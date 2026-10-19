<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Agrega a la matriz de permisos los permisos introducidos por las Fases 1-4
 * (caja, utilidad, guías de remisión, transferencias de stock). El catálogo
 * previo se sembró con una migración anterior; como esta ya corrió en
 * producción, los permisos nuevos deben incorporarse de forma incremental.
 */
return new class extends Migration
{
    public function up(): void
    {
        $cajeroDefaults = [
            'abrir_caja' => true,
            'emitir_guia' => true,
            'ver_utilidad' => false,
            'transferir_stock' => false,
        ];

        $filas = [];

        foreach (array_keys($cajeroDefaults) as $permiso) {
            $filas[] = [
                'rol' => 'Administrador',
                'permiso' => $permiso,
                'permitido' => true,
            ];

            $filas[] = [
                'rol' => 'Cajero',
                'permiso' => $permiso,
                'permitido' => $cajeroDefaults[$permiso],
            ];
        }

        DB::table('permisos_roles')->upsert($filas, ['rol', 'permiso'], ['permitido']);
    }

    public function down(): void
    {
        DB::table('permisos_roles')
            ->whereIn('permiso', ['abrir_caja', 'emitir_guia', 'ver_utilidad', 'transferir_stock'])
            ->delete();
    }
};
