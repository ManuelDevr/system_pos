<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SupabaseStorageService
{
    protected string $url;
    protected string $key;
    protected string $bucket;

    public function __construct()
    {
        $url = rtrim((string) config('services.supabase.url'), '/');
        $key = (string) config('services.supabase.key');
        $bucket = (string) config('services.supabase.bucket');

        // Limpiar URL por si copiaron el endpoint /rest/v1/ en vez de la base
        $url = preg_replace('#/rest/v1/?$#', '', $url);

        if (empty($url) || empty($key) || empty($bucket)) {
            throw new \RuntimeException(
                'Supabase Storage no está configurado. Revisa SUPABASE_URL, SUPABASE_KEY y SUPABASE_BUCKET en el .env del POS.'
            );
        }

        $this->url = $url;
        $this->key = $key;
        $this->bucket = $bucket;
    }

    public function upload(UploadedFile $file, ?string $existingUrl = null): string
    {
        if ($existingUrl) {
            $this->delete($existingUrl);
        }

        $extension = $file->getClientOriginalExtension();
        $fileName = Str::random(40) . '.' . $extension;
        $filePath = "{$this->bucket}/{$fileName}";

        $contents = file_get_contents($file->getRealPath());
        $contentType = $file->getMimeType();

        $url = "{$this->url}/storage/v1/object/{$filePath}";

        $response = Http::timeout(10)->withHeaders([
            'apiKey' => $this->key,
            'Authorization' => "Bearer {$this->key}",
        ])->withBody($contents, $contentType)->post($url);

        if (!$response->successful()) {
            throw new \RuntimeException(
                "Error al subir imagen a Supabase [{$response->status()}]: {$response->body()}"
            );
        }

        $publicUrl = "{$this->url}/storage/v1/object/public/{$filePath}";

        return $publicUrl;
    }

    public function delete(string $url): void
    {
        $prefix = "{$this->url}/storage/v1/object/public/{$this->bucket}/";
        if (!str_starts_with($url, $prefix)) {
            return;
        }

        $fileName = Str::after($url, $prefix);

        $response = Http::timeout(10)->withHeaders([
            'apiKey' => $this->key,
            'Authorization' => "Bearer {$this->key}",
        ])->delete("{$this->url}/storage/v1/object/{$this->bucket}/{$fileName}");

        if (!$response->successful()) {
            throw new \RuntimeException('Error al eliminar imagen de Supabase: ' . $response->body());
        }
    }
}
