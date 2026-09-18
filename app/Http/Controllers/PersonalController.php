<?php

namespace App\Http\Controllers;

use App\Models\Grupo;
use App\Models\PermisoRol;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PersonalController extends Controller
{
    public function grupos()
    {
        $grupos = Grupo::orderBy('codigo')->get()->map(function ($grupo) {
            return [
                'id' => $grupo->id,
                'codigo' => $grupo->codigo,
                'nombre' => $grupo->nombre,
                'descripcion' => $grupo->descripcion,
                'estado' => $grupo->estado,
                'total_usuarios' => User::where('rol', $grupo->nombre)->count(),
                'permisos_otorgados' => PermisoRol::where('rol', $grupo->nombre)->where('permitido', true)->count(),
                'permisos_total' => PermisoRol::where('rol', $grupo->nombre)->count(),
            ];
        });

        return Inertia::render('Personal/Grupo', [
            'grupos' => $grupos,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'codigo' => 'required|string|max:20|unique:grupos,codigo',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string|max:255',
        ]);

        Grupo::create([
            'codigo' => $validated['codigo'],
            'nombre' => $validated['nombre'],
            'descripcion' => $validated['descripcion'] ?? null,
            'estado' => 'Activo',
        ]);

        return redirect()->back()->with('success', 'Grupo creado.');
    }

    public function update(Request $request, Grupo $grupo)
    {
        $validated = $request->validate([
            'codigo' => 'required|string|max:20|unique:grupos,codigo,' . $grupo->id,
            'descripcion' => 'nullable|string|max:255',
        ]);

        $grupo->update($validated);

        return redirect()->back()->with('success', 'Grupo actualizado.');
    }

    public function toggleStatus(Grupo $grupo)
    {
        $grupo->estado = $grupo->estado === 'Activo' ? 'Inactivo' : 'Activo';
        $grupo->save();

        return redirect()->back()->with('success', 'Estado del grupo actualizado.');
    }
}