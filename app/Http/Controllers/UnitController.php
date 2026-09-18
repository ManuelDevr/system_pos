<?php

namespace App\Http\Controllers;

use App\Models\Unidad;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UnitController extends Controller
{
    public function index()
    {
        return Inertia::render('Unidades/Index', [
            'unidades' => Unidad::orderBy('nombre')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:unidades,nombre',
            'abreviatura' => 'required|string|max:10|unique:unidades,abreviatura',
        ]);

        Unidad::create($validated);

        return redirect()->back()->with('success', 'Unidad de medida creada.');
    }

    public function update(Request $request, Unidad $unidad)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:unidades,nombre,' . $unidad->id,
            'abreviatura' => 'required|string|max:10|unique:unidades,abreviatura,' . $unidad->id,
            'estado' => 'required|in:Activo,Inactivo',
        ]);

        $unidad->update($validated);

        return redirect()->back()->with('success', 'Unidad actualizada.');
    }

    public function toggleStatus(Unidad $unidad)
    {
        $unidad->estado = $unidad->estado === 'Activo' ? 'Inactivo' : 'Activo';
        $unidad->save();

        return redirect()->back()->with('success', 'Estado de la unidad actualizado.');
    }
}
