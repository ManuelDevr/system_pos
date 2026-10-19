<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Fase 0/1 — Trazabilidad de la venta.
 *
 * Agrega la relación con la caja (turno) y la sucursal, el costo total de la
 * venta (para utilidad) y un estado de pago explícito, además de guardar el
 * tipo de comprobante elegido en el POS.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            $table->foreignId('caja_id')->nullable()->after('user_id')->constrained('cajas')->nullOnDelete();
            $table->foreignId('sucursal_id')->nullable()->after('caja_id')->constrained('sucursales')->nullOnDelete();
            $table->decimal('costo_total', 12, 2)->default(0)->after('total');
            $table->string('estado_pago', 20)->default('Pagado')->after('estado')->index();
            $table->string('tipo_comprobante', 20)->nullable()->after('nro_comprobante');

            $table->index(['sucursal_id', 'created_at']);
            $table->index('cliente_id');
        });

        Schema::table('detalles_venta', function (Blueprint $table) {
            $table->index('producto_id');
        });

        Schema::table('kardex', function (Blueprint $table) {
            $table->index('producto_id');
        });
    }

    public function down(): void
    {
        Schema::table('kardex', function (Blueprint $table) {
            $table->dropIndex(['producto_id']);
        });

        Schema::table('detalles_venta', function (Blueprint $table) {
            $table->dropIndex(['producto_id']);
        });

        Schema::table('ventas', function (Blueprint $table) {
            $table->dropIndex(['sucursal_id', 'created_at']);
            $table->dropIndex(['cliente_id']);
            $table->dropConstrainedForeignId('sucursal_id');
            $table->dropConstrainedForeignId('caja_id');
            $table->dropColumn(['costo_total', 'estado_pago', 'tipo_comprobante']);
        });
    }
};
