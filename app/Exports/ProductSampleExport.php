<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;

class ProductSampleExport implements FromArray, WithHeadings, WithTitle
{
    public function array(): array
    {
        return [
            ['Clavo de Acero 3"', 'CLV-001', 'Clavo de acero galvanizado de 3 pulgadas', 2.50, 2.50, 500, 50, 'Clavos', 'Clavos para Madera', 'AceroMax', 'Unidad'],
            ['Pintura Latex Blanca 1L', 'PNT-002', 'Pintura látex blanca mate x 1 litro', 8.00, 7.00, 100, 20, 'Pinturas', '', 'ColorPro', 'Unidad'],
        ];
    }

    public function headings(): array
    {
        return [
            'nombre',
            'sku',
            'descripcion',
            'precio_compra',
            'margen_ganancia',
            'stock',
            'stock_minimo',
            'categoria',
            'subcategoria',
            'marca',
            'unidad_medida',
        ];
    }

    public function title(): string
    {
        return 'Productos';
    }
}
