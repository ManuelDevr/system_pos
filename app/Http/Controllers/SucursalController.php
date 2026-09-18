<?php

namespace App\Http\Controllers;

use App\Models\Sucursal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SucursalController extends Controller
{
    public function index()
    {
        return Inertia::render('Sucursales/Index', [
            'sucursales' => Sucursal::orderBy('principal', 'desc')->orderBy('nombre')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:150',
            'direccion' => 'nullable|string',
            'telefono' => 'nullable|string|max:20',
            'ruc' => 'nullable|string|max:11',
            'serie_factura' => 'nullable|string|max:10',
            'serie_boleta' => 'nullable|string|max:10',
            'principal' => 'boolean',
        ]);

        if ($validated['principal'] ?? false) {
            Sucursal::where('principal', true)->update(['principal' => false]);
        }

        Sucursal::create($validated);

        return redirect()->route('sucursales.index')->with('success', 'Sucursal agregada correctamente.');
    }

    public function update(Request $request, Sucursal $sucursal)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:150',
            'direccion' => 'nullable|string',
            'telefono' => 'nullable|string|max:20',
            'ruc' => 'nullable|string|max:11',
            'serie_factura' => 'nullable|string|max:10',
            'serie_boleta' => 'nullable|string|max:10',
            'principal' => 'boolean',
            'activo' => 'boolean',
        ]);

        if ($validated['principal'] ?? false) {
            Sucursal::where('principal', true)->where('id', '!=', $sucursal->id)->update(['principal' => false]);
        }

        $sucursal->update($validated);

        return redirect()->route('sucursales.index')->with('success', 'Sucursal actualizada correctamente.');
    }

    public function toggle(Sucursal $sucursal)
    {
        $sucursal->update(['activo' => !$sucursal->activo]);

        return redirect()->route('sucursales.index')->with('success', 'Estado de sucursal actualizado.');
    }

    public function destroy(Sucursal $sucursal)
    {
        $sucursal->delete();

        return redirect()->route('sucursales.index')->with('success', 'Sucursal eliminada correctamente.');
    }
}
