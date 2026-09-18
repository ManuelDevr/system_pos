<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use App\Models\Marca;
use App\Models\Unidad;
use App\Models\Producto;
use App\Models\Kardex;
use App\Services\KardexService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function maintenance()
    {
        return Inertia::render('Inventory/Maintenance', [
            'categorias' => Categoria::with('children')->whereNull('parent_id')->get(),
            'marcas' => Marca::all(),
            'unidades' => Unidad::all(),
        ]);
    }

    public function adjustments()
    {
        $ajustes = Kardex::with(['producto', 'user'])
            ->where('referencia_tipo', 'AJUSTE')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($k) => [
                'id' => $k->id,
                'fecha' => $k->created_at->format('d/m/Y H:i'),
                'producto' => $k->producto?->nombre ?? '-',
                'tipo' => $k->tipo_movimiento,
                'cantidad' => (float) $k->cantidad,
                'stock_anterior' => (float) $k->stock_anterior,
                'stock_actual' => (float) $k->stock_actual,
                'motivo' => $k->motivo,
                'usuario' => $k->user?->name ?? '-',
            ]);

        return Inertia::render('Inventory/Adjustments', [
            'productos' => Producto::select('id', 'nombre', 'sku', 'stock', 'unidad_medida', 'estado')
                ->where('estado', 'Activo')
                ->orderBy('nombre')
                ->get(),
            'ajustes' => $ajustes,
        ]);
    }

    public function storeAdjustment(Request $request)
    {
        $validated = $request->validate([
            'producto_id' => 'required|exists:productos,id',
            'tipo' => 'required|in:ENTRADA,SALIDA',
            'cantidad' => 'required|numeric|min:0.01',
            'motivo' => 'required|string|max:255',
        ]);

        $producto = Producto::findOrFail($validated['producto_id']);

        if ($validated['tipo'] === 'SALIDA' && $producto->stock < $validated['cantidad']) {
            return redirect()->route('inventory.adjustments')->with('error', 'Stock insuficiente para realizar la salida.');
        }

        KardexService::registrarMovimiento(
            $producto,
            $validated['tipo'],
            $validated['cantidad'],
            $validated['motivo'],
            'AJUSTE',
            null
        );

        return redirect()->route('inventory.adjustments')->with('success', 'Ajuste de inventario registrado correctamente.');
    }
}
