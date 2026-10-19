<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Fase 4 — Stock por sucursal y transferencias internas.
 *
 * - `productos.stock` sigue siendo el stock consolidado (suma de sucursales)
 *   para no romper dashboards ni reportes existentes.
 * - `stock_sucursal` guarda la existencia real por sucursal.
 * - `transferencias` registra el traslado de mercadería entre sucursales.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_sucursal', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sucursal_id')->constrained('sucursales')->cascadeOnDelete();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->decimal('stock', 14, 4)->default(0);
            $table->timestamps();
            $table->unique(['sucursal_id', 'producto_id']);
        });

        Schema::create('transferencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sucursal_origen_id')->constrained('sucursales');
            $table->foreignId('sucursal_destino_id')->constrained('sucursales');
            $table->foreignId('user_id')->constrained();
            $table->json('items');
            $table->string('estado', 20)->default('COMPLETADA');
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });

        if (! Schema::hasColumn('kardex', 'sucursal_id')) {
            Schema::table('kardex', function (Blueprint $table) {
                $table->unsignedBigInteger('sucursal_id')->nullable()->index();
            });
        }

        if (! Schema::hasColumn('compras', 'sucursal_id')) {
            Schema::table('compras', function (Blueprint $table) {
                $table->unsignedBigInteger('sucursal_id')->nullable()->index();
            });
        }

        $principalId = DB::table('sucursales')->where('principal', true)->value('id')
            ?? DB::table('sucursales')->orderBy('id')->value('id');

        if (! $principalId) {
            $principalId = DB::table('sucursales')->insertGetId([
                'nombre' => 'Principal',
                'principal' => true,
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        DB::table('productos')->orderBy('id')->chunkById(500, function ($productos) use ($principalId) {
            $rows = [];

            foreach ($productos as $producto) {
                $rows[] = [
                    'sucursal_id' => $principalId,
                    'producto_id' => $producto->id,
                    'stock' => $producto->stock,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            if ($rows) {
                DB::table('stock_sucursal')->insert($rows);
            }
        });
    }

    public function down(): void
    {
        Schema::table('compras', function (Blueprint $table) {
            $table->dropColumn('sucursal_id');
        });

        Schema::table('kardex', function (Blueprint $table) {
            $table->dropColumn('sucursal_id');
        });

        Schema::dropIfExists('transferencias');
        Schema::dropIfExists('stock_sucursal');
    }
};
