<?php

namespace Database\Factories;

use App\Models\Unidad;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Unidad>
 */
class UnidadFactory extends Factory
{
    protected $model = Unidad::class;

    public function definition(): array
    {
        $units = [
            ['nombre' => 'Unidad', 'abreviatura' => 'UND', 'codigo_sunat' => 'NIU'],
            ['nombre' => 'Kilogramo', 'abreviatura' => 'KGS', 'codigo_sunat' => 'KGM'],
            ['nombre' => 'Metro', 'abreviatura' => 'MTS', 'codigo_sunat' => 'MTR'],
            ['nombre' => 'Litro', 'abreviatura' => 'LT', 'codigo_sunat' => 'LTR'],
            ['nombre' => 'Caja', 'abreviatura' => 'CJA', 'codigo_sunat' => 'BX'],
            ['nombre' => 'Par', 'abreviatura' => 'PAR', 'codigo_sunat' => 'PR'],
            ['nombre' => 'Galón', 'abreviatura' => 'GLN', 'codigo_sunat' => 'GLL'],
        ];

        $unit = fake()->randomElement($units);

        return [
            'nombre' => $unit['nombre'],
            'abreviatura' => $unit['abreviatura'],
            'codigo_sunat' => $unit['codigo_sunat'],
            'estado' => 'Activo',
        ];
    }
}
