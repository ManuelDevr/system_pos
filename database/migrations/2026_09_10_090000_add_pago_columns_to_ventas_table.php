<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            $table->decimal('pagado_con', 10, 2)->nullable()->after('total');
            $table->decimal('vuelto', 10, 2)->nullable()->after('pagado_con');
        });
    }

    public function down(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            $table->dropColumn(['pagado_con', 'vuelto']);
        });
    }
};