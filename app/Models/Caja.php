<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Caja extends Model
{
    use HasFactory;

    protected $table = 'cajas';

    protected $fillable = [
        'sucursal_id',
        'user_id',
        'monto_inicial',
        'monto_esperado',
        'monto_contado',
        'diferencia',
        'estado',
        'abierta_en',
        'cerrada_en',
        'notas',
    ];

    protected $casts = [
        'monto_inicial' => 'decimal:2',
        'monto_esperado' => 'decimal:2',
        'monto_contado' => 'decimal:2',
        'diferencia' => 'decimal:2',
        'abierta_en' => 'datetime',
        'cerrada_en' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sucursal(): BelongsTo
    {
        return $this->belongsTo(Sucursal::class);
    }

    public function movimientos(): HasMany
    {
        return $this->hasMany(MovimientoCaja::class);
    }

    public function ventas(): HasMany
    {
        return $this->hasMany(Venta::class);
    }

    public function scopeAbierta(Builder $query): Builder
    {
        return $query->where('estado', 'Abierta');
    }

    public function estaAbierta(): bool
    {
        return $this->estado === 'Abierta';
    }

    /**
     * Total de ventas cobradas en efectivo durante el turno.
     */
    public function totalVentasEfectivo(): float
    {
        return (float) $this->ventas()
            ->where('estado', 'Pagado')
            ->where('metodo_pago', 'Efectivo')
            ->sum('total');
    }

    /**
     * Total de ingresos/egresos manuales de caja (excluye los que provienen de
     * una venta, que ya se contabilizan en totalVentasEfectivo()).
     */
    public function totalMovimientos(string $tipo): float
    {
        return (float) $this->movimientos()
            ->where('tipo', $tipo)
            ->whereNull('venta_id')
            ->sum('monto');
    }

    /**
     * Efectivo que debería haber en caja al cierre.
     */
    public function calcularEsperado(): float
    {
        return round(
            (float) $this->monto_inicial
            + $this->totalVentasEfectivo()
            + $this->totalMovimientos('Ingreso')
            - $this->totalMovimientos('Egreso'),
            2
        );
    }
}
