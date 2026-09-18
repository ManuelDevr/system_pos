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
        Schema::create('cotizaciones', function (Blueprint $table) {
            $table->id();
            $table->string('nro_cotizacion', 30)->unique();
            $table->string('cliente_nombre', 255)->nullable();
            $table->string('cliente_ruc', 20)->nullable();
            $table->string('cliente_direccion', 255)->nullable();
            $table->string('cliente_email', 255)->nullable();
            $table->string('cliente_telefono', 20)->nullable();
            $table->string('tipo_comprobante', 20)->default('Boleta');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('igv', 10, 2);
            $table->decimal('total', 10, 2);
            $table->text('observaciones')->nullable();
            $table->enum('estado', ['Pendiente', 'Aprobada', 'Convertida', 'Rechazada'])->default('Pendiente')->index();
            $table->foreignId('user_id')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cotizaciones');
    }
};
