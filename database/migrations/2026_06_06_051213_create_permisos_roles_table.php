<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permisos_roles', function (Blueprint $table) {
            $table->id();
            $table->string('rol'); // 'Administrador', 'Cajero'
            $table->string('permiso'); // 'ver_dashboard', 'gestionar_productos', etc.
            $table->boolean('permitido')->default(false);
            $table->timestamps();
            
            $table->unique(['rol', 'permiso']);
            $table->index(['rol', 'permiso']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permisos_roles');
    }
};
