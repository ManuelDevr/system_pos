<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Siembra la matriz de permisos por rol.
 *
 * Se hace como migración (y no solo con el seeder) porque el arranque en
 * producción ejecuta `php artisan migrate --force` pero nunca `db:seed`.
 * Sin esta matriz, CheckPermission aborta con 403 en todas las rutas
 * `permission:*` y el primer Administrador no podría usar el sistema.
 *
 * El catálogo de permisos sale de config/permissions.php: Administrador recibe
 * todos y Cajero solo los cinco operativos. Es idempotente: volver a correr la
 * migración no duplica filas (unique en rol+permiso).
 */
return new class extends Migration
{
    public function up(): void
    {
        $permisos = array_keys(config('permissions', []));

        if ($permisos === []) {
            return;
        }

        $cajeroDefaults = [
            'ver_dashboard' => true,
            'ver_catalogo' => true,
            'gestionar_clientes' => true,
            'realizar_ventas' => true,
            'ver_historial_ventas' => true,
        ];

        $filas = [];

        foreach ($permisos as $permiso) {
            $filas[] = [
                'rol' => 'Administrador',
                'permiso' => $permiso,
                'permitido' => true,
            ];

            $filas[] = [
                'rol' => 'Cajero',
                'permiso' => $permiso,
                'permitido' => $cajeroDefaults[$permiso] ?? false,
            ];
        }

        foreach (array_chunk($filas, 200) as $lote) {
            DB::table('permisos_roles')->upsert(
                $lote,
                ['rol', 'permiso'],
                ['permitido']
            );
        }
    }

    public function down(): void
    {
        DB::table('permisos_roles')
            ->whereIn('rol', ['Administrador', 'Cajero'])
            ->delete();
    }
};
