<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversiones_unidad_producto', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->foreignId('unidad_id')->constrained('unidades');
            $table->integer('cantidad')->default(1);
            $table->decimal('factor', 10, 4);
            $table->string('codigo_barras', 50)->unique()->nullable();
            $table->decimal('precio_compra', 10, 2);
            $table->decimal('precio_venta', 10, 2);
            $table->enum('estado', ['Activo', 'Inactivo'])->default('Activo');
            $table->unique(['producto_id', 'unidad_id']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversiones_unidad_producto');
    }
};
