<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Fase 0 — Cimientos de inventario y costos.
 *
 * - Permite vender/almacenar cantidades fraccionadas (metros, kilos): la
 *   columna `detalles_venta.cantidad` pasa a decimal.
 * - Guarda el costo unitario al momento de la operación (snapshot) para poder
 *   calcular utilidad histórica sin depender del costo actual.
 * - Agrega campos de valoración y reorden al producto.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->decimal('costo_promedio', 12, 4)->default(0)->after('precio_compra');
            $table->string('metodo_valoracion', 20)->default('promedio')->after('costo_promedio');
            $table->boolean('es_fraccionable')->default(false)->after('unidad_medida');
            $table->decimal('punto_reorden', 12, 4)->default(0)->after('stock_minimo');
        });

        Schema::table('detalles_venta', function (Blueprint $table) {
            $table->decimal('cantidad', 12, 4)->change();
            $table->decimal('costo_unitario', 12, 4)->default(0)->after('precio_unitario');
        });

        Schema::table('detalles_compra', function (Blueprint $table) {
            $table->decimal('cantidad', 12, 4)->change();
        });

        Schema::table('kardex', function (Blueprint $table) {
            $table->decimal('costo_unitario', 12, 4)->default(0)->after('cantidad');
            $table->decimal('valor_total', 12, 2)->default(0)->after('costo_unitario');
        });
    }

    public function down(): void
    {
        Schema::table('kardex', function (Blueprint $table) {
            $table->dropColumn(['costo_unitario', 'valor_total']);
        });

        Schema::table('detalles_compra', function (Blueprint $table) {
            $table->decimal('cantidad', 10, 2)->change();
        });

        Schema::table('detalles_venta', function (Blueprint $table) {
            $table->dropColumn('costo_unitario');
            $table->integer('cantidad')->change();
        });

        Schema::table('productos', function (Blueprint $table) {
            $table->dropColumn(['costo_promedio', 'metodo_valoracion', 'es_fraccionable', 'punto_reorden']);
        });
    }
};
