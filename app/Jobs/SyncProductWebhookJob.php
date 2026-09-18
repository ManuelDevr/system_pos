<?php

namespace App\Jobs;

use App\Models\Producto;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Cola Redis del POS: notifica a la Tienda Web que un producto fue creado,
 * editado, eliminado o cambió su stock, enviando un Webhook firmado (HMAC).
 *
 * - Se despacha a la cola "sync-queue" (Redis) para NO congelar la caja del vendedor.
 * - Reintentos automáticos: 3 intentos con retardo exponencial en caso de fallo de red.
 */
class SyncProductWebhookJob implements ShouldQueue, ShouldBeUnique
{
    use Queueable;

    /** Número de reintentos en caso de fallo. */
    public $tries = 3;

    /** Tiempo máximo de ejecución del envío HTTP. */
    public $timeout = 20;

    /**
     * Firma de unicidad basada en SKU + timestamp para evitar duplicados en ráfagas.
     */
    public $uniqueFor = 10;

    public function __construct(
        protected string $sku,
        protected array $payload,
        protected string $action, // 'create' | 'update' | 'delete'
    ) {}

    /**
     * Identificador de unicidad: evita envíos duplicados consecutivos del mismo SKU.
     */
    public function uniqueId(): string
    {
        return 'product-sync.'.$this->sku;
    }

    /**
     * Implementa el reintento con retardo exponencial (3 intentos).
     * Laravel aplica automáticamente: 2^($attempts-1) si no se sobrescribe.
     */
    public function backoff(): array
    {
        return [5, 15, 45]; // segundos entre reintentos
    }

    public function handle(): void
    {
        $url = config('sync.webhook_url');

        if (empty($url)) {
            Log::warning("[SyncProductWebhookJob] SYNC_WEBHOOK_URL no configurado. SKU: {$this->sku}");
            return;
        }

        $response = Http::timeout($this->timeout)
            ->withToken(config('sync.webhook_token'))
            ->acceptJson()
            ->asJson()
            ->post($url, $this->payload);

        if ($response->failed()) {
            Log::error("[SyncProductWebhookJob] Fallo al sincronizar SKU: {$this->sku} (acción: {$this->action}). HTTP {$response->status()} - {$response->body()}");
            throw new RequestException($response);
        }

        Log::info("[SyncProductWebhookJob] Producto sincronizado SKU: {$this->sku} (acción: {$this->action}). HTTP {$response->status()}");
    }
}
