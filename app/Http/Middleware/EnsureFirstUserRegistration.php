<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Regula el acceso al registro público según el estado de la base de datos:
 *
 * · Sin usuarios: /login redirige a /register para obligar a crear el primer
 *   administrador (no tiene sentido iniciar sesión si no hay ninguna cuenta).
 * · Con usuarios: /register responde 404. El registro queda cerrado y las
 *   cuentas nuevas las crea el Administrador desde /gestion-usuarios.
 */
class EnsureFirstUserRegistration
{
    public function handle(Request $request, Closure $next): Response
    {
        $hayUsuarios = User::query()->exists();

        if ($request->is('register') && $hayUsuarios) {
            abort(404);
        }

        if ($request->is('login') && ! $hayUsuarios) {
            return redirect('/register');
        }

        return $next($request);
    }
}
