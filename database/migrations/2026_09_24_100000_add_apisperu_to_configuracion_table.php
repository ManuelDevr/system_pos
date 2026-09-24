<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('configuracion', function (Blueprint $table) {
            $table->string('apisperu_base_url')->nullable()->after('sunat_webhook_secret');
            $table->text('apisperu_token')->nullable()->after('apisperu_base_url');
        });
    }

    public function down(): void
    {
        Schema::table('configuracion', function (Blueprint $table) {
            $table->dropColumn(['apisperu_base_url', 'apisperu_token']);
        });
    }
};