<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversiones_unidad_producto', function (Blueprint $table) {
            $table->decimal('tasa_descuento', 5, 2)->default(0)->after('precio_venta');
        });
    }

    public function down(): void
    {
        Schema::table('conversiones_unidad_producto', function (Blueprint $table) {
            $table->dropColumn('tasa_descuento');
        });
    }
};
