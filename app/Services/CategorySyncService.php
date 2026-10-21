<?php

namespace App\Services;

use App\Models\Categoria;
use App\Jobs\SyncCategoryWebhookJob;
use Illuminate\Support\Facades\Log;

class CategorySyncService
{
    public function buildPayload(Categoria $categoria, string $action): array
    {
        $parent = $categoria->parent;

        $payload = [
            'nombre' => $categoria->nombre,
            'descripcion' => $categoria->descripcion,
            'categoria_padre' => $parent?->nombre,
            'visible' => $categoria->visible_tienda ?? true,
            'orden' => $categoria->orden_tienda,
            'action' => $action,
        ];

        $payload['hash_firma'] = $this->sign($payload);

        return $payload;
    }

    public function sign(array $payload): string
    {
        $canonical = collect($payload)
            ->except(['action', 'hash_firma'])
            ->sortKeys()
            ->toJson();

        return hash_hmac('sha256', $canonical, (string) config('sync.webhook_secret'));
    }

    public function dispatchSync(Categoria $categoria, string $action = 'update'): void
    {
        try {
            if (! config('sync.enabled')) {
                return;
            }

            $payload = $this->buildPayload($categoria, $action);
            SyncCategoryWebhookJob::dispatch($categoria->nombre, $payload, $action)->onQueue('sync-queue');
        } catch (\Throwable $e) {
            Log::error("[CategorySyncService] No se pudo despachar la sincronización de categoría {$categoria->nombre}: {$e->getMessage()}");
        }
    }
}
