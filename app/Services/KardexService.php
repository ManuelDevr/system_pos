<?php

namespace App\Services;

use App\Models\Kardex;
use App\Models\Producto;
use App\Models\StockSucursal;
use App\Models\Sucursal;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class KardexService
{
    /**
     * Registrar un movimiento en el Kardex y actualizar stock de forma atómica.
     *
     * Bloquea la fila del producto (lockForUpdate) y envuelve todo en una
     * transacción para evitar condiciones de carrera en actualizaciones
     * concurrentes de stock. Si el llamador ya está en una transacción, Laravel
     * anida en un savepoint (no hay problema).
     *
     * @param  float|null  $costoUnitario  Costo de la operación. En ENTRADA
     *   alimenta el costo promedio ponderado; en SALIDA, si no se indica, se usa
     *   el costo promedio actual del producto.
     * @param  int|null  $sucursalId  Sucursal que origina el movimiento. Si es
     *   null se usa la sucursal principal. `productos.stock` se mantiene como
     *   stock consolidado y `stock_sucursal` guarda la existencia por sucursal.
     */
    public static function registrarMovimiento(
        Producto $producto,
        string $tipo,
        float $cantidad,
        string $motivo,
        ?string $referenciaTipo = null,
        int|string|null $referenciaId = null,
        ?float $costoUnitario = null,
        ?int $sucursalId = null
    ): Kardex {
        $tipo = strtoupper($tipo);

        if (! in_array($tipo, ['ENTRADA', 'SALIDA'], true)) {
            throw new InvalidArgumentException("Tipo de movimiento no válido: {$tipo}");
        }

        return DB::transaction(function () use (
            $producto, $tipo, $cantidad, $motivo, $referenciaTipo, $referenciaId, $costoUnitario, $sucursalId
        ) {
            // Rebloquear el producto dentro de la transacción (withTrashed para
            // permitir devoluciones de productos eliminados lógicamente).
            $bloqueado = Producto::withTrashed()->lockForUpdate()->find($producto->id);
            if ($bloqueado) {
                $producto = $bloqueado;
            }

            $cantidad = (float) $cantidad;
            $stockAnterior = (float) $producto->stock;
            $costoPromedioAnterior = (float) ($producto->costo_promedio ?? 0);

            if ($tipo === 'ENTRADA') {
                $stockActual = $stockAnterior + $cantidad;
            } else {
                $stockActual = $stockAnterior - $cantidad;
            }

            if ($stockActual < 0) {
                throw new InvalidArgumentException("Stock insuficiente para: {$producto->nombre}");
            }

            // Costo de la operación.
            if ($costoUnitario !== null) {
                $costo = (float) $costoUnitario;
            } else {
                $costo = $costoPromedioAnterior > 0 ? $costoPromedioAnterior : (float) $producto->precio_compra;
            }

            // Actualizar costo promedio ponderado en entradas.
            if ($tipo === 'ENTRADA' && $costoUnitario !== null && $stockActual > 0) {
                $nuevoCosto = (($stockAnterior * $costoPromedioAnterior) + ($cantidad * $costo))
                    / $stockActual;
                $producto->costo_promedio = round($nuevoCosto, 4);
            }

            // Existencia por sucursal. Si la sucursal aún no tiene fila para el
            // producto se inicializa con el stock consolidado solo en la
            // sucursal principal (migración transparente de inventarios
            // previos a esta fase); las demás sucursales parten en cero.
            $sucursalId ??= Sucursal::defaultId();

            if ($sucursalId) {
                $stockSucursal = StockSucursal::where('sucursal_id', $sucursalId)
                    ->where('producto_id', $producto->id)
                    ->lockForUpdate()
                    ->first();

                if (! $stockSucursal) {
                    $stockSucursal = StockSucursal::create([
                        'sucursal_id' => $sucursalId,
                        'producto_id' => $producto->id,
                        'stock' => $sucursalId === Sucursal::defaultId() ? $stockAnterior : 0,
                    ]);
                }

                $stockSucursalAnterior = (float) $stockSucursal->stock;
                $stockSucursalActual = $tipo === 'ENTRADA'
                    ? $stockSucursalAnterior + $cantidad
                    : $stockSucursalAnterior - $cantidad;

                if ($stockSucursalActual < 0) {
                    throw new InvalidArgumentException("Stock insuficiente en la sucursal para: {$producto->nombre}");
                }

                $stockSucursal->stock = $stockSucursalActual;
                $stockSucursal->save();
            }

            $movimiento = Kardex::create([
                'producto_id' => $producto->id,
                'sucursal_id' => $sucursalId,
                'tipo_movimiento' => $tipo,
                'motivo' => $motivo,
                'cantidad' => $cantidad,
                'costo_unitario' => $costo,
                'valor_total' => round($cantidad * $costo, 2),
                'stock_anterior' => $stockAnterior,
                'stock_actual' => $stockActual,
                'referencia_tipo' => $referenciaTipo,
                'referencia_id' => $referenciaId,
                'user_id' => auth()->id() ?? 1,
            ]);

            $producto->stock = $stockActual;
            $producto->save();

            return $movimiento;
        });
    }
}
