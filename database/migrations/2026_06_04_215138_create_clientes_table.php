<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150)->index();
            $table->string('ruc_dni', 20)->unique()->nullable()->index();
            $table->string('email', 100)->nullable();
            $table->string('telefono', 20)->nullable();
            $table->text('direccion')->nullable();
            $table->enum('estado', ['Activo', 'Inactivo'])->default('Activo')->index();
            $table->timestamps();
            $table->softDeletes(); // Columna para papelera
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};
