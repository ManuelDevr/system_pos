<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSaleRequest;
use App\Models\Caja;
use App\Models\Configuracion;
use App\Models\ConversionUnidadProducto;
use App\Models\DetalleVenta;
use App\Models\Producto;
use App\Models\Unidad;
use App\Models\Venta;
use App\Services\FacturacionFactory;
use App\Services\KardexService;
use App\Support\FacturacionSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SaleController extends Controller
{
    public function index()
    {
        return Inertia::render('Sales/Index', [
            'ventas' => Venta::select('id', 'total', 'costo_total', 'pagado_con', 'vuelto', 'metodo_pago', 'nro_comprobante', 'tipo_comprobante', 'estado', 'estado_pago', 'user_id', 'caja_id', 'sucursal_id', 'cliente_id', 'cliente_tipo_doc', 'cliente_documento', 'cliente_nombre', 'sunat_envio', 'sunat_status', 'sunat_document_id', 'sunat_pdf_url', 'sunat_cdr', 'sunat_response_at', 'created_at')
                ->with([
                    'cliente:id,nombre,ruc_dni',
                    'user:id,name',
                    'caja:id,estado,abierta_en,cerrada_en',
                    'sucursal:id,nombre',
                    'detalles.producto:id,nombre',
                ])
                ->orderBy('created_at', 'desc')
                ->get(),
        ]);
    }

    public function checkout()
    {
        $config = Configuracion::first();

        $caja = Caja::abierta()
            ->where('user_id', auth()->id())
            ->latest('id')
            ->first();

        return Inertia::render('Sales/Checkout', [
            // El correlativo lo asigna la Plataforma-Sunat al emitir.
            'igv' => (float) ($config?->igv ?? 18.00),
            'metodos_pago' => $config?->metodos_pago ?? ['Efectivo', 'Transferencia', 'Yape', 'Plin', 'BCP'],
            'caja' => $caja,
            'productos' => Producto::select('id', 'nombre', 'sku', 'codigo_barras', 'stock', 'precio_venta', 'costo_promedio', 'precio_compra', 'unidad_medida', 'es_fraccionable', 'marca_id', 'imagen_url')
                ->with(['marca:id,nombre', 'conversiones.unidad:id,nombre,abreviatura'])
                ->where('estado', 'Activo')
                ->get(),
        ]);
    }

    public function store(StoreSaleRequest $request)
    {
        $caja = Caja::abierta()
            ->where('user_id', auth()->id())
            ->latest('id')
            ->first();

        if (! $caja) {
            return redirect()->back()->withErrors([
                'error' => 'No tienes una caja abierta. Abre tu turno antes de vender.',
            ]);
        }

        $tipoComprobante = $request->tipo_comprobante ?? 'Boleta';
        $tipoDocMap = ['Boleta' => '03', 'Factura' => '01'];
        $tipoDoc = $tipoDocMap[$tipoComprobante] ?? null;

        try {
            $venta = DB::transaction(function () use ($request, $caja, $tipoComprobante) {
                $totalBackend = 0;
                $costoTotal = 0;
                $itemsData = [];
                $productosProcesados = [];
                $cantidadesRequeridas = [];

                foreach ($request->items as $item) {
                    $productId = $item['producto_id'];

                    if (! isset($productosProcesados[$productId])) {
                        $producto = Producto::lockForUpdate()->find($productId);
                        if (! $producto || $producto->estado !== 'Activo') {
                            throw new \Exception('El producto seleccionado no está disponible o está inactivo.');
                        }
                        $productosProcesados[$productId] = $producto;
                        $cantidadesRequeridas[$productId] = 0;
                    }

                    $producto = $productosProcesados[$productId];

                    $factor = 1;
                    $precioReal = (float) $producto->precio_venta;

                    // Buscar unidad y su mapeo SUNAT
                    $unidad = Unidad::where('nombre', $producto->unidad_medida)->first();

                    if (isset($item['conversion_id']) && $item['conversion_id']) {
                        $conv = ConversionUnidadProducto::with('unidad')->find($item['conversion_id']);
                        if ($conv) {
                            $factor = (float) $conv->factor;
                            $precioReal = (float) $conv->precio_venta;
                            $unidad = $conv->unidad;
                        }
                    }

                    $cantidad = (float) $item['cantidad'];
                    $cantidadBase = $cantidad * $factor;
                    $cantidadesRequeridas[$productId] += $cantidadBase;

                    if ((float) $producto->stock < $cantidadesRequeridas[$productId]) {
                        throw new \Exception('Stock insuficiente para: '.$producto->nombre);
                    }

                    // Costo unitario por unidad vendida (para valorización/utilidad).
                    $costoBase = (float) ($producto->costo_promedio > 0 ? $producto->costo_promedio : $producto->precio_compra);
                    $costoUnitario = $costoBase * $factor;

                    $subtotalReal = $cantidad * $precioReal;
                    $descuentoItem = round((float) ($item['descuento'] ?? 0), 2);
                    $subtotalDescuento = round(max($subtotalReal - $descuentoItem, 0), 2);
                    $totalBackend += $subtotalDescuento;
                    $costoTotal += $cantidad * $costoUnitario;

                    $itemsData[] = [
                        'producto_id' => $producto->id,
                        'nombre' => $producto->nombre,
                        'cantidad' => $cantidad,
                        'precio_unitario' => $precioReal,
                        'costo_unitario' => $costoUnitario,
                        'subtotal' => $subtotalReal,
                        'descuento' => $descuentoItem,
                        'subtotal_descuento' => $subtotalDescuento,
                        'unidad_id' => $item['unidad_id'] ?? ($unidad ? $unidad->id : null),
                        'cantidad_base' => $cantidadBase,
                        'producto_model' => $producto,
                    ];
                }

                $config = Configuracion::first();
                $igvRate = (float) ($config?->igv ?? 18.00);
                $baseImponible = round($totalBackend / (1 + $igvRate / 100), 2);
                $igvAmount = round($totalBackend - $baseImponible, 2);

                $venta = Venta::create([
                    'total' => $totalBackend,
                    'costo_total' => round($costoTotal, 2),
                    'pagado_con' => $request->metodo_pago === 'Efectivo' ? round((float) $request->pagado_con, 2) : null,
                    'vuelto' => $request->metodo_pago === 'Efectivo' ? round((float) $request->vuelto, 2) : null,
                    'descuento' => round((float) ($request->descuento ?? 0), 2),
                    'base_imponible' => $baseImponible,
                    'igv' => $igvAmount,
                    'metodo_pago' => $request->metodo_pago,
                    'tipo_comprobante' => $tipoComprobante,
                    'estado' => 'Pagado',
                    'estado_pago' => 'Pagado',
                    'user_id' => auth()->id(),
                    'caja_id' => $caja->id,
                    'sucursal_id' => $caja->sucursal_id,
                    'cliente_id' => $request->cliente_id,
                    'cliente_tipo_doc' => $request->cliente_tipo_doc,
                    'cliente_documento' => $request->cliente_documento,
                    'cliente_nombre' => $request->cliente_nombre,
                    // nro_comprobante queda null: lo asigna la Plataforma-Sunat al emitir.
                ]);

                foreach ($itemsData as $data) {
                    DetalleVenta::create([
                        'venta_id' => $venta->id,
                        'producto_id' => $data['producto_id'],
                        'cantidad' => $data['cantidad'],
                        'precio_unitario' => $data['precio_unitario'],
                        'costo_unitario' => round($data['costo_unitario'], 4),
                        'subtotal' => $data['subtotal'],
                        'descuento' => $data['descuento'],
                        'subtotal_descuento' => $data['subtotal_descuento'],
                        'unidad_id' => $data['unidad_id'],
                        'cantidad_base' => $data['cantidad_base'],
                    ]);

                    // Registrar en Kardex y actualizar stock
                    KardexService::registrarMovimiento(
                        $data['producto_model'],
                        'SALIDA',
                        $data['cantidad_base'],
                        'Venta #'.$venta->id,
                        'Venta',
                        $venta->id,
                        round($data['costo_unitario'], 4),
                        $venta->sucursal_id
                    );
                }

                return $venta;
            });
        } catch (\Throwable $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }

        // La emisión SUNAT ocurre FUERA de la transacción para no mantener locks
        // de fila durante una llamada HTTP larga.
        $sunat = $this->emitirSunat($venta, $tipoDoc);

        return redirect()->back()->with([
            'success' => 'Venta realizada y stock actualizado en Kardex.',
            'last_sale_id' => $venta->id,
            'sunat' => $sunat,
        ]);
    }

    public function cancel(Venta $venta)
    {
        if ($venta->estado === 'Anulado') {
            return redirect()->back()->withErrors(['error' => 'La venta ya está anulada.']);
        }

        try {
            DB::transaction(function () use ($venta) {
                $venta->loadMissing('detalles');

                foreach ($venta->detalles as $detalle) {
                    // withTrashed: recupera el producto aunque haya sido eliminado (SoftDeletes)
                    $producto = Producto::withTrashed()->find($detalle->producto_id);

                    if (! $producto) {
                        Log::warning('Anulación venta '.($venta->nro_comprobante ?? $venta->id).": producto ID {$detalle->producto_id} no encontrado.");
                        continue;
                    }

                    KardexService::registrarMovimiento(
                        $producto,
                        'ENTRADA',
                        (float) ($detalle->cantidad_base ?: $detalle->cantidad),
                        'Anulación Venta: '.($venta->nro_comprobante ?? 'Venta #'.$venta->id),
                        'Venta',
                        $venta->id,
                        (float) $detalle->costo_unitario,
                        $venta->sucursal_id
                    );
                }

                $venta->estado = 'Anulado';
                $venta->save();
            });
        } catch (\Throwable $e) {
            Log::error('Error al anular venta '.$venta->id.': '.$e->getMessage());
            return redirect()->back()->withErrors(['error' => 'No se pudo anular la venta.']);
        }

        return redirect()->back()->with('success', 'Venta anulada y stock retornado al Kardex.');
    }

    public function emitir(Request $request, Venta $venta)
    {
        $tipoDoc = $request->input('tipo_documento', '03');

        if (! in_array($tipoDoc, ['01', '03'])) {
            return back()->withErrors(['error' => 'Tipo de documento inválido. Use 01 (Factura) o 03 (Boleta).']);
        }

        if ($venta->sunat_envio) {
            return back()->withErrors(['error' => 'Esta venta ya fue emitida ante SUNAT.']);
        }

        $venta->load(['detalles.producto', 'detalles.unidad', 'cliente']);

        $sunat = $this->emitirSunat($venta, $tipoDoc);

        if (($sunat['status'] ?? null) === 'ERROR') {
            return back()->withErrors([
                'sunat' => $sunat['message'] ?? 'Error desconocido al emitir el comprobante.',
            ]);
        }

        return back()->with([
            'success' => 'Comprobante enviado. Documento: '.($sunat['document_id'] ?? ''),
            'sunat_status' => $sunat['status'],
            'sunat_pdf_url' => $sunat['pdf_url'],
        ]);
    }

    public function reenviar(Venta $venta)
    {
        if (! $venta->sunat_document_id) {
            return back()->withErrors(['sunat' => 'La venta no tiene un documento SUNAT para reenviar.']);
        }

        $serie = strtoupper(explode('-', (string) $venta->nro_comprobante)[0] ?? '');
        $recurso = str_starts_with($serie, 'F') ? 'facturas' : 'boletas';

        $resultado = FacturacionFactory::make()->reenviar($recurso, (string) $venta->sunat_document_id);

        if (($resultado['status'] ?? null) === 'ERROR') {
            return back()->withErrors([
                'sunat' => $resultado['error']['message'] ?? 'No se pudo reenviar el comprobante.',
            ]);
        }

        $venta->update([
            'sunat_status' => $resultado['estado'] ?? $venta->sunat_status,
            'sunat_response_at' => now(),
        ]);

        return back()->with('success', 'Comprobante reenviado a SUNAT.');
    }

    public function pdf(Request $request, Venta $venta)
    {
        $format = $request->query('format', 'ticket-80');

        if ($venta->sunat_pdf_url) {
            $targetUrl = $venta->sunat_pdf_url;

            if (str_contains($targetUrl, 'format=')) {
                $targetUrl = preg_replace('/format=[^&]+/', 'format='.urlencode($format), $targetUrl);
            } elseif (str_contains($targetUrl, '/getPDF/')) {
                $apisunatFormat = strtoupper($format) === 'A4' ? 'A4' : 'ticket';
                $targetUrl = preg_replace('/\/getPDF\/[^\/]+/', '/getPDF/'.$apisunatFormat, $targetUrl);
            }

            try {
                $response = Http::timeout(10)->get($targetUrl);
                if ($response->successful()) {
                    return response($response->body(), 200, [
                        'Content-Type' => 'application/pdf',
                        'Content-Disposition' => 'inline; filename="'.$venta->nro_comprobante.'-'.$format.'.pdf"',
                        'Cache-Control' => 'no-cache, private',
                    ]);
                }
            } catch (\Exception $e) {
                Log::warning('Error al proxificar PDF de SUNAT: '.$e->getMessage());
            }
        }

        return response()->json(['error' => 'PDF oficial no disponible'], 404);
    }

    /**
     * Emitir el comprobante ante SUNAT y persistir el resultado. Nunca lanza
     * excepción: devuelve un arreglo normalizado para la respuesta al usuario.
     *
     * @return array{status: ?string, document_id: ?string, pdf_url: ?string, message: ?string}
     */
    private function emitirSunat(Venta $venta, ?string $tipoDoc): array
    {
        $sunat = [
            'status' => null,
            'document_id' => null,
            'pdf_url' => null,
            'message' => null,
        ];

        if (! $tipoDoc) {
            return $sunat;
        }

        $provider = FacturacionFactory::make();
        $rucCliente = (string) $venta->documento_cliente;

        if (! $provider->isConfigured()) {
            $sunat['status'] = 'ERROR';
            $sunat['message'] = FacturacionSettings::isPlataforma()
                ? 'Plataforma SUNAT no configurada (Configuración del Sistema).'
                : 'APISUNAT no configurado (Configuración del Sistema).';

            return $sunat;
        }

        if ($tipoDoc === '01' && strlen($rucCliente) !== 11) {
            $sunat['status'] = 'ERROR';
            $sunat['message'] = 'Para emitir Factura, el cliente debe tener RUC (11 dígitos).';

            return $sunat;
        }

        if ($tipoDoc === '03' && $rucCliente !== '' && ! in_array(strlen($rucCliente), [8, 11])) {
            $sunat['status'] = 'ERROR';
            $sunat['message'] = 'El cliente debe tener DNI (8) o RUC (11) para emitir la Boleta.';

            return $sunat;
        }

        try {
            $resultado = $provider->emitirComprobante($venta, $tipoDoc);
            $esError = ($resultado['status'] ?? '') === 'ERROR';

            $pdfUrl = null;
            if (! $esError && isset($resultado['documentId'])) {
                $fileName = $resultado['fileName'] ?? $provider->buildFileName($venta, $tipoDoc);
                $pdfUrl = $provider->getPDFUrl($resultado['documentId'], $fileName);
            }

            $venta->update([
                'nro_comprobante' => $resultado['numero_completo'] ?? $venta->nro_comprobante,
                'sunat_envio' => ! $esError,
                'sunat_document_id' => $resultado['documentId'] ?? null,
                'sunat_status' => $resultado['status'] ?? 'ERROR',
                'sunat_pdf_url' => $pdfUrl,
                'sunat_cdr' => isset($resultado['error']) ? json_encode($resultado['error']) : null,
                'sunat_response_at' => now(),
            ]);

            return [
                'status' => $venta->sunat_status ?? ($resultado['status'] ?? 'ERROR'),
                'document_id' => $venta->sunat_document_id,
                'pdf_url' => $venta->sunat_pdf_url,
                'message' => ! $esError
                    ? 'Comprobante enviado a SUNAT'
                    : ($resultado['error']['message'] ?? 'Error al enviar a SUNAT'),
            ];
        } catch (\Throwable $e) {
            return [
                'status' => 'ERROR',
                'document_id' => null,
                'pdf_url' => null,
                'message' => 'Error al emitir: '.$e->getMessage(),
            ];
        }
    }
}
