<?php

namespace App\Services;

use App\Contracts\SunatProvider;
use App\Models\Configuracion;
use App\Models\Venta;
use App\Support\FacturacionSettings;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Integración con la Plataforma-Sunat (API nativa, multi-tenant desplegada en
 * https://api.cma-shop.com). Autentica con X-Api-Key + X-Api-Secret.
 *
 * - Emisión:  POST   /sunat/facturas | /sunat/boletas
 * - Estado:   GET    /v1/facturas/{id} | /v1/boletas/{id}
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

        [$serie, $numero] = array_pad(explode('-', (string) $venta->nro_comprobante), 2, '');
        $correlativo = (int) ltrim($numero, '0');

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
            'correlativo' => $correlativo,
            'fecha_emision' => $venta->created_at->format('Y-m-d'),
            'tipo_moneda' => 'PEN',
            'forma_pago' => 'Contado',
            'cliente' => $cliente,
            'items' => $this->buildItems($venta),
        ];

        $endpoint = $tipoDoc === '01'
            ? "{$this->baseUrl}/sunat/facturas"
            : "{$this->baseUrl}/sunat/boletas";

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

            return [
                'status' => 'OK',
                'documentId' => $documentId,
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

        try {
            $response = Http::timeout(20)
                ->withHeaders([
                    'Accept' => 'application/json',
                    'X-Api-Key' => $this->apiKey,
                    'X-Api-Secret' => $this->apiSecret,
                ])
                ->get("{$this->baseUrl}/v1/{$endpoint}/{$documentId}");

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
                'type' => $tipoDoc,
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

        return "{$this->baseUrl}/sunat/{$tipo}/{$documentId}/pdf?{$query}";
    }

    public function buildFileName(Venta $venta, string $tipoDoc): string
    {
        $config = Configuracion::first();
        $ruc = str_pad((string) ($config?->ruc ?? '00000000000'), 11, '0', STR_PAD_LEFT);

        [$serie, $numero] = explode('-', (string) $venta->nro_comprobante);
        $correlativo = str_pad((int) $numero, 8, '0', STR_PAD_LEFT);

        return "{$ruc}-{$tipoDoc}-{$serie}-{$correlativo}";
    }

    public function buildDocumentId(Venta $venta): string
    {
        [$serie, $numero] = explode('-', (string) $venta->nro_comprobante);

        return "{$serie}-" . str_pad((int) $numero, 8, '0', STR_PAD_LEFT);
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

    // -------------------------------------------------------------------------
    // Helpers internos
    // -------------------------------------------------------------------------

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
                $unidad = $detalle->unidad->sunat_code;
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