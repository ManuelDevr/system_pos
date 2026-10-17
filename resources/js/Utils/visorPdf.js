/**
 * Visor de PDF modal reutilizable con soporte nativo de <dialog>,
 * selectores de formato dinámicos, reintentos automáticos y revocación de Blob URLs.
 *
 * @param {Object} options
 * @param {string} options.titulo Título principal del comprobante.
 * @param {string} [options.subtitulo] Subtítulo o información contextual.
 * @param {Array<[string, string]>} [options.formatos] Formatos disponibles: [[valor, texto], ...]
 * @param {string} [options.formato] Formato inicial preferido.
 * @param {function(string): (Promise<Blob>|Blob)} options.cargar Función que retorna el Blob del PDF.
 * @param {function(string): string} options.nombre Función que retorna el nombre del archivo para descarga.
 * @returns {HTMLDialogElement} La instancia del dialog abierta.
 */

const DEFAULT_FORMATOS = [
    ['ticket-80', 'Ticket 80 mm'],
    ['58', '58 mm'],
    ['a4', 'A4'],
    ['a5', 'A5'],
];

const ANCHOS_POR_FORMATO = {
    'ticket-80': '26rem',
    80: '26rem',
    58: '21rem',
    'ticket-58': '21rem',
    a5: '42rem',
    a4: '56rem',
};

// SVG Icons inline para no depender de librerías en el DOM nativo
const ICONS = {
    printer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>`,
    download: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    externalTab: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
    close: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    alert: `<svg class="visor-error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    retry: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>`,
};

