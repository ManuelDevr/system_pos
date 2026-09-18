<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            $table->string('cliente_tipo_doc', 10)->nullable()->after('cliente_id');
            $table->string('cliente_documento', 20)->nullable()->after('cliente_tipo_doc');
            $table->string('cliente_nombre')->nullable()->after('cliente_documento');
        });
    }

    public function down(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            $table->dropColumn([
                'cliente_tipo_doc',
                'cliente_documento',
                'cliente_nombre',
            ]);
        });
    }
};