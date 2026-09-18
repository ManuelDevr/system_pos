<?php

namespace App\Exports;

use App\Models\Venta;
use OpenSpout\Writer\XLSX\Writer;
use OpenSpout\Writer\CSV\Writer as CsvWriter;
use OpenSpout\Writer\Common\Creator\WriterEntityFactory;
use OpenSpout\Common\Entity\Style\Style;
use OpenSpout\Common\Entity\Style\CellAlignment;

class RvieExport
{
    protected $year;
    protected $month;

    public function __construct(int $year, int $month)
    {
        $this->year = $year;
        $this->month = $month;
    }

    public function getData(): array
    {
        $ventas = Venta::with(['detalles', 'cliente'])
            ->whereYear('created_at', $this->year)
            ->whereMonth('created_at', $this->month)
            ->orderBy('nro_comprobante')
            ->get();

        $rows = [];
        $correlativo = 1;

        foreach ($ventas as $venta) {
            $periodo = sprintf('%04d%02d', $this->year, $this->month);
            $fecha = $venta->created_at->format('d/m/Y');

            // Tipo comprobante desde nro_comprobante
            $tipo = $this->getTipoComprobante($venta->nro_comprobante, $venta->estado);

            // Serie y número
            $partes = explode('-', $venta->nro_comprobante);
            $serie = $partes[0] ?? '';
            $numero = $partes[1] ?? '';

            // Datos del cliente
            $cliente = $venta->cliente;
            $tipoDoc = '1';
            $nroDoc = '-';
            $razonSocial = '-';
            if ($cliente) {
                $doc = $cliente->ruc_dni ?? '';
                if (strlen(preg_replace('/\D/', '', $doc)) === 11) {
                    $tipoDoc = '6';
                    $nroDoc = preg_replace('/\D/', '', $doc);
                } else {
                    $tipoDoc = '1';
                    $nroDoc = $doc;
                }
                $razonSocial = $cliente->nombre ?? '-';
            }

            // Operaciones gravadas
            $total = (float) $venta->total;
            $baseImponible = (float) ($venta->base_imponible ?? round($total / 1.18, 2));
            $igv = (float) ($venta->igv ?? round($total - $baseImponible, 2));

            // Estado SUNAT
            $estadoSunat = $venta->estado === 'Anulado' ? '3' : '1';

            $rows[] = [
                $periodo,
                (string) $correlativo++,
                $fecha,
                $tipo,
                $serie,
                $numero,
                $nroDoc,
                $tipoDoc,
                $razonSocial,
                number_format($baseImponible, 2, '.', ''),
                number_format($igv, 2, '.', ''),
                number_format($total, 2, '.', ''),
                'PEN',
                $estadoSunat,
            ];
        }

        return $rows;
    }

    public function getHeaders(): array
    {
        return [
            'Periodo',
            'Nro Correlativo',
            'Fecha de Emisión',
            'Tipo Comprobante',
            'Serie',
            'Número',
            'Nro Documento',
            'Tipo Documento',
            'Razón Social / Apellidos y Nombres',
            'Base Imponible',
            'IGV',
            'Importe Total',
            'Moneda',
            'Estado',
        ];
    }

    public function getFilename(): string
    {
        return "RVIE_{$this->year}{$this->month}";
    }

    public function getTitle(): string
    {
        $meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre',
        ];
        return "Registro de Ventas e Ingresos - {$meses[$this->month - 1]} {$this->year}";
    }

    protected function getTipoComprobante(?string $nroComprobante, ?string $estado): string
    {
        if ($estado === 'Anulado') return '03';

        if (!$nroComprobante) return '03';

        if (str_starts_with($nroComprobante, 'F')) return '01';
        if (str_starts_with($nroComprobante, 'B')) return '03';

        return '03';
    }
}
