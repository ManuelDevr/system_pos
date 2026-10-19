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
        'costo_total',
        'pagado_con',
        'vuelto',
        'descuento',
        'base_imponible',
        'igv',
        'metodo_pago',
        'nro_comprobante',
        'tipo_comprobante',
        'estado',
        'estado_pago',
        'sunat_envio',
        'sunat_document_id',
        'sunat_status',
        'sunat_pdf_url',
        'sunat_cdr',
        'sunat_response_at',
        'user_id',
        'caja_id',
        'sucursal_id',
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
            'total' => 'decimal:2',
            'costo_total' => 'decimal:2',
            'pagado_con' => 'decimal:2',
            'vuelto' => 'decimal:2',
            'descuento' => 'decimal:2',
            'base_imponible' => 'decimal:2',
            'igv' => 'decimal:2',
            'sunat_envio' => 'boolean',
            'sunat_response_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function caja(): BelongsTo
    {
        return $this->belongsTo(Caja::class);
    }

    public function sucursal(): BelongsTo
    {
        return $this->belongsTo(Sucursal::class);
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleVenta::class);
    }

    public function notasDebito(): HasMany
    {
        return $this->hasMany(NotaDebito::class);
    }

    public function guiasRemision(): HasMany
    {
        return $this->hasMany(GuiaRemision::class);
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
