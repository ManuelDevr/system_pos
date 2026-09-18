<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('productos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150)->index();
            $table->string('sku', 50)->unique()->nullable()->index();
            $table->text('descripcion')->nullable();
            $table->integer('stock')->default(0);
            $table->integer('stock_minimo')->default(0);
            $table->decimal('precio_compra', 10, 2);
            $table->decimal('precio_venta', 10, 2);
            $table->decimal('margen_ganancia', 10, 2)->default(0.00);
            $table->string('unidad_medida', 50)->default('Unidad');
            $table->decimal('tasa_descuento', 5, 2)->default(0.00);
            $table->enum('estado', ['Activo', 'Inactivo'])->default('Activo')->index();
            
            $table->foreignId('categoria_id')->nullable()->constrained('categorias')->nullOnDelete();
            $table->foreignId('marca_id')->nullable()->constrained('marcas')->nullOnDelete();
            
            $table->timestamps();
            $table->softDeletes(); // Columna para papelera
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};
