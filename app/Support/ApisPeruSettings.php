<?php

namespace App\Support;

use App\Models\Configuracion;
use Illuminate\Support\Facades\Crypt;

/**
 * Resuelve la configuración de consultas DNI/RUC (ApisPeru).
 *
 * Prioridad: valores guardados en `configuracion` (Configuración del Sistema)
 * sobre variables de entorno (.env/Dokploy).
 */
class ApisPeruSettings
{
    public static function baseUrl(): string
    {
        $db = Configuracion::query()->first();

        return rtrim((string) ($db?->apisperu_base_url ?: config('apisperu.base_url', 'https://dniruc.apisperu.com')), '/');
    }

    public static function token(): string
    {
        $db = Configuracion::query()->first();

        return self::secret($db?->apisperu_token) ?: (string) config('apisperu.token', '');
    }

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