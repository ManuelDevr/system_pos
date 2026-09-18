<?php

namespace Database\Factories;

use App\Models\DetalleCompra;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DetalleCompra>
 */
class DetalleCompraFactory extends Factory
{
    protected $model = DetalleCompra::class;

    public function definition(): array
    {
        $cantidad = fake()->numberBetween(1, 50);
        $precioCompra = fake()->randomFloat(2, 2, 50);

        return [
            'cantidad' => $cantidad,
            'precio_compra' => $precioCompra,
            'subtotal' => round($cantidad * $precioCompra, 2),
            'producto_nombre' => fake()->words(2, true),
            'unidad_medida' => 'Unidad',
            'compra_id' => \App\Models\Compra::factory(),
            'producto_id' => \App\Models\Producto::factory(),
        ];
    }
}
