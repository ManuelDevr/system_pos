<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotaDebito extends Model
{
    protected $table = 'notas_debito';

    protected $fillable = [
        'venta_id',
        'nro_comprobante',
        'serie',
        'motivo_codigo',
        'motivo_descripcion',
        'total',
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
            'total' => 'decimal:2',
            'sunat_response' => 'array',
        ];
    }

    public function venta(): BelongsTo
    {
        return $this->belongsTo(Venta::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
