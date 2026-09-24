<?php

namespace App\Services;

use App\Contracts\SunatProvider;
use App\Support\FacturacionSettings;

/**
 * Resuelve el proveedor de facturación electrónica según la configuración
 * (Configuración del Sistema → facturacion_provider, o env FACTURACION_PROVIDER):
 * 'plataforma' → Plataforma-Sunat (API nativa), cualquier otro → APISUNAT.
 */
class FacturacionFactory
{
    public static function make(): SunatProvider
    {
        return match (FacturacionSettings::provider()) {
            'plataforma' => new PlataformaSunatService(),
            default => new ApisunatService(),
        };
    }
}