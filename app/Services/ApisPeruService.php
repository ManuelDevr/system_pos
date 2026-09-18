<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ApisPeruService
{
    private string $baseUrl;

    private string $token;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('apisperu.base_url', 'https://dniruc.apisperu.com'), '/');
        $this->token = config('apisperu.token', '');
    }

    /**
     * Consultar un documento de identidad (DNI 8 o RUC 11) a traves de APIsPERU.
     *
     * @return array{tipo?: string, numero?: string, nombre?: string, estado?: ?string, direccion?: ?string, error?: string}
     */
    public function consultar(string $numero): array
    {
        $numero = preg_replace('/\D/', '', $numero);

        $tipo = match (strlen($numero)) {
            11 => 'ruc',
            8 => 'dni',
            default => null,
        };

        if (! $tipo) {
            return ['error' => 'El documento debe tener 8 dígitos (DNI) o 11 dígitos (RUC).'];
        }

        if ($this->token === '') {
            return ['error' => 'APISPERU_TOKEN no configurado en el servidor (.env).'];
        }

        try {
            $response = Http::timeout(15)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $this->token,
                    'Accept' => 'application/json',
                ])
                ->get("{$this->baseUrl}/api/v1/{$tipo}/{$numero}");

            if ($response->failed()) {
                Log::error('APISPERU consulta HTTP error', [
                    'tipo' => $tipo,
                    'numero' => $numero,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return ['error' => 'Error al conectarse con ApisPeru (' . $response->status() . ').'];
            }

            $data = $response->json();

            if (isset($data['success']) && $data['success'] === false) {
                Log::warning('APISPERU consulta sin resultados', [
                    'tipo' => $tipo,
                    'numero' => $numero,
                    'message' => $data['message'] ?? '',
                ]);

                return ['error' => $data['message'] ?? 'No se encontraron resultados.'];
            }

            $nombre = $this->nombreDesde($tipo, $data);

            if ($nombre === null) {
                return ['error' => 'No se pudieron obtener los datos del documento.'];
            }

            return [
                'tipo' => $tipo === 'ruc' ? 'RUC' : 'DNI',
                'numero' => $numero,
                'nombre' => $nombre,
                'estado' => $data['estado'] ?? null,
                'direccion' => $data['direccion'] ?? null,
            ];
        } catch (\Exception $e) {
            Log::error('APISPERU consulta exception', [
                'tipo' => $tipo,
                'numero' => $numero,
                'message' => $e->getMessage(),
            ]);

            return ['error' => 'Error inesperado al consultar con ApisPeru.'];
        }
    }

    private function nombreDesde(string $tipo, array $data): ?string
    {
        if ($tipo === 'ruc') {
            $razonSocial = $data['razonSocial'] ?? null;

            return is_string($razonSocial) && trim($razonSocial) !== '' ? $razonSocial : null;
        }

        $partes = [
            $data['nombres'] ?? '',
            $data['apellidoPaterno'] ?? '',
            $data['apellidoMaterno'] ?? '',
        ];

        $nombre = trim(implode(' ', array_filter($partes, fn ($p) => trim((string) $p) !== '')));

        return $nombre !== '' ? $nombre : null;
    }
}