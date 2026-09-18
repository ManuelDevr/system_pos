<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('configuracion', function (Blueprint $table) {
            $table->string('certificado_digital')->nullable()->after('metodos_pago');
            $table->string('sol_usuario', 100)->nullable()->after('certificado_digital');
            $table->text('sol_clave')->nullable()->after('sol_usuario');
            $table->string('entorno', 20)->default('Beta')->after('sol_clave');
            $table->string('serie_factura', 10)->nullable()->after('entorno');
            $table->string('serie_boleta', 10)->nullable()->after('serie_factura');
            $table->string('serie_nota_credito', 10)->nullable()->after('serie_boleta');
            $table->string('serie_nota_debito', 10)->nullable()->after('serie_nota_credito');
        });
    }

    public function down(): void
    {
        Schema::table('configuracion', function (Blueprint $table) {
            $table->dropColumn([
                'certificado_digital',
                'sol_usuario',
                'sol_clave',
                'entorno',
                'serie_factura',
                'serie_boleta',
                'serie_nota_credito',
                'serie_nota_debito',
            ]);
        });
    }
};
