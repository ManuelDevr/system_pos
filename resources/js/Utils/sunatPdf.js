/**
 * Resuelve las URLs de PDF (ticket y A4) según el proveedor de facturación.
 *
 * - Plataforma-Sunat: .../sunat/{tipo}/{id}/pdf?format=ticket-80... → A4 cambia el query `format=a4`.
 * - APISUNAT: .../documents/{id}/getPDF/{formato}/{file}.pdf → A4 reemplaza el segmento de formato.
 *
 * @param {string|null} pdfUrl URL almacenada en `ventas.sunat_pdf_url` (ticket por defecto).
 * @returns {{ticket: string|null, a4: string|null}}
 */
export function getPdfUrls(pdfUrl) {
    if (!pdfUrl) return { ticket: null, a4: null };

    if (pdfUrl.includes('/sunat/') && pdfUrl.includes('/pdf')) {
        try {
            const u = new URL(pdfUrl);
            u.searchParams.set('format', 'a4');
            return { ticket: pdfUrl, a4: u.toString() };
        } catch {
            return {
                ticket: pdfUrl,
                a4: pdfUrl.replace(/format=[^&]*(&|$)/, 'format=a4$1'),
            };
        }
    }

    return {
        ticket: pdfUrl,
        a4: pdfUrl.replace(/\/getPDF\/[^/]+/, '/getPDF/A4'),
    };
}
