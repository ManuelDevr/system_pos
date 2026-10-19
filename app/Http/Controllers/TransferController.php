<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\StockSucursal;
use App\Models\Sucursal;
use App\Models\Transferencia;
use App\Services\KardexService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransferController extends Controller
{
    public function index()
    {
        $transferencias = Transferencia::with([
            'origen:id,nombre',
            'destino:id,nombre',
            'user:id,name',
        ])->orderByDesc('created_at')->paginate(25);

        return Inertia::render('Transfers/Index', [
            'transferencias' => $transferencias,
        ]);
    }

    public function create(Request $request)
    {
        $origenId = (int) $request->input('origen_id') ?: Sucursal::defaultId();

        $stocks = StockSucursal::where('sucursal_id', $origenId)
            ->pluck('stock', 'producto_id')
            ->map(fn ($stock) => (float) $stock);

        return Inertia::render('Transfers/Create', [
            'sucursales' => Sucursal::select('id', 'nombre', 'principal')->where('activo', true)->orderBy('nombre')->get(),
            'productos' => Producto::select('id', 'nombre', 'sku', 'stock', 'unidad_medida', 'costo_promedio', 'precio_compra')
                ->where('estado', 'Activo')
                ->orderBy('nombre')
                ->get(),
            'origenId' => $origenId,
            'stocks' => $stocks,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sucursal_origen_id' => 'required|exists:sucursales,id',
            'sucursal_destino_id' => 'required|exists:sucursales,id|different:sucursal_origen_id',
            'observaciones' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.producto_id' => 'required|distinct|exists:productos,id',
            'items.*.cantidad' => 'required|numeric|min:0.0001',
        ]);

        $origenId = (int) $validated['sucursal_origen_id'];
        $destinoId = (int) $validated['sucursal_destino_id'];

        try {
            $transferencia = DB::transaction(function () use ($validated, $origenId, $destinoId) {
                $items = [];

                $transferencia = Transferencia::create([
                    'sucursal_origen_id' => $origenId,
                    'sucursal_destino_id' => $destinoId,
                    'user_id' => auth()->id(),
                    'items' => [],
                    'estado' => 'COMPLETADA',
                    'observaciones' => $validated['observaciones'] ?? null,
                ]);

                foreach ($validated['items'] as $item) {
                    $producto = Producto::withTrashed()->lockForUpdate()->findOrFail($item['producto_id']);
                    $cantidad = (float) $item['cantidad'];

                    $costo = (float) ($producto->costo_promedio > 0
                        ? $producto->costo_promedio
                        : $producto->precio_compra);

                    KardexService::registrarMovimiento(
                        $producto,
                        'SALIDA',
                        $cantidad,
                        'Transferencia a sucursal destino #'.$destinoId,
                        'TRANSFERENCIA',
                        $transferencia->id,
                        $costo,
                        $origenId
                    );

                    KardexService::registrarMovimiento(
                        $producto,
                        'ENTRADA',
                        $cantidad,
                        'Transferencia desde sucursal origen #'.$origenId,
                        'TRANSFERENCIA',
                        $transferencia->id,
                        $costo,
                        $destinoId
                    );

                    $items[] = [
                        'producto_id' => $producto->id,
                        'nombre' => $producto->nombre,
                        'sku' => $producto->sku,
                        'cantidad' => $cantidad,
                        'costo_unitario' => $costo,
                    ];
                }

                $transferencia->update(['items' => $items]);

                return $transferencia;
            });
        } catch (\Throwable $e) {
            return redirect()->back()->withErrors(['error' => 'No se pudo registrar la transferencia: '.$e->getMessage()]);
        }

        return redirect()->route('transferencias.index')
            ->with('success', 'Transferencia #'.$transferencia->id.' registrada correctamente.');
    }
}
