<?php

namespace App\Http\Controllers;

use App\Models\Configuracion;
use App\Models\NotaDebito;
use App\Models\Venta;
use App\Services\FacturacionFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DebitNoteController extends Controller
{
    /**
     * Catalogo 10 SUNAT (se excluye el 13 hasta su vigencia en 2027).
     */
    public const MOTIVOS = [
        '01' => 'Intereses por mora',
        '02' => 'Aumento en el valor',
        '03' => 'Otros conceptos',
        '04' => 'Ajustes de valor de exportacion',
        '05' => 'Ajustes por correccion de la moneda',
        '06' => 'Ajustes por correccion de la cantidad',
        '07' => 'Ajustes por descuentos no aplicados',
        '08' => 'Ajustes por cargos adicionales',
        '09' => 'Otros',
        '11' => 'Ajustes de operaciones de exportacion',
        '12' => 'Ajustes afectos al IVAP',
    ];

    public function index()
    {
        $notas = NotaDebito::with([
            'venta:id,nro_comprobante,total,cliente_nombre,cliente_documento',
            'user:id,name',
        ])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('DebitNotes/Index', [
            'notas' => $notas,
        ]);
    }

    public function create()
    {
        $ventas = Venta::select('id', 'nro_comprobante', 'total', 'cliente_nombre', 'cliente_documento', 'cliente_tipo_doc', 'created_at')
            ->where('sunat_envio', true)
            ->where('estado', '!=', 'Anulado')
            ->whereNotNull('nro_comprobante')
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('DebitNotes/Create', [
            'ventas' => $ventas,
            'motivos' => self::MOTIVOS,
            'serie' => (string) (Configuracion::first()?->serie_nota_debito ?: 'FD01'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'venta_id' => 'required|exists:ventas,id',
            'motivo_codigo' => 'required|string|in:'.implode(',', array_keys(self::MOTIVOS)),
            'motivo_descripcion' => 'required|string|max:250',
            'total' => 'required|numeric|gt:0',
        ]);

        $venta = Venta::findOrFail($validated['venta_id']);

        if (! $venta->sunat_envio || ! $venta->nro_comprobante) {
            return back()->withErrors(['venta_id' => 'La venta debe tener un comprobante emitido ante SUNAT.']);
        }

        if ($venta->estado === 'Anulado') {
            return back()->withErrors(['venta_id' => 'No se puede emitir una nota de debito sobre una venta anulada.']);
        }

        $nota = NotaDebito::create([
            'venta_id' => $venta->id,
            'serie' => (string) (Configuracion::first()?->serie_nota_debito ?: 'FD01'),
            'motivo_codigo' => $validated['motivo_codigo'],
            'motivo_descripcion' => $validated['motivo_descripcion'],
            'total' => $validated['total'],
            'estado' => 'PENDIENTE',
            'user_id' => auth()->id(),
        ]);

        $provider = FacturacionFactory::make();
        $resultado = $provider->emitirNotaDebito($nota);

        if (($resultado['status'] ?? null) === 'ERROR') {
            $nota->update([
                'estado' => 'ERROR',
                'sunat_status' => 'ERROR',
                'sunat_response' => $resultado['error'] ?? ['message' => 'Error desconocido'],
            ]);

            return back()->withErrors([
                'sunat' => $resultado['error']['message'] ?? 'No se pudo emitir la nota de debito.',
            ]);
        }

        $nota->update([
            'nro_comprobante' => $resultado['numero_completo'] ?? null,
            'serie' => $resultado['serie'] ?? $nota->serie,
            'estado' => $resultado['estado'] ?? 'PENDIENTE',
            'sunat_document_id' => $resultado['documentId'] ?? null,
            'sunat_status' => $resultado['estado'] ?? 'PENDIENTE',
            'sunat_pdf_url' => isset($resultado['documentId'])
                ? $provider->documentoPDFUrl('notas-debito', (string) $resultado['documentId'], 'A4')
                : null,
            'sunat_response' => $resultado['plataforma'] ?? null,
        ]);

        return redirect()->route('notas-debito.index')
            ->with('success', 'Nota de debito '.($nota->nro_comprobante ?? 'registrada').' emitida correctamente.');
    }

    public function reenviar(NotaDebito $nota)
    {
        if (! $nota->sunat_document_id) {
            return back()->withErrors(['sunat' => 'La nota de debito no tiene documento SUNAT.']);
        }

        $resultado = FacturacionFactory::make()->reenviar('notas-debito', (string) $nota->sunat_document_id);

        if (($resultado['status'] ?? null) === 'ERROR') {
            return back()->withErrors([
                'sunat' => $resultado['error']['message'] ?? 'No se pudo reenviar la nota de debito.',
            ]);
        }

        $nota->update([
            'estado' => $resultado['estado'] ?? $nota->estado,
            'sunat_status' => $resultado['estado'] ?? $nota->sunat_status,
            'sunat_response' => $resultado['datos'] ?? $nota->sunat_response,
        ]);

        return back()->with('success', 'Nota de debito reenviada a SUNAT.');
    }

    public function pdf(NotaDebito $nota)
    {
        if (! $nota->sunat_pdf_url) {
            return response()->json(['error' => 'PDF oficial no disponible'], 404);
        }

        try {
            $response = Http::timeout(15)->get($nota->sunat_pdf_url);

            if ($response->successful()) {
                return response($response->body(), 200, [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => 'inline; filename="'.$nota->nro_comprobante.'.pdf"',
                    'Cache-Control' => 'no-cache, private',
                ]);
            }
        } catch (\Throwable $e) {
            Log::warning('Error al proxificar PDF de nota de debito: '.$e->getMessage());
        }

        return response()->json(['error' => 'PDF oficial no disponible'], 404);
    }
}
