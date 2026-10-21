<?php

namespace App\Console\Commands;

use App\Models\Categoria;
use App\Services\CategorySyncService;
use Illuminate\Console\Command;

class SyncCategoriesCommand extends Command
{
    protected $signature = 'sync:categories {--chunk=50 : Cantidad de categorías por lote}';

    protected $description = 'Re-despacha la sincronización de todas las categorías del POS hacia la Tienda Web';

    public function handle(CategorySyncService $syncService): int
    {
        $chunk = (int) $this->option('chunk');
        $total = Categoria::count();

        if ($total === 0) {
            $this->info('No hay categorías que sincronizar.');
            return self::SUCCESS;
        }

        $this->info("Sincronizando {$total} categorías hacia la Tienda Web...");

        $progress = $this->output->createProgressBar($total);
        $progress->start();

        Categoria::chunkById($chunk, function ($categorias) use ($syncService, $progress) {
            foreach ($categorias as $categoria) {
                $syncService->dispatchSync($categoria, 'update');
                $progress->advance();
            }
        });

        $progress->finish();
        $this->newLine();
        $this->info("Se despacharon {$total} operaciones. Procesa la cola con: php artisan queue:work --queue=sync-queue --tries=3");

        return self::SUCCESS;
    }
}
