<?php

namespace App\Http\Requests;

use App\Models\Configuracion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Cache;

class StoreSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Obtener métodos de pago desde la configuración (cacheada)
        $metodosPermitidos = Cache::remember('app_config_metodos_pago', 3600, function () {
            $config = Configuracion::first();
            return $config?->metodos_pago ?? ['Efectivo', 'Transferencia', 'Yape', 'Plin', 'BCP'];
        });

        return [
            'total'                    => 'required|numeric|min:0',
            'pagado_con'               => 'nullable|numeric|min:0',
            'vuelto'                   => 'nullable|numeric|min:0',
            'descuento'                => 'nullable|numeric|min:0',
            'metodo_pago'              => 'required|in:' . implode(',', $metodosPermitidos),
            'cliente_id'               => 'nullable|exists:clientes,id',
            'items'                    => 'required|array|min:1',
            'items.*.producto_id'      => 'required|exists:productos,id',
            'items.*.cantidad'         => 'required|integer|min:1',
            'items.*.unidad_id'        => 'nullable|exists:unidades,id',
            'items.*.precio_unitario'  => 'required|numeric',
            'items.*.descuento'        => 'nullable|numeric|min:0',
        ];
    }
}
