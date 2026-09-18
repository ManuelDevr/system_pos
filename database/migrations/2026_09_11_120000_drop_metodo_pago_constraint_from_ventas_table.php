<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * El método de pago ahora es configurable (configuracion.metodos_pago),
     * así que eliminamos la restricción CHECK de la migración original del enum.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE ventas DROP CONSTRAINT IF EXISTS ventas_metodo_pago_check');
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE ventas ADD CONSTRAINT ventas_metodo_pago_check CHECK (metodo_pago IN ('Efectivo', 'Yape', 'BCP', 'Plin'))");
    }
};