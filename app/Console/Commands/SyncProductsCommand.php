<?php

namespace App\Console\Commands;

use App\Models\Producto;
use App\Services\ProductSyncService;
use Illuminate\Console\Command;

class SyncProductsCommand extends Command
{
    protected $signature = 'sync:products {--chunk=50 : Cantidad de productos por lote}';

    protected $description = 'Re-despacha la sincronización de todos los productos del POS hacia la Tienda Web';

    public function handle(ProductSyncService $syncService): int
    {
        $chunk = (int) $this->option('chunk');
        $total = Producto::withTrashed()->count();

        if ($total === 0) {
            $this->info('No hay productos que sincronizar.');
            return self::SUCCESS;
        }

        $this->info("Sincronizando {$total} productos hacia la Tienda Web...");

        $progress = $this->output->createProgressBar($total);
        $progress->start();

        Producto::withTrashed()->chunkById($chunk, function ($productos) use ($syncService, $progress) {
            foreach ($productos as $producto) {
                if ($producto->trashed()) {
                    $syncService->dispatchDelete($producto->getAttributes());
                } else {
                    $syncService->dispatchSync($producto, 'update');
                }
                $progress->advance();
            }
        });

        $progress->finish();
        $this->newLine();
        $this->info("Se despacharon {$total} operaciones. Procesa la cola con: php artisan queue:work --queue=sync-queue --tries=3");

        return self::SUCCESS;
    }
}