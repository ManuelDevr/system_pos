<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Services\ApisPeruService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index()
    {
        $clientes = Cliente::select('id', 'nombre', 'ruc_dni', 'email', 'telefono', 'direccion', 'estado')
            ->orderBy('nombre')
            ->get();
            
        return Inertia::render('Clients/Index', [
            'clientes' => $clientes
        ]);
    }

    /**
     * Búsqueda AJAX de clientes para el POS (máx 15 resultados).
     * GET /clientes/search?q=termino
     */
    public function search(Request $request)
    {
        $q = $request->get('q', '');

        $clientes = Cliente::select('id', 'nombre', 'ruc_dni', 'telefono')
            ->where('estado', 'Activo')
            ->where(function ($query) use ($q) {
                $query->where('nombre', 'ilike', "%{$q}%")
                      ->orWhere('ruc_dni', 'ilike', "%{$q}%");
            })
            ->orderBy('nombre')
            ->limit(15)
            ->get();

        return response()->json($clientes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:150',
            'ruc_dni' => 'nullable|string|max:20|unique:clientes,ruc_dni',
            'email' => 'nullable|email|max:100',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string',
        ]);

        Cliente::create($validated);

        return redirect()->back()->with('success', 'Cliente creado correctamente.');
    }

    public function update(Request $request, Cliente $cliente)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:150',
            'ruc_dni' => 'nullable|string|max:20|unique:clientes,ruc_dni,' . $cliente->id,
            'email' => 'nullable|email|max:100',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string',
            'estado' => 'required|in:Activo,Inactivo',
        ]);

        $cliente->update($validated);

        return redirect()->back()->with('success', 'Cliente actualizado correctamente.');
    }

    public function toggleStatus(Cliente $cliente)
    {
        $cliente->estado = $cliente->estado === 'Activo' ? 'Inactivo' : 'Activo';
        $cliente->save();

        return redirect()->back()->with('success', 'Estado del cliente actualizado.');
    }

    /**
     * Consulta un documento (DNI 8 o RUC 11) para autocompletar el nombre
     * en el POS. Primero busca local (solo lectura, gratis); si no existe,
     * consulta a ApisPeru. Nunca crea ni enlaza un cliente a la venta.
     *
     * GET /clientes/consulta-documento?numero=20604071115
     */
    public function consultaDocumento(Request $request, ApisPeruService $apisPeru)
    {
        $numero = preg_replace('/\D/', '', (string) $request->get('numero', ''));

        if (! in_array(strlen($numero), [8, 11])) {
            return response()->json([
                'message' => 'El documento debe tener 8 dígitos (DNI) u 11 dígitos (RUC).',
            ], 422);
        }

        $tipo = strlen($numero) === 11 ? 'RUC' : 'DNI';

        $clienteExistente = Cliente::select('id', 'nombre')
            ->where('estado', 'Activo')
            ->where('ruc_dni', $numero)
            ->first();

        if ($clienteExistente) {
            return response()->json([
                'origen' => 'local',
                'tipo' => $tipo,
                'numero' => $numero,
                'nombre' => $clienteExistente->nombre,
            ]);
        }

        $resultado = $apisPeru->consultar($numero);

        if (isset($resultado['error'])) {
            return response()->json(['message' => $resultado['error']], 422);
        }

        return response()->json([
            'origen' => 'apisperu',
            'tipo' => $resultado['tipo'],
            'numero' => $resultado['numero'],
            'nombre' => $resultado['nombre'],
        ]);
    }
}
