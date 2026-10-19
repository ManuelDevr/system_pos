<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use InvalidArgumentException;

/**
 * Generador de correlativos internos (compras, cotizaciones, notas de crédito).
 *
 * A diferencia del comprobante de venta — cuyo número lo asigna la
 * Plataforma-SUNAT — estos documentos usan una secuencia local. Para evitar
 * duplicados bajo concurrencia se bloquea la última fila dentro de una
 * transacción.
 */
class SequenceService
{
    /**
     * @param  class-string<Model>  $model  Modelo con la columna de correlativo.
     */
    public static function next(string $model, string $prefix, int $digits = 6, string $column = 'nro_comprobante'): string
    {
        if (! is_subclass_of($model, Model::class)) {
            throw new InvalidArgumentException("{$model} no es un modelo Eloquent válido.");
        }

        $last = $model::query()
            ->orderByDesc('id')
            ->lockForUpdate()
            ->value($column);

        $num = 1;
        if ($last) {
            $num = ((int) substr($last, -$digits)) + 1;
        }

        return $prefix.str_pad((string) $num, $digits, '0', STR_PAD_LEFT);
    }
}