export function visorPdf({
    titulo = 'Comprobante de Venta',
    subtitulo = '',
    formatos = DEFAULT_FORMATOS,
    formato = null,
    cargar,
    nombre = (fmt) => `comprobante-${fmt}.pdf`,
}) {
    if (typeof cargar !== 'function') {
        throw new Error(
            'visorPdf: la propiedad "cargar" debe ser una función que retorne un Blob',
        );
    }

    // 1. Obtener o crear el elemento <dialog id="visor-pdf-modal"> con clase "modal-visor"
    let dialog = document.getElementById('visor-pdf-modal');
    if (!dialog) {
        dialog = document.createElement('dialog');
        dialog.id = 'visor-pdf-modal';
        document.body.appendChild(dialog);
    }

    // Si el diálogo quedó abierto (p. ej. reapertura rápida), ciérralo antes
    // de reemplazar su contenido para evitar InvalidStateError en showModal().
    if (dialog.open) {
        dialog.close();
    }

    dialog.className = 'modal-visor';

    // 2. Determinar formato inicial considerando preferencia de localStorage
    const savedFormat = localStorage.getItem('visor_pdf_formato');
    const validFormatValues = formatos.map(([val]) => String(val));

    let formatoActual = '';
    if (savedFormat && validFormatValues.includes(savedFormat)) {
        formatoActual = savedFormat;
    } else if (formato && validFormatValues.includes(String(formato))) {
        formatoActual = String(formato);
    } else {
        formatoActual = validFormatValues[0] || 'ticket-80';
    }

    // 3. Variables de estado del ciclo de vida
    let currentBlobUrl = null;
    let loadCycleToken = 0;
    let isDialogOpen = true;

    // Función segura para revocar el Blob URL activo
    const revocarBlobActual = () => {
        if (currentBlobUrl) {
            try {
                URL.revokeObjectURL(currentBlobUrl);
            } catch (e) {
                console.warn('Error revocando Blob URL:', e);
            }
            currentBlobUrl = null;
        }
    };

    // Actualiza la variable CSS --visor-ancho y el atributo data-formato
    const aplicarAnchoFormato = (fmt) => {
        const ancho = ANCHOS_POR_FORMATO[fmt] || '26rem';
        dialog.setAttribute('data-formato', fmt);
        dialog.style.setProperty('--visor-ancho', ancho);
    };

    aplicarAnchoFormato(formatoActual);

    // 4. Renderizar la estructura interna del modal
    const formatButtonsHtml = formatos
        .map(([val, label]) => {
            const isActive = String(val) === String(formatoActual);
            return `
                <button
                    type="button"
                    role="radio"
                    data-formato="${val}"
                    aria-checked="${isActive ? 'true' : 'false'}"
                    class="visor-formato-btn ${isActive ? 'active' : ''}"
                >
                    ${label}
                </button>
            `;
        })
        .join('');

    dialog.innerHTML = `
        <!-- Barra flotante superior: Título y Selector de Formato -->
        <header class="visor-topbar">
            <div class="visor-title-pill">
                <h3 class="visor-title">${titulo}</h3>
                ${subtitulo ? `<p class="visor-subtitle">${subtitulo}</p>` : ''}
            </div>

            <div class="visor-formatos" role="radiogroup" aria-label="Selector de formato de impresión">
                ${formatButtonsHtml}
            </div>
        </header>

        <!-- Tarjeta central con el PDF -->
        <main class="visor-card">
            <!-- Estado: Spinner de Carga -->
            <div class="visor-state-loading">
                <div class="visor-spinner"></div>
                <p class="visor-loading-text">Preparando…</p>
                <p class="visor-loading-subtext">Generando representación impresa</p>
            </div>

            <!-- Estado: Error con botón Reintentar -->
            <div class="visor-state-error" style="display: none;">
                ${ICONS.alert}
                <p class="visor-error-msg">No se pudo preparar el documento.</p>
                <p class="visor-error-subtext">Ocurrió un error al cargar el PDF. Intente de nuevo.</p>
                <button type="button" class="btn-retry">
                    ${ICONS.retry}
                    <span>Reintentar</span>
                </button>
            </div>

            <!-- Iframe para visualización del PDF -->
            <iframe class="visor-iframe" title="Visor de PDF" style="display: none;"></iframe>
        </main>

        <!-- Barra flotante inferior: Botones de Acción -->
        <footer class="visor-actions">
            <!-- Imprimir -->
            <button type="button" class="btn-pill btn-pill-print" title="Imprimir documento">
                ${ICONS.printer}
                <span class="btn-label">Imprimir</span>
            </button>

            <!-- Descargar -->
            <a download="comprobante.pdf" href="#" class="btn-pill btn-pill-download" title="Descargar archivo PDF">
                ${ICONS.download}
                <span class="btn-label">Descargar</span>
            </a>

            <!-- Abrir en otra pestaña -->
            <button type="button" class="btn-pill btn-pill-tab" title="Abrir en otra pestaña">
                ${ICONS.externalTab}
                <span class="btn-label">Otra pestaña</span>
            </button>

            <!-- Cerrar con <form method="dialog"> -->
            <form method="dialog">
                <button type="submit" value="cerrar" class="btn-pill btn-pill-close" title="Cerrar visor">
                    ${ICONS.close}
                    <span class="btn-label">Cerrar</span>
                </button>
            </form>
        </footer>
    `;

    // 5. Referencias a elementos del DOM interno
    const stateLoading = dialog.querySelector('.visor-state-loading');
    const stateError = dialog.querySelector('.visor-state-error');
    const iframe = dialog.querySelector('.visor-iframe');
    const btnRetry = dialog.querySelector('.btn-retry');

    const btnPrint = dialog.querySelector('.btn-pill-print');
    const linkDownload = dialog.querySelector('.btn-pill-download');
    const btnTab = dialog.querySelector('.btn-pill-tab');
    const btnClose = dialog.querySelector('.btn-pill-close');

    const formatoButtons = dialog.querySelectorAll('.visor-formato-btn');

    // Manejo de cambios visuales de estado
    const setUIState = (state) => {
        if (state === 'loading') {
            stateLoading.style.display = 'flex';
            stateError.style.display = 'none';
            iframe.style.display = 'none';
        } else if (state === 'error') {
            stateLoading.style.display = 'none';
            stateError.style.display = 'flex';
            iframe.style.display = 'none';
        } else if (state === 'ready') {
            stateLoading.style.display = 'none';
            stateError.style.display = 'none';
            iframe.style.display = 'block';
        }
    };

    // 6. Carga de PDF con Reintentos (4x, intervalo de 1.5s)
    const MAX_RETRIES = 4;
    const RETRY_INTERVAL_MS = 1500;

    const ejecutarCarga = async (fmt) => {
        const cycleToken = ++loadCycleToken;

        // Revocar blob anterior al cambiar de formato o reintentar
        revocarBlobActual();
        setUIState('loading');

        let attempts = 0;
        let success = false;

        while (attempts < MAX_RETRIES) {
            if (!isDialogOpen || cycleToken !== loadCycleToken) {
                return;
            }

            attempts++;

            try {
                const result = await cargar(fmt);

                if (!isDialogOpen || cycleToken !== loadCycleToken) {
                    return;
                }

                if (result instanceof Blob && result.size > 0) {
                    revocarBlobActual();
                    currentBlobUrl = URL.createObjectURL(result);

                    // Requisito: iframe que muestra un PDF desde un blob URL con "#toolbar=0&navpanes=0&view=FitH"
                    iframe.src = `${currentBlobUrl}#toolbar=0&navpanes=0&view=FitH`;

                    // Configurar botón descargar con <a download> y el blob
                    const fileName =
                        typeof nombre === 'function'
                            ? nombre(fmt)
                            : `comprobante-${fmt}.pdf`;
                    linkDownload.href = currentBlobUrl;
                    linkDownload.setAttribute('download', fileName);

                    setUIState('ready');
                    success = true;
                    break;
                } else {
                    throw new Error(
                        'El resultado de cargar() no es un Blob válido.',
                    );
                }
            } catch (err) {
                console.warn(
                    `[VisorPDF] Intento ${attempts}/${MAX_RETRIES} falló para formato "${fmt}":`,
                    err,
                );

                if (attempts < MAX_RETRIES) {
                    await new Promise((resolve) =>
                        setTimeout(resolve, RETRY_INTERVAL_MS),
                    );
                }
            }
        }

        if (!success && isDialogOpen && cycleToken === loadCycleToken) {
            setUIState('error');
        }
    };

    // 7. Eventos de la barra de acciones
    // Imprimir: iframe.contentWindow.print()
    btnPrint.addEventListener('click', () => {
        try {
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
            } else if (currentBlobUrl) {
                window.open(currentBlobUrl, '_blank');
            }
        } catch (err) {
            console.warn('Error imprimiendo iframe:', err);
            if (currentBlobUrl) {
                window.open(currentBlobUrl, '_blank');
            }
        }
    });

    // Otra pestaña: window.open
    btnTab.addEventListener('click', () => {
        if (currentBlobUrl) {
            window.open(currentBlobUrl, '_blank');
        }
    });

    // Cerrar: cerrar dialog
    if (btnClose) {
        btnClose.addEventListener('click', () => {
            dialog.close('cerrar');
        });
    }

    // Botón de reintento en caso de fallo
    btnRetry.addEventListener('click', () => {
        ejecutarCarga(formatoActual);
    });

    // 8. Selector de Formato
    formatoButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const nuevoFormato = btn.getAttribute('data-formato');
            if (nuevoFormato === formatoActual && currentBlobUrl) {
                return;
            }

            formatoActual = nuevoFormato;

            // Guarda preferencia en localStorage
            try {
                localStorage.setItem('visor_pdf_formato', nuevoFormato);
            } catch (e) {
                console.warn('Error guardando en localStorage:', e);
            }

            // Actualizar botones UI
            formatoButtons.forEach((b) => {
                const active = b === btn;
                b.setAttribute('aria-checked', active ? 'true' : 'false');
                b.classList.toggle('active', active);
            });

            // Ajustar ancho con transición
            aplicarAnchoFormato(nuevoFormato);

            // Vuelve a pedir el PDF
            ejecutarCarga(nuevoFormato);
        });
    });

    // 9. Clic fuera cierra el dialog
    const handleDialogClick = (event) => {
        const card = dialog.querySelector('.visor-card');
        const topbar = dialog.querySelector('.visor-topbar');
        const actions = dialog.querySelector('.visor-actions');

        const inCard = card && card.contains(event.target);
        const inTopbar = topbar && topbar.contains(event.target);
        const inActions = actions && actions.contains(event.target);

        if (!inCard && !inTopbar && !inActions) {
            dialog.close('backdrop');
        }
    };

    dialog.addEventListener('click', handleDialogClick);

    // 10. Limpieza y revocación al cerrar
    const handleClose = () => {
        isDialogOpen = false;
        loadCycleToken++;
        revocarBlobActual();
        dialog.removeEventListener('click', handleDialogClick);
        dialog.removeEventListener('close', handleClose);
    };

    dialog.addEventListener('close', handleClose);

    // 11. Abrir con showModal() e iniciar carga
    dialog.showModal();
    ejecutarCarga(formatoActual);

    return dialog;
}

export default visorPdf;
