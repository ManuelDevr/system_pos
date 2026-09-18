<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unidad extends Model
{
    use HasFactory;

    protected $table = 'unidades';

    protected $fillable = [
        'nombre',
        'abreviatura',
        'codigo_sunat',
        'estado',
    ];

    public static function getSunatMapping()
    {
        return [
            'UND' => 'NIU',
            'UNID' => 'NIU',
            'KGS' => 'KGM',
            'KG' => 'KGM',
            'MTS' => 'MTR',
            'MT' => 'MTR',
            'GLN' => 'GLL',
            'GAL' => 'GLL',
            'CJA' => 'BX',
            'PAR' => 'PR',
        ];
    }

    public function getSunatCodeAttribute()
    {
        $codigoSunat = $this->attributes['codigo_sunat'] ?? null;
        if (!empty($codigoSunat)) {
            return $codigoSunat;
        }

        $mapping = self::getSunatMapping();
        $abrev = strtoupper($this->abreviatura);

        return $mapping[$abrev] ?? 'NIU';
    }

    public function conversiones(): HasMany
    {
        return $this->hasMany(ConversionUnidadProducto::class);
    }

    public function detallesVenta(): HasMany
    {
        return $this->hasMany(DetalleVenta::class);
    }
}
