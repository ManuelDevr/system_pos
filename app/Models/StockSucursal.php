<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockSucursal extends Model
{
    protected $table = 'stock_sucursal';

    protected $fillable = [
        'sucursal_id',
        'producto_id',
        'stock',
    ];

    protected $casts = [
        'stock' => 'decimal:4',
    ];

    public function sucursal(): BelongsTo
    {
        return $this->belongsTo(Sucursal::class);
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }
}
