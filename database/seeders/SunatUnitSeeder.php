<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Unidad;

class SunatUnitSeeder extends Seeder
{
    public function run(): void
    {
        $units = [
            ['nombre' => 'Unidad', 'abreviatura' => 'UND', 'codigo_sunat' => 'NIU'],
            ['nombre' => 'Kilogramo', 'abreviatura' => 'KG', 'codigo_sunat' => 'KGM'],
            ['nombre' => 'Metro', 'abreviatura' => 'MT', 'codigo_sunat' => 'MTR'],
            ['nombre' => 'Galón', 'abreviatura' => 'GAL', 'codigo_sunat' => 'GLL'],
            ['nombre' => 'Caja', 'abreviatura' => 'CJA', 'codigo_sunat' => 'BX'],
            ['nombre' => 'Par', 'abreviatura' => 'PAR', 'codigo_sunat' => 'PR'],
            ['nombre' => 'Docena', 'abreviatura' => 'DOC', 'codigo_sunat' => 'DZN'],
            ['nombre' => 'Ciento', 'abreviatura' => 'CTO', 'codigo_sunat' => 'CEN'],
        ];

        foreach ($units as $u) {
            Unidad::updateOrCreate(
                ['nombre' => $u['nombre']],
                ['abreviatura' => $u['abreviatura'], 'codigo_sunat' => $u['codigo_sunat'], 'estado' => 'Activo']
            );
        }
    }
}
