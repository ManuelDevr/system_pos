<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Configuracion;
use App\Models\Cliente;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

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

        // Usuario Administrador
        User::create([
            'name' => 'Mirtha Almeyda Boza',
            'email' => 'admin@example.com',
            'password' => Hash::make('admin123'),
            'telefono' => '941117410',
            'rol' => 'Administrador',
            'estado' => 'Activo',
        ]);

        // Usuarios Cajeros
        User::create([
            'name' => 'Manuel Nole',
            'email' => 'manuel234nole@gmail.com',
            'password' => Hash::make('admin123'),
            'telefono' => '973749506',
            'rol' => 'Cajero',
            'estado' => 'Activo',
        ]);

        // Configuración Inicial
        Configuracion::create([
            'nombre_empresa' => 'Ferretería CMA',
            'ruc' => '20123456789',
            'direccion' => 'Av. Principal 123',
            'telefono' => '01-2345678',
        ]);

        // Clientes Iniciales
        Cliente::create([
            'nombre' => 'Camila',
            'ruc_dni' => '61096634',
            'email' => 'adn@demo.com',
            'telefono' => '987654322',
            'direccion' => 'Los Brillantes 155',
            'estado' => 'Activo',
        ]);

        Cliente::create([
            'nombre' => 'Ana Torres',
            'ruc_dni' => '70000001',
            'email' => 'ana.torres@example.com',
            'telefono' => '999111222',
            'direccion' => 'Av. Siempre Viva 742',
            'estado' => 'Activo',
        ]);
    }
}
