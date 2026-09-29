<?php

namespace App\Providers;

use App\Rules\PasswordPolicy;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Política de contraseña del sistema (mínimo 8, mayúscula, minúscula,
        // número y símbolo) como regla por defecto: se aplica sola en todo
        // formulario que use Password::defaults().
        Password::defaults(fn () => PasswordPolicy::rule());

        Vite::prefetch(concurrency: 3);
    }
}
