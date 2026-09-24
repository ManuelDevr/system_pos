<?php

namespace App\Http\Controllers;

use App\Models\Venta;
use App\Support\FacturacionSettings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Webhook receptor de la Plataforma-Sunat.
 *
 * La plataforma hace POST a /api/v1/sunat/webhook con
 * {event, document: {id, tipo_documento, serie, correlativo, numero_completo,
 *                   sunat_status, sunat_code, sunat_description, ...}, timestamp}
 * y firma el body crudo con HMAC-SHA256 (header X-Signature) usando
 * SUNAT_WEBHOOK_SECRET (debe ser el MISMO valor configurado en la Plataforma).
 */
class SunatWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $secret = (string) FacturacionSettings::plataforma()['webhook_secret'];

        if ($secret === '') {
            Log::warning('SUNAT webhook: SUNAT_WEBHOOK_SECRET no configurado en el POS.');
        } else {
            $expected = hash_hmac('sha256', $request->getContent(), $secret);
            $provided = (string) $request->header('X-Signature', '');

            if ($provided === '' || ! hash_equals($expected, $provided)) {
                Log::warning('SUNAT webhook: firma inválida.', ['ip' => $request->ip()]);

                return response()->json(['estado' => 'error', 'mensaje' => 'Firma inválida.'], 401);
            }
        }

        $documento = $request->input('document');

        if (! is_array($documento) || empty($documento['id'])) {
            return response()->json(['estado' => 'error', 'mensaje' => 'Payload sin documento.'], 422);
        }

        $venta = Venta::where('sunat_document_id', (int) $documento['id'])->first();

        if (! $venta) {
            Log::info('SUNAT webhook: venta no encontrada por document_id.', [
                'document_id' => $documento['id'],
            ]);

            return response()->json(['estado' => 'exito', 'mensaje' => 'Documento no rastreado.'], 200);
        }

        $status = strtolower((string) ($documento['sunat_status'] ?? ''));

        $nuevoEstado = match (true) {
            str_contains($status, 'acepta') => 'ACEPTADO',
            str_contains($status, 'rechaz') => 'ERROR',
            str_contains($status, 'excepc'), str_contains($status, 'observ') => 'EXCEPCION',
            default => 'ENVIADO',
        };

        $updates = [
            'sunat_status' => $nuevoEstado,
            'sunat_response_at' => now(),
        ];

        if ($nuevoEstado === 'ERROR') {
            $detalle = (string) ($documento['sunat_description'] ?? $documento['sunat_code'] ?? '');
            $updates['sunat_cdr'] = $detalle !== '' ? $detalle : null;
        }

        $venta->update($updates);

        return response()->json(['estado' => 'exito', 'mensaje' => 'ok']);
    }
}