<?php

namespace App\Http\Controllers;

use App\Models\Marca;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BrandController extends Controller
{
    public function index()
    {
        return Inertia::render('Marcas/Index', [
            'marcas' => Marca::orderBy('nombre')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:marcas,nombre',
        ]);

        Marca::create($validated);

        return redirect()->back()->with('success', 'Marca creada correctamente.');
    }

    public function update(Request $request, Marca $marca)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:marcas,nombre,' . $marca->id,
            'estado' => 'required|in:Activo,Inactivo',
        ]);

        $marca->update($validated);

        return redirect()->back()->with('success', 'Marca actualizada.');
    }

    public function toggleStatus(Marca $marca)
    {
        $marca->estado = $marca->estado === 'Activo' ? 'Inactivo' : 'Activo';
        $marca->save();

        return redirect()->back()->with('success', 'Estado de la marca actualizado.');
    }
}
