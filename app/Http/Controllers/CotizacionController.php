<?php

namespace App\Http\Controllers;

use App\Models\Cotizacion;
use App\Models\DetalleCotizacion;
use App\Models\Producto;
use App\Models\Venta;
use App\Models\DetalleVenta;
use App\Services\KardexService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class CotizacionController extends Controller
{
    public function index()
    {
        $proformas = Cotizacion::with(['user:id,name', 'detalles'])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Quotes/Index', [
            'proformas' => $proformas,
        ]);
    }

    public function create()
    {
        return Inertia::render('Quotes/Create', [
            'productos' => Producto::select('id', 'nombre', 'sku', 'codigo_barras', 'stock', 'precio_venta', 'precio_compra', 'unidad_medida', 'estado')
                ->where('estado', 'Activo')
                ->orderBy('nombre')
                ->get(),
            'lastNumber' => $this->getNextNumber(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cliente_nombre' => 'nullable|string|max:255',
            'cliente_telefono' => 'nullable|string|max:20',
            'tipo_comprobante' => 'required|in:Proforma',
            'observaciones' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.producto_id' => 'required|exists:productos,id',
            'items.*.cantidad' => 'required|numeric|min:0.01',
            'items.*.precio_unitario' => 'required|numeric|min:0',
            'items.*.descuento' => 'nullable|numeric|min:0',
        ]);

        $brutoTotal = 0;
        $descuentoTotal = 0;
        $detallesData = [];

        foreach ($validated['items'] as $item) {
            $producto = Producto::findOrFail($item['producto_id']);
            $itemSubtotal = $item['cantidad'] * $item['precio_unitario'];
            $itemDescuento = round((float) ($item['descuento'] ?? 0), 2);
            $brutoTotal += $itemSubtotal;
            $descuentoTotal += $itemDescuento;

            $detallesData[] = [
                'producto_id' => $producto->id,
                'producto_nombre' => $producto->nombre,
                'unidad_medida' => $producto->unidad_medida,
                'cantidad' => $item['cantidad'],
                'precio_unitario' => $item['precio_unitario'],
                'subtotal' => $itemSubtotal,
                'descuento' => $itemDescuento,
                'subtotal_descuento' => round($itemSubtotal - $itemDescuento, 2),
            ];
        }

        $subtotal = round($brutoTotal - $descuentoTotal, 2);
        $igv = round($subtotal * 0.18, 2);
        $total = $subtotal + $igv;

        $proforma = Cotizacion::create([
            'nro_cotizacion' => $this->getNextNumber(),
            'cliente_nombre' => $validated['cliente_nombre'],
            'cliente_telefono' => $validated['cliente_telefono'],
            'tipo_comprobante' => 'Proforma',
            'subtotal' => $subtotal,
            'descuento' => $descuentoTotal,
            'igv' => $igv,
            'total' => $total,
            'observaciones' => $validated['observaciones'],
            'user_id' => auth()->id(),
        ]);

        $proforma->detalles()->createMany($detallesData);

        return redirect()->route('cotizaciones.index')
            ->with('last_proforma_id', $proforma->id)
            ->with('success', "Proforma {$proforma->nro_cotizacion} generada correctamente.");
    }

    public function convert(Cotizacion $cotizacion)
    {
        if ($cotizacion->estado === 'Convertida') {
            return redirect()->back()->withErrors(['error' => 'Esta proforma ya fue convertida.']);
        }

        try {
            DB::beginTransaction();

            $totalBackend = (float) $cotizacion->total;

            // Generar número de comprobante
            $serie = 'B001';
            $lastNro = Venta::lockForUpdate()
                ->where('nro_comprobante', 'LIKE', $serie . '-%')
                ->orderByRaw("CAST(SUBSTRING(nro_comprobante FROM " . (strlen($serie) + 2) . ") AS INTEGER) DESC")
                ->value('nro_comprobante');
            $nextNum = $lastNro ? ((int) substr($lastNro, strlen($serie) + 1)) + 1 : 1;
            $nroComprobante = $serie . '-' . str_pad($nextNum, 6, '0', STR_PAD_LEFT);

            // Crear la venta
            $venta = Venta::create([
                'total' => $totalBackend,
                'metodo_pago' => 'Efectivo',
                'user_id' => auth()->id(),
                'nro_comprobante' => $nroComprobante,
            ]);

            // Crear detalles de venta y registrar kardex
            foreach ($cotizacion->detalles as $detalle) {
                $producto = Producto::lockForUpdate()->find($detalle->producto_id);
                if (!$producto) continue;

                $cantidadBase = (float) $detalle->cantidad;

                if ($producto->stock < $cantidadBase) {
                    throw new \Exception("Stock insuficiente para: {$producto->nombre}");
                }

                DetalleVenta::create([
                    'venta_id' => $venta->id,
                    'producto_id' => $producto->id,
                    'cantidad' => $cantidadBase,
                    'precio_unitario' => (float) $detalle->precio_unitario,
                    'subtotal' => (float) $detalle->subtotal,
                    'cantidad_base' => $cantidadBase,
                ]);

                KardexService::registrarMovimiento(
                    $producto,
                    'SALIDA',
                    $cantidadBase,
                    "Venta (desde Proforma {$cotizacion->nro_cotizacion}): {$nroComprobante}",
                    'Venta',
                    $venta->id
                );
            }

            $cotizacion->estado = 'Convertida';
            $cotizacion->save();

            DB::commit();

            return redirect()->route('cotizaciones.index')
                ->with('success', "Proforma convertida en venta {$nroComprobante} exitosamente.");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    private function getNextNumber(): string
    {
        $last = Cotizacion::orderByDesc('id')->first();
        $num = $last ? (int) substr($last->nro_cotizacion, -6) + 1 : 1;
        return 'PRO-' . str_pad($num, 6, '0', STR_PAD_LEFT);
    }
}
