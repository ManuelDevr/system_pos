<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Solo administradores pueden actualizar usuarios
        return $this->user() && $this->user()->rol === 'Administrador';
    }

    public function rules(): array
    {
        $userId = $this->route('user')->id ?? $this->route('user');

        return [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $userId,
            'telefono' => 'nullable|string|max:20',
            'rol' => 'required|exists:grupos,nombre',
            'estado' => 'required|in:Activo,Inactivo',
        ];
    }
}
