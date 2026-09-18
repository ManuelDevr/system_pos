<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ventas', function (Blueprint $table) {
            $table->id();
            $table->decimal('total', 10, 2);
            $table->enum('metodo_pago', ['Efectivo', 'Yape', 'BCP', 'Plin'])->index();
            $table->string('nro_comprobante', 50)->unique()->nullable()->index();
            $table->enum('estado', ['Pagado', 'Anulado'])->default('Pagado')->index();
            
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('cliente_id')->nullable()->constrained('clientes')->nullOnDelete();
            
            $table->timestamps();
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ventas');
    }
};
