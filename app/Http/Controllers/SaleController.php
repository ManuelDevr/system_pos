<?php

namespace App\Http\Controllers;

use App\Models\Venta;
use App\Models\DetalleVenta;
use App\Models\Producto;
use App\Models\ConversionUnidadProducto;
use App\Models\Unidad;
use App\Models\Configuracion;
use App\Http\Requests\StoreSaleRequest;
use App\Services\ApisunatService;
use App\Services\KardexService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SaleController extends Controller
{
    public function index()
    {
        return Inertia::render('Sales/Index', [
            'ventas' => Venta::select('id', 'total', 'pagado_con', 'vuelto', 'metodo_pago', 'nro_comprobante', 'estado', 'user_id', 'cliente_id', 'cliente_tipo_doc', 'cliente_documento', 'cliente_nombre', 'sunat_envio', 'sunat_status', 'sunat_document_id', 'sunat_pdf_url', 'sunat_cdr', 'sunat_response_at', 'created_at')
                ->with([
                    'cliente:id,nombre,ruc_dni', 
                    'user:id,name', 
                    'detalles.producto:id,nombre'
                ])
                ->orderBy('created_at', 'desc')
                ->get()
        ]);
    }

    public function checkout()
    {
        $config = Configuracion::first();
        $serieBoleta = $config?->serie_boleta ?: 'B001';
        $serieFactura = $config?->serie_factura ?: 'F001';

        $nextNumberFor = fn (string $serie) => (function () use ($serie) {
            $lastNro = Venta::where('nro_comprobante', 'LIKE', $serie . '-%')
                ->orderByRaw("CAST(SUBSTR(nro_comprobante, " . (strlen($serie) + 2) . ") AS INTEGER) DESC")
                ->value('nro_comprobante');

            return $lastNro ? ((int) substr($lastNro, strlen($serie) + 1)) + 1 : 1;
        })();

        return Inertia::render('Sales/Checkout', [
            'serie' => $serieBoleta,
            'numero' => str_pad($nextNumberFor($serieBoleta), 6, '0', STR_PAD_LEFT),
            'serie_factura' => $serieFactura,
            'numero_factura' => str_pad($nextNumberFor($serieFactura), 6, '0', STR_PAD_LEFT),
            'igv' => (float) ($config?->igv ?? 18.00),
            'metodos_pago' => $config?->metodos_pago ?? ['Efectivo', 'Transferencia', 'Yape', 'Plin', 'BCP'],
            'productos' => Producto::select('id', 'nombre', 'sku', 'codigo_barras', 'stock', 'precio_venta', 'unidad_medida', 'marca_id', 'imagen_url')
                ->with(['marca:id,nombre', 'conversiones.unidad:id,nombre,abreviatura'])
                ->where('estado', 'Activo')
                ->get(),
        ]);
    }

    public function store(StoreSaleRequest $request)
    {
        try {
            DB::beginTransaction();

            $totalBackend = 0;
            $itemsData = [];
            $productosProcesados = [];
            $cantidadesRequeridas = [];

            foreach ($request->items as $item) {
                $productId = $item['producto_id'];

                if (!isset($productosProcesados[$productId])) {
                    $producto = Producto::lockForUpdate()->find($productId);
                    if (!$producto || $producto->estado !== 'Activo') {
                        throw new \Exception("El producto seleccionado no está disponible o está inactivo.");
                    }
                    $productosProcesados[$productId] = $producto;
                    $cantidadesRequeridas[$productId] = 0;
                }

                $producto = $productosProcesados[$productId];
                
                $factor = 1;
                $precioReal = (float)$producto->precio_venta;
                $unidadBaseSunat = 'NIU';

                // Buscar unidad y su mapeo SUNAT
                $unidad = Unidad::where('nombre', $producto->unidad_medida)->first();
                if ($unidad) {
                    $unidadBaseSunat = $unidad->sunat_code;
                }

                if (isset($item['conversion_id']) && $item['conversion_id']) {
                    $conv = ConversionUnidadProducto::with('unidad')->find($item['conversion_id']);
                    if ($conv) {
                        $factor = $conv->factor;
                        $precioReal = (float)$conv->precio_venta;
                        $unidadBaseSunat = $conv->unidad->sunat_code;
                    }
                }

                $cantidadBase = $item['cantidad'] * $factor;
                $cantidadesRequeridas[$productId] += $cantidadBase;

                if ($producto->stock < $cantidadesRequeridas[$productId]) {
                    throw new \Exception("Stock insuficiente para: " . $producto->nombre);
                }

                $subtotalReal = $item['cantidad'] * $precioReal;
                $descuentoItem = round((float) ($item['descuento'] ?? 0), 2);
                $subtotalDescuento = round(max($subtotalReal - $descuentoItem, 0), 2);
                $totalBackend += $subtotalDescuento;

                $itemsData[] = [
                    'producto_id' => $producto->id,
                    'nombre' => $producto->nombre,
                    'cantidad' => $item['cantidad'],
                    'precio_unitario' => $precioReal,
                    'subtotal' => $subtotalReal,
                    'descuento' => $descuentoItem,
                    'subtotal_descuento' => $subtotalDescuento,
                    'unidad_id' => $item['unidad_id'] ?? ($unidad ? $unidad->id : null),
                    'unidad_sunat' => $unidadBaseSunat,
                    'cantidad_base' => $cantidadBase,
                    'producto_model' => $producto
                ];
            }

            // Número de comprobante secuencial según tipo y serie (B001 boleta, F001 factura)
            $tipoComprobante = $request->tipo_comprobante ?? 'Boleta';
            $config = Configuracion::first();
            $serie = match ($tipoComprobante) {
                'Factura' => $config?->serie_factura ?: 'F001',
                default => $config?->serie_boleta ?: 'B001',
            };
            $lastNro = Venta::lockForUpdate()
                ->where('nro_comprobante', 'LIKE', $serie . '-%')
                ->orderByRaw("CAST(SUBSTR(nro_comprobante, " . (strlen($serie) + 2) . ") AS INTEGER) DESC")
                ->value('nro_comprobante');

            $nextNum = $lastNro ? ((int) substr($lastNro, strlen($serie) + 1)) + 1 : 1;
            $nro_comprobante = $serie . '-' . str_pad($nextNum, 6, '0', STR_PAD_LEFT);

            $igvRate = (float) ($config?->igv ?? 18.00);
            $baseImponible = round($totalBackend / (1 + $igvRate / 100), 2);
            $igvAmount = round($totalBackend - $baseImponible, 2);

            $venta = Venta::create([
                'total' => $totalBackend,
                'pagado_con' => $request->metodo_pago === 'Efectivo' ? round((float) $request->pagado_con, 2) : null,
                'vuelto' => $request->metodo_pago === 'Efectivo' ? round((float) $request->vuelto, 2) : null,
                'descuento' => round((float) $request->descuento ?? 0, 2),
                'base_imponible' => $baseImponible,
                'igv' => $igvAmount,
                'metodo_pago' => $request->metodo_pago,
                'user_id' => auth()->id(),
                'cliente_id' => $request->cliente_id,
                'cliente_tipo_doc' => $request->cliente_tipo_doc,
                'cliente_documento' => $request->cliente_documento,
                'cliente_nombre' => $request->cliente_nombre,
                'nro_comprobante' => $nro_comprobante,
            ]);

            foreach ($itemsData as $data) {
                DetalleVenta::create([
                    'venta_id' => $venta->id,
                    'producto_id' => $data['producto_id'],
                    'cantidad' => $data['cantidad'],
                    'precio_unitario' => $data['precio_unitario'],
                    'subtotal' => $data['subtotal'],
                    'descuento' => $data['descuento'],
                    'subtotal_descuento' => $data['subtotal_descuento'],
                    'unidad_id' => $data['unidad_id'],
                    'cantidad_base' => $data['cantidad_base']
                ]);

                // Registrar en Kardex y actualizar stock
                KardexService::registrarMovimiento(
                    $data['producto_model'],
                    'SALIDA',
                    $data['cantidad_base'],
                    'Venta: ' . $nro_comprobante,
                    'Venta',
                    $venta->id
                );
            }

            // Emisión SUNAT opcional (después del commit para no bloquear la venta)
            $sunat = [
                'status' => null,
                'document_id' => null,
                'pdf_url' => null,
                'message' => null,
            ];
            $tipoDocMap = ['Boleta' => '03', 'Factura' => '01'];
            $tipoDoc = $tipoDocMap[$tipoComprobante] ?? null;
            $rucCliente = $venta->documento_cliente;

            if ($request->boolean('enviar_sunat') && $tipoDoc) {
                $apisunatEnabled = config('apisunat.persona_id') && config('apisunat.persona_token');

                if (! $apisunatEnabled) {
                    $sunat['message'] = 'APISUNAT no configurado en el servidor (.env).';
                } elseif ($tipoDoc === '01' && strlen($rucCliente) !== 11) {
                    $sunat['message'] = 'Para emitir Factura, el cliente debe tener RUC (11 dígitos).';
                } elseif ($tipoDoc === '03' && $rucCliente !== '' && ! in_array(strlen($rucCliente), [8, 11])) {
                    $sunat['message'] = 'El cliente debe tener DNI (8) o RUC (11) para emitir la Boleta.';
                } else {
                    $apisunat = new ApisunatService();
                    $resultado = $apisunat->emitirComprobante($venta, $tipoDoc);
                    $esError = ($resultado['status'] ?? '') === 'ERROR';

                    $pdfUrl = null;
                    if (isset($resultado['documentId'])) {
                        $fileName = $resultado['fileName'] ?? $apisunat->buildFileName($venta, $tipoDoc);
                        $pdfUrl = $apisunat->getPDFUrl($resultado['documentId'], $fileName);
                    }

                    $venta->update([
                        'sunat_envio' => ! $esError,
                        'sunat_document_id' => $resultado['documentId'] ?? null,
                        'sunat_status' => $resultado['status'] ?? 'ERROR',
                        'sunat_pdf_url' => $pdfUrl,
                        'sunat_cdr' => isset($resultado['error']) ? json_encode($resultado['error']) : null,
                        'sunat_response_at' => now(),
                    ]);

                    $sunat = [
                        'status' => $resultado['status'] ?? 'ERROR',
                        'document_id' => $resultado['documentId'] ?? null,
                        'pdf_url' => $pdfUrl,
                        'message' => ! $esError
                            ? 'Comprobante enviado a SUNAT'
                            : ($resultado['error']['message'] ?? 'Error al enviar a SUNAT'),
                    ];
                }
            }

            DB::commit();

            return redirect()->back()->with([
                'success' => 'Venta realizada y stock actualizado en Kardex.',
                'last_sale_id' => $venta->id,
                'sunat' => $sunat,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function cancel(Venta $venta)
    {
        if ($venta->estado === 'Anulado') {
            return redirect()->back()->withErrors(['error' => 'La venta ya está anulada.']);
        }

        try {
            DB::beginTransaction();

            foreach ($venta->detalles as $detalle) {
                // withTrashed: recupera el producto aunque haya sido eliminado (SoftDeletes)
                $producto = Producto::withTrashed()->lockForUpdate()->find($detalle->producto_id);

                if (!$producto) {
                    // Producto no encontrado ni en trash: registrar warning y continuar
                    \Illuminate\Support\Facades\Log::warning("Anulación venta {$venta->nro_comprobante}: producto ID {$detalle->producto_id} no encontrado.");
                    continue;
                }
                
                // Devolver stock vía Kardex
                KardexService::registrarMovimiento(
                    $producto,
                    'ENTRADA',
                    $detalle->cantidad_base,
                    'Anulación Venta: ' . $venta->nro_comprobante,
                    'Venta',
                    $venta->id
                );
            }

            $venta->estado = 'Anulado';
            $venta->save();

            DB::commit();
            return redirect()->back()->with('success', 'Venta anulada y stock retornado al Kardex.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'No se pudo anular la venta.']);
        }
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

        $apisunatService = new ApisunatService();
        $resultado = $apisunatService->emitirComprobante($venta, $tipoDoc);

        $pdfUrl = null;
        if (isset($resultado['documentId'])) {
            $fileName = $resultado['fileName'] ?? $apisunatService->buildFileName($venta, $tipoDoc);
            $pdfUrl = $apisunatService->getPDFUrl($resultado['documentId'], $fileName);
        }

        $esError = ($resultado['status'] ?? '') === 'ERROR';

        $venta->update([
            'sunat_envio' => ! $esError,
            'sunat_document_id' => $resultado['documentId'] ?? null,
            'sunat_status' => $resultado['status'] ?? 'ERROR',
            'sunat_pdf_url' => $pdfUrl,
            'sunat_cdr' => isset($resultado['error']) ? json_encode($resultado['error']) : null,
            'sunat_response_at' => now(),
        ]);

        if ($esError) {
            return back()->withErrors([
                'sunat' => $resultado['error']['message'] ?? 'Error desconocido al emitir el comprobante.',
            ]);
        }

        return back()->with([
            'success' => "Comprobante enviado. Documento: {$resultado['documentId']}",
            'sunat_status' => $resultado['status'],
            'sunat_pdf_url' => $pdfUrl,
        ]);
    }
}
