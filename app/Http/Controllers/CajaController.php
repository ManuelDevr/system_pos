<?php

namespace App\Http\Controllers;

use App\Models\Caja;
use App\Models\MovimientoCaja;
use App\Models\Sucursal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CajaController extends Controller
{
    public function index(Request $request)
    {
        $caja = Caja::abierta()
            ->where('user_id', auth()->id())
            ->latest('id')
            ->first();

        if ($caja) {
            $caja->load(['movimientos' => fn ($q) => $q->orderByDesc('created_at'), 'movimientos.user:id,name']);

            $caja->setAttribute('total_ventas_efectivo', $caja->totalVentasEfectivo());
            $caja->setAttribute('total_ventas', (float) $caja->ventas()->where('estado', 'Pagado')->sum('total'));
            $caja->setAttribute('total_ingresos', $caja->totalMovimientos('Ingreso'));
            $caja->setAttribute('total_egresos', $caja->totalMovimientos('Egreso'));
            $caja->setAttribute('monto_esperado_actual', $caja->calcularEsperado());
            $caja->setAttribute('cantidad_ventas', $caja->ventas()->where('estado', 'Pagado')->count());
        }

        return Inertia::render('Caja/Index', [
            'caja' => $caja,
            'sucursales' => Sucursal::select('id', 'nombre')->where('activo', true)->get(),
            'ultimaCaja' => Caja::where('user_id', auth()->id())->where('estado', 'Cerrada')
                ->latest('cerrada_en')->first(),
        ]);
    }

    public function abrir(Request $request)
    {
        $validated = $request->validate([
            'monto_inicial' => 'required|numeric|min:0',
            'sucursal_id' => 'nullable|exists:sucursales,id',
            'notas' => 'nullable|string|max:1000',
        ]);

        if (Caja::abierta()->where('user_id', auth()->id())->exists()) {
            return redirect()->back()->withErrors(['error' => 'Ya tienes una caja abierta.']);
        }

        Caja::create([
            'user_id' => auth()->id(),
            'sucursal_id' => $validated['sucursal_id'] ?? null,
            'monto_inicial' => $validated['monto_inicial'],
            'estado' => 'Abierta',
            'abierta_en' => now(),
            'notas' => $validated['notas'] ?? null,
        ]);

        return redirect()->route('caja.index')->with('success', 'Caja abierta correctamente.');
    }

    public function movimiento(Request $request)
    {
        $validated = $request->validate([
            'tipo' => 'required|in:Ingreso,Egreso',
            'monto' => 'required|numeric|min:0.01',
            'motivo' => 'required|string|max:255',
        ]);

        $caja = Caja::abierta()->where('user_id', auth()->id())->latest('id')->first();

        if (! $caja) {
            return redirect()->back()->withErrors(['error' => 'No tienes una caja abierta.']);
        }

        MovimientoCaja::create([
            'caja_id' => $caja->id,
            'user_id' => auth()->id(),
            'tipo' => $validated['tipo'],
            'monto' => $validated['monto'],
            'motivo' => $validated['motivo'],
        ]);

        return redirect()->back()->with('success', 'Movimiento registrado.');
    }

    public function cerrar(Request $request)
    {
        $validated = $request->validate([
            'monto_contado' => 'required|numeric|min:0',
            'notas' => 'nullable|string|max:1000',
        ]);

        $caja = Caja::abierta()->where('user_id', auth()->id())->latest('id')->first();

        if (! $caja) {
            return redirect()->back()->withErrors(['error' => 'No tienes una caja abierta.']);
        }

        DB::transaction(function () use ($caja, $validated) {
            $esperado = $caja->calcularEsperado();

            $caja->update([
                'monto_esperado' => $esperado,
                'monto_contado' => $validated['monto_contado'],
                'diferencia' => round($validated['monto_contado'] - $esperado, 2),
                'estado' => 'Cerrada',
                'cerrada_en' => now(),
                'notas' => $validated['notas'] ?? $caja->notas,
            ]);
        });

        return redirect()->route('caja.index')->with('success', 'Caja cerrada correctamente.');
    }

    public function historial(Request $request)
    {
        $desde = $request->input('desde');
        $hasta = $request->input('hasta');

        $cajas = Caja::with(['user:id,name', 'sucursal:id,nombre'])
            ->when($desde, fn ($q) => $q->whereDate('abierta_en', '>=', $desde))
            ->when($hasta, fn ($q) => $q->whereDate('abierta_en', '<=', $hasta))
            ->orderByDesc('abierta_en')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Caja/Historial', [
            'cajas' => $cajas,
            'filtros' => ['desde' => $desde, 'hasta' => $hasta],
        ]);
    }
}
