<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categorias', function (Blueprint $table) {
            $table->boolean('visible_tienda')->default(true)->after('estado');
            $table->unsignedSmallInteger('orden_tienda')->nullable()->after('visible_tienda');
        });

        Schema::table('productos', function (Blueprint $table) {
            $table->boolean('visible_tienda')->default(true)->after('estado');
            $table->boolean('destacado_tienda')->default(false)->after('visible_tienda');
            $table->unsignedSmallInteger('orden_tienda')->nullable()->after('destacado_tienda');
        });

        Schema::create('sync_logs', function (Blueprint $table) {
            $table->id();
            $table->enum('tipo', ['producto', 'categoria']);
            $table->string('referencia', 150)->nullable();
            $table->string('accion', 20)->default('update');
            $table->string('estado', 20)->default('ok');
            $table->integer('http_status')->nullable();
            $table->text('error')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sync_logs');

        Schema::table('productos', function (Blueprint $table) {
            $table->dropColumn(['visible_tienda', 'destacado_tienda', 'orden_tienda']);
        });

        Schema::table('categorias', function (Blueprint $table) {
            $table->dropColumn(['visible_tienda', 'orden_tienda']);
        });
    }
};
