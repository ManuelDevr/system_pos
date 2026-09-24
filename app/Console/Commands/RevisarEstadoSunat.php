<?php

namespace App\Console\Commands;

use App\Models\Venta;
use App\Services\FacturacionFactory;
use Illuminate\Console\Command;

class RevisarEstadoSunat extends Command
{
    protected $signature = 'sunat:revisar';

    protected $description = 'Consulta el estado real de los comprobantes PENDIENTE en APISUNAT y actualiza el registro';

    public function handle(): int
    {
        $pendientes = Venta::where('sunat_envio', true)
            ->whereNotNull('sunat_document_id')
            ->where(function ($q) {
                $q->whereIn('sunat_status', ['PENDIENTE', null])
                    ->orWhereNull('sunat_status');
            })
            ->get()
            ->filter(fn (Venta $v) => $v->sunat_document_id !== '');

        if ($pendientes->isEmpty()) {
            $this->info('No hay comprobantes pendientes de revisión.');

            return Command::SUCCESS;
        }

        $provider = FacturacionFactory::make();
        $procesadas = 0;

        foreach ($pendientes as $venta) {
            $estado = $provider->getEstado($venta->sunat_document_id, $venta);

            if (empty($estado['status']) || isset($estado['error'])) {
                $this->warn("Venta #{$venta->id} ({$venta->nro_comprobante}): no se pudo consultar el estado.");

                continue;
            }

            $statusSunat = strtoupper((string) $estado['status']);

            if (in_array($statusSunat, ['PENDIENTE', 'PROCESSING', 'ENVIADO'], true)) {
                $this->line("Venta #{$venta->id} ({$venta->nro_comprobante}): sigue {$statusSunat}.");

                continue;
            }

            $esAceptado = $statusSunat === 'ACEPTADO';
            $esExcepcion = $statusSunat === 'EXCEPCION';
            $faults = $estado['faults'] ?? [];

            $venta->update([
                'sunat_status' => $esAceptado ? 'ACEPTADO' : ($esExcepcion ? 'EXCEPCION' : 'ERROR'),
                'sunat_pdf_url' => $esAceptado ? $venta->sunat_pdf_url : null,
                'sunat_cdr' => $esAceptado
                    ? ($estado['cdr'] ?? $venta->sunat_cdr)
                    : (count($faults) > 0 ? json_encode($faults, JSON_UNESCAPED_UNICODE) : null),
                'sunat_response_at' => now(),
            ]);

            $this->info("Venta #{$venta->id} ({$venta->nro_comprobante}): {$venta->sunat_status}");

            if (! $esAceptado) {
                foreach ($faults as $fault) {
                    $mensaje = $fault['faultstring']['_text'] ?? json_encode($fault, JSON_UNESCAPED_UNICODE);
                    $this->error("  - {$mensaje}");
                }
            }

            $procesadas++;
        }

        $this->info("Procesadas {$procesadas} comprobante(s).");

        return Command::SUCCESS;
    }
}