<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sucursal extends Model
{
    protected $table = 'sucursales';

    protected $fillable = [
        'nombre',
        'direccion',
        'telefono',
        'ruc',
        'serie_factura',
        'serie_boleta',
        'principal',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'principal' => 'boolean',
            'activo' => 'boolean',
        ];
    }

    public function stock(): HasMany
    {
        return $this->hasMany(StockSucursal::class);
    }

    public function transferenciasOrigen(): HasMany
    {
        return $this->hasMany(Transferencia::class, 'sucursal_origen_id');
    }

    public function transferenciasDestino(): HasMany
    {
        return $this->hasMany(Transferencia::class, 'sucursal_destino_id');
    }

    /**
     * Sucursal por defecto para operaciones que no indican una explícitamente.
     */
    public static function defaultId(): ?int
    {
        $sucursal = static::where('principal', true)->where('activo', true)->orderBy('id')->first()
            ?? static::where('activo', true)->orderBy('id')->first()
            ?? static::orderBy('id')->first();

        return $sucursal?->id;
    }
}
