<?php

namespace App\Services;

use App\Contracts\SunatProvider;

/**
 * Resuelve el proveedor de facturación electrónica.
 *
 * El POS emite exclusivamente contra la Plataforma-Sunat (API nativa).
 */
class FacturacionFactory
{
    public static function make(): SunatProvider
    {
        return new PlataformaSunatService();
    }
}