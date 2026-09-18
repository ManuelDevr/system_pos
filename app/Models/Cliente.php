<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cliente extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nombre',
        'ruc_dni',
        'email',
        'telefono',
        'direccion',
        'estado',
    ];

    public function ventas(): HasMany
    {
        return $this->hasMany(Venta::class);
    }
}
