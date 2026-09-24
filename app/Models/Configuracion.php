<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Configuracion extends Model
{
    use HasFactory;

    protected $table = 'configuracion';

    protected $fillable = [
        'nombre_empresa',
        'logo_empresa',
        'ruc',
        'direccion',
        'telefono',
        'correo',
        'metodos_pago',
        'certificado_digital',
        'sol_usuario',
        'sol_clave',
        'entorno',
        'serie_factura',
        'serie_boleta',
        'serie_nota_credito',
        'serie_nota_debito',
        'igv',
        'facturacion_provider',
        'sunat_plataforma_base_url',
        'sunat_plataforma_api_key',
        'sunat_plataforma_api_secret',
        'sunat_webhook_secret',
        'apisperu_base_url',
        'apisperu_token',
    ];

    protected $casts = [
        'metodos_pago' => 'array',
        'igv' => 'decimal:2',
    ];
}
