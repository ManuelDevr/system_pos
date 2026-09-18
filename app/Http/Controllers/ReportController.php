<?php

namespace App\Http\Controllers;

use App\Exports\RvieExport;
use App\Exports\RceExport;
use App\Models\Venta;
use App\Models\Compra;
use Illuminate\Http\Request;
use Inertia\Inertia;
use OpenSpout\Writer\XLSX\Writer;
use OpenSpout\Writer\CSV\Writer as CsvWriter;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Common\Entity\Style\Style;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function rvie(Request $request)
    {
        $year = $request->get('year', now()->year);
        $month = $request->get('month', now()->month);
        $page = $request->get('page', 1);

        $ventas = Venta::with(['cliente'])
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('nro_comprobante')
            ->get();

        $summary = [
            'total_registros' => $ventas->count(),
            'total_base_imponible' => $ventas->sum(fn($v) => (float)($v->base_imponible ?? round((float)$v->total / 1.18, 2))),
            'total_igv' => $ventas->sum(fn($v) => (float)($v->igv ?? round((float)$v->total - round((float)$v->total / 1.18, 2), 2))),
            'total_general' => $ventas->sum('total'),
            'anulados' => $ventas->where('estado', 'Anulado')->count(),
        ];

        $preview = $ventas->take(25)->map(fn($v) => [
            'fecha' => $v->created_at->format('d/m/Y'),
            'comprobante' => $v->nro_comprobante,
            'cliente' => $v->cliente?->nombre ?? '-',
            'total' => number_format((float)$v->total, 2),
            'estado' => $v->estado,
        ]);

        return Inertia::render('Reports/Rvie', [
            'year' => (int) $year,
            'month' => (int) $month,
            'summary' => $summary,
            'preview' => $preview,
        ]);
    }

    public function rce(Request $request)
    {
        $year = $request->get('year', now()->year);
        $month = $request->get('month', now()->month);

        $compras = Compra::with(['detalles'])
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->where('estado', '!=', 'Anulado')
            ->orderBy('nro_comprobante')
            ->get();

        $summary = [
            'total_registros' => $compras->count(),
            'total_base_imponible' => $compras->sum('subtotal'),
            'total_igv' => $compras->sum('igv'),
            'total_general' => $compras->sum('total'),
        ];

        $preview = $compras->take(25)->map(fn($c) => [
            'fecha' => $c->created_at->format('d/m/Y'),
            'comprobante' => $c->nro_comprobante,
            'proveedor' => $c->proveedor ?? '-',
            'total' => number_format((float)$c->total, 2),
            'tipo' => $c->tipo_comprobante,
        ]);

        return Inertia::render('Reports/Rce', [
            'year' => (int) $year,
            'month' => (int) $month,
            'summary' => $summary,
            'preview' => $preview,
        ]);
    }

    public function exportRvie(Request $request)
    {
        $validated = $request->validate([
            'year' => 'required|integer|min:2020|max:2100',
            'month' => 'required|integer|min:1|max:12',
            'format' => 'required|in:xlsx,csv',
        ]);

        $export = new RvieExport($validated['year'], $validated['month']);
        $data = $export->getData();
        $headers = $export->getHeaders();

        if ($validated['format'] === 'csv') {
            return $this->streamCsv($headers, $data, $export->getFilename() . '.csv');
        }

        return $this->streamXlsx($headers, $data, $export->getFilename() . '.xlsx', $export->getTitle());
    }

    public function exportRce(Request $request)
    {
        $validated = $request->validate([
            'year' => 'required|integer|min:2020|max:2100',
            'month' => 'required|integer|min:1|max:12',
            'format' => 'required|in:xlsx,csv',
        ]);

        $export = new RceExport($validated['year'], $validated['month']);
        $data = $export->getData();
        $headers = $export->getHeaders();

        if ($validated['format'] === 'csv') {
            return $this->streamCsv($headers, $data, $export->getFilename() . '.csv');
        }

        return $this->streamXlsx($headers, $data, $export->getFilename() . '.xlsx', $export->getTitle());
    }

    protected function streamCsv(array $headers, array $data, string $filename): StreamedResponse
    {
        return new StreamedResponse(function () use ($headers, $data) {
            $output = fopen('php://output', 'w');
            fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($output, $headers, ',', '"', '\\');
            foreach ($data as $row) {
                fputcsv($output, $row, ',', '"', '\\');
            }
            fclose($output);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    protected function streamXlsx(array $headers, array $data, string $filename, string $title): StreamedResponse
    {
        return new StreamedResponse(function () use ($headers, $data, $filename, $title) {
            $writer = new Writer();

            $writer->openToBrowser($filename);

            $titleStyle = (new Style())->setFontBold()->setFontSize(14);
            $writer->addRow(Row::fromValues([$title], $titleStyle));

            $writer->addRow(Row::fromValues([]));

            $headerStyle = (new Style())->setFontBold()->setBackgroundColor('FFF0F0F0');
            $writer->addRow(Row::fromValues($headers, $headerStyle));

            foreach ($data as $rowData) {
                $writer->addRow(Row::fromValues($rowData));
            }

            $writer->close();
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}
