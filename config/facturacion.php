<?php

return [

    // Proveedor de facturación electrónica. El POS solo emite contra la
    // Plataforma-Sunat; este valor es la espalda para cuando el campo
    // 'facturacion_provider' de Configuración del Sistema esté vacío.
    'provider' => env('FACTURACION_PROVIDER', 'plataforma'),

    // Formato PDF por defecto para la Plataforma-Sunat (a4, a5, ticket-80, ticket-58)
    'default_pdf_format' => env('SUNAT_PLATFORM_PDF_FORMAT', 'ticket-80'),

    'plataforma' => [
        'base_url' => rtrim((string) env('SUNAT_PLATFORM_BASE_URL', ''), '/'),
        'api_key' => env('SUNAT_PLATFORM_API_KEY', ''),
        'api_secret' => env('SUNAT_PLATFORM_API_SECRET', ''),
        // Debe ser EXACTAMENTE el mismo valor que SUNAT_WEBHOOK_SECRET en la Plataforma-Sunat.
        'webhook_secret' => env('SUNAT_WEBHOOK_SECRET', ''),
    ],

];