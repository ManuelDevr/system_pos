<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;
use App\Models\PermisoRol;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        $allowedPermissions = Cache::remember(
            "role_permissions_{$user->rol}",
            600,
            fn () => PermisoRol::where('rol', $user->rol)
                ->where('permitido', true)
                ->pluck('permiso')
                ->toArray()
        );

        $isAllowed = in_array($permission, $allowedPermissions);

        if (!$isAllowed) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'No tienes permiso para realizar esta acción.'], 403);
            }

            abort(403, "Acceso denegado: No tienes el privilegio para realizar esta acción ($permission).");
        }

        return $next($request);
    }
}
