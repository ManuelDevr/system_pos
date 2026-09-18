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
        Schema::table('configuracion', function (Blueprint $table) {
            $table->decimal('igv', 5, 2)->default(18.00)->after('serie_nota_debito');
        });

        Schema::table('ventas', function (Blueprint $table) {
            $table->decimal('base_imponible', 10, 2)->nullable()->after('total');
            $table->decimal('igv', 10, 2)->nullable()->after('base_imponible');
        });
    }

    public function down(): void
    {
        Schema::table('configuracion', function (Blueprint $table) {
            $table->dropColumn('igv');
        });

        Schema::table('ventas', function (Blueprint $table) {
            $table->dropColumn(['base_imponible', 'igv']);
        });
    }
};
