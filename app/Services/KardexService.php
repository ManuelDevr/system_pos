<?php

namespace App\Services;

use App\Models\Kardex;
use App\Models\Producto;
use Illuminate\Support\Facades\DB;

class KardexService
{
    /**
     * Registrar un movimiento en el Kardex y actualizar stock.
     */
    public static function registrarMovimiento(Producto $producto, $tipo, $cantidad, $motivo, $referenciaTipo = null, $referenciaId = null)
    {
        $stockAnterior = $producto->stock;
        
        if ($tipo === 'ENTRADA') {
            $stockActual = $stockAnterior + $cantidad;
        } else {
            $stockActual = $stockAnterior - $cantidad;
        }

        // Crear registro en Kardex
        $movimiento = Kardex::create([
            'producto_id' => $producto->id,
            'tipo_movimiento' => $tipo,
            'motivo' => $motivo,
            'cantidad' => $cantidad,
            'stock_anterior' => $stockAnterior,
            'stock_actual' => $stockActual,
            'referencia_tipo' => $referenciaTipo,
            'referencia_id' => $referenciaId,
            'user_id' => auth()->id() ?? 1, // Fallback a admin si es seeder
        ]);

        // Actualizar el stock del producto
        $producto->stock = $stockActual;
        $producto->save();

        return $movimiento;
    }
}
