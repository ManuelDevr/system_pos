<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transferencia extends Model
{
    protected $table = 'transferencias';

    protected $fillable = [
        'sucursal_origen_id',
        'sucursal_destino_id',
        'user_id',
        'items',
        'estado',
        'observaciones',
    ];

    protected $casts = [
        'items' => 'array',
    ];

    public function origen(): BelongsTo
    {
        return $this->belongsTo(Sucursal::class, 'sucursal_origen_id');
    }

    public function destino(): BelongsTo
    {
        return $this->belongsTo(Sucursal::class, 'sucursal_destino_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
