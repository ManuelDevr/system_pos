<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Venta;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Venta>
 */
class VentaFactory extends Factory
{
    protected $model = Venta::class;

    public function definition(): array
    {
        $total = fake()->randomFloat(2, 10, 500);
        $igv = round($total * 0.18, 2);

        return [
            'total' => $total,
            'base_imponible' => $total - $igv,
            'igv' => $igv,
            'metodo_pago' => 'Efectivo',
            'nro_comprobante' => fake()->unique()->bothify('B001-######'),
            'estado' => 'Pagado',
            'sunat_envio' => false,
            'user_id' => User::factory(),
            'cliente_id' => null,
        ];
    }
}
