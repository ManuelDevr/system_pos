<?php

namespace App\Jobs;

use App\Models\Producto;
use App\Models\SyncLog;
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
 * - Sin unicidad: cada guardado se sincroniza siempre; el payload guarda el estado final.
 */
class SyncProductWebhookJob implements ShouldQueue
{
    use Queueable;

    /** Número de reintentos en caso de fallo. */
    public $tries = 3;

    /** Tiempo máximo de ejecución del envío HTTP. */
    public $timeout = 20;

    public function __construct(
        protected string $sku,
        protected array $payload,
        protected string $action, // 'create' | 'update' | 'delete'
    ) {}

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

        try {
            $response = Http::timeout($this->timeout)
                ->withToken(config('sync.webhook_token'))
                ->acceptJson()
                ->asJson()
                ->post($url, $this->payload);

            if ($response->failed()) {
                SyncLog::create([
                    'tipo' => 'producto',
                    'referencia' => $this->sku,
                    'accion' => $this->action,
                    'estado' => 'error',
                    'http_status' => $response->status(),
                    'error' => mb_substr($response->body(), 0, 1000),
                ]);

                Log::error("[SyncProductWebhookJob] Fallo al sincronizar SKU: {$this->sku} (acción: {$this->action}). HTTP {$response->status()} - {$response->body()}");
                throw new RequestException($response);
            }

            SyncLog::create([
                'tipo' => 'producto',
                'referencia' => $this->sku,
                'accion' => $this->action,
                'estado' => 'ok',
                'http_status' => $response->status(),
                'error' => null,
            ]);

            Log::info("[SyncProductWebhookJob] Producto sincronizado SKU: {$this->sku} (acción: {$this->action}). HTTP {$response->status()}");
        } catch (\Throwable $e) {
            if (! $e instanceof RequestException) {
                SyncLog::create([
                    'tipo' => 'producto',
                    'referencia' => $this->sku,
                    'accion' => $this->action,
                    'estado' => 'error',
                    'http_status' => null,
                    'error' => mb_substr($e->getMessage(), 0, 1000),
                ]);
            }

            throw $e;
        }
    }
}
