<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('configuracion')->update([
            'metodos_pago' => json_encode(['Efectivo', 'Transferencia', 'Billetera digital', 'Tarjeta', 'Yape', 'Plin', 'BCP']),
        ]);

        Cache::forget('app_config');
        Cache::forget('app_config_metodos_pago');
    }

    public function down(): void
    {
        DB::table('configuracion')->update([
            'metodos_pago' => json_encode(['Efectivo', 'Yape', 'BCP', 'Plin']),
        ]);

        Cache::forget('app_config');
        Cache::forget('app_config_metodos_pago');
    }
};