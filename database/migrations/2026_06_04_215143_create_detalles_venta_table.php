<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detalles_venta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('venta_id')->constrained('ventas')->cascadeOnDelete();
            $table->foreignId('producto_id')->constrained('productos');
            $table->integer('cantidad');
            $table->decimal('precio_unitario', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->foreignId('unidad_id')->nullable()->constrained('unidades')->nullOnDelete();
            $table->decimal('cantidad_base', 10, 2)->default(0); // Nueva columna para guardar la cantidad real en unidades físicas
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalles_venta');
    }
};
