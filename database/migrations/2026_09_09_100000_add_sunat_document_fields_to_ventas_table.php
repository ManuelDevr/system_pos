<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            $table->string('sunat_document_id')->nullable()->after('sunat_envio');
            $table->string('sunat_status', 30)->nullable()->after('sunat_document_id');
            $table->string('sunat_pdf_url')->nullable()->after('sunat_status');
            $table->string('sunat_cdr')->nullable()->after('sunat_pdf_url');
            $table->timestamp('sunat_response_at')->nullable()->after('sunat_cdr');
        });
    }

    public function down(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            $table->dropColumn([
                'sunat_document_id',
                'sunat_status',
                'sunat_pdf_url',
                'sunat_cdr',
                'sunat_response_at',
            ]);
        });
    }
};
