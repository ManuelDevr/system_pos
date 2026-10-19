<?php

namespace App\Http\Controllers;

use App\Models\NotaCredito;
use App\Models\Venta;
use App\Models\Producto;
use App\Services\KardexService;
use App\Services\SequenceService;
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
            $nota = DB::transaction(function () use ($venta, $validated) {
                // Crear primero la nota para referenciarla en el Kardex.
                $nota = NotaCredito::create([
                    'venta_id' => $venta->id,
                    'nro_comprobante' => SequenceService::next(NotaCredito::class, 'NC'),
                    'motivo' => $validated['motivo'],
                    'total' => $venta->total,
                    'user_id' => auth()->id(),
                ]);

                $motivo = 'Nota Crédito Venta: '.($venta->nro_comprobante ?? 'Venta #'.$venta->id);

                foreach ($venta->detalles as $detalle) {
                    $producto = Producto::withTrashed()->lockForUpdate()->find($detalle->producto_id);
                    if ($producto) {
                        KardexService::registrarMovimiento(
                            $producto,
                            'ENTRADA',
                            $detalle->cantidad_base ?? $detalle->cantidad,
                            $motivo,
                            'NOTA_CREDITO',
                            $nota->id,
                            (float) $detalle->costo_unitario,
                            $venta->sucursal_id
                        );
                    }
                }

                // Marcar venta como anulada
                $venta->estado = 'Anulado';
                $venta->save();

                return $nota;
            });

            return redirect()->route('notas-credito.index')
                ->with('success', "Nota de Crédito {$nota->nro_comprobante} emitida correctamente.");
        } catch (\Throwable $e) {
            return redirect()->back()->withErrors(['error' => 'Error al emitir nota de crédito: '.$e->getMessage()]);
        }
    }

    private function getNextNumber(): string
    {
        $last = NotaCredito::orderByDesc('id')->value('nro_comprobante');
        $num = $last ? ((int) substr($last, -6)) + 1 : 1;

        return 'NC'.str_pad((string) $num, 6, '0', STR_PAD_LEFT);
    }
}
