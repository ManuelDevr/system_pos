<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GuiaRemision extends Model
{
    protected $table = 'guias_remision';

    protected $fillable = [
        'venta_id',
        'cliente_id',
        'nro_comprobante',
        'serie',
        'fecha_emision',
        'fecha_traslado',
        'motivo_traslado',
        'modalidad',
        'destinatario_tipo_doc',
        'destinatario_num_doc',
        'destinatario_razon_social',
        'partida_ubigeo',
        'partida_direccion',
        'llegada_ubigeo',
        'llegada_direccion',
        'peso_total',
        'und_peso_total',
        'num_bultos',
        'transportista_tipo_doc',
        'transportista_num_doc',
        'transportista_razon_social',
        'transportista_nro_mtc',
        'vehiculo_placa',
        'conductor_tipo_doc',
        'conductor_num_doc',
        'conductor_nombres',
        'conductor_apellidos',
        'conductor_licencia',
        'observacion',
        'items',
        'estado',
        'sunat_document_id',
        'sunat_status',
        'sunat_pdf_url',
        'sunat_response',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'fecha_emision' => 'date',
            'fecha_traslado' => 'date',
            'peso_total' => 'decimal:3',
            'items' => 'array',
            'sunat_response' => 'array',
        ];
    }

    public function venta(): BelongsTo
    {
        return $this->belongsTo(Venta::class);
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
