<?php

namespace App\Http\Controllers;

use App\Models\Configuracion;
use App\Models\GuiaRemision;
use App\Models\Venta;
use App\Services\FacturacionFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DispatchGuideController extends Controller
{
    public const MOTIVOS = [
        '01' => 'Venta',
        '02' => 'Compra',
        '04' => 'Traslado entre establecimientos de la misma empresa',
        '08' => 'Importacion',
        '09' => 'Exportacion',
        '13' => 'Otros',
        '14' => 'Venta sujeta a confirmacion del comprador',
        '18' => 'Traslado emisor itinerante CP',
        '19' => 'Traslado a zona primaria',
    ];

    public function index()
    {
        $guias = GuiaRemision::with([
            'venta:id,nro_comprobante,total',
            'cliente:id,nombre,ruc_dni',
            'user:id,name',
        ])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('DispatchGuides/Index', [
            'guias' => $guias,
        ]);
    }

    public function create()
    {
        $ventas = Venta::select('id', 'nro_comprobante', 'total', 'cliente_id', 'cliente_nombre', 'cliente_documento', 'cliente_tipo_doc', 'created_at')
            ->with(['detalles.producto:id,nombre,sku', 'detalles.unidad:id,nombre,codigo_sunat,abreviatura', 'cliente:id,nombre,ruc_dni,direccion'])
            ->where('estado', '!=', 'Anulado')
            ->orderByDesc('created_at')
            ->limit(200)
            ->get();

        return Inertia::render('DispatchGuides/Create', [
            'ventas' => $ventas,
            'motivos' => self::MOTIVOS,
            'serie' => (string) (Configuracion::first()?->serie_guia_remision ?: 'T001'),
            'empresa' => [
                'ruc' => (string) Configuracion::first()?->ruc,
                'razon_social' => (string) Configuracion::first()?->nombre_empresa,
                'direccion' => (string) Configuracion::first()?->direccion,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'venta_id' => 'nullable|exists:ventas,id',
            'serie' => 'required|string|size:4',
            'fecha_emision' => 'required|date',
            'fecha_traslado' => 'required|date|after_or_equal:fecha_emision',
            'motivo_traslado' => 'required|string|in:'.implode(',', array_keys(self::MOTIVOS)),
            'modalidad' => 'required|string|in:01,02',
            'destinatario_tipo_doc' => 'required|string|in:1,6',
            'destinatario_num_doc' => 'required|string|max:15',
            'destinatario_razon_social' => 'required|string|max:255',
            'partida_ubigeo' => 'required|string|size:6',
            'partida_direccion' => 'required|string|max:500',
            'llegada_ubigeo' => 'required|string|size:6',
            'llegada_direccion' => 'required|string|max:500',
            'peso_total' => 'required|numeric|gt:0',
            'und_peso_total' => 'nullable|string|max:3',
            'num_bultos' => 'nullable|integer|min:1',
            'transportista_num_doc' => 'required_if:modalidad,01|nullable|string|max:11',
            'transportista_razon_social' => 'required_if:modalidad,01|nullable|string|max:255',
            'transportista_nro_mtc' => 'nullable|string|max:20',
            'vehiculo_placa' => 'required_if:modalidad,02|nullable|string|max:8',
            'conductor_tipo_doc' => 'required_if:modalidad,02|nullable|string|in:1,4',
            'conductor_num_doc' => 'required_if:modalidad,02|nullable|string|max:15',
            'conductor_nombres' => 'required_if:modalidad,02|nullable|string|max:100',
            'conductor_apellidos' => 'required_if:modalidad,02|nullable|string|max:100',
            'conductor_licencia' => 'required_if:modalidad,02|nullable|string|max:20',
            'observacion' => 'nullable|string|max:500',
        ]);

        $venta = isset($validated['venta_id'])
            ? Venta::with(['detalles.producto:id,nombre,sku', 'detalles.unidad:id,nombre,codigo_sunat,abreviatura'])->findOrFail($validated['venta_id'])
            : null;

        $items = $this->buildItems($request, $venta);

        if (count($items) === 0) {
            return back()->withErrors(['items' => 'Debe indicar al menos un producto a trasladar.']);
        }

        $guia = GuiaRemision::create([
            'venta_id' => $venta?->id,
            'cliente_id' => $venta?->cliente_id,
            'serie' => $validated['serie'],
            'fecha_emision' => $validated['fecha_emision'],
            'fecha_traslado' => $validated['fecha_traslado'],
            'motivo_traslado' => $validated['motivo_traslado'],
            'modalidad' => $validated['modalidad'],
            'destinatario_tipo_doc' => $validated['destinatario_tipo_doc'],
            'destinatario_num_doc' => $validated['destinatario_num_doc'],
            'destinatario_razon_social' => $validated['destinatario_razon_social'],
            'partida_ubigeo' => $validated['partida_ubigeo'],
            'partida_direccion' => $validated['partida_direccion'],
            'llegada_ubigeo' => $validated['llegada_ubigeo'],
            'llegada_direccion' => $validated['llegada_direccion'],
            'peso_total' => $validated['peso_total'],
            'und_peso_total' => $validated['und_peso_total'] ?? 'KGM',
            'num_bultos' => $validated['num_bultos'] ?? null,
            'transportista_tipo_doc' => $validated['modalidad'] === '01' ? '6' : null,
            'transportista_num_doc' => $validated['modalidad'] === '01' ? $validated['transportista_num_doc'] : null,
            'transportista_razon_social' => $validated['modalidad'] === '01' ? $validated['transportista_razon_social'] : null,
            'transportista_nro_mtc' => $validated['modalidad'] === '01' ? ($validated['transportista_nro_mtc'] ?? null) : null,
            'vehiculo_placa' => $validated['modalidad'] === '02' ? $validated['vehiculo_placa'] : null,
            'conductor_tipo_doc' => $validated['modalidad'] === '02' ? $validated['conductor_tipo_doc'] : null,
            'conductor_num_doc' => $validated['modalidad'] === '02' ? $validated['conductor_num_doc'] : null,
            'conductor_nombres' => $validated['modalidad'] === '02' ? $validated['conductor_nombres'] : null,
            'conductor_apellidos' => $validated['modalidad'] === '02' ? $validated['conductor_apellidos'] : null,
            'conductor_licencia' => $validated['modalidad'] === '02' ? $validated['conductor_licencia'] : null,
            'observacion' => $validated['observacion'] ?? null,
            'items' => $items,
            'estado' => 'PENDIENTE',
            'user_id' => auth()->id(),
        ]);

        $provider = FacturacionFactory::make();
        $resultado = $provider->emitirGuiaRemision($guia);

        if (($resultado['status'] ?? null) === 'ERROR') {
            $guia->update([
                'estado' => 'ERROR',
                'sunat_status' => 'ERROR',
                'sunat_response' => $resultado['error'] ?? ['message' => 'Error desconocido'],
            ]);

            return redirect()->route('guias.index')->withErrors([
                'sunat' => $resultado['error']['message'] ?? 'No se pudo emitir la guia de remision.',
            ]);
        }

        $guia->update([
            'nro_comprobante' => $resultado['numero_completo'] ?? null,
            'serie' => $resultado['serie'] ?? $guia->serie,
            'estado' => $resultado['estado'] ?? 'PENDIENTE',
            'sunat_document_id' => $resultado['documentId'] ?? null,
            'sunat_status' => $resultado['estado'] ?? 'PENDIENTE',
            'sunat_pdf_url' => isset($resultado['documentId'])
                ? $provider->documentoPDFUrl('guias-remision', (string) $resultado['documentId'], 'A4')
                : null,
            'sunat_response' => $resultado['plataforma'] ?? null,
        ]);

        return redirect()->route('guias.index')
            ->with('success', 'Guia de remision '.($guia->nro_comprobante ?? 'registrada').' emitida correctamente.');
    }

    public function estado(GuiaRemision $guia)
    {
        if (! $guia->sunat_document_id) {
            return back()->withErrors(['sunat' => 'La guia no tiene documento SUNAT.']);
        }

        $estado = FacturacionFactory::make()->getEstadoDocumento('guias-remision', (string) $guia->sunat_document_id);

        if (isset($estado['error'])) {
            return back()->withErrors(['sunat' => $estado['error']]);
        }

        $guia->update([
            'estado' => $estado['status'] ?? $guia->estado,
            'sunat_status' => $estado['status'] ?? $guia->sunat_status,
            'sunat_response' => $estado,
        ]);

        return back()->with('success', 'Estado actualizado: '.$guia->sunat_status);
    }

    public function pdf(GuiaRemision $guia)
    {
        if (! $guia->sunat_pdf_url) {
            return response()->json(['error' => 'PDF oficial no disponible'], 404);
        }

        try {
            $response = Http::timeout(15)->get($guia->sunat_pdf_url);

            if ($response->successful()) {
                return response($response->body(), 200, [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => 'inline; filename="'.$guia->nro_comprobante.'.pdf"',
                    'Cache-Control' => 'no-cache, private',
                ]);
            }
        } catch (\Throwable $e) {
            Log::warning('Error al proxificar PDF de guia de remision: '.$e->getMessage());
        }

        return response()->json(['error' => 'PDF oficial no disponible'], 404);
    }

    /**
     * Los items se derivan de la venta (unidades fisicas trasladadas). Si no
     * hay venta asociada se aceptan items manuales.
     */
    private function buildItems(Request $request, ?Venta $venta): array
    {
        if ($venta) {
            return $venta->detalles->map(function ($detalle) {
                return [
                    'codigo' => (string) ($detalle->producto?->sku ?? ''),
                    'descripcion' => (string) ($detalle->producto?->nombre ?? 'Item'),
                    'cantidad' => (float) ($detalle->cantidad_base ?: $detalle->cantidad),
                    'unidad' => $detalle->unidad?->codigo_sunat ?? 'NIU',
                ];
            })->all();
        }

        return collect($request->input('items', []))
            ->filter(fn ($item) => ! empty($item['descripcion']) && (float) ($item['cantidad'] ?? 0) > 0)
            ->map(fn ($item) => [
                'codigo' => (string) ($item['codigo'] ?? ''),
                'descripcion' => (string) $item['descripcion'],
                'cantidad' => (float) $item['cantidad'],
                'unidad' => (string) ($item['unidad'] ?? 'NIU'),
            ])
            ->values()
            ->all();
    }
}
