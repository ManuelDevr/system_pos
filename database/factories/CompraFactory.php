<?php

namespace Database\Factories;

use App\Models\Compra;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Compra>
 */
class CompraFactory extends Factory
{
    protected $model = Compra::class;

    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 50, 500);
        $igv = round($subtotal * 0.18, 2);

        return [
            'nro_comprobante' => fake()->unique()->bothify('C00000#'),
            'proveedor' => fake()->company(),
            'ruc_dni' => fake()->numerify('#########'),
            'direccion' => fake()->address(),
            'telefono' => fake()->phoneNumber(),
            'email' => fake()->safeEmail(),
            'tipo_comprobante' => 'Boleta',
            'subtotal' => $subtotal,
            'igv' => $igv,
            'total' => $subtotal + $igv,
            'estado' => 'Activo',
            'observaciones' => fake()->optional()->sentence(),
            'user_id' => User::factory(),
        ];
    }
}
