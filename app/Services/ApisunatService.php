<?php

namespace App\Services;

use App\Contracts\SunatProvider;
use App\Models\Venta;
use App\Models\Configuracion;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ApisunatService implements SunatProvider
{
    private string $baseUrl;

    private string $personaId;

    private string $personaToken;

    private string $customerEmail;

    private string $pdfFormat;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('apisunat.api_base_url', 'https://back.apisunat.com'), '/');
        $this->personaId = config('apisunat.persona_id', '');
        $this->personaToken = config('apisunat.persona_token', '');
        $this->customerEmail = config('apisunat.customer_email', '');
        $this->pdfFormat = config('apisunat.default_pdf_format', 'ticket80mm');
    }

    public function isConfigured(): bool
    {
        return $this->personaId !== '' && $this->personaToken !== '';
    }

    /**
     * Emitir comprobante (Factura o Boleta) a traves de APISUNAT.
     *
     * @param  Venta   $venta   modelo de la venta ya persistida
     * @param  string  $tipoDoc '01' (Factura) | '03' (Boleta)
     * @return array{status: string, documentId?: string, error?: array, fileName?: string}
     */
    public function emitirComprobante(Venta $venta, string $tipoDoc = '03'): array
    {
        $fileName = $this->buildFileName($venta, $tipoDoc);

        $payload = [
            'personaId' => $this->personaId,
            'personaToken' => $this->personaToken,
            'fileName' => $fileName,
            'customerEmail' => $this->customerEmail,
            'reference' => "POS Venta #{$venta->nro_comprobante}",
            'documentBody' => $this->buildDocumentBody($venta, $tipoDoc),
        ];

        try {
            $response = Http::timeout(30)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post("{$this->baseUrl}/personas/v1/sendBill", $payload);

            if ($response->failed()) {
                Log::error('APISUNAT sendBill HTTP error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'venta_id' => $venta->id,
                ]);

                return [
                    'status' => 'ERROR',
                    'error' => [
                        'http_status' => $response->status(),
                        'message' => 'Error HTTP al conectar con APISUNAT',
                        'detail' => $response->json('error'),
                    ],
                ];
            }

            $data = $response->json();

            if (($data['status'] ?? '') === 'ERROR') {
                Log::error('APISUNAT sendBill business error', [
                    'venta_id' => $venta->id,
                    'error' => $data['error'] ?? null,
                ]);
            }

            return array_merge($data, ['fileName' => $fileName]);

        } catch (\Exception $e) {
            Log::critical('APISUNAT sendBill exception', [
                'venta_id' => $venta->id,
                'message' => $e->getMessage(),
            ]);

            return [
                'status' => 'ERROR',
                'error' => [
                    'message' => $e->getMessage(),
                ],
            ];
        }
    }

    /**
     * Consultar el estado de un documento ya emitido.
     *
     * @return array{production: bool, status: string, type: string, fileName: string, xml: string, cdr: string, faults: array, notes: array}|array
     */
    public function getEstado(string $documentId, ?Venta $venta = null): array
    {
        try {
            $response = Http::timeout(15)->get(
                "{$this->baseUrl}/documents/{$documentId}/getById"
            );

            if ($response->failed()) {
                return ['error' => 'No se pudo obtener el estado del documento', 'http_status' => $response->status()];
            }

            return $response->json();
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Obtener URL del PDF de representacion impresa.
     *
     * @param  string  $documentId  ID devuelto por sendBill
     * @param  string  $fileName    nombre del archivo (sin .pdf)
     * @param  string  $format      A4 | A5 | ticket58mm | ticket80mm | default
     */
    public function getPDFUrl(string $documentId, string $fileName, string $format = ''): string
    {
        $format = $format ?: $this->pdfFormat;

        return "{$this->baseUrl}/documents/{$documentId}/getPDF/{$format}/{$fileName}.pdf";
    }

    /**
     * Construir el fileName SUNAT: RRRRRRRRRR-TT-SSSS-CCCCCCCC
     */
    public function buildFileName(Venta $venta, string $tipoDoc): string
    {
        $config = Configuracion::first();
        $ruc = str_pad($config?->ruc ?? '00000000000', 11, '0', STR_PAD_LEFT);

        [$serie, $numero] = explode('-', $venta->nro_comprobante);
        $correlativo = str_pad((int) $numero, 8, '0', STR_PAD_LEFT);

        return "{$ruc}-{$tipoDoc}-{$serie}-{$correlativo}";
    }

    /**
     * Construir el ID SUNAT del documento: SERIE-CCCCCCCC (8 dígitos).
     */
    public function buildDocumentId(Venta $venta): string
    {
        [$serie, $numero] = explode('-', $venta->nro_comprobante);

        return "{$serie}-" . str_pad((int) $numero, 8, '0', STR_PAD_LEFT);
    }

    /**
     * Determinar el tipo de documento de identidad del cliente.
     *
     * @return string schemeID: '6'=RUC, '1'=DNI, '4'=CE, '7'=Pasaporte, '0'=Sin doc
     */
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
    // Construccion del documentBody (UBL 2.1 JSON)
    // -------------------------------------------------------------------------

    private function buildDocumentBody(Venta $venta, string $tipoDoc): array
    {
        $config = Configuracion::first();
        $igvRate = (float) ($config?->igv ?? 18.00);
        $igvFactor = $igvRate / 100;
        $igvMultiplier = 1 + $igvFactor;

        $venta->load(['detalles.producto', 'detalles.unidad', 'cliente']);

        $total = round((float) $venta->total, 2);
        $baseImponible = 0.0;

        $lineItems = [];

        foreach ($venta->detalles as $lineIndex => $detalle) {
            $cantidad = (float) $detalle->cantidad;
            $precioConIgv = (float) $detalle->precio_unitario;
            $descuentoConIgv = round((float) $detalle->descuento, 2);

            $valorUnitario = round($precioConIgv / $igvMultiplier, 6);
            $subtotalBrutoLinea = round($valorUnitario * $cantidad, 2);

            // Descuento de línea expresado sin IGV (AllowanceCharge).
            $montoDescuento = 0.0;
            if ($descuentoConIgv > 0) {
                $montoDescuento = round($descuentoConIgv / $igvMultiplier, 6);
                if ($montoDescuento > $subtotalBrutoLinea) {
                    $montoDescuento = $subtotalBrutoLinea;
                }
            }

            $subtotalLinea = round($subtotalBrutoLinea - $montoDescuento, 2);
            $igvLinea = round($subtotalLinea * $igvFactor, 2);
            $baseImponible += $subtotalLinea;

            // Con descuento, se informan precios unitarios netos (sin AllowanceCharge)
            // para que SUNAT acepte la línea (error 3270 al mezclar precio de lista + descuento).
            $valorUnitario = round($precioConIgv / $igvMultiplier, 6);
            $precioVenta = $precioConIgv;
            if ($montoDescuento > 0) {
                $valorUnitario = round($subtotalLinea / $cantidad, 6);
                $precioVenta = round($valorUnitario * $igvMultiplier, 2);
            }

            $sunatUnitCode = 'NIU';
            if ($detalle->unidad) {
                $sunatUnitCode = $detalle->unidad->sunat_code;
            }

            $lineItems[] = $this->buildItemUBL(
                lineId: $lineIndex + 1,
                quantity: $cantidad,
                unitCode: $sunatUnitCode,
                valorUnitario: $valorUnitario,
                precioVenta: $precioVenta,
                subtotalLinea: $subtotalLinea,
                igvLinea: $igvLinea,
                description: $detalle->producto?->nombre ?? 'Item',
            );
        }

        $baseImponible = round($baseImponible, 2);
        $igvTotal = round($total - $baseImponible, 2);

        $customerSchemeId = $this->getCustomerDocType($venta->documento_cliente);

        $supplierParty = [
            'cac:Party' => [
                'cac:PartyIdentification' => [
                    'cbc:ID' => ['_attributes' => ['schemeID' => '6'], '_text' => $config?->ruc ?? ''],
                ],
                'cac:PartyLegalEntity' => [
                    'cbc:RegistrationName' => ['_text' => $config?->nombre_empresa ?? ''],
                    'cac:RegistrationAddress' => [
                        'cbc:AddressTypeCode' => ['_text' => '0000'],
                    ],
                ],
            ],
        ];

        $customerParty = [
            'cac:Party' => [
                'cac:PartyIdentification' => [
                    'cbc:ID' => [
                        '_attributes' => ['schemeID' => $customerSchemeId],
                        '_text' => $venta->documento_cliente,
                    ],
                ],
                'cac:PartyLegalEntity' => [
                    'cbc:RegistrationName' => ['_text' => $venta->nombre_cliente],
                ],
            ],
        ];

        $documentBody = [
            'cbc:UBLVersionID' => ['_text' => '2.1'],
            'cbc:CustomizationID' => ['_text' => '2.0'],
            'cbc:ID' => ['_text' => $this->buildDocumentId($venta)],
            'cbc:IssueDate' => ['_text' => $venta->created_at->format('Y-m-d')],
            'cbc:IssueTime' => ['_text' => $venta->created_at->format('H:i:s')],
            'cbc:InvoiceTypeCode' => [
                '_attributes' => ['listID' => '0101'],
                '_text' => $tipoDoc,
            ],
            'cbc:DocumentCurrencyCode' => ['_text' => 'PEN'],
            'cac:AccountingSupplierParty' => $supplierParty,
            'cac:AccountingCustomerParty' => $customerParty,
            'cac:TaxTotal' => [
                'cbc:TaxAmount' => ['_attributes' => ['currencyID' => 'PEN'], '_text' => $igvTotal],
                'cac:TaxSubtotal' => [
                    [
                        'cbc:TaxableAmount' => ['_attributes' => ['currencyID' => 'PEN'], '_text' => $baseImponible],
                        'cbc:TaxAmount' => ['_attributes' => ['currencyID' => 'PEN'], '_text' => $igvTotal],
                        'cac:TaxCategory' => [
                            'cac:TaxScheme' => [
                                'cbc:ID' => ['_text' => '1000'],
                                'cbc:Name' => ['_text' => 'IGV'],
                                'cbc:TaxTypeCode' => ['_text' => 'VAT'],
                            ],
                        ],
                    ],
                ],
            ],
            'cac:LegalMonetaryTotal' => [
                'cbc:LineExtensionAmount' => ['_attributes' => ['currencyID' => 'PEN'], '_text' => $baseImponible],
                'cbc:TaxInclusiveAmount' => ['_attributes' => ['currencyID' => 'PEN'], '_text' => $total],
                'cbc:PayableAmount' => ['_attributes' => ['currencyID' => 'PEN'], '_text' => $total],
            ],
            'cac:InvoiceLine' => $lineItems,
        ];

        if ($tipoDoc !== '03') {
            $documentBody['cac:PaymentTerms'] = [
                'cbc:ID' => ['_text' => 'FormaPago'],
                'cbc:PaymentMeansID' => ['_text' => 'Contado'],
            ];
        }

        return $documentBody;
    }

    /**
     * Construir un单品 InvoiceLine UBL.
     *
     * @return array<string, mixed>
     */
    private function buildItemUBL(
        int $lineId,
        float $quantity,
        string $unitCode,
        float $valorUnitario,
        float $precioVenta,
        float $subtotalLinea,
        float $igvLinea,
        string $description = 'Item',
    ): array {
        $item = [
            'cbc:ID' => ['_text' => $lineId],
            'cbc:InvoicedQuantity' => [
                '_attributes' => ['unitCode' => $unitCode],
                '_text' => $quantity,
            ],
            'cbc:LineExtensionAmount' => [
                '_attributes' => ['currencyID' => 'PEN'],
                '_text' => $subtotalLinea,
            ],
            'cac:PricingReference' => [
                'cac:AlternativeConditionPrice' => [
                    'cbc:PriceAmount' => [
                        '_attributes' => ['currencyID' => 'PEN'],
                        '_text' => $precioVenta,
                    ],
                    'cbc:PriceTypeCode' => ['_text' => '01'],
                ],
            ],
        ];

        $item['cac:TaxTotal'] = [
                'cbc:TaxAmount' => [
                    '_attributes' => ['currencyID' => 'PEN'],
                    '_text' => $igvLinea,
                ],
                'cac:TaxSubtotal' => [
                    [
                        'cbc:TaxableAmount' => [
                            '_attributes' => ['currencyID' => 'PEN'],
                            '_text' => $subtotalLinea,
                        ],
                        'cbc:TaxAmount' => [
                            '_attributes' => ['currencyID' => 'PEN'],
                            '_text' => $igvLinea,
                        ],
                        'cac:TaxCategory' => [
                            'cbc:Percent' => ['_text' => 18],
                            'cbc:TaxExemptionReasonCode' => ['_text' => '10'],
                            'cac:TaxScheme' => [
                                'cbc:ID' => ['_text' => '1000'],
                                'cbc:Name' => ['_text' => 'IGV'],
                                'cbc:TaxTypeCode' => ['_text' => 'VAT'],
                            ],
                        ],
                    ],
                ],
            ];
        $item['cac:Item'] = [
            'cbc:Description' => ['_text' => $description],
        ];
        $item['cac:Price'] = [
            'cbc:PriceAmount' => [
                '_attributes' => ['currencyID' => 'PEN'],
                '_text' => $valorUnitario,
            ],
        ];

        return $item;
    }
}
