<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('configuracion', function (Blueprint $table) {
            // Métodos de pago configurables como array JSON
            $table->json('metodos_pago')->nullable()->after('telefono');
        });

        // Poblar con los valores actuales para no romper registros existentes
        DB::table('configuracion')->update([
            'metodos_pago' => json_encode(['Efectivo', 'Yape', 'BCP', 'Plin']),
        ]);
    }

    public function down(): void
    {
        Schema::table('configuracion', function (Blueprint $table) {
            $table->dropColumn('metodos_pago');
        });
    }
};
