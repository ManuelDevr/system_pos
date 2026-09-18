<?php

namespace App\Http\Controllers;

use App\Models\Configuracion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        $config = Configuracion::first();
        if ($config && $config->sol_clave) {
            try {
                $config->sol_clave = Crypt::decryptString($config->sol_clave);
            } catch (\Exception $e) {
                $config->sol_clave = '';
            }
        }

        return Inertia::render('Settings/Index', [
            'configuracion' => $config,
        ]);
    }

    public function update(Request $request)
    {
        $config = Configuracion::first() ?? new Configuracion();

        $validated = $request->validate([
            'nombre_empresa' => 'required|string|max:150',
            'ruc'            => 'nullable|string|max:20',
            'direccion'      => 'nullable|string',
            'telefono'       => 'nullable|string|max:20',
            'correo'         => 'nullable|string|max:255',
            'logo'           => 'nullable|image|max:1024',
            'metodos_pago'   => 'nullable|array|min:1',
            'metodos_pago.*' => 'string|max:50',
            'sol_usuario'    => 'nullable|string|max:100',
            'sol_clave'      => 'nullable|string',
            'entorno'        => 'nullable|string|in:Beta,Produccion',
            'serie_factura'  => 'nullable|string|max:10',
            'serie_boleta'   => 'nullable|string|max:10',
            'serie_nota_credito' => 'nullable|string|max:10',
            'serie_nota_debito'  => 'nullable|string|max:10',
            'igv'               => 'nullable|numeric|min:0|max:100',
        ]);

        if ($request->hasFile('logo')) {
            if ($config->logo_empresa && is_string($config->logo_empresa)) {
                Storage::disk('public')->delete($config->logo_empresa);
            }
            $path = $request->file('logo')->store('config', 'public');
            $validated['logo_empresa'] = $path;
        }

        if ($request->has('certificado_digital_remove') && $request->certificado_digital_remove) {
            if ($config->certificado_digital && is_string($config->certificado_digital)) {
                Storage::disk('public')->delete($config->certificado_digital);
            }
            $validated['certificado_digital'] = null;
        }

        if ($request->hasFile('certificado_digital')) {
            if ($config->certificado_digital && is_string($config->certificado_digital)) {
                Storage::disk('public')->delete($config->certificado_digital);
            }
            $path = $request->file('certificado_digital')->store('certificados', 'public');
            $validated['certificado_digital'] = $path;
        }

        if (!empty($validated['sol_clave'])) {
            $validated['sol_clave'] = Crypt::encryptString($validated['sol_clave']);
        } else {
            unset($validated['sol_clave']);
        }

        $config->fill($validated);
        $config->save();

        Cache::forget('app_config');
        Cache::forget('app_config_metodos_pago');

        return redirect()->back()->with('success', 'Configuración actualizada correctamente.');
    }

}
