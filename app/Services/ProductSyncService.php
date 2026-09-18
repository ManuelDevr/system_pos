<?php

namespace App\Services;

use App\Models\Categoria;
use App\Models\Producto;
use App\Jobs\SyncProductWebhookJob;
use Illuminate\Support\Facades\Log;

/**
 * Servicio del POS (Emisor): construye el Payload estándar firmado (HMAC)
 * y lo envia a la cola Redis "sync-queue" hacia la Tienda Web (Receptor).
 */
class ProductSyncService
{
    /**
     * Construye el payload estándar de sincronización.
     *
     * @param Producto $product  Producto POS a sincronizar.
     * @param string   $action   'create' | 'update' | 'delete'
     */
    public function buildPayload(Producto $product, string $action): array
    {
        $categoria      = $product->categoria;
        $categoriaPadre = $categoria?->parent;

        $payload = [
            'sku'            => $product->sku,
            'nombre'         => $product->nombre,
            'descripcion'    => $product->descripcion,
            'precio'         => (float) $product->precio_venta,
            'precio_compra'  => (float) $product->precio_compra,
            'stock'          => (int) $product->stock,
            'stock_minimo'   => (int) $product->stock_minimo,
            'categoria'      => $categoria?->nombre,
            'categoria_padre'=> $categoriaPadre?->nombre,
            'marca'          => $product->marca?->nombre,
            'unidad_medida'  => $product->unidad_medida,
            'codigo_barras'  => $product->codigo_barras,
            'imagen_url'     => $product->imagen_url,
            'video_url'      => $product->video_url,
            'mostrar_video'  => (bool) $product->mostrar_video,
            'disponible'     => $product->estado === 'Activo' && $product->stock > 0,
            'action'         => $action,
        ];

        // Firma HMAC para garantizar integridad (la Web la verifica con el mismo secreto).
        $payload['hash_firma'] = $this->sign($payload);

        return $payload;
    }

    /**
     * Firma el payload con HMAC-SHA256 usando el secreto compartido.
     */
    public function sign(array $payload): string
    {
        // Canonical: los campos estables (sin action ni hash_firma) ordenados por clave.
        $canonical = collect($payload)
            ->except(['action', 'hash_firma'])
            ->sortKeys()
            ->toJson();
        return hash_hmac('sha256', $canonical, (string) config('sync.webhook_secret'));
    }

    /**
     * Despacha el Job a la cola Redis "sync-queue" para el producto indicado.
     */
    public function dispatchSync(Producto $product, string $action = 'update'): void
    {
        try {
            $payload = $this->buildPayload($product, $action);
            SyncProductWebhookJob::dispatch(
                $product->sku,
                $payload,
                $action,
            )->onQueue('sync-queue');
        } catch (\Throwable $e) {
            Log::error("[ProductSyncService] No se pudo despachar la sincronización del SKU {$product->sku}: {$e->getMessage()}");
        }
    }

    /**
     * Para eliminaciones (el producto ya no existe en BD): construye el payload
     * solo con los datos recibidos.
     */
    public function dispatchDelete(array $data): void
    {
        try {
            $payload = [
                'sku'            => $data['sku'] ?? null,
                'nombre'         => $data['nombre'] ?? null,
                'descripcion'    => $data['descripcion'] ?? null,
                'precio'         => (float) ($data['precio_venta'] ?? 0),
                'precio_compra'  => (float) ($data['precio_compra'] ?? 0),
                'stock'          => (int) ($data['stock'] ?? 0),
                'stock_minimo'   => (int) ($data['stock_minimo'] ?? 0),
                'categoria'      => null,
                'categoria_padre'=> null,
                'marca'          => null,
                'unidad_medida'  => $data['unidad_medida'] ?? 'Unidad',
                'codigo_barras'  => $data['codigo_barras'] ?? null,
                'imagen_url'     => $data['imagen_url'] ?? null,
                'video_url'      => $data['video_url'] ?? null,
                'mostrar_video'  => (bool) ($data['mostrar_video'] ?? false),
                'disponible'     => false,
                'action'         => 'delete',
            ];
            $payload['hash_firma'] = $this->sign($payload);
            SyncProductWebhookJob::dispatch($payload['sku'], $payload, 'delete')->onQueue('sync-queue');
        } catch (\Throwable $e) {
            Log::error("[ProductSyncService] No se pudo despachar la eliminación: {$e->getMessage()}");
        }
    }
}
