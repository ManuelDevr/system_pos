<?php

namespace App\Http\Controllers;

use App\Models\Venta;
use App\Models\DetalleVenta;
use App\Models\Producto;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $today = Carbon::today();

        // --- GANANCIA NETA ESTIMADA (hoy) ---
        $gananciaNeta = (float) DetalleVenta::whereHas('venta', function ($q) use ($today, $user) {
            $q->whereDate('created_at', $today)->where('estado', 'Pagado');
            if ($user->rol !== 'Administrador') $q->where('user_id', $user->id);
        })->join('productos', 'detalles_venta.producto_id', '=', 'productos.id')
            ->selectRaw('SUM(detalles_venta.cantidad * (detalles_venta.precio_unitario - COALESCE(productos.precio_compra, 0))) as ganancia')
            ->value('ganancia') ?? 0;

        // --- ALERTAS CRÍTICAS ---
        $productosCriticos = Producto::where('estado', 'Activo')
            ->whereColumn('stock', '<=', 'stock_minimo')
            ->count();

        $comprobantesPendientes = Venta::where('estado', 'Pagado')
            ->where(function ($q) {
                $q->whereNull('sunat_envio')->orWhere('sunat_envio', false);
            })
            ->when($user->rol !== 'Administrador', fn($q) => $q->where('user_id', $user->id))
            ->count();

        // --- MÉTODOS DE PAGO ---
        $metodosPago = Venta::selectRaw('metodo_pago, COUNT(*) as total')
            ->where('estado', 'Pagado')
            ->when($user->rol !== 'Administrador', fn($q) => $q->where('user_id', $user->id))
            ->groupBy('metodo_pago')
            ->orderByDesc('total')
            ->get()
            ->map(fn($v) => ['name' => $v->metodo_pago, 'value' => (int) $v->total]);

        // --- TOP 5 PRODUCTOS MÁS VENDIDOS ---
        $topProductos = DetalleVenta::selectRaw('producto_id, SUM(cantidad) as total_vendido')
            ->whereHas('venta', function ($q) use ($user) {
                $q->where('estado', 'Pagado');
                if ($user->rol !== 'Administrador') $q->where('user_id', $user->id);
            })
            ->groupBy('producto_id')
            ->orderByDesc('total_vendido')
            ->limit(5)
            ->with('producto:id,nombre')
            ->get()
            ->map(fn($d) => [
                'nombre' => $d->producto?->nombre ?? 'Eliminado',
                'cantidad' => (int) $d->total_vendido,
            ]);

        // --- VENTAS DEL DÍA / SEMANA ---
        $baseVentas = Venta::whereDate('created_at', $today)->where('estado', 'Pagado');
        if ($user->rol !== 'Administrador') $baseVentas->where('user_id', $user->id);

        $ventasDelDia = (float) $baseVentas->sum('total');
        $numeroDeVentas = $baseVentas->count();

        $productosVendidos = (int) DetalleVenta::whereHas('venta', function ($q) use ($today, $user) {
            $q->whereDate('created_at', $today)->where('estado', 'Pagado');
            if ($user->rol !== 'Administrador') $q->where('user_id', $user->id);
        })->sum('cantidad');

        $desde = Carbon::today()->subDays(6)->startOfDay();
        $ventasQuery = Venta::selectRaw('DATE(created_at) as dia, SUM(total) as total')
            ->where('estado', 'Pagado')
            ->whereBetween('created_at', [$desde, Carbon::now()]);
        if ($user->rol !== 'Administrador') $ventasQuery->where('user_id', $user->id);

        $ventasAgrupadas = $ventasQuery->groupBy('dia')->pluck('total', 'dia');

        $ventasSemanales = [];
        for ($i = 6; $i >= 0; $i--) {
            $fecha = Carbon::today()->subDays($i)->toDateString();
            $ventasSemanales[] = [
                'dia' => $fecha,
                'total' => (float) ($ventasAgrupadas[$fecha] ?? 0),
            ];
        }

        // --- VENTAS RECIENTES ---
        $ventasRecientes = Venta::where('estado', 'Pagado')
            ->when($user->rol !== 'Administrador', fn($q) => $q->where('user_id', $user->id))
            ->with('cliente:id,nombre')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn($v) => [
                'nro_comprobante' => $v->nro_comprobante,
                'codigo' => optional($v->cliente)->nombre ?? 'General',
                'cliente' => optional($v->cliente)->nombre ?? 'General',
                'total' => (float) $v->total,
                'fecha' => $v->created_at->toDateString(),
                'hora' => $v->created_at->format('H:i'),
                'estado' => $v->estado,
            ]);

        // --- TOP 5 CLIENTES ---
        $topClientes = Venta::selectRaw('cliente_id, COUNT(*) as compras, SUM(total) as total')
            ->where('estado', 'Pagado')
            ->whereNotNull('cliente_id')
            ->when($user->rol !== 'Administrador', fn($q) => $q->where('user_id', $user->id))
            ->groupBy('cliente_id')
            ->orderByDesc('total')
            ->limit(5)
            ->with('cliente:id,nombre')
            ->get()
            ->map(fn($v) => [
                'nombre' => optional($v->cliente)->nombre ?? 'General',
                'compras' => (int) $v->compras,
                'total' => (float) $v->total,
            ]);

        // --- PRODUCTOS CON STOCK CRÍTICO ---
        $productosStockCritico = Producto::where('estado', 'Activo')
            ->whereColumn('stock', '<=', 'stock_minimo')
            ->orderBy('stock')
            ->limit(10)
            ->get(['id', 'nombre', 'sku', 'stock', 'stock_minimo'])
            ->map(fn($p) => [
                'nombre' => $p->nombre,
                'sku' => $p->sku,
                'stock' => (int) $p->stock,
                'stock_minimo' => (int) $p->stock_minimo,
            ]);

        $data = [
            'stats' => [
                'rol' => $user->rol,
                'ventasDelDia' => $ventasDelDia,
                'numeroDeVentas' => $numeroDeVentas,
                'productosVendidos' => $productosVendidos,
                'ventasSemanales' => $ventasSemanales,
                'gananciaNeta' => $gananciaNeta,
                'alertas' => [
                    'stockCritico' => $productosCriticos,
                    'comprobantesPendientes' => $comprobantesPendientes,
                ],
                'metodosPago' => $metodosPago,
                'topProductos' => $topProductos,
                'ventasRecientes' => $ventasRecientes,
                'topClientes' => $topClientes,
                'productosStockCritico' => $productosStockCritico,
            ],
        ];

        return Inertia::render('Dashboard', $data);
    }
}
