<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Compra extends Model
{
    use HasFactory;

    protected $fillable = [
        'nro_comprobante',
        'proveedor',
        'ruc_dni',
        'direccion',
        'telefono',
        'email',
        'tipo_comprobante',
        'subtotal',
        'igv',
        'total',
        'estado',
        'observaciones',
        'user_id',
    ];

    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleCompra::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
