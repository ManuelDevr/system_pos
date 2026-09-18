<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grupos', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->unique();
            $table->string('nombre')->unique();
            $table->string('descripcion')->nullable();
            $table->enum('estado', ['Activo', 'Inactivo'])->default('Activo')->index();
            $table->timestamps();
        });

        DB::table('grupos')->insert([
            [
                'codigo' => 'GRP-001',
                'nombre' => 'Administrador',
                'descripcion' => 'Acceso total al sistema y configuración.',
                'estado' => 'Activo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'codigo' => 'GRP-002',
                'nombre' => 'Cajero',
                'descripcion' => 'Gestiona ventas, clientes y su historial.',
                'estado' => 'Activo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('grupos');
    }
};