<?php

namespace App\Support;

use App\Models\Configuracion;
use Illuminate\Support\Facades\Crypt;

/**
 * Resuelve la configuración de facturación electrónica.
 *
 * Prioridad: valores guardados en la fila `configuracion`
 * (Configuración del Sistema) sobre variables de entorno (.env/Dokploy).
 */
class FacturacionSettings
{
    public static function provider(): string
    {
        $db = Configuracion::query()->first();

        if ($db && ! empty($db->facturacion_provider)) {
            return $db->facturacion_provider;
        }

        return (string) config('facturacion.provider', 'plataforma');
    }

    public static function isPlataforma(): bool
    {
        return self::provider() === 'plataforma';
    }

    public static function plataforma(): array
    {
        $db = Configuracion::query()->first();

        return [
            'base_url' => (string) ($db?->sunat_plataforma_base_url ?: config('facturacion.plataforma.base_url', '')),
            'api_key' => self::secret($db?->sunat_plataforma_api_key) ?: (string) config('facturacion.plataforma.api_key', ''),
            'api_secret' => self::secret($db?->sunat_plataforma_api_secret) ?: (string) config('facturacion.plataforma.api_secret', ''),
            'webhook_secret' => self::secret($db?->sunat_webhook_secret) ?: (string) config('facturacion.plataforma.webhook_secret', ''),
        ];
    }

    /**
     * Devuelve el valor desencriptado. Si el valor no está cifrado
     * (p. ej. migrado desde .env) lo devuelve tal cual.
     */
    protected static function secret(?string $stored): string
    {
        if ($stored === null || $stored === '') {
            return '';
        }

        try {
            return Crypt::decryptString($stored);
        } catch (\Exception $e) {
            return $stored;
        }
    }
}