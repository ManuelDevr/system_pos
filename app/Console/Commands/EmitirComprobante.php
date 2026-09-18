<?php

namespace App\Console\Commands;

use App\Models\Venta;
use App\Services\ApisunatService;
use Illuminate\Console\Command;

class EmitirComprobante extends Command
{
    protected $signature = 'sunat:emitir {ventaId} {--tipo=03 : Tipo de documento (01=Factura, 03=Boleta)}';

    protected $description = 'Emitir un comprobante electronico a APISUNAT desde una venta del POS';

    public function handle(): int
    {
        $ventaId = $this->argument('ventaId');
        $tipoDoc = $this->option('tipo');

        if (! in_array($tipoDoc, ['01', '03'])) {
            $this->error("Tipo de documento invalido: {$tipoDoc}. Use 01 (Factura) o 03 (Boleta).");

            return Command::FAILURE;
        }

        $venta = Venta::with(['detalles.producto', 'detalles.unidad', 'cliente'])->find($ventaId);

        if (! $venta) {
            $this->error("Venta #{$ventaId} no encontrada.");

            return Command::FAILURE;
        }

        if ($venta->sunat_envio) {
            $this->warn("La venta #{$ventaId} ya fue emitida (sunat_status: {$venta->sunat_status}).");

            if (! $this->confirm('Desea reintentar el envio?')) {
                return Command::SUCCESS;
            }
        }

        $this->info("Preparando envio...");
        $this->line("  Venta:     {$venta->nro_comprobante}");
        $this->line("  Tipo:      ".($tipoDoc === '01' ? 'Factura' : 'Boleta de Venta'));
        $this->line("  Total:     S/ {$venta->total}");
        $clienteNombre = $venta->cliente?->nombre ?? '(sin cliente)';
        $this->line("  Cliente:   {$clienteNombre}");
        $this->line('');

        $this->info("Enviando a APISUNAT...");

        $service = new ApisunatService();
        $resultado = $service->emitirComprobante($venta, $tipoDoc);

        $this->line('');
        $this->line('--- Respuesta de APISUNAT ---');
        $this->line(json_encode($resultado, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $this->line('-----------------------------');

        $pdfUrl = null;
        if (isset($resultado['documentId'])) {
            $fileName = $resultado['fileName'] ?? $service->buildFileName($venta, $tipoDoc);
            $pdfUrl = $service->getPDFUrl($resultado['documentId'], $fileName);
        }

        $esError = ($resultado['status'] ?? '') === 'ERROR';

        $venta->update([
            'sunat_envio' => ! $esError,
            'sunat_document_id' => $resultado['documentId'] ?? null,
            'sunat_status' => $resultado['status'] ?? 'ERROR',
            'sunat_pdf_url' => $pdfUrl,
            'sunat_cdr' => isset($resultado['error']) ? json_encode($resultado['error']) : null,
            'sunat_response_at' => now(),
        ]);

        if ($esError) {
            $errorMsg = $resultado['error']['message'] ?? 'Error desconocido';
            $this->error("Error: {$errorMsg}");

            return Command::FAILURE;
        }

        $this->newLine();
        $this->info("Comprobante enviado correctamente.");
        $this->line("  Status:     {$resultado['status']}");
        $this->line("  DocumentId: {$resultado['documentId']}");
        $this->line("  PDF URL:    {$pdfUrl}");

        return Command::SUCCESS;
    }
}
