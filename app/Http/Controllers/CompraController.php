<?php

namespace App\Http\Controllers;

use App\Models\Compra;
use App\Models\Configuracion;
use App\Models\Producto;
use App\Models\Sucursal;
use App\Services\KardexService;
use App\Services\SequenceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CompraController extends Controller
{
    public function index()
    {
        return Inertia::render('Purchases/Index', [
            'compras' => Compra::with(['user:id,name', 'detalles'])
                ->orderByDesc('created_at')
                ->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Purchases/Create', [
            'productos' => Producto::select('id', 'nombre', 'sku', 'stock', 'precio_compra', 'unidad_medida', 'estado')
                ->where('estado', 'Activo')
                ->orderBy('nombre')
                ->get(),
            'lastNumber' => $this->getNextNumber(),
            'sucursales' => Sucursal::select('id', 'nombre', 'principal')
                ->where('activo', true)
                ->orderBy('nombre')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'proveedor' => 'required|string|max:255',
            'ruc_dni' => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'tipo_comprobante' => 'required|in:Boleta,Factura',
            'observaciones' => 'nullable|string|max:1000',
            'sucursal_id' => 'nullable|exists:sucursales,id',
            'items' => 'required|array|min:1',
            'items.*.producto_id' => 'required|exists:productos,id',
            'items.*.cantidad' => 'required|numeric|min:0.0001',
            'items.*.precio_compra' => 'required|numeric|min:0',
        ]);

        try {
            $compra = DB::transaction(function () use ($validated) {
                $sucursalId = $validated['sucursal_id'] ?? Sucursal::defaultId();
                $subtotal = 0;
                $detallesData = [];
                $productos = [];

                foreach ($validated['items'] as $item) {
                    $producto = Producto::lockForUpdate()->findOrFail($item['producto_id']);
                    $productos[$producto->id] = $producto;

                    $itemSubtotal = round($item['cantidad'] * $item['precio_compra'], 2);
                    $subtotal += $itemSubtotal;

                    $detallesData[] = [
                        'producto_id' => $producto->id,
                        'producto_nombre' => $producto->nombre,
                        'unidad_medida' => $producto->unidad_medida,
                        'cantidad' => $item['cantidad'],
                        'precio_compra' => $item['precio_compra'],
                        'subtotal' => $itemSubtotal,
                    ];
                }

                $config = Configuracion::first();
                $igvRate = (float) ($config?->igv ?? 18.00);
                $igv = round($subtotal * $igvRate / 100, 2);
                $total = round($subtotal + $igv, 2);

                $compra = Compra::create([
                    'nro_comprobante' => SequenceService::next(Compra::class, 'C'),
                    'proveedor' => $validated['proveedor'],
                    'ruc_dni' => $validated['ruc_dni'] ?? null,
                    'direccion' => $validated['direccion'] ?? null,
                    'telefono' => $validated['telefono'] ?? null,
                    'email' => $validated['email'] ?? null,
                    'tipo_comprobante' => $validated['tipo_comprobante'],
                    'subtotal' => $subtotal,
                    'igv' => $igv,
                    'total' => $total,
                    'observaciones' => $validated['observaciones'] ?? null,
                    'user_id' => auth()->id(),
                    'sucursal_id' => $sucursalId,
                ]);

                $compra->detalles()->createMany($detallesData);

                foreach ($detallesData as $detalle) {
                    KardexService::registrarMovimiento(
                        $productos[$detalle['producto_id']],
                        'ENTRADA',
                        $detalle['cantidad'],
                        "Compra {$compra->nro_comprobante}",
                        'COMPRA',
                        $compra->id,
                        (float) $detalle['precio_compra'],
                        $sucursalId
                    );
                }

                return $compra;
            });
        } catch (\Throwable $e) {
            return redirect()->back()->withErrors(['error' => 'No se pudo registrar la compra: '.$e->getMessage()]);
        }

        return redirect()->route('compras.index')
            ->with('success', 'Compra registrada correctamente. Stock actualizado.');
    }

    private function getNextNumber(): string
    {
        $last = Compra::orderByDesc('id')->first();
        $num = $last ? (int) substr($last->nro_comprobante, -6) + 1 : 1;

        return 'C'.str_pad($num, 6, '0', STR_PAD_LEFT);
    }
}
