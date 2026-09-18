<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Producto extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nombre',
        'sku',
        'codigo_barras',
        'descripcion',
        'stock',
        'stock_minimo',
        'precio_compra',
        'precio_venta',
        'margen_ganancia',
        'unidad_medida',
        'tasa_descuento',
        'estado',
        'categoria_id',
        'marca_id',
        'imagen_url',
        'video_url',
        'imagenes',
        'mostrar_video',
    ];

    protected $casts = [
        'imagenes' => 'array',
        'mostrar_video' => 'boolean',
    ];

    protected static function booted(): void
    {
        // --- Emisor de sincronización (solo cuando la bandera está activa en el POS) ---
        static::saved(function (Producto $product) {
            if (config('sync.enabled')) {
                app(\App\Services\ProductSyncService::class)->dispatchSync($product, 'update');
            }
        });

        // Capturar datos antes del borrado lógico (SoftDeletes) para avisar a la Web.
        static::deleting(function (Producto $product) {
            if (config('sync.enabled')) {
                app(\App\Services\ProductSyncService::class)->dispatchDelete($product->toArray());
            }
        });
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class);
    }

    public function marca(): BelongsTo
    {
        return $this->belongsTo(Marca::class);
    }

    public function conversiones(): HasMany
    {
        return $this->hasMany(ConversionUnidadProducto::class);
    }

    public function detallesVenta(): HasMany
    {
        return $this->hasMany(DetalleVenta::class);
    }

    public function movimientosKardex(): HasMany
    {
        return $this->hasMany(Kardex::class);
    }
}
