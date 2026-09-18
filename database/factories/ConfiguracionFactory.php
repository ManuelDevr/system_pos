<?php

namespace Database\Factories;

use App\Models\Configuracion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Configuracion>
 */
class ConfiguracionFactory extends Factory
{
    protected $model = Configuracion::class;

    public function definition(): array
    {
        return [
            'nombre_empresa' => 'Ferreteria CMA',
            'logo_empresa' => 'img/logo.png',
            'ruc' => '20123456789',
            'direccion' => 'Av. Principal 123, Lima',
            'telefono' => '012345678',
            'metodos_pago' => ['Efectivo', 'Transferencia', 'Tarjeta'],
            'certificado_digital' => null,
            'sol_usuario' => 'CMAUSR',
            'sol_clave' => 'Clave123',
            'entorno' => 'facturacion',
            'serie_factura' => 'F001',
            'serie_boleta' => 'B001',
            'serie_nota_credito' => 'NC01',
            'serie_nota_debito' => 'ND01',
            'igv' => 18.00,
        ];
    }
}
