<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\CajaController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\SucursalController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\KardexController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\CompraController;
use App\Http\Controllers\ProveedorController;
use App\Http\Controllers\NotaCreditoController;
use App\Http\Controllers\DebitNoteController;
use App\Http\Controllers\DispatchGuideController;
use App\Http\Controllers\CotizacionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PersonalController;
use App\Http\Controllers\TransferController;
use App\Http\Controllers\TiendaController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

// La tienda web vive en su propio sistema (www.cma-shop.com), que consume el
// catalogo del POS via webhooks. Lo que quedaba aqui era una copia congelada
// que ademas exigia iniciar sesion. Cualquier ruta /tienda-web/* (incluidas
// las antiguas /catalogo, /buscar y /producto/{id}) responde 301 al sitio
// oficial, asi que ningun enlace guardado queda en una pagina muerta.
Route::get('/tienda-web/{ruta?}', function () {
    return redirect()->away('https://www.cma-shop.com', 301);
})->where('ruta', '.*')->name('store.index');

Route::middleware(['auth'])->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('permission:ver_dashboard')
        ->name('dashboard');
    
    // POS / Ventas Rápidas
    Route::get('/venta-rapida', [SaleController::class, 'checkout'])
        ->middleware('permission:realizar_ventas')
        ->name('venta-rapida');

    Route::post('/ventas', [SaleController::class, 'store'])
        ->middleware('permission:realizar_ventas')
        ->name('ventas.store');

    // Historial de Ventas
    Route::get('/mis-ventas', [SaleController::class, 'index'])
        ->middleware('permission:ver_historial_ventas')
        ->name('mis-ventas');
    
    Route::get('/gestion-ventas', [SaleController::class, 'index'])
        ->middleware('permission:ver_historial_ventas')
        ->name('gestion-ventas');

    Route::patch('/ventas/{venta}/cancel', [SaleController::class, 'cancel'])
        ->middleware('permission:anular_ventas')
        ->name('ventas.cancel');

    Route::post('/ventas/{venta}/emitir', [SaleController::class, 'emitir'])
        ->middleware('permission:realizar_ventas')
        ->name('ventas.emitir');

    Route::post('/ventas/{venta}/reenviar', [SaleController::class, 'reenviar'])
        ->middleware('permission:realizar_ventas')
        ->name('ventas.reenviar');

    Route::get('/ventas/{venta}/pdf', [SaleController::class, 'pdf'])
        ->middleware('permission:realizar_ventas')
        ->name('ventas.pdf');

    // Caja y Turnos
    Route::get('/caja', [CajaController::class, 'index'])
        ->middleware('permission:abrir_caja')
        ->name('caja.index');
    Route::post('/caja/abrir', [CajaController::class, 'abrir'])
        ->middleware('permission:abrir_caja')
        ->name('caja.abrir');
    Route::post('/caja/movimiento', [CajaController::class, 'movimiento'])
        ->middleware('permission:abrir_caja')
        ->name('caja.movimiento');
    Route::post('/caja/cerrar', [CajaController::class, 'cerrar'])
        ->middleware('permission:abrir_caja')
        ->name('caja.cerrar');
    Route::get('/caja/historial', [CajaController::class, 'historial'])
        ->middleware('permission:ver_historial_ventas')
        ->name('caja.historial');

    // Guias de Remision (GRE Remitente - tipo 09)
    Route::get('/guias-remision', [DispatchGuideController::class, 'index'])
        ->middleware('permission:emitir_guia')
        ->name('guias.index');
    Route::get('/guias-remision/nueva', [DispatchGuideController::class, 'create'])
        ->middleware('permission:emitir_guia')
        ->name('guias.create');
    Route::post('/guias-remision', [DispatchGuideController::class, 'store'])
        ->middleware('permission:emitir_guia')
        ->name('guias.store');
    Route::post('/guias-remision/{guia}/estado', [DispatchGuideController::class, 'estado'])
        ->middleware('permission:emitir_guia')
        ->name('guias.estado');
    Route::get('/guias-remision/{guia}/pdf', [DispatchGuideController::class, 'pdf'])
        ->middleware('permission:emitir_guia')
        ->name('guias.pdf');

    // Kardex
    Route::get('/inventario/kardex', [KardexController::class, 'index'])
        ->middleware('permission:ver_kardex')
        ->name('kardex.index');

    // Transferencias entre sucursales
    Route::get('/transferencias', [TransferController::class, 'index'])
        ->middleware('permission:transferir_stock')
        ->name('transferencias.index');
    Route::get('/transferencias/nueva', [TransferController::class, 'create'])
        ->middleware('permission:transferir_stock')
        ->name('transferencias.create');
    Route::post('/transferencias', [TransferController::class, 'store'])
        ->middleware('permission:transferir_stock')
        ->name('transferencias.store');

    // Mantenimiento de Inventario
    Route::get('/inventario/mantenimiento', [InventoryController::class, 'maintenance'])
        ->middleware('permission:gestionar_mantenimiento')
        ->name('inventory.maintenance');

    // Ajustes de Inventario
    Route::get('/inventario/ajustes', [InventoryController::class, 'adjustments'])
        ->middleware('permission:gestionar_mantenimiento')
        ->name('inventory.adjustments');
    Route::post('/inventario/ajustes', [InventoryController::class, 'storeAdjustment'])
        ->middleware('permission:gestionar_mantenimiento')
        ->name('inventory.adjustments.store');

    // Clientes
    Route::get('/gestion-clientes', [ClientController::class, 'index'])
        ->middleware('permission:gestionar_clientes')
        ->name('gestion-clientes');
    Route::get('/clientes/search', [ClientController::class, 'search'])->middleware('permission:realizar_ventas')->name('clientes.search');
    Route::get('/clientes/consulta-documento', [ClientController::class, 'consultaDocumento'])->middleware('permission:realizar_ventas')->name('clientes.consulta-documento');
    Route::post('/clientes', [ClientController::class, 'store'])->middleware('permission:gestionar_clientes')->name('clientes.store');
    Route::put('/clientes/{cliente}', [ClientController::class, 'update'])->middleware('permission:gestionar_clientes')->name('clientes.update');
    Route::patch('/clientes/{cliente}/toggle', [ClientController::class, 'toggleStatus'])->middleware('permission:gestionar_clientes')->name('clientes.toggle');

    // --- RUTAS DE ADMINISTRACIÓN ---
    Route::middleware(['admin'])->group(function () {

        // Contabilidad y Reportes SIRE
        Route::get('/reportes/rvie', [ReportController::class, 'rvie'])->middleware('permission:ver_reporte_rvie')->name('reportes.rvie');
        Route::get('/reportes/rvie/export', [ReportController::class, 'exportRvie'])->middleware('permission:ver_reporte_rvie')->name('reportes.rvie.export');
        Route::get('/reportes/rce', [ReportController::class, 'rce'])->middleware('permission:ver_reporte_rce')->name('reportes.rce');
        Route::get('/reportes/rce/export', [ReportController::class, 'exportRce'])->middleware('permission:ver_reporte_rce')->name('reportes.rce.export');
        Route::get('/reportes/utilidad', [ReportController::class, 'utilidad'])->middleware('permission:ver_utilidad')->name('reportes.utilidad');
        Route::get('/reportes/utilidad/export', [ReportController::class, 'exportUtilidad'])->middleware('permission:ver_utilidad')->name('reportes.utilidad.export');
        
        // Proveedores
        Route::get('/proveedores', [ProveedorController::class, 'index'])->middleware('permission:gestionar_mantenimiento')->name('proveedores.index');
        Route::post('/proveedores', [ProveedorController::class, 'store'])->middleware('permission:gestionar_mantenimiento')->name('proveedores.store');
        Route::put('/proveedores/{proveedor}', [ProveedorController::class, 'update'])->middleware('permission:gestionar_mantenimiento')->name('proveedores.update');
        Route::patch('/proveedores/{proveedor}/toggle', [ProveedorController::class, 'toggleStatus'])->middleware('permission:gestionar_mantenimiento')->name('proveedores.toggle');

        // Notas de Crédito
        Route::get('/notas-credito', [NotaCreditoController::class, 'index'])->middleware('permission:ver_historial_ventas')->name('notas-credito.index');
        Route::get('/notas-credito/nueva', [NotaCreditoController::class, 'create'])->middleware('permission:anular_ventas')->name('notas-credito.create');
        Route::post('/notas-credito', [NotaCreditoController::class, 'store'])->middleware('permission:anular_ventas')->name('notas-credito.store');

        // Notas de Debito
        Route::get('/notas-debito', [DebitNoteController::class, 'index'])->middleware('permission:ver_historial_ventas')->name('notas-debito.index');
        Route::get('/notas-debito/nueva', [DebitNoteController::class, 'create'])->middleware('permission:anular_ventas')->name('notas-debito.create');
        Route::post('/notas-debito', [DebitNoteController::class, 'store'])->middleware('permission:anular_ventas')->name('notas-debito.store');
        Route::post('/notas-debito/{nota}/reenviar', [DebitNoteController::class, 'reenviar'])->middleware('permission:anular_ventas')->name('notas-debito.reenviar');
        Route::get('/notas-debito/{nota}/pdf', [DebitNoteController::class, 'pdf'])->middleware('permission:ver_historial_ventas')->name('notas-debito.pdf');

        // Cotizaciones / Proformas
        Route::get('/cotizaciones', [CotizacionController::class, 'index'])->middleware('permission:gestionar_productos')->name('cotizaciones.index');
        Route::get('/cotizaciones/nueva', [CotizacionController::class, 'create'])->middleware('permission:gestionar_productos')->name('cotizaciones.create');
        Route::post('/cotizaciones', [CotizacionController::class, 'store'])->middleware('permission:gestionar_productos')->name('cotizaciones.store');
        Route::post('/cotizaciones/{cotizacion}/convert', [CotizacionController::class, 'convert'])->middleware('permission:realizar_ventas')->name('cotizaciones.convert');

        // Compras
        Route::get('/compras', [CompraController::class, 'index'])->middleware('permission:gestionar_productos')->name('compras.index');
        Route::get('/compras/nueva', [CompraController::class, 'create'])->middleware('permission:gestionar_productos')->name('compras.create');
        Route::post('/compras', [CompraController::class, 'store'])->middleware('permission:gestionar_productos')->name('compras.store');

        // Productos e Inventario
        Route::get('/gestion-productos', [ProductController::class, 'index'])->middleware('permission:gestionar_productos')->name('gestion-productos');
        Route::post('/productos', [ProductController::class, 'store'])->middleware('permission:gestionar_productos')->name('productos.store');
        Route::put('/productos/{producto}', [ProductController::class, 'update'])->middleware('permission:gestionar_productos')->name('productos.update');
        Route::patch('/productos/{producto}/toggle', [ProductController::class, 'toggleStatus'])->middleware('permission:gestionar_productos')->name('productos.toggle');
        Route::delete('/productos/{producto}/imagen', [ProductController::class, 'destroyImage'])->middleware('permission:gestionar_productos')->name('productos.imagen.destroy');
        Route::post('/productos/{producto}/conversiones', [ProductController::class, 'storeConversion'])->middleware('permission:gestionar_productos')->name('productos.conversiones.store');
        Route::put('/conversiones/{conversion}', [ProductController::class, 'updateConversion'])->middleware('permission:gestionar_productos')->name('productos.conversiones.update');
        Route::patch('/conversiones/{conversion}/toggle', [ProductController::class, 'toggleStatusConversion'])->middleware('permission:gestionar_productos')->name('productos.conversiones.toggle');
        Route::delete('/conversiones/{conversion}', [ProductController::class, 'destroyConversion'])->middleware('permission:gestionar_productos')->name('productos.conversiones.destroy');
        Route::post('/productos/importar-excel', [ProductController::class, 'importExcel'])->middleware('permission:gestionar_productos')->name('productos.import-excel');
        Route::get('/productos/plantilla-excel', [ProductController::class, 'downloadSampleExcel'])->middleware('permission:gestionar_productos')->name('productos.sample-excel');

        // Mantenimiento
        Route::get('/marcas', [BrandController::class, 'index'])->middleware('permission:gestionar_mantenimiento')->name('marcas.index');
        Route::post('/marcas', [BrandController::class, 'store'])->middleware('permission:gestionar_mantenimiento')->name('marcas.store');
        Route::put('/marcas/{marca}', [BrandController::class, 'update'])->middleware('permission:gestionar_mantenimiento')->name('marcas.update');
        Route::patch('/marcas/{marca}/toggle', [BrandController::class, 'toggleStatus'])->middleware('permission:gestionar_mantenimiento')->name('marcas.toggle');
        Route::get('/categorias', [CategoryController::class, 'index'])->middleware('permission:gestionar_mantenimiento')->name('categorias.index');
        Route::post('/categorias', [CategoryController::class, 'store'])->middleware('permission:gestionar_mantenimiento')->name('categorias.store');
        Route::put('/categorias/{categoria}', [CategoryController::class, 'update'])->middleware('permission:gestionar_mantenimiento')->name('categorias.update');
        Route::patch('/categorias/{categoria}/toggle', [CategoryController::class, 'toggleStatus'])->middleware('permission:gestionar_mantenimiento')->name('categorias.toggle');
        Route::get('/unidades', [UnitController::class, 'index'])->middleware('permission:gestionar_mantenimiento')->name('unidades.index');
        Route::post('/unidades', [UnitController::class, 'store'])->middleware('permission:gestionar_mantenimiento')->name('unidades.store');
        Route::put('/unidades/{unidad}', [UnitController::class, 'update'])->middleware('permission:gestionar_mantenimiento')->name('unidades.update');
        Route::patch('/unidades/{unidad}/toggle', [UnitController::class, 'toggleStatus'])->middleware('permission:gestionar_mantenimiento')->name('unidades.toggle');

        // Grupo de Personal
        Route::get('/grupo-personal', [PersonalController::class, 'grupos'])->middleware('permission:gestionar_usuarios')->name('grupo-personal.index');
        Route::post('/grupos', [PersonalController::class, 'store'])->middleware('permission:gestionar_usuarios')->name('grupos.store');
        Route::put('/grupos/{grupo}', [PersonalController::class, 'update'])->middleware('permission:gestionar_usuarios')->name('grupos.update');
        Route::patch('/grupos/{grupo}/toggle', [PersonalController::class, 'toggleStatus'])->middleware('permission:gestionar_usuarios')->name('grupos.toggle');

        // Usuarios
        Route::get('/gestion-usuarios', [UserController::class, 'index'])->middleware('permission:gestionar_usuarios')->name('gestion-usuarios');
        Route::post('/usuarios', [UserController::class, 'store'])->middleware('permission:gestionar_usuarios')->name('usuarios.store');
        Route::put('/usuarios/{user}', [UserController::class, 'update'])->middleware('permission:gestionar_usuarios')->name('usuarios.update');
        Route::patch('/usuarios/{user}/toggle', [UserController::class, 'toggleStatus'])->middleware('permission:gestionar_usuarios')->name('usuarios.toggle');
        
        // Configuración y Privilegios
        Route::get('/configuracion', [SettingController::class, 'index'])->middleware('permission:configuracion_sistema')->name('configuracion');
        Route::post('/configuracion', [SettingController::class, 'update'])->middleware('permission:configuracion_sistema')->name('configuracion.update');
        Route::get('/sucursales', [SucursalController::class, 'index'])->middleware('permission:gestionar_sucursales')->name('sucursales.index');
        Route::post('/sucursales', [SucursalController::class, 'store'])->middleware('permission:gestionar_sucursales')->name('sucursales.store');
        Route::put('/sucursales/{sucursal}', [SucursalController::class, 'update'])->middleware('permission:gestionar_sucursales')->name('sucursales.update');
        Route::patch('/sucursales/{sucursal}/toggle', [SucursalController::class, 'toggle'])->middleware('permission:gestionar_sucursales')->name('sucursales.toggle');
        Route::delete('/sucursales/{sucursal}', [SucursalController::class, 'destroy'])->middleware('permission:gestionar_sucursales')->name('sucursales.destroy');
        
        Route::get('/configuracion/privilegios', [PermissionController::class, 'index'])->middleware('permission:configurar_privilegios')->name('privilegios.index');
        Route::post('/configuracion/privilegios', [PermissionController::class, 'update'])->middleware('permission:configurar_privilegios')->name('privilegios.update');

        // Gestión de la Tienda Web
        Route::get('/tienda', [TiendaController::class, 'index'])->middleware('permission:gestionar_tienda')->name('tienda.index');
        Route::put('/tienda/productos/{producto}', [TiendaController::class, 'updateProducto'])->middleware('permission:gestionar_tienda')->name('tienda.productos.update');
        Route::post('/tienda/productos/bulk', [TiendaController::class, 'bulkProductos'])->middleware('permission:gestionar_tienda')->name('tienda.productos.bulk');
        Route::put('/tienda/categorias/{categoria}', [TiendaController::class, 'updateCategoria'])->middleware('permission:gestionar_tienda')->name('tienda.categorias.update');
        Route::post('/tienda/sync/productos', [TiendaController::class, 'syncProducts'])->middleware('permission:gestionar_tienda')->name('tienda.sync.productos');
        Route::post('/tienda/sync/categorias', [TiendaController::class, 'syncCategories'])->middleware('permission:gestionar_tienda')->name('tienda.sync.categorias');
        Route::post('/tienda/test-connection', [TiendaController::class, 'testConnection'])->middleware('permission:gestionar_tienda')->name('tienda.test-connection');
        Route::post('/tienda/reintentar', [TiendaController::class, 'retryFailed'])->middleware('permission:gestionar_tienda')->name('tienda.reintentar');
    });

    // Perfil
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');

});

require __DIR__.'/auth.php';
