<?php

namespace App\Http\Controllers;

use App\Models\NotaCredito;
use App\Models\Venta;
use App\Models\Producto;
use App\Services\KardexService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class NotaCreditoController extends Controller
{
    public function index()
    {
        $notas = NotaCredito::with(['venta:id,total,metodo_pago,nro_comprobante', 'user:id,name'])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('CreditNotes/Index', [
            'notas' => $notas,
        ]);
    }

    public function create()
    {
        $ventas = Venta::select('id', 'total', 'nro_comprobante', 'metodo_pago', 'created_at')
            ->where('estado', 'Pagado')
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('CreditNotes/Create', [
            'ventas' => $ventas,
            'lastNumber' => $this->getNextNumber(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'venta_id' => 'required|exists:ventas,id',
            'motivo' => 'required|string|max:1000',
        ]);

        $venta = Venta::with('detalles')->findOrFail($validated['venta_id']);

        if ($venta->estado !== 'Pagado') {
            return redirect()->back()->withErrors(['error' => 'La venta no está en estado Pagado.']);
        }

        try {
            DB::beginTransaction();

            // Restaurar stock de cada detalle
            foreach ($venta->detalles as $detalle) {
                $producto = Producto::lockForUpdate()->find($detalle->producto_id);
                if ($producto) {
                    KardexService::registrarMovimiento(
                        $producto,
                        'ENTRADA',
                        $detalle->cantidad_base ?? $detalle->cantidad,
                        "Nota Crédito Venta: {$venta->nro_comprobante}",
                        'NOTA_CREDITO',
                        null
                    );
                }
            }

            // Crear la nota de crédito
            $nota = NotaCredito::create([
                'venta_id' => $venta->id,
                'nro_comprobante' => $this->getNextNumber(),
                'motivo' => $validated['motivo'],
                'total' => $venta->total,
                'user_id' => auth()->id(),
            ]);

            // Marcar venta como anulada
            $venta->estado = 'Anulado';
            $venta->save();

            DB::commit();

            return redirect()->route('notas-credito.index')
                ->with('success', "Nota de Crédito {$nota->nro_comprobante} emitida correctamente.");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Error al emitir nota de crédito: ' . $e->getMessage()]);
        }
    }

    private function getNextNumber(): string
    {
        $last = NotaCredito::orderByDesc('id')->first();
        $num = $last ? (int) substr($last->nro_comprobante, -6) + 1 : 1;
        return 'NC' . str_pad($num, 6, '0', STR_PAD_LEFT);
    }
}
