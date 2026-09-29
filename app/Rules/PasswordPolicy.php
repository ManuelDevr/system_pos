<?php

namespace App\Rules;

use Illuminate\Validation\Rules\Password;

/**
 * Política de contraseña única del sistema: mínimo 8 caracteres, con al menos
 * una mayúscula, una minúscula, un número y un carácter especial.
 *
 * Se registra como regla por defecto de Laravel (AppServiceProvider), por lo
 * que `Password::defaults()` y `Password::min(...)` heredan esta política en
 * todo el sistema: registro inicial, alta de usuarios y cambio de contraseña.
 */
class PasswordPolicy
{
    public static function rule(): Password
    {
        return Password::min(8)
            ->mixedCase()  // al menos una mayúscula y una minúscula
            ->numbers()    // al menos un número
            ->symbols();   // al menos un carácter especial
    }
}
