<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Descuento por línea en soles (monto fijo por producto)
        Schema::table('detalles_venta', function (Blueprint $table) {
            $table->decimal('descuento', 10, 2)->default(0)->after('subtotal');
            $table->decimal('subtotal_descuento', 10, 2)->default(0)->after('descuento');
        });

        // Descuento total de la venta en soles
        Schema::table('ventas', function (Blueprint $table) {
            $table->decimal('descuento', 10, 2)->default(0)->after('total');
        });
    }

    public function down(): void
    {
        Schema::table('detalles_venta', function (Blueprint $table) {
            $table->dropColumn(['descuento', 'subtotal_descuento']);
        });

        Schema::table('ventas', function (Blueprint $table) {
            $table->dropColumn('descuento');
        });
    }
};