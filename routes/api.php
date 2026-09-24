<?php

use App\Http\Controllers\SunatWebhookController;
use Illuminate\Support\Facades\Route;

// Webhook de la Plataforma-Sunat (sin CSRF, sin auth: verifica X-Signature HMAC).
Route::post('/v1/sunat/webhook', [SunatWebhookController::class, 'handle'])
    ->middleware('throttle:60,1')
    ->name('api.v1.sunat.webhook');