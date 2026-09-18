<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PermisoRol;
use App\Http\Controllers\PermissionController;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = PermissionController::getAllPermissions();
        $keys = array_column($permissions, 'key');

        // Administrador: todos activos por defecto
        foreach ($keys as $perm) {
            PermisoRol::updateOrCreate(
                ['rol' => 'Administrador', 'permiso' => $perm],
                ['permitido' => true]
            );
        }

        // Cajero: permisos limitados (nuevos permisos se heredan como false)
        $cajeroDefaults = [
            'ver_dashboard' => true,
            'ver_catalogo' => true,
            'gestionar_clientes' => true,
            'realizar_ventas' => true,
            'ver_historial_ventas' => true,
        ];

        foreach ($keys as $perm) {
            PermisoRol::updateOrCreate(
                ['rol' => 'Cajero', 'permiso' => $perm],
                ['permitido' => $cajeroDefaults[$perm] ?? false]
            );
        }
    }
}
