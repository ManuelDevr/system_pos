<?php

namespace Database\Factories;

use App\Models\Categoria;
use App\Models\Marca;
use App\Models\Producto;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Producto>
 */
class ProductoFactory extends Factory
{
    protected $model = Producto::class;

    public function definition(): array
    {
        $precioCompra = fake()->randomFloat(2, 5, 50);
        $stock = fake()->numberBetween(20, 500);
        $stockMinimo = fake()->numberBetween(5, 15);

        return [
            'sku' => fake()->unique()->bothify('SKU-####'),
            'nombre' => fake()->words(2, true),
            'descripcion' => fake()->sentence(),
            'precio_compra' => $precioCompra,
            'precio_venta' => $precioCompra + fake()->randomFloat(2, 3, 50),
            'stock' => $stock,
            'stock_minimo' => $stockMinimo,
            'unidad_medida' => 'Unidad',
            'margen_ganancia' => fake()->randomFloat(2, 10, 100),
            'tasa_descuento' => 0,
            'codigo_barras' => fake()->numerify('#############'),
            'imagen_url' => null,
            'video_url' => null,
            'imagenes' => null,
            'estado' => 'Activo',
            'categoria_id' => Categoria::factory(),
            'marca_id' => Marca::factory(),
        ];
    }
}
