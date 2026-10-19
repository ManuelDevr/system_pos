<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleVenta extends Model
{
    use HasFactory;

    protected $table = 'detalles_venta';

    protected $fillable = [
        'venta_id',
        'producto_id',
        'cantidad',
        'precio_unitario',
        'costo_unitario',
        'subtotal',
        'descuento',
        'subtotal_descuento',
        'unidad_id',
        'cantidad_base',
    ];

    protected $casts = [
        'cantidad' => 'decimal:4',
        'cantidad_base' => 'decimal:4',
        'costo_unitario' => 'decimal:4',
        'precio_unitario' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'descuento' => 'decimal:2',
        'subtotal_descuento' => 'decimal:2',
    ];

    public function venta(): BelongsTo
    {
        return $this->belongsTo(Venta::class);
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }

    public function unidad(): BelongsTo
    {
        return $this->belongsTo(Unidad::class);
    }
}
