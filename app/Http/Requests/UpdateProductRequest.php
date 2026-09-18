<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Doble validación: Solo administradores pueden actualizar productos
        return $this->user() && $this->user()->rol === 'Administrador';
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('mostrar_video')) {
            $this->merge([
                'mostrar_video' => filter_var($this->input('mostrar_video'), FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }

    public function rules(): array
    {
        $productId = $this->route('producto')->id ?? $this->route('producto');

        return [
            'nombre' => 'required|string|max:150',
            'sku' => 'nullable|string|max:50|unique:productos,sku,' . $productId,
            'codigo_barras' => 'nullable|string|max:50|unique:productos,codigo_barras,' . $productId,
            'descripcion' => 'nullable|string',
            'stock' => 'required|integer|min:0',
            'stock_minimo' => 'nullable|integer|min:0',
            'precio_compra' => 'required|numeric|min:0',
            'precio_venta' => 'required|numeric|min:0',
            'margen_ganancia' => 'nullable|numeric|min:0',
            'unidad_medida' => 'required|string|max:50',
            'tasa_descuento' => 'nullable|numeric|min:0|max:100',
            'categoria_id' => 'required|exists:categorias,id',
            'marca_id' => 'nullable|exists:marcas,id',
            'estado' => 'required|in:Activo,Inactivo',
            'imagen' => 'nullable|image|max:2048',
            'imagenes' => 'nullable|array|max:6',
            'imagenes.*' => 'image|mimes:png,jpg,jpeg,webp|max:2048',
            'imagenes_keep' => 'nullable|array|max:6',
            'imagenes_keep.*' => 'string',
            'video_url' => 'nullable|string|max:500',
            'mostrar_video' => 'nullable|boolean',
        ];
    }
}
