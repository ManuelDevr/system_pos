<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConversionUnidadProducto extends Model
{
    protected $table = 'conversiones_unidad_producto';

    protected $fillable = [
        'producto_id',
        'unidad_id',
        'cantidad',
        'factor',
        'codigo_barras',
        'precio_compra',
        'precio_venta',
        'tasa_descuento',
        'estado',
    ];

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }

    public function unidad(): BelongsTo
    {
        return $this->belongsTo(Unidad::class);
    }
}
