<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleCotizacion extends Model
{
    protected $table = 'detalles_cotizacion';

    protected $fillable = [
        'cotizacion_id',
        'producto_id',
        'producto_nombre',
        'unidad_medida',
        'cantidad',
        'precio_unitario',
        'subtotal',
        'descuento',
        'subtotal_descuento',
    ];

    public function cotizacion(): BelongsTo
    {
        return $this->belongsTo(Cotizacion::class);
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }
}
