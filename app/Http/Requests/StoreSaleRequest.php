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
            'total' => 'required|numeric|min:0',
            'pagado_con' => 'nullable|numeric|min:0',
            'vuelto' => 'nullable|numeric|min:0',
            'descuento' => 'nullable|numeric|min:0',
            'metodo_pago' => 'required|in:'.implode(',', $metodosPermitidos),
            'tipo_comprobante' => 'nullable|in:Boleta,Factura',
            'cliente_id' => 'nullable|exists:clientes,id',
            'cliente_tipo_doc' => 'nullable|in:DNI,RUC',
            'cliente_documento' => 'nullable|string|max:20',
            'cliente_nombre' => 'nullable|string|max:255',
            'items' => 'required|array|min:1',
            'items.*.producto_id' => 'required|exists:productos,id',
            'items.*.cantidad' => 'required|numeric|min:0.0001',
            'items.*.unidad_id' => 'nullable|exists:unidades,id',
            'items.*.conversion_id' => 'nullable|exists:conversiones_unidad_producto,id',
            'items.*.precio_unitario' => 'required|numeric|min:0',
            'items.*.descuento' => 'nullable|numeric|min:0',
        ];
    }
}
