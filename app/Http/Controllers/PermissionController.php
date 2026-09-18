<?php

namespace App\Http\Controllers;

use App\Models\PermisoRol;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;

class PermissionController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings/Privileges', [
            'availablePermissions' => self::getAllPermissions(),
            'permisosExistentes' => PermisoRol::all(),
            'roles' => \App\Models\Grupo::where('estado', 'Activo')->orderBy('nombre')->get()->map(function($g) {
                return [
                    'id' => $g->nombre,
                    'name' => $g->nombre,
                    'desc' => $g->descripcion ?? 'Rol definido en el sistema',
                    'color' => match($g->nombre) {
                        'Administrador' => 'bg-indigo-100 text-indigo-700',
                        'Cajero' => 'bg-emerald-100 text-emerald-700',
                        default => 'bg-slate-100 text-slate-700',
                    }
                ];
            })
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'privilegios' => 'required|array',
            'privilegios.*.rol' => 'required|string',
            'privilegios.*.permiso' => 'required|string',
            'privilegios.*.permitido' => 'required|boolean',
        ]);

        foreach ($request->privilegios as $priv) {
            PermisoRol::updateOrCreate(
                ['rol' => $priv['rol'], 'permiso' => $priv['permiso']],
                ['permitido' => $priv['permitido']]
            );
        }

        $rolesAfectados = collect($request->privilegios)->pluck('rol')->unique();
        foreach ($rolesAfectados as $rol) {
            Cache::forget("role_permissions_{$rol}");
        }

        return redirect()->route('privilegios.index')->with('success', 'Privilegios actualizados correctamente en todo el sistema.');
    }

    public static function getAllPermissions(): array
    {
        $labels = config('permissions', []);

        $keys = [];
        foreach (Route::getRoutes() as $route) {
            $middleware = $route->getAction()['middleware'] ?? [];
            foreach ((array)$middleware as $m) {
                if (is_string($m) && str_starts_with($m, 'permission:')) {
                    $keys[substr($m, strlen('permission:'))] = true;
                }
            }
        }

        $keys = array_keys($keys);
        sort($keys);

        return array_map(fn($key) => [
            'key' => $key,
            'label' => $labels[$key] ?? self::generateLabel($key),
        ], $keys);
    }

    private static function generateLabel(string $key): string
    {
        $words = explode('_', $key);
        $words = array_map(fn($w) => match ($w) {
            'de', 'del', 'en', 'por', 'para', 'con', 'sin', 'y', 'a', 'e', 'o', 'u' => $w,
            default => ucfirst($w),
        }, $words);
        $words[0] = ucfirst($words[0]);
        return implode(' ', $words);
    }
}
