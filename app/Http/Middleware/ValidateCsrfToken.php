<?php

namespace App\Http\Middleware;

use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken as Middleware;
use Symfony\Component\HttpFoundation\Cookie;

class ValidateCsrfToken extends Middleware
{
    /**
     * Nombre único de la cookie XSRF de esta aplicación
     * (evita colisiones de `XSRF-TOKEN` entre apps en el mismo host).
     */
    public const COOKIE_NAME = 'XSRF-TOKEN-POS';

    /**
     * Create a new CSRF token cookie with an app-specific name.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  array  $config
     * @return \Symfony\Component\HttpFoundation\Cookie
     */
    protected function newCookie($request, $config)
    {
        return new Cookie(
            static::COOKIE_NAME,
            $request->session()->token(),
            $this->availableAt(60 * $config['lifetime']),
            $config['path'],
            $config['domain'],
            $config['secure'],
            false,
            false,
            $config['same_site'] ?? null,
            $config['partitioned'] ?? false
        );
    }

    /**
     * Determine if the cookie contents should be serialized.
     */
    public static function serialized()
    {
        return EncryptCookies::serialized(static::COOKIE_NAME);
    }
}