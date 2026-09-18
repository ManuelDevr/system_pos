<?php

namespace Database\Factories;

use App\Models\Kardex;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Kardex>
 */
class KardexFactory extends Factory
{
    protected $model = Kardex::class;

    public function definition(): array
    {
        $stockAnterior = fake()->numberBetween(0, 100);
        $cantidad = fake()->numberBetween(1, 50);

        return [
            'tipo_movimiento' => 'ENTRADA',
            'motivo' => 'Compra test',
            'cantidad' => $cantidad,
            'stock_anterior' => $stockAnterior,
            'stock_actual' => $stockAnterior + $cantidad,
            'referencia_tipo' => null,
            'referencia_id' => null,
            'producto_id' => \App\Models\Producto::factory(),
            'user_id' => User::factory(),
        ];
    }
}
