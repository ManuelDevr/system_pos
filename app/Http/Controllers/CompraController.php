<?php

namespace App\Http\Controllers;

use App\Models\Compra;
use App\Models\Producto;
use App\Services\KardexService;
use Illuminate\Http\Request;
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
            'items' => 'required|array|min:1',
            'items.*.producto_id' => 'required|exists:productos,id',
            'items.*.cantidad' => 'required|numeric|min:0.01',
            'items.*.precio_compra' => 'required|numeric|min:0',
        ]);

        $subtotal = 0;
        $detallesData = [];

        foreach ($validated['items'] as $item) {
            $producto = Producto::findOrFail($item['producto_id']);
            $itemSubtotal = $item['cantidad'] * $item['precio_compra'];
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

        $igv = round($subtotal * 0.18, 2);
        $total = $subtotal + $igv;

        $compra = Compra::create([
            'nro_comprobante' => $this->getNextNumber(),
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
        ]);

        $compra->detalles()->createMany($detallesData);

        foreach ($detallesData as $detalle) {
            $producto = Producto::find($detalle['producto_id']);
            KardexService::registrarMovimiento(
                $producto,
                'ENTRADA',
                $detalle['cantidad'],
                "Compra {$compra->nro_comprobante}",
                'COMPRA',
                $compra->id
            );
        }

        return redirect()->route('compras.index')->with('success', 'Compra registrada correctamente. Stock actualizado.');
    }

    private function getNextNumber(): string
    {
        $last = Compra::orderByDesc('id')->first();
        $num = $last ? (int) substr($last->nro_comprobante, -6) + 1 : 1;
        return 'C' . str_pad($num, 6, '0', STR_PAD_LEFT);
    }
}
