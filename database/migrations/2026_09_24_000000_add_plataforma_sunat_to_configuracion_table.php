<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('configuracion', function (Blueprint $table) {
            $table->string('facturacion_provider', 20)->nullable()->after('igv');
            $table->string('sunat_plataforma_base_url')->nullable()->after('facturacion_provider');
            $table->text('sunat_plataforma_api_key')->nullable()->after('sunat_plataforma_base_url');
            $table->text('sunat_plataforma_api_secret')->nullable()->after('sunat_plataforma_api_key');
            $table->text('sunat_webhook_secret')->nullable()->after('sunat_plataforma_api_secret');
        });
    }

    public function down(): void
    {
        Schema::table('configuracion', function (Blueprint $table) {
            $table->dropColumn([
                'facturacion_provider',
                'sunat_plataforma_base_url',
                'sunat_plataforma_api_key',
                'sunat_plataforma_api_secret',
                'sunat_webhook_secret',
            ]);
        });
    }
};