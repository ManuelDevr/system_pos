<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sucursales', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150);
            $table->text('direccion')->nullable();
            $table->string('telefono', 20)->nullable();
            $table->string('ruc', 11)->nullable();
            $table->string('serie_factura', 10)->nullable();
            $table->string('serie_boleta', 10)->nullable();
            $table->boolean('principal')->default(false);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sucursales');
    }
};
