<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Añadir código de barras a Productos
        Schema::table('productos', function (Blueprint $table) {
            $table->string('codigo_barras', 50)->unique()->nullable()->after('sku')->index();
        });

        // 2. Añadir código SUNAT a Unidades
        Schema::table('unidades', function (Blueprint $table) {
            $table->string('codigo_sunat', 10)->nullable()->after('abreviatura');
        });

        // 3. Crear tabla de Kardex Permanente (En Unidades)
        Schema::create('kardex', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->enum('tipo_movimiento', ['ENTRADA', 'SALIDA'])->index();
            $table->string('motivo'); // 'Venta', 'Compra', 'Ajuste', 'Anulación'
            $table->decimal('cantidad', 12, 4); // Soporte para decimales en KG
            $table->decimal('stock_anterior', 12, 4);
            $table->decimal('stock_actual', 12, 4);
            $table->string('referencia_tipo')->nullable(); // 'Venta', 'Compra'
            $table->unsignedBigInteger('referencia_id')->nullable(); // ID de la venta o compra
            $table->foreignId('user_id')->constrained('users');
            $table->timestamps();
            
            $table->index(['referencia_tipo', 'referencia_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kardex');
        Schema::table('unidades', function (Blueprint $table) {
            $table->dropColumn('codigo_sunat');
        });
        Schema::table('productos', function (Blueprint $table) {
            $table->dropColumn('codigo_barras');
        });
    }
};
