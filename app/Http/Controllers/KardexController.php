<?php

namespace App\Http\Controllers;

use App\Models\Kardex;
use App\Models\Producto;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class KardexController extends Controller
{
    public function index(Request $request)
    {
        $query = Kardex::with(['producto:id,nombre,sku,imagen_url', 'user:id,name'])
            ->orderBy('created_at', 'desc');

        // Filtrar por producto
        if ($request->has('producto_id') && $request->producto_id) {
            $query->where('producto_id', $request->producto_id);
        }

        // Filtrar por tipo de movimiento
        if ($request->has('tipo') && $request->tipo !== 'TODOS') {
            $query->where('tipo_movimiento', $request->tipo);
        }

        // Filtrar por rango de fechas
        if ($request->has('fecha_inicio') && $request->fecha_inicio) {
            $query->whereDate('created_at', '>=', $request->fecha_inicio);
        }

        if ($request->has('fecha_fin') && $request->fecha_fin) {
            $query->whereDate('created_at', '<=', $request->fecha_fin);
        }

        return Inertia::render('Inventory/Kardex', [
            'movimientos' => $query->get(),
            'productos' => Producto::select('id', 'nombre', 'sku')->orderBy('nombre')->get(),
            'filters' => $request->only(['producto_id', 'tipo', 'fecha_inicio', 'fecha_fin'])
        ]);
    }
}
