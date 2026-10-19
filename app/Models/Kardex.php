<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Kardex extends Model
{
    use HasFactory;

    protected $table = 'kardex';

    protected $fillable = [
        'producto_id',
        'sucursal_id',
        'tipo_movimiento',
        'motivo',
        'cantidad',
        'costo_unitario',
        'valor_total',
        'stock_anterior',
        'stock_actual',
        'referencia_tipo',
        'referencia_id',
        'user_id',
    ];

    protected $casts = [
        'cantidad' => 'decimal:4',
        'costo_unitario' => 'decimal:4',
        'valor_total' => 'decimal:2',
        'stock_anterior' => 'decimal:4',
        'stock_actual' => 'decimal:4',
    ];

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sucursal(): BelongsTo
    {
        return $this->belongsTo(Sucursal::class);
    }
}
