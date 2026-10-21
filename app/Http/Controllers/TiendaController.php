<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use App\Models\Producto;
use App\Models\SyncLog;
use App\Services\CategorySyncService;
use App\Services\ProductSyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class TiendaController extends Controller
{
    public function __construct(
        protected ProductSyncService $productSyncService,
        protected CategorySyncService $categorySyncService,
    ) {}

    public function index(Request $request)
    {
        $filtro = $request->get('filtro', 'todos');

        $productos = Producto::query()
            ->with(['categoria:id,nombre,visible_tienda', 'marca:id,nombre'])
            ->when($filtro === 'publicados', fn ($q) => $q->where('visible_tienda', true)->where('estado', 'Activo'))
            ->when($filtro === 'ocultos', fn ($q) => $q->where('visible_tienda', false))
            ->when($filtro === 'destacados', fn ($q) => $q->where('destacado_tienda', true))
            ->orderBy('nombre')
            ->get(['id', 'sku', 'nombre', 'precio_venta', 'stock', 'estado', 'categoria_id', 'marca_id', 'visible_tienda', 'destacado_tienda', 'orden_tienda', 'imagen_url']);

        $categorias = Categoria::query()
            ->with('children:id,nombre,parent_id,visible_tienda,orden_tienda')
            ->whereNull('parent_id')
            ->orderByRaw('COALESCE(orden_tienda, 999999)')
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'estado', 'parent_id', 'visible_tienda', 'orden_tienda']);

        $resumen = [
            'total_productos' => Producto::count(),
            'publicados' => Producto::where('visible_tienda', true)->where('estado', 'Activo')->count(),
            'ocultos' => Producto::where('visible_tienda', false)->count(),
            'destacados' => Producto::where('destacado_tienda', true)->count(),
            'agotados' => Producto::where('visible_tienda', true)->where('estado', 'Activo')->where('stock', '<=', 0)->count(),
            'categorias_visibles' => Categoria::where('visible_tienda', true)->where('estado', 'Activo')->count(),
            'categorias_ocultas' => Categoria::where('visible_tienda', false)->count(),
        ];

        $logs = SyncLog::orderByDesc('created_at')->limit(30)->get();
        $ultimaSync = SyncLog::where('estado', 'ok')->orderByDesc('created_at')->first();
        $errores = SyncLog::where('estado', 'error')->orderByDesc('created_at')->limit(10)->get();

        return Inertia::render('Tienda/Index', [
            'productos' => $productos,
            'categorias' => $categorias,
            'resumen' => $resumen,
            'logs' => $logs,
            'errores' => $errores,
            'filtro' => $filtro,
            'ultimaSync' => $ultimaSync,
            'syncConfig' => [
                'habilitado' => (bool) config('sync.enabled'),
                'url_configurada' => ! empty(config('sync.webhook_url')),
                'token_configurado' => ! empty(config('sync.webhook_token')),
                'secreto_configurado' => ! empty(config('sync.webhook_secret')),
            ],
        ]);
    }

    public function updateProducto(Request $request, Producto $producto)
    {
        $validated = $request->validate([
            'visible_tienda' => 'nullable|boolean',
            'destacado_tienda' => 'nullable|boolean',
            'orden_tienda' => 'nullable|integer|min:0',
        ]);

        $producto->update($validated);

        return redirect()->back()->with('success', 'Producto actualizado en la tienda.');
    }

    public function bulkProductos(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:productos,id',
            'accion' => 'required|in:publicar,ocultar,destacar,quitar_destacado',
        ]);

        $data = match ($validated['accion']) {
            'publicar' => ['visible_tienda' => true],
            'ocultar' => ['visible_tienda' => false],
            'destacar' => ['destacado_tienda' => true],
            'quitar_destacado' => ['destacado_tienda' => false],
        };

        Producto::whereIn('id', $validated['ids'])->get()->each->update($data);

        return redirect()->back()->with('success', 'Productos actualizados.');
    }

    public function updateCategoria(Request $request, Categoria $categoria)
    {
        $validated = $request->validate([
            'visible_tienda' => 'nullable|boolean',
            'orden_tienda' => 'nullable|integer|min:0',
        ]);

        $categoria->update($validated);

        return redirect()->back()->with('success', 'Categoría actualizada en la tienda.');
    }

    public function syncProducts()
    {
        Artisan::queue('sync:products');

        return redirect()->back()->with('success', 'Sincronización de productos encolada.');
    }

    public function syncCategories()
    {
        Artisan::queue('sync:categories');

        return redirect()->back()->with('success', 'Sincronización de categorías encolada.');
    }

    public function testConnection()
    {
        $url = config('sync.webhook_url');

        if (empty($url)) {
            return redirect()->back()->with('error', 'SYNC_WEBHOOK_URL no configurado.');
        }

        $healthUrl = str_replace('/sync/product', '/sync/health', $url);

        try {
            $response = Http::timeout(10)
                ->withToken(config('sync.webhook_token'))
                ->acceptJson()
                ->get($healthUrl);

            if ($response->successful()) {
                return redirect()->back()->with('success', 'Conexión con la tienda OK (HTTP ' . $response->status() . ').');
            }

            return redirect()->back()->with('error', 'La tienda respondió HTTP ' . $response->status() . '.');
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'No se pudo conectar con la tienda: ' . $e->getMessage());
        }
    }

    public function retryFailed()
    {
        Artisan::queue('sync:products');
        Artisan::queue('sync:categories');

        return redirect()->back()->with('success', 'Reintento de sincronización encolado.');
    }
}
