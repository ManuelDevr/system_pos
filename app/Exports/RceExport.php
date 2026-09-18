<?php

namespace App\Exports;

use App\Models\Compra;
use OpenSpout\Writer\XLSX\Writer;
use OpenSpout\Writer\CSV\Writer as CsvWriter;
use OpenSpout\Writer\Common\Creator\WriterEntityFactory;
use OpenSpout\Common\Entity\Style\Style;
use OpenSpout\Common\Entity\Style\CellAlignment;

class RceExport
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
        $compras = Compra::with(['detalles'])
            ->whereYear('created_at', $this->year)
            ->whereMonth('created_at', $this->month)
            ->where('estado', '!=', 'Anulado')
            ->orderBy('nro_comprobante')
            ->get();

        $rows = [];
        $correlativo = 1;

        foreach ($compras as $compra) {
            $periodo = sprintf('%04d%02d', $this->year, $this->month);
            $fecha = $compra->created_at->format('d/m/Y');
            $fechaVenc = $compra->created_at->format('d/m/Y');

            // Tipo comprobante
            $tipo = $compra->tipo_comprobante === 'Factura' ? '01' : '03';

            // Serie y número
            $partes = explode('-', $compra->nro_comprobante ?? '');
            $serie = $partes[0] ?? '';
            $numero = $partes[1] ?? '';

            // Datos del proveedor
            $ruc = preg_replace('/\D/', '', $compra->ruc_dni ?? '');
            $razonSocial = $compra->proveedor ?? '-';

            $rows[] = [
                $periodo,
                (string) $correlativo++,
                $fecha,
                $fechaVenc,
                $tipo,
                $serie,
                $numero,
                $ruc,
                '6',
                $razonSocial,
                number_format((float) $compra->subtotal, 2, '.', ''),
                number_format((float) $compra->igv, 2, '.', ''),
                number_format((float) $compra->total, 2, '.', ''),
                'PEN',
                '1',
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
            'Fecha Vencimiento',
            'Tipo Comprobante',
            'Serie',
            'Número',
            'Nro RUC Proveedor',
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
        return "RCE_{$this->year}{$this->month}";
    }

    public function getTitle(): string
    {
        $meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre',
        ];
        return "Registro de Compras Electrónico - {$meses[$this->month - 1]} {$this->year}";
    }
}
