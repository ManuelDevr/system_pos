<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Fase 3 - SUNAT ampliado.
 *
 * - Notas de debito (tipo 08) que modifican al alza un comprobante emitido.
 * - Guias de remision remitente (tipo 09).
 *
 * Ambos documentos se emiten contra la Plataforma-Sunat, que asigna el
 * correlativo. El POS solo guarda la serie configurada y el resultado.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('configuracion', function (Blueprint $table) {
            $table->string('serie_guia_remision', 10)->nullable()->after('serie_nota_debito');
        });

        Schema::create('notas_debito', function (Blueprint $table) {
            $table->id();
            $table->foreignId('venta_id')->constrained('ventas')->cascadeOnDelete();
            $table->string('nro_comprobante', 50)->nullable()->unique();
            $table->string('serie', 10)->nullable();
            $table->string('motivo_codigo', 2);
            $table->string('motivo_descripcion', 250);
            $table->decimal('total', 12, 2);
            $table->string('estado', 20)->default('PENDIENTE')->index();
            $table->string('sunat_document_id', 50)->nullable();
            $table->string('sunat_status', 20)->nullable();
            $table->text('sunat_pdf_url')->nullable();
            $table->text('sunat_response')->nullable();
            $table->foreignId('user_id')->constrained('users');
            $table->timestamps();

            $table->index(['venta_id', 'created_at']);
        });

        Schema::create('guias_remision', function (Blueprint $table) {
            $table->id();
            $table->foreignId('venta_id')->nullable()->constrained('ventas')->nullOnDelete();
            $table->foreignId('cliente_id')->nullable()->constrained('clientes')->nullOnDelete();
            $table->string('nro_comprobante', 50)->nullable()->unique();
            $table->string('serie', 10);
            $table->date('fecha_emision');
            $table->date('fecha_traslado');
            $table->string('motivo_traslado', 2);
            $table->string('modalidad', 2);

            $table->string('destinatario_tipo_doc', 2);
            $table->string('destinatario_num_doc', 15);
            $table->string('destinatario_razon_social', 255);

            $table->string('partida_ubigeo', 6);
            $table->string('partida_direccion', 500);
            $table->string('llegada_ubigeo', 6);
            $table->string('llegada_direccion', 500);

            $table->decimal('peso_total', 12, 3)->default(1);
            $table->string('und_peso_total', 3)->default('KGM');
            $table->unsignedInteger('num_bultos')->nullable();

            $table->string('transportista_tipo_doc', 2)->nullable();
            $table->string('transportista_num_doc', 11)->nullable();
            $table->string('transportista_razon_social', 255)->nullable();
            $table->string('transportista_nro_mtc', 20)->nullable();

            $table->string('vehiculo_placa', 8)->nullable();
            $table->string('conductor_tipo_doc', 2)->nullable();
            $table->string('conductor_num_doc', 15)->nullable();
            $table->string('conductor_nombres', 100)->nullable();
            $table->string('conductor_apellidos', 100)->nullable();
            $table->string('conductor_licencia', 20)->nullable();

            $table->text('observacion')->nullable();
            $table->json('items')->nullable();

            $table->string('estado', 20)->default('PENDIENTE')->index();
            $table->string('sunat_document_id', 50)->nullable();
            $table->string('sunat_status', 20)->nullable();
            $table->text('sunat_pdf_url')->nullable();
            $table->text('sunat_response')->nullable();
            $table->foreignId('user_id')->constrained('users');
            $table->timestamps();

            $table->index(['venta_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guias_remision');
        Schema::dropIfExists('notas_debito');

        Schema::table('configuracion', function (Blueprint $table) {
            $table->dropColumn('serie_guia_remision');
        });
    }
};
