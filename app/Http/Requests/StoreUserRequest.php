<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Solo administradores pueden crear usuarios
        return $this->user() && $this->user()->rol === 'Administrador';
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'telefono' => 'nullable|string|max:20',
            'rol' => 'required|exists:grupos,nombre',
        ];
    }
}
