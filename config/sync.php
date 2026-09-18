<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Sincronización POS -> Tienda Web (Webhooks)
    |--------------------------------------------------------------------------
    |
    | El POS es el EMISOR de webhooks. Cada vez que se crea, edita o elimina un
    | producto, o cambia su stock, se envia un evento firmado (HMAC) a la URL
    | de sincronización de la Tienda Web a traves de una cola Redis.
    |
    | En el proyecto "Ferreteria_web" (Receptor), "enabled" debe estar en false.
    |
    */

    'enabled' => (bool) env('SYNC_ENABLED', false),

    // URL del endpoint receptor en la Tienda Web: POST /api/v1/sync/product
    'webhook_url' => env('SYNC_WEBHOOK_URL'),

    // Bearer Token estatico compartido con la Tienda Web.
    'webhook_token' => env('SYNC_WEBHOOK_TOKEN'),

    // Secreto compartido para firmar/verificar la integridad (HMAC-SHA256).
    'webhook_secret' => env('SYNC_WEBHOOK_SECRET'),
];
