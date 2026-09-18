<?php

namespace App\Imports;

use App\Models\Producto;
use App\Models\Categoria;
use App\Models\Marca;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Validators\Failure;
use Maatwebsite\Excel\Row;

class ProductsImport implements OnEachRow, WithHeadingRow, WithValidation, SkipsOnFailure
{
    use Importable;

    private $errors = [];

    public function onRow(Row $row)
    {
        $data = $row->toArray();

        $numericFields = ['precio_compra', 'margen_ganancia', 'stock', 'stock_minimo'];
        foreach ($numericFields as $field) {
            $value = $data[$field] ?? null;
            if ($value !== null && $value !== '' && (float) $value < 0) {
                $this->errors[] = "Fila {$row->getIndex()}: {$field} - El valor no puede ser negativo.";
                return;
            }
        }

        if ((float) $data['margen_ganancia'] > (float) $data['precio_compra']) {
            $this->errors[] = "Fila {$row->getIndex()}: margen_ganancia - El margen de ganancia no puede ser mayor que el precio de compra.";
            return;
        }

        $precioCompra = (float) $data['precio_compra'];
        $margenGanancia = (float) $data['margen_ganancia'];

        $categoria = null;
        if (!empty($data['categoria'])) {
            $categoria = Categoria::firstOrCreate(
                ['nombre' => trim($data['categoria'])],
                ['estado' => 'Activo']
            );

            if (!empty($data['subcategoria'])) {
                $categoria = Categoria::firstOrCreate(
                    ['nombre' => trim($data['subcategoria'])],
                    ['estado' => 'Activo', 'parent_id' => $categoria->id]
                );
            }
        }

        $marca = null;
        if (!empty($data['marca'])) {
            $marca = Marca::firstOrCreate(
                ['nombre' => trim($data['marca'])],
                ['estado' => 'Activo']
            );
        }

        Producto::create([
            'nombre'          => trim($data['nombre']),
            'sku'             => trim($data['sku']),
            'descripcion'     => trim($data['descripcion'] ?? ''),
            'precio_compra'   => $precioCompra,
            'precio_venta'    => round($precioCompra + $margenGanancia, 2),
            'margen_ganancia' => $margenGanancia,
            'stock'           => $data['stock'] ?? 0,
            'stock_minimo'    => $data['stock_minimo'] ?? 0,
            'unidad_medida'   => trim($data['unidad_medida'] ?? 'Unidad'),
            'categoria_id'    => $categoria?->id,
            'marca_id'        => $marca?->id,
            'estado'          => 'Activo',
            'mostrar_video'   => true,
        ]);
    }

    public function rules(): array
    {
        return [
            'nombre'         => 'required|string|max:150',
            'sku'            => 'required|string|max:50|unique:productos,sku',
            'descripcion'    => 'required|string',
            'precio_compra'  => 'required|numeric|min:0',
            'margen_ganancia' => 'required|numeric|min:0',
            'stock'          => 'required|numeric|min:0',
            'stock_minimo'   => 'required|numeric|min:0',
            'categoria'      => 'required|string|max:150',
            'subcategoria'   => 'nullable|string|max:100',
            'marca'          => 'required|string|max:150',
            'unidad_medida'  => 'required|string|max:50',
        ];
    }

    public function customValidationMessages(): array
    {
        return [
            'nombre.required'        => 'El nombre es obligatorio.',
            'sku.required'           => 'El SKU es obligatorio.',
            'sku.unique'             => 'El SKU ya existe en la base de datos.',
            'descripcion.required'   => 'La descripción es obligatoria.',
            'precio_compra.required' => 'El precio de compra es obligatorio.',
            'precio_compra.min'      => 'El precio de compra no puede ser negativo.',
            'margen_ganancia.required' => 'El margen de ganancia es obligatorio.',
            'margen_ganancia.min'    => 'El margen de ganancia no puede ser negativo.',
            'stock.required'         => 'El stock es obligatorio.',
            'stock.min'              => 'El stock no puede ser negativo.',
            'stock_minimo.required'  => 'El stock mínimo es obligatorio.',
            'stock_minimo.min'       => 'El stock mínimo no puede ser negativo.',
            'categoria.required'      => 'La categoría es obligatoria.',
            'marca.required'          => 'La marca es obligatoria.',
            'unidad_medida.required'  => 'La unidad de medida es obligatoria.',
        ];
    }

    public function onFailure(Failure ...$failures)
    {
        foreach ($failures as $failure) {
            $row = $failure->row();
            $attribute = $failure->attribute();
            $errors = $failure->errors();
            $this->errors[] = "Fila {$row}: {$attribute} - " . implode(', ', $errors);
        }
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}