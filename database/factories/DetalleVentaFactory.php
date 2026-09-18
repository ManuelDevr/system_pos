<?php

namespace Database\Factories;

use App\Models\DetalleVenta;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DetalleVenta>
 */
class DetalleVentaFactory extends Factory
{
    protected $model = DetalleVenta::class;

    public function definition(): array
    {
        $cantidad = fake()->numberBetween(1, 10);
        $precioUnitario = fake()->randomFloat(2, 5, 100);

        return [
            'cantidad' => $cantidad,
            'precio_unitario' => $precioUnitario,
            'subtotal' => round($cantidad * $precioUnitario, 2),
            'cantidad_base' => $cantidad,
            'venta_id' => \App\Models\Venta::factory(),
            'producto_id' => \App\Models\Producto::factory(),
            'unidad_id' => \App\Models\Unidad::factory(),
        ];
    }
}
