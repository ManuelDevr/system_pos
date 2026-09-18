<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        return Inertia::render('Users/Index', [
            'usuarios' => User::orderBy('name')->get(),
            'roles' => \App\Models\Grupo::where('estado', 'Activo')->orderBy('nombre')->pluck('nombre')
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'telefono' => $request->telefono,
            'rol' => $request->rol,
            'estado' => 'Activo',
        ]);

        return redirect()->back()->with('success', 'Usuario creado correctamente.');
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $user->update($request->validated());

        return redirect()->back()->with('success', 'Usuario actualizado.');
    }

    public function toggleStatus(User $user)
    {
        // Solo administradores pueden cambiar el estado
        if (auth()->user()->rol !== 'Administrador') {
            abort(403);
        }

        if ($user->id === auth()->id()) {
            return redirect()->back()->withErrors(['error' => 'No puedes desactivarte a ti mismo.']);
        }

        $user->estado = $user->estado === 'Activo' ? 'Inactivo' : 'Activo';
        $user->save();

        return redirect()->back()->with('success', 'Estado del usuario actualizado.');
    }
}
