<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            $table->string('metodo_pago', 50)->change();
        });

        Schema::table('productos', function (Blueprint $table) {
            $table->decimal('stock', 12, 4)->default(0.0000)->change();
            $table->decimal('stock_minimo', 12, 4)->default(0.0000)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            $table->enum('metodo_pago', ['Efectivo', 'Yape', 'BCP', 'Plin'])->change();
        });

        Schema::table('productos', function (Blueprint $table) {
            $table->integer('stock')->default(0)->change();
            $table->integer('stock_minimo')->default(0)->change();
        });
    }
};
