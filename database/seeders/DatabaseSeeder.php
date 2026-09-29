<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Datos base del sistema: catálogos de permisos y unidades de medida.
 *
 * NO crea usuarios, clientes ni configuración de empresa. El primer arranque
 * arranca con la base de datos vacía: el Administrador se crea desde
 * /register (garantiza EnsureFirstUserRegistration) y la empresa, series y
 * credenciales de facturación se completan desde /configuracion.
 */
class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            SunatUnitSeeder::class,
        ]);
    }
}
