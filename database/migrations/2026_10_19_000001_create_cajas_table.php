<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Fase 1 — Caja y turnos.
 *
 * Una "caja" es un turno abierto por un usuario (opcionalmente en una sucursal).
 * Los ingresos/egresos de efectivo se registran en `movimientos_caja` y las
 * ventas se asocian a la caja abierta mediante `ventas.caja_id`.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cajas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sucursal_id')->nullable()->constrained('sucursales')->nullOnDelete();
            $table->foreignId('user_id')->constrained('users');
            $table->decimal('monto_inicial', 12, 2)->default(0);
            $table->decimal('monto_esperado', 12, 2)->default(0);
            $table->decimal('monto_contado', 12, 2)->nullable();
            $table->decimal('diferencia', 12, 2)->nullable();
            $table->string('estado', 20)->default('Abierta')->index();
            $table->timestamp('abierta_en')->nullable();
            $table->timestamp('cerrada_en')->nullable();
            $table->text('notas')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'estado']);
        });

        Schema::create('movimientos_caja', function (Blueprint $table) {
            $table->id();
            $table->foreignId('caja_id')->constrained('cajas')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users');
            $table->string('tipo', 20); // Ingreso | Egreso
            $table->decimal('monto', 12, 2);
            $table->string('motivo', 255);
            $table->foreignId('venta_id')->nullable()->constrained('ventas')->nullOnDelete();
            $table->timestamps();

            $table->index(['caja_id', 'tipo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movimientos_caja');
        Schema::dropIfExists('cajas');
    }
};
