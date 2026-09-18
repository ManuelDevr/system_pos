// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    // Directorio de tests
    testDir: './tests/playwright',
    // Archivos de test
    testMatch: '**/*.spec.{js,mjs}',

    // Tiempo máximo por test
    timeout: 60_000,

    // Opciones globales de expect
    expect: { timeout: 10_000 },

    // Número de workers (1 para no conflictos de sesión)
    workers: 1,
    fullyParallel: false,

    // Reporter: mostrar en terminal + HTML
    reporter: [
        ['list'],
        ['html', { outputFolder: 'tests/playwright/reports', open: 'never' }],
    ],

    use: {
        baseURL: 'http://127.0.0.1:8000',
        // Capturar screenshots solo en fallo
        screenshot: 'only-on-failure',
        // Capturar video en fallo
        video: 'retain-on-failure',
        // Traza en fallo
        trace: 'retain-on-failure',
        // Viewport estándar escritorio
        viewport: { width: 1366, height: 768 },
        // Locale español Perú
        locale: 'es-PE',
        timezoneId: 'America/Lima',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
