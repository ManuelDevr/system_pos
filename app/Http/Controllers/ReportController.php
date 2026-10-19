<?php

namespace App\Http\Controllers;

use App\Exports\RvieExport;
use App\Exports\RceExport;
use App\Models\Venta;
use App\Models\Compra;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
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

    public function utilidad(Request $request)
    {
        [$desde, $hasta] = $this->periodo($request);

        return Inertia::render('Reports/Utilidad', $this->buildUtilidad($desde, $hasta));
    }

    public function exportUtilidad(Request $request)
    {
        [$desde, $hasta] = $this->periodo($request);

        $rows = $this->ventasDelPeriodo($desde, $hasta)
            ->map(function (Venta $venta) {
                $costo = $this->costoVenta($venta);

                return [
                    $venta->created_at->format('d/m/Y H:i'),
                    $venta->nro_comprobante ?? 'Venta #'.$venta->id,
                    number_format((float) $venta->total, 2, '.', ''),
                    number_format($costo, 2, '.', ''),
                    number_format((float) $venta->total - $costo, 2, '.', ''),
                ];
            })
            ->all();

        return $this->streamCsv(
            ['Fecha', 'Comprobante', 'Ventas', 'Costo', 'Utilidad'],
            $rows,
            'utilidad_'.$desde->format('Ymd').'_'.$hasta->format('Ymd').'.csv'
        );
    }

    private function periodo(Request $request): array
    {
        $request->validate([
            'desde' => 'nullable|date',
            'hasta' => 'nullable|date|after_or_equal:desde',
        ]);

        $desde = $request->filled('desde')
            ? Carbon::parse($request->input('desde'))->startOfDay()
            : now()->startOfMonth();

        $hasta = $request->filled('hasta')
            ? Carbon::parse($request->input('hasta'))->endOfDay()
            : now()->endOfDay();

        return [$desde, $hasta];
    }

    private function ventasDelPeriodo(Carbon $desde, Carbon $hasta)
    {
        return Venta::with(['detalles.producto', 'cliente'])
            ->where('estado', '!=', 'Anulado')
            ->whereBetween('created_at', [$desde, $hasta])
            ->orderBy('created_at')
            ->get();
    }

    private function costoVenta(Venta $venta): float
    {
        if ($venta->costo_total !== null) {
            return (float) $venta->costo_total;
        }

        return (float) $venta->detalles->sum(
            fn ($detalle) => (float) ($detalle->costo_unitario ?? $detalle->producto?->precio_compra ?? 0)
                * (float) $detalle->cantidad
        );
    }

    private function buildUtilidad(Carbon $desde, Carbon $hasta): array
    {
        $ventas = $this->ventasDelPeriodo($desde, $hasta);

        $totalVentas = 0.0;
        $totalCosto = 0.0;
        $porDia = [];
        $porMetodo = [];
        $productos = [];

        foreach ($ventas as $venta) {
            $ventaTotal = (float) $venta->total;
            $costo = $this->costoVenta($venta);

            $totalVentas += $ventaTotal;
            $totalCosto += $costo;

            $dia = $venta->created_at->format('Y-m-d');
            $porDia[$dia]['dia'] = $dia;
            $porDia[$dia]['ventas'] = ($porDia[$dia]['ventas'] ?? 0) + $ventaTotal;
            $porDia[$dia]['costo'] = ($porDia[$dia]['costo'] ?? 0) + $costo;

            $metodo = $venta->metodo_pago ?? 'Otro';
            $porMetodo[$metodo]['metodo'] = $metodo;
            $porMetodo[$metodo]['total'] = ($porMetodo[$metodo]['total'] ?? 0) + $ventaTotal;
            $porMetodo[$metodo]['cantidad'] = ($porMetodo[$metodo]['cantidad'] ?? 0) + 1;

            foreach ($venta->detalles as $detalle) {
                $key = $detalle->producto_id ?? 'sin-producto';
                $costoDetalle = (float) ($detalle->costo_unitario ?? $detalle->producto?->precio_compra ?? 0)
                    * (float) $detalle->cantidad;
                $ventaDetalle = (float) ($detalle->subtotal ?? $detalle->precio_unitario * $detalle->cantidad);

                if (! isset($productos[$key])) {
                    $productos[$key] = [
                        'producto' => $detalle->producto?->nombre ?? 'Producto eliminado',
                        'cantidad' => 0.0,
                        'ventas' => 0.0,
                        'costo' => 0.0,
                    ];
                }

                $productos[$key]['cantidad'] += (float) $detalle->cantidad;
                $productos[$key]['ventas'] += $ventaDetalle;
                $productos[$key]['costo'] += $costoDetalle;
            }
        }

        $utilidad = $totalVentas - $totalCosto;

        $topProductos = collect($productos)
            ->map(function (array $item) {
                $item['utilidad'] = $item['ventas'] - $item['costo'];

                return $item;
            })
            ->sortByDesc('utilidad')
            ->values()
            ->take(15)
            ->map(fn (array $item) => [
                'producto' => $item['producto'],
                'cantidad' => round($item['cantidad'], 2),
                'ventas' => round($item['ventas'], 2),
                'costo' => round($item['costo'], 2),
                'utilidad' => round($item['utilidad'], 2),
            ])
            ->all();

        return [
            'desde' => $desde->format('Y-m-d'),
            'hasta' => $hasta->format('Y-m-d'),
            'resumen' => [
                'ventas' => round($totalVentas, 2),
                'costo' => round($totalCosto, 2),
                'utilidad' => round($utilidad, 2),
                'margen' => $totalVentas > 0 ? round(($utilidad / $totalVentas) * 100, 2) : 0,
                'transacciones' => $ventas->count(),
                'ticket_promedio' => $ventas->count() > 0 ? round($totalVentas / $ventas->count(), 2) : 0,
            ],
            'por_dia' => collect($porDia)
                ->map(fn (array $item) => [
                    'dia' => $item['dia'],
                    'ventas' => round($item['ventas'], 2),
                    'costo' => round($item['costo'], 2),
                    'utilidad' => round($item['ventas'] - $item['costo'], 2),
                ])
                ->sortBy('dia')
                ->values()
                ->all(),
            'por_metodo' => collect($porMetodo)
                ->map(fn (array $item) => [
                    'metodo' => $item['metodo'],
                    'total' => round($item['total'], 2),
                    'cantidad' => $item['cantidad'],
                ])
                ->sortByDesc('total')
                ->values()
                ->all(),
            'top_productos' => $topProductos,
        ];
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
