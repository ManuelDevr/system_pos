<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cotizaciones', function (Blueprint $table) {
            $table->decimal('descuento', 10, 2)->default(0)->after('subtotal');
        });

        Schema::table('detalles_cotizacion', function (Blueprint $table) {
            $table->decimal('descuento', 10, 2)->default(0)->after('subtotal');
            $table->decimal('subtotal_descuento', 10, 2)->default(0)->after('descuento');
        });
    }

    public function down(): void
    {
        Schema::table('detalles_cotizacion', function (Blueprint $table) {
            $table->dropColumn(['descuento', 'subtotal_descuento']);
        });

        Schema::table('cotizaciones', function (Blueprint $table) {
            $table->dropColumn('descuento');
        });
    }
};