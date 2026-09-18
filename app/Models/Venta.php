<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Venta extends Model
{
    use HasFactory;

    protected $fillable = [
        'total',
        'pagado_con',
        'vuelto',
        'descuento',
        'base_imponible',
        'igv',
        'metodo_pago',
        'nro_comprobante',
        'estado',
        'sunat_envio',
        'sunat_document_id',
        'sunat_status',
        'sunat_pdf_url',
        'sunat_cdr',
        'sunat_response_at',
        'user_id',
        'cliente_id',
        'cliente_tipo_doc',
        'cliente_documento',
        'cliente_nombre',
    ];

    protected $appends = [
        'nombre_cliente',
        'documento_cliente',
        'tipo_documento_cliente',
    ];

    protected function casts(): array
    {
        return [
            'sunat_envio' => 'boolean',
            'sunat_response_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleVenta::class);
    }

    public function getNombreClienteAttribute(): string
    {
        return $this->cliente_nombre
            ?: $this->cliente?->nombre
            ?: 'CLIENTE VARIOS';
    }

    public function getDocumentoClienteAttribute(): string
    {
        return $this->cliente_documento
            ?: $this->cliente?->ruc_dni
            ?: '';
    }

    public function getTipoDocumentoClienteAttribute(): ?string
    {
        if ($this->cliente_tipo_doc) {
            return $this->cliente_tipo_doc;
        }

        $documento = $this->documento_cliente;

        return match (strlen($documento)) {
            11 => 'RUC',
            8 => 'DNI',
            default => null,
        };
    }
}
