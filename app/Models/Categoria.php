<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Categoria extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'descripcion',
        'estado',
        'visible_tienda',
        'orden_tienda',
        'parent_id',
    ];

    protected $casts = [
        'visible_tienda' => 'boolean',
        'orden_tienda' => 'integer',
    ];

    protected static function booted(): void
    {
        static::saved(function (Categoria $categoria) {
            if (config('sync.enabled')) {
                app(\App\Services\CategorySyncService::class)->dispatchSync($categoria, 'update');
            }
        });

        static::deleting(function (Categoria $categoria) {
            if (config('sync.enabled')) {
                try {
                    app(\App\Services\CategorySyncService::class)->dispatchSync($categoria, 'delete');
                } catch (\Throwable $e) {
                    // ignore
                }
            }
        });
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Categoria::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Categoria::class, 'parent_id');
    }

    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class);
    }
}
