<?php

namespace App\Services;

use App\Contracts\SunatProvider;
use App\Models\Configuracion;
use App\Models\GuiaRemision;
use App\Models\NotaDebito;
use App\Models\Venta;
use App\Support\FacturacionSettings;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Integración con la Plataforma-Sunat (API nativa, multi-tenant desplegada en
 * https://api.cma-shop.com). Autentica con X-Api-Key + X-Api-Secret.
 *
 * - Emisión:  POST   /facturas | /boletas
 * - Estado:   GET    /facturas/{id} | /boletas/{id}
 * - PDF:      GET    /sunat/facturas|boletas/{id}/pdf?format=...&api_key=...&api_secret=...
 */
class PlataformaSunatService implements SunatProvider
{
    private string $baseUrl;

    private string $apiKey;

    private string $apiSecret;

    public function __construct()
    {
        $settings = FacturacionSettings::plataforma();

        $this->baseUrl = $settings['base_url'];
        $this->apiKey = $settings['api_key'];
        $this->apiSecret = $settings['api_secret'];
    }

    public function isConfigured(): bool
    {
        return $this->baseUrl !== '' && $this->apiKey !== '' && $this->apiSecret !== '';
    }

    public function emitirComprobante(Venta $venta, string $tipoDoc = '03'): array
    {
        if (! $this->isConfigured()) {
            return [
                'status' => 'ERROR',
                'error' => ['message' => 'La Plataforma SUNAT no está configurada (Configuración del Sistema).'],
            ];
        }

        // El correlativo lo asigna la Plataforma (la empresa ya tiene su
        // numeración). El POS solo informa la serie del tipo de documento.
        $serie = $this->resolveSerie($tipoDoc);

        $docType = $this->getCustomerDocType($venta->documento_cliente);

        if ($tipoDoc === '01' && $docType !== '6') {
            return [
                'status' => 'ERROR',
                'error' => ['message' => 'Para emitir Factura, el cliente debe tener RUC (11 dígitos).'],
            ];
        }

        $cliente = ['tipo_doc' => $docType];

        if ($venta->documento_cliente !== '') {
            $cliente['num_doc'] = $venta->documento_cliente;
        } elseif ($docType === '0') {
            // Boleta sin documento: el schema de la plataforma exige num_doc no vacío.
            $cliente['num_doc'] = '0';
        }

        $cliente['razon_social'] = $venta->nombre_cliente ?: 'CLIENTE VARIOS';

        $direccion = $venta->cliente?->direccion;
        if ($direccion) {
            $cliente['direccion'] = $direccion;
        }

        $payload = [
            'serie' => $serie,
            'fecha_emision' => $venta->created_at->format('Y-m-d'),
            'tipo_moneda' => 'PEN',
            'forma_pago' => 'Contado',
            'cliente' => $cliente,
            'items' => $this->buildItems($venta),
        ];

        $endpoint = $tipoDoc === '01'
            ? "{$this->baseUrl}/facturas"
            : "{$this->baseUrl}/boletas";

        try {
            $response = Http::timeout(45)
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                    'X-Api-Key' => $this->apiKey,
                    'X-Api-Secret' => $this->apiSecret,
                ])
                ->post($endpoint, $payload);

            $data = $response->json();

            if ($response->failed()) {
                Log::error('Plataforma SUNAT emisión HTTP error', [
                    'venta_id' => $venta->id,
                    'status' => $response->status(),
                    'body' => $data ?? $response->body(),
                ]);

                return [
                    'status' => 'ERROR',
                    'error' => [
                        'http_status' => $response->status(),
                        'message' => $data['mensaje'] ?? 'Error HTTP al conectar con la Plataforma SUNAT',
                        'detail' => $data['errores'] ?? null,
                        'validation' => $data['errores'] ?? null,
                    ],
                ];
            }

            $documentId = data_get($data, 'datos.id');

            if (! $documentId) {
                return [
                    'status' => 'ERROR',
                    'error' => ['message' => $data['mensaje'] ?? 'La Plataforma SUNAT respondió sin id de documento.'],
                ];
            }

            // La Plataforma asigna el correlativo: adoptamos su número oficial.
            $numeroCompleto = data_get($data, 'datos.numero_completo');
            $seriePlataforma = data_get($data, 'datos.serie', $serie);
            $correlativoPlataforma = data_get($data, 'datos.correlativo');

            if (! $numeroCompleto && $seriePlataforma && $correlativoPlataforma !== null) {
                $numeroCompleto = $seriePlataforma . '-' . str_pad((int) $correlativoPlataforma, 8, '0', STR_PAD_LEFT);
            }

            if ($numeroCompleto) {
                $venta->nro_comprobante = $numeroCompleto;
            }

            return [
                'status' => 'OK',
                'documentId' => $documentId,
                'numero_completo' => $numeroCompleto,
                'serie' => $seriePlataforma,
                'correlativo' => $correlativoPlataforma,
                'fileName' => $this->buildFileName($venta, $tipoDoc),
                'plataforma' => data_get($data, 'datos'),
            ];
        } catch (\Exception $e) {
            Log::critical('Plataforma SUNAT emisión exception', [
                'venta_id' => $venta->id,
                'message' => $e->getMessage(),
            ]);

            return [
                'status' => 'ERROR',
                'error' => ['message' => $e->getMessage()],
            ];
        }
    }

    public function getEstado(string $documentId, ?Venta $venta = null): array
    {
        $tipoDoc = $this->resolveDocType($venta);
        $endpoint = $tipoDoc === '01' ? 'facturas' : 'boletas';

        return $this->getEstadoDocumento($endpoint, $documentId);
    }

    public function getEstadoDocumento(string $recurso, string $documentId): array
    {
        try {
            $response = Http::timeout(20)
                ->withHeaders([
                    'Accept' => 'application/json',
                    'X-Api-Key' => $this->apiKey,
                    'X-Api-Secret' => $this->apiSecret,
                ])
                ->get("{$this->baseUrl}/{$recurso}/{$documentId}");

            if ($response->failed()) {
                return [
                    'error' => 'No se pudo obtener el estado del documento',
                    'http_status' => $response->status(),
                ];
            }

            $data = $response->json();

            if (($data['estado'] ?? '') === 'error') {
                return [
                    'error' => $data['mensaje'] ?? 'Error de la Plataforma SUNAT',
                    'http_status' => $response->status(),
                ];
            }

            $doc = (array) ($data['datos'] ?? []);
            $sunat = (array) ($doc['sunat'] ?? []);
            $estadoRaw = strtolower((string) ($sunat['estado'] ?? 'pendiente'));

            $faults = [];
            if (! empty($sunat['descripcion'])) {
                $faults[] = ['faultstring' => ['_text' => (string) $sunat['descripcion']]];
            }
            foreach ((array) ($sunat['notas'] ?? []) as $nota) {
                $faults[] = ['faultstring' => ['_text' => (string) $nota]];
            }

            return [
                'status' => $this->normalizeStatus($estadoRaw),
                'type' => $recurso,
                'fileName' => $doc['numero_completo'] ?? null,
                'cdr' => $sunat['hash_cpe'] ?? null,
                'faults' => $faults,
                'sunat_status_raw' => $estadoRaw,
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    public function getPDFUrl(string $documentId, string $fileName, string $format = ''): string
    {
        $format = $format ?: (string) config('facturacion.default_pdf_format', 'ticket-80');

        $tipo = 'boletas';
        $parts = explode('-', $fileName);
        $tipoDoc = $parts[1] ?? '';
        if ($tipoDoc === '01') {
            $tipo = 'facturas';
        }

        $query = http_build_query(array_filter([
            'format' => $format,
            'api_key' => $this->apiKey,
            'api_secret' => $this->apiSecret,
        ]));

        return "{$this->baseUrl}/{$tipo}/{$documentId}/pdf?{$query}";
    }

    public function buildFileName(Venta $venta, string $tipoDoc): string
    {
        $config = Configuracion::first();
        $ruc = str_pad((string) ($config?->ruc ?? '00000000000'), 11, '0', STR_PAD_LEFT);

        [$serie, $numero] = array_pad(explode('-', (string) $venta->nro_comprobante), 2, '');
        $serie = $serie ?: $this->resolveSerie($tipoDoc);
        $correlativo = str_pad((int) $numero, 8, '0', STR_PAD_LEFT);

        return "{$ruc}-{$tipoDoc}-{$serie}-{$correlativo}";
    }

    public function buildDocumentId(Venta $venta): string
    {
        [$serie, $numero] = array_pad(explode('-', (string) $venta->nro_comprobante), 2, '');

        return ($serie ?: 'B001') . '-' . str_pad((int) $numero, 8, '0', STR_PAD_LEFT);
    }

    public function getCustomerDocType(?string $rucDni): string
    {
        if (empty($rucDni)) {
            return '0';
        }

        $digits = preg_replace('/\D/', '', $rucDni);

        return match (strlen($digits)) {
            11 => '6',
            8 => '1',
            default => '0',
        };
    }

    public function emitirNotaDebito(NotaDebito $nota): array
    {
        if (! $this->isConfigured()) {
            return $this->notConfigured();
        }

        $nota->loadMissing(['venta.cliente']);
        $venta = $nota->venta;
        $nroComprobante = (string) ($venta?->nro_comprobante ?? '');

        [$serieAfectada, $correlativo] = array_pad(explode('-', $nroComprobante), 2, '');

        if (! $venta || $serieAfectada === '') {
            return [
                'status' => 'ERROR',
                'error' => ['message' => 'La venta no tiene un comprobante emitido ante SUNAT.'],
            ];
        }

        $tipoAfectado = str_starts_with(strtoupper($serieAfectada), 'F') ? '01' : '03';
        $config = Configuracion::first();
        $serie = $nota->serie
            ?: (string) ($config?->serie_nota_debito ?: ($tipoAfectado === '01' ? 'FD01' : 'BD01'));

        $docType = $this->getCustomerDocType($venta->documento_cliente);
        $cliente = [
            'tipo_doc' => $docType,
            'num_doc' => $venta->documento_cliente !== '' ? $venta->documento_cliente : '0',
            'razon_social' => $venta->nombre_cliente ?: 'CLIENTE VARIOS',
        ];

        if ($venta->cliente?->direccion) {
            $cliente['direccion'] = $venta->cliente->direccion;
        }

        $payload = [
            'serie' => $serie,
            'fecha_emision' => ($nota->created_at ?? now())->format('Y-m-d'),
            'tipo_moneda' => 'PEN',
            'cliente' => $cliente,
            'doc_afectado_tipo' => $tipoAfectado,
            'doc_afectado_serie' => $serieAfectada,
            'doc_afectado_correlativo' => str_pad((string) $correlativo, 8, '0', STR_PAD_LEFT),
            'cod_motivo' => $nota->motivo_codigo,
            'des_motivo' => $nota->motivo_descripcion,
            'items' => [[
                'descripcion' => $nota->motivo_descripcion,
                'unidad' => 'ZZ',
                'cantidad' => 1,
                'precio_unitario' => (float) $nota->total,
                'tip_afe_igv' => '10',
            ]],
        ];

        return $this->emitirDocumento('notas-debito', $payload, $serie);
    }

    public function emitirGuiaRemision(GuiaRemision $guia): array
    {
        if (! $this->isConfigured()) {
            return $this->notConfigured();
        }

        $payload = [
            'serie' => $guia->serie,
            'fecha_emision' => $guia->fecha_emision->format('Y-m-d'),
            'observacion' => $guia->observacion,
            'destinatario' => [
                'tipo_doc' => $guia->destinatario_tipo_doc,
                'num_doc' => $guia->destinatario_num_doc,
                'razon_social' => $guia->destinatario_razon_social,
            ],
            'cod_traslado' => $guia->motivo_traslado,
            'mod_traslado' => $guia->modalidad,
            'fecha_traslado' => $guia->fecha_traslado->format('Y-m-d'),
            'peso_total' => (float) $guia->peso_total,
            'und_peso_total' => $guia->und_peso_total,
            'num_bultos' => $guia->num_bultos,
            'partida_ubigeo' => $guia->partida_ubigeo,
            'partida_direccion' => $guia->partida_direccion,
            'llegada_ubigeo' => $guia->llegada_ubigeo,
            'llegada_direccion' => $guia->llegada_direccion,
            'items' => $guia->items ?: [],
        ];

        if ($guia->modalidad === '01') {
            $payload['transportista'] = [
                'tipo_doc' => $guia->transportista_tipo_doc ?: '6',
                'num_doc' => $guia->transportista_num_doc,
                'razon_social' => $guia->transportista_razon_social,
                'nro_mtc' => $guia->transportista_nro_mtc,
            ];
        } else {
            $payload['vehiculo'] = ['placa' => $guia->vehiculo_placa];

            if ($guia->conductor_num_doc) {
                $payload['conductor'] = [
                    'tipo_doc' => $guia->conductor_tipo_doc ?: '1',
                    'num_doc' => $guia->conductor_num_doc,
                    'tipo' => 'Principal',
                    'nombres' => $guia->conductor_nombres,
                    'apellidos' => $guia->conductor_apellidos,
                    'licencia' => $guia->conductor_licencia,
                ];
            }
        }

        return $this->emitirDocumento('guias-remision', $payload, $guia->serie);
    }

    public function reenviar(string $recurso, string $documentId): array
    {
        if (! $this->isConfigured()) {
            return $this->notConfigured();
        }

        try {
            $response = $this->client()->post("{$this->baseUrl}/{$recurso}/{$documentId}/reenviar");
            $data = $response->json();

            if ($response->failed()) {
                return [
                    'status' => 'ERROR',
                    'error' => [
                        'http_status' => $response->status(),
                        'message' => $data['mensaje'] ?? 'Error HTTP al reenviar el documento',
                        'detail' => $data['errores'] ?? null,
                    ],
                ];
            }

            if (($data['estado'] ?? '') === 'error') {
                return [
                    'status' => 'ERROR',
                    'error' => ['message' => $data['mensaje'] ?? 'La Plataforma SUNAT rechazo el reenvio.'],
                ];
            }

            return [
                'status' => 'OK',
                'estado' => $this->normalizeStatus((string) data_get($data, 'datos.sunat.estado', 'pendiente')),
                'datos' => (array) data_get($data, 'datos', []),
            ];
        } catch (\Throwable $e) {
            Log::error('Plataforma SUNAT reenvio exception', [
                'recurso' => $recurso,
                'document_id' => $documentId,
                'message' => $e->getMessage(),
            ]);

            return ['status' => 'ERROR', 'error' => ['message' => $e->getMessage()]];
        }
    }

    public function documentoPDFUrl(string $recurso, string $documentId, string $format = ''): string
    {
        $format = $format ?: (string) config('facturacion.default_pdf_format', 'ticket-80');

        $query = http_build_query(array_filter([
            'format' => $format,
            'api_key' => $this->apiKey,
            'api_secret' => $this->apiSecret,
        ]));

        return "{$this->baseUrl}/{$recurso}/{$documentId}/pdf?{$query}";
    }

    // -------------------------------------------------------------------------
    // Helpers internos
    // -------------------------------------------------------------------------

    private function client(): PendingRequest
    {
        return Http::timeout(45)->withHeaders([
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
            'X-Api-Key' => $this->apiKey,
            'X-Api-Secret' => $this->apiSecret,
        ]);
    }

    private function notConfigured(): array
    {
        return [
            'status' => 'ERROR',
            'error' => ['message' => 'La Plataforma SUNAT no esta configurada (Configuracion del Sistema).'],
        ];
    }

    /**
     * Enviar un documento a la plataforma y normalizar la respuesta.
     */
    private function emitirDocumento(string $recurso, array $payload, ?string $serieEnviada = null): array
    {
        try {
            $response = $this->client()->post("{$this->baseUrl}/{$recurso}", $payload);
            $data = $response->json();

            if ($response->failed()) {
                Log::error("Plataforma SUNAT emision {$recurso} HTTP error", [
                    'status' => $response->status(),
                    'body' => $data ?? $response->body(),
                ]);

                return [
                    'status' => 'ERROR',
                    'error' => [
                        'http_status' => $response->status(),
                        'message' => $data['mensaje'] ?? 'Error HTTP al conectar con la Plataforma SUNAT',
                        'detail' => $data['errores'] ?? null,
                        'validation' => $data['errores'] ?? null,
                    ],
                ];
            }

            $documentId = data_get($data, 'datos.id');

            if (! $documentId) {
                return [
                    'status' => 'ERROR',
                    'error' => ['message' => $data['mensaje'] ?? 'La Plataforma SUNAT respondio sin id de documento.'],
                ];
            }

            $numeroCompleto = data_get($data, 'datos.numero_completo');
            $serie = data_get($data, 'datos.serie', $serieEnviada);
            $correlativo = data_get($data, 'datos.correlativo');

            if (! $numeroCompleto && $serie && $correlativo !== null) {
                $numeroCompleto = $serie.'-'.str_pad((int) $correlativo, 8, '0', STR_PAD_LEFT);
            }

            return [
                'status' => 'OK',
                'documentId' => $documentId,
                'numero_completo' => $numeroCompleto,
                'serie' => $serie,
                'correlativo' => $correlativo,
                'estado' => $this->normalizeStatus((string) data_get($data, 'datos.sunat.estado', 'pendiente')),
                'plataforma' => (array) data_get($data, 'datos', []),
            ];
        } catch (\Throwable $e) {
            Log::critical("Plataforma SUNAT emision {$recurso} exception", [
                'message' => $e->getMessage(),
            ]);

            return ['status' => 'ERROR', 'error' => ['message' => $e->getMessage()]];
        }
    }

    /**
     * Serie configurada para el tipo de documento (01 Factura / 03 Boleta).
     * El correlativo NO se genera en el POS: lo asigna la Plataforma.
     */
    private function resolveSerie(string $tipoDoc): string
    {
        $config = Configuracion::first();

        return $tipoDoc === '01'
            ? (string) ($config?->serie_factura ?: 'F001')
            : (string) ($config?->serie_boleta ?: 'B001');
    }

    /**
     * Resolver 01/03 desde la serie de la venta (F…→factura, B…→boleta).
     */
    private function resolveDocType(?Venta $venta): string
    {
        if ($venta) {
            $serie = strtoupper(explode('-', (string) $venta->nro_comprobante)[0] ?? '');

            if (str_starts_with($serie, 'F')) {
                return '01';
            }
            if (str_starts_with($serie, 'B')) {
                return '03';
            }
        }

        return '03';
    }

    /**
     * Mapear el estado de la plataforma a los estados usados por el POS.
     */
    public function normalizeStatus(string $raw): string
    {
        $m = strtolower($raw);

        if (str_contains($m, 'acepta')) {
            return 'ACEPTADO';
        }
        if (str_contains($m, 'rechaz')) {
            return 'ERROR';
        }
        if (str_contains($m, 'excepc') || str_contains($m, 'observ')) {
            return 'EXCEPCION';
        }
        if (str_contains($m, 'envi') || str_contains($m, 'proces')) {
            return 'ENVIADO';
        }

        return 'PENDIENTE';
    }

    /**
     * Construir los ítems del comprobante. El descuento del detalle se integra en
     * el precio unitario neto (con IGV) para que la plataforma calcule los montos
     * SUNAT (valor unitario, base IGV, IGV) sin AllowanceCharge que rompa SUNAT.
     */
    private function buildItems(Venta $venta): array
    {
        $config = Configuracion::first();
        $igvRate = (float) ($config?->igv ?? 18.00);
        $igvMultiplier = 1 + $igvRate / 100;

        $venta->loadMissing(['detalles.producto', 'detalles.unidad', 'cliente']);

        $items = [];

        foreach ($venta->detalles as $detalle) {
            $cantidad = (float) $detalle->cantidad;
            $precioConIgv = (float) $detalle->precio_unitario;
            $descuentoConIgv = round((float) $detalle->descuento, 2);

            $valorUnitario = round($precioConIgv / $igvMultiplier, 6);
            $subtotalBruto = round($valorUnitario * $cantidad, 2);

            $montoDescuento = 0.0;
            if ($descuentoConIgv > 0) {
                $montoDescuento = round($descuentoConIgv / $igvMultiplier, 6);
                if ($montoDescuento > $subtotalBruto) {
                    $montoDescuento = $subtotalBruto;
                }
            }

            $subtotalNeto = round($subtotalBruto - $montoDescuento, 2);
            $precioNetoConIgv = $cantidad > 0
                ? round(($subtotalNeto * $igvMultiplier) / $cantidad, 2)
                : $precioConIgv;

            $unidad = 'NIU';
            if ($detalle->unidad) {
                $unidad = $detalle->unidad->codigo_sunat ?? 'NIU';
            }

            $items[] = [
                'codigo' => (string) ($detalle->producto?->sku ?? ''),
                'descripcion' => $detalle->producto?->nombre ?? 'Item',
                'unidad' => $unidad,
                'cantidad' => $cantidad,
                'precio_unitario' => $precioNetoConIgv,
            ];
        }

        return $items;
    }
}