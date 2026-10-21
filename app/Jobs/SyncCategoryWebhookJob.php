<?php

namespace App\Jobs;

use App\Models\SyncLog;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SyncCategoryWebhookJob implements ShouldQueue
{
    use Queueable;

    public $tries = 3;

    public $timeout = 20;

    public function __construct(
        protected string $nombre,
        protected array $payload,
        protected string $action,
    ) {}

    public function backoff(): array
    {
        return [5, 15, 45];
    }

    public function handle(): void
    {
        $url = config('sync.webhook_url');

        if (empty($url)) {
            Log::warning("[SyncCategoryWebhookJob] SYNC_WEBHOOK_URL no configurado. Categoría: {$this->nombre}");

            return;
        }

        try {
            $response = Http::timeout($this->timeout)
                ->withToken(config('sync.webhook_token'))
                ->acceptJson()
                ->asJson()
                ->post(str_replace('/sync/product', '/sync/category', $url), $this->payload);

            if ($response->failed()) {
                SyncLog::create([
                    'tipo' => 'categoria',
                    'referencia' => $this->nombre,
                    'accion' => $this->action,
                    'estado' => 'error',
                    'http_status' => $response->status(),
                    'error' => mb_substr($response->body(), 0, 1000),
                ]);

                Log::error("[SyncCategoryWebhookJob] Fallo al sincronizar categoría: {$this->nombre} ({$this->action}). HTTP {$response->status()}");
                throw new RequestException($response);
            }

            SyncLog::create([
                'tipo' => 'categoria',
                'referencia' => $this->nombre,
                'accion' => $this->action,
                'estado' => 'ok',
                'http_status' => $response->status(),
                'error' => null,
            ]);

            Log::info("[SyncCategoryWebhookJob] Categoría sincronizada: {$this->nombre} ({$this->action}). HTTP {$response->status()}");
        } catch (\Throwable $e) {
            if (! $e instanceof RequestException) {
                SyncLog::create([
                    'tipo' => 'categoria',
                    'referencia' => $this->nombre,
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
