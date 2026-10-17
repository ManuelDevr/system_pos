import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { visorPdf } from './visorPdf';

/**
 * Obtiene o genera el Blob del PDF para una venta según el formato seleccionado.
 * Intenta primero consultar la ruta proxy del backend o la URL oficial de SUNAT (si existe);
 * si falla por CORS o no está configurada, genera el PDF vectorial de alta calidad en el cliente usando jsPDF.
 *
 * @param {Object} sale Datos de la venta
 * @param {string} formato Formato ('ticket-80', '58', 'a4', 'a5')
 * @param {Object} config Configuración de la empresa
 * @returns {Promise<Blob>}
 */
export async function cargarPdfVenta(
    sale,
    formato = 'ticket-80',
    config = null,
) {
    if (!sale) {
        throw new Error('Datos de venta no proporcionados');
    }

    // 1. Intento vía proxy del backend (evita CORS y valida permisos)
    if (sale.id) {
        try {
            const res = await fetch(
                `/ventas/${sale.id}/pdf?format=${encodeURIComponent(formato)}`,
            );
            if (res.ok) {
                const contentType = res.headers.get('content-type') || '';
                if (contentType.includes('application/pdf')) {
                    const blob = await res.blob();
                    if (blob && blob.size > 200) {
                        return blob;
                    }
                }
            }
        } catch {
            // Continúa al siguiente método
        }
    }

    // 2. Intento directo con URL oficial de SUNAT (si está presente)
    if (sale.sunat_pdf_url) {
        try {
            let targetUrl = sale.sunat_pdf_url;
            try {
                const u = new URL(targetUrl);
                const apiFormat = formato === '58' ? 'ticket-58' : formato;
                u.searchParams.set('format', apiFormat);
                targetUrl = u.toString();
            } catch {
                const apiFormat = formato === '58' ? 'ticket-58' : formato;
                targetUrl = targetUrl.replace(
                    /format=[^&]*(&|$)/,
                    `format=${apiFormat}$1`,
                );
            }

            const response = await fetch(targetUrl);
            if (response.ok) {
                const blob = await response.blob();
                if (
                    blob &&
                    (blob.type === 'application/pdf' || blob.size > 800)
                ) {
                    return blob;
                }
            }
        } catch {
            // Si falla por CORS o red, recurre de inmediato a la generación local en el cliente
        }
    }

    // 2. Generación en el cliente con jsPDF según el formato
    if (formato === 'ticket-80' || formato === '80') {
        return generarTicketBlob(sale, 80, config);
    } else if (formato === '58' || formato === 'ticket-58') {
        return generarTicketBlob(sale, 58, config);
    } else if (formato === 'a5') {
        return generarInvoiceBlob(sale, 'a5', config);
    } else {
        return generarInvoiceBlob(sale, 'a4', config);
    }
}

/**
 * Retorna el nombre sugerido para el archivo PDF.
 */
export function nombrePdfVenta(sale, formato = 'ticket-80') {
    const nro = sale?.nro_comprobante || 'venta';
    const cleanNro = String(nro).replace(/[^a-zA-Z0-9-_]/g, '_');
    return `Comprobante_${cleanNro}_${formato}.pdf`;
}

/**
 * Abre el visor de PDF modal reutilizable para una venta.
 *
 * @param {Object} sale Venta a visualizar
 * @param {Object} [config] Configuración de la empresa
 * @returns {HTMLDialogElement}
 */
export function abrirVisorVenta(sale, config = null) {
    if (!sale) return;

    const tipoDoc = (sale.nro_comprobante || '').startsWith('F')
        ? 'Factura'
        : 'Boleta';
    const titulo = `${tipoDoc} ${sale.nro_comprobante || ''}`;
    const cliente =
        sale.nombre_cliente || sale.cliente?.nombre || 'Clientes Varios';
    const total = parseFloat(sale.total || 0).toFixed(2);
    const subtitulo = `Total: S/ ${total} • Cliente: ${cliente}`;

    return visorPdf({
        titulo,
        subtitulo,
        formatos: [
            ['ticket-80', 'Ticket 80 mm'],
            ['58', '58 mm'],
            ['a4', 'A4'],
            ['a5', 'A5'],
        ],
        formato: localStorage.getItem('visor_pdf_formato') || 'ticket-80',
        cargar: (formato) => cargarPdfVenta(sale, formato, config),
        nombre: (formato) => nombrePdfVenta(sale, formato),
    });
}

// -------------------------------------------------------------
// Generador de Tickets (80 mm y 58 mm)
// -------------------------------------------------------------
function generarTicketBlob(sale, mmWidth, config) {
    const is58 = mmWidth <= 60;
    const margin = is58 ? 3 : 5;
    const printableWidth = mmWidth - margin * 2;

    const detalles = sale.detalles || [];
    const estimatedHeight = Math.max(
        130,
        80 + detalles.length * (is58 ? 10 : 8) + 50,
    );

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [mmWidth, estimatedHeight],
    });

    let y = margin + 3;

    // Encabezado Empresa
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(is58 ? 10 : 12);
    const nombreEmpresa = config?.nombre_empresa || 'FERRETERÍA CMA';
    const empLines = doc.splitTextToSize(
        nombreEmpresa.toUpperCase(),
        printableWidth,
    );
    doc.text(empLines, mmWidth / 2, y, { align: 'center' });
    y += empLines.length * (is58 ? 4 : 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(is58 ? 7 : 8);

    if (config?.ruc) {
        doc.text(`RUC: ${config.ruc}`, mmWidth / 2, y, { align: 'center' });
        y += 3.5;
    }
    if (config?.direccion) {
        const dirLines = doc.splitTextToSize(config.direccion, printableWidth);
        doc.text(dirLines, mmWidth / 2, y, { align: 'center' });
        y += dirLines.length * 3.2;
    }
    if (config?.telefono) {
        doc.text(`TELF: ${config.telefono}`, mmWidth / 2, y, {
            align: 'center',
        });
        y += 3.5;
    }

    // Separador
    y += 1;
    doc.setLineDashPattern([1, 1], 0);
    doc.line(margin, y, mmWidth - margin, y);
    y += 3.5;

    // Datos del Comprobante
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(is58 ? 8 : 9);
    doc.text(`COMPROBANTE: ${sale.nro_comprobante || '---'}`, margin, y);
    y += 3.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(is58 ? 7 : 7.5);

    const fechaStr = sale.created_at
        ? new Date(sale.created_at).toLocaleString('es-PE', {
              timeZone: 'America/Lima',
          })
        : new Date().toLocaleString('es-PE');
    doc.text(`FECHA: ${fechaStr}`, margin, y);
    y += 3.2;

    const clienteNombre =
        sale.nombre_cliente || sale.cliente?.nombre || 'CLIENTES VARIOS';
    const cliLines = doc.splitTextToSize(
        `CLIENTE: ${clienteNombre}`,
        printableWidth,
    );
    doc.text(cliLines, margin, y);
    y += cliLines.length * 3.2;

    const docCliente =
        sale.documento_cliente ||
        sale.cliente_documento ||
        sale.cliente?.ruc_dni;
    if (docCliente) {
        doc.text(`DOC: ${docCliente}`, margin, y);
        y += 3.2;
    }

    const vendedor = sale.user?.name || 'Cajero';
    doc.text(`VENDEDOR: ${vendedor}`, margin, y);
    y += 3.5;

    // Separador
    doc.line(margin, y, mmWidth - margin, y);
    y += 3.5;

    // Encabezado de Items
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(is58 ? 6.5 : 7.5);
    doc.text('CANT', margin, y);
    doc.text('DESCRIPCIÓN', margin + (is58 ? 9 : 12), y);
    doc.text('TOTAL', mmWidth - margin, y, { align: 'right' });
    y += 2.5;

    doc.line(margin, y, mmWidth - margin, y);
    y += 3;

    // Detalle de Items
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(is58 ? 6.5 : 7);

    detalles.forEach((d) => {
        const cant = parseFloat(d.cantidad || 1);
        const subtotal = parseFloat(
            d.subtotal_descuento ??
                d.subtotal ??
                cant * (d.precio_unitario || 0),
        ).toFixed(2);
        const descNombre = d.producto?.nombre || d.nombre || 'Producto';
        const descMaxW = printableWidth - (is58 ? 24 : 30);
        const linesDesc = doc.splitTextToSize(descNombre, descMaxW);

        doc.text(String(cant), margin, y);
        doc.text(linesDesc[0], margin + (is58 ? 9 : 12), y);
        doc.text(`S/ ${subtotal}`, mmWidth - margin, y, { align: 'right' });
        y += 3;

        if (linesDesc.length > 1) {
            for (let i = 1; i < linesDesc.length; i++) {
                doc.text(linesDesc[i], margin + (is58 ? 9 : 12), y);
                y += 2.8;
            }
        }
    });

    // Separador
    y += 1;
    doc.line(margin, y, mmWidth - margin, y);
    y += 3.5;

    // Totales
    const totalVal = parseFloat(sale.total || 0);
    const subtotalVal = parseFloat(sale.base_imponible ?? totalVal / 1.18);
    const igvVal = parseFloat(sale.igv ?? totalVal - subtotalVal);
    const descVal = parseFloat(sale.descuento || 0);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(is58 ? 7 : 7.5);

    if (descVal > 0) {
        doc.text('DESCUENTO:', margin + (is58 ? 10 : 20), y);
        doc.text(`- S/ ${descVal.toFixed(2)}`, mmWidth - margin, y, {
            align: 'right',
        });
        y += 3.2;
    }

    doc.text('OP. GRAVADA:', margin + (is58 ? 10 : 20), y);
    doc.text(`S/ ${subtotalVal.toFixed(2)}`, mmWidth - margin, y, {
        align: 'right',
    });
    y += 3.2;

    doc.text('I.G.V. (18%):', margin + (is58 ? 10 : 20), y);
    doc.text(`S/ ${igvVal.toFixed(2)}`, mmWidth - margin, y, {
        align: 'right',
    });
    y += 3.5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(is58 ? 9 : 10);
    doc.text('TOTAL:', margin + (is58 ? 10 : 20), y);
    doc.text(`S/ ${totalVal.toFixed(2)}`, mmWidth - margin, y, {
        align: 'right',
    });
    y += 4;

    // Pago y vuelto
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(is58 ? 6.5 : 7);
    if (sale.metodo_pago) {
        doc.text(
            `MÉTODO DE PAGO: ${sale.metodo_pago.toUpperCase()}`,
            margin,
            y,
        );
        y += 3;
    }
    if (sale.pagado_con && parseFloat(sale.pagado_con) > 0) {
        doc.text(
            `PAGÓ CON: S/ ${parseFloat(sale.pagado_con).toFixed(2)}`,
            margin,
            y,
        );
        y += 3;
    }
    if (sale.vuelto !== null && sale.vuelto !== undefined) {
        doc.text(`VUELTO: S/ ${parseFloat(sale.vuelto).toFixed(2)}`, margin, y);
        y += 3.5;
    }

    // Pie de página
    y += 2;
    doc.line(margin, y, mmWidth - margin, y);
    y += 4;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(is58 ? 6.5 : 7.5);
    doc.text('¡Gracias por su compra!', mmWidth / 2, y, { align: 'center' });

    return doc.output('blob');
}

// -------------------------------------------------------------
// Generador de Facturas / Boletas (A4 y A5)
// -------------------------------------------------------------
function generarInvoiceBlob(sale, pageFormat, config) {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: pageFormat, // 'a4' o 'a5'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = pageFormat === 'a5' ? 10 : 14;
    const contentWidth = pageWidth - margin * 2;

    let y = margin;

    // Datos Empresa (Izquierda)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(pageFormat === 'a5' ? 13 : 16);
    doc.setTextColor(30, 41, 59);
    doc.text(config?.nombre_empresa || 'FERRETERÍA CMA', margin, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(pageFormat === 'a5' ? 8 : 9);
    doc.setTextColor(100, 116, 139);

    let empY = y + 10;
    if (config?.ruc) {
        doc.text(`RUC: ${config.ruc}`, margin, empY);
        empY += 4;
    }
    if (config?.direccion) {
        const dLines = doc.splitTextToSize(
            config.direccion,
            contentWidth * 0.55,
        );
        doc.text(dLines, margin, empY);
        empY += dLines.length * 3.5;
    }
    if (config?.telefono) {
        doc.text(`Tel: ${config.telefono}`, margin, empY);
        empY += 4;
    }

    // Caja de Comprobante (Derecha)
    const boxWidth = pageFormat === 'a5' ? 55 : 68;
    const boxHeight = pageFormat === 'a5' ? 24 : 28;
    const boxX = pageWidth - margin - boxWidth;
    const boxY = margin;

    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.6);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(pageFormat === 'a5' ? 8 : 9);
    doc.setTextColor(79, 70, 229);
    doc.text(
        `R.U.C. ${config?.ruc || '20000000000'}`,
        boxX + boxWidth / 2,
        boxY + 6,
        { align: 'center' },
    );

    const tipoNombre = (sale.nro_comprobante || '').startsWith('F')
        ? 'FACTURA ELECTRÓNICA'
        : 'BOLETA DE VENTA ELECTRÓNICA';
    doc.setFontSize(pageFormat === 'a5' ? 7 : 8);
    doc.setTextColor(30, 41, 59);
    doc.text(tipoNombre, boxX + boxWidth / 2, boxY + 13, { align: 'center' });

    doc.setFontSize(pageFormat === 'a5' ? 10 : 12);
    doc.setTextColor(15, 23, 42);
    doc.text(
        sale.nro_comprobante || 'B001-000001',
        boxX + boxWidth / 2,
        boxY + 21,
        { align: 'center' },
    );

    y = Math.max(empY, boxY + boxHeight) + 6;

    // Caja de Datos del Cliente
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.setFillColor(255, 255, 255);
    const clientBoxH = pageFormat === 'a5' ? 20 : 22;
    doc.roundedRect(margin, y, contentWidth, clientBoxH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(pageFormat === 'a5' ? 7.5 : 8.5);
    doc.setTextColor(71, 85, 105);

    const cCol1 = margin + 3;
    const cCol2 = margin + contentWidth * 0.55;
    let cy = y + 5;

    const clienteNombre =
        sale.nombre_cliente || sale.cliente?.nombre || 'CLIENTES VARIOS';
    doc.text('CLIENTE:', cCol1, cy);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(clienteNombre, cCol1 + 18, cy);

    const fechaStr = sale.created_at
        ? new Date(sale.created_at).toLocaleDateString('es-PE', {
              timeZone: 'America/Lima',
          })
        : new Date().toLocaleDateString('es-PE');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('FECHA:', cCol2, cy);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(fechaStr, cCol2 + 15, cy);

    cy += 5;

    const docCliente =
        sale.documento_cliente ||
        sale.cliente_documento ||
        sale.cliente?.ruc_dni ||
        '---';
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('RUC / DNI:', cCol1, cy);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(docCliente, cCol1 + 18, cy);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('MONEDA:', cCol2, cy);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text('SOLES (PEN)', cCol2 + 15, cy);

    cy += 5;

    const direccionCli = sale.cliente?.direccion || '---';
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('DIRECCIÓN:', cCol1, cy);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(direccionCli, cCol1 + 18, cy);

    const vendedor = sale.user?.name || 'Cajero';
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('CAJERO:', cCol2, cy);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(vendedor, cCol2 + 15, cy);

    y += clientBoxH + 5;

    // Tabla de Items con AutoTable
    const headers = [
        'ÍTEM',
        'CANT.',
        'U.M.',
        'DESCRIPCIÓN',
        'P. UNIT.',
        'DSCTO.',
        'IMPORTE',
    ];
    const detalles = sale.detalles || [];
    const body = detalles.map((d, index) => {
        const cant = parseFloat(d.cantidad || 1);
        const pUnit = parseFloat(d.precio_unitario || 0);
        const dscto = parseFloat(d.descuento || 0);
        const totalItem = parseFloat(
            d.subtotal_descuento ?? d.subtotal ?? cant * pUnit - dscto,
        );
        const unidad = d.unidad?.abreviatura || d.unidad?.nombre || 'NIU';

        return [
            String(index + 1),
            cant.toFixed(2),
            unidad,
            d.producto?.nombre || d.nombre || 'Producto',
            `S/ ${pUnit.toFixed(2)}`,
            dscto > 0 ? `S/ ${dscto.toFixed(2)}` : '-',
            `S/ ${totalItem.toFixed(2)}`,
        ];
    });

    autoTable(doc, {
        startY: y,
        head: [headers],
        body: body,
        theme: 'grid',
        headStyles: {
            fillColor: [79, 70, 229],
            textColor: 255,
            fontSize: pageFormat === 'a5' ? 7 : 8,
            fontStyle: 'bold',
            halign: 'center',
            cellPadding: pageFormat === 'a5' ? 2 : 2.5,
        },
        styles: {
            fontSize: pageFormat === 'a5' ? 6.5 : 7.5,
            cellPadding: pageFormat === 'a5' ? 1.8 : 2.2,
            textColor: [30, 41, 59],
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: pageFormat === 'a5' ? 10 : 12 },
            1: { halign: 'right', cellWidth: pageFormat === 'a5' ? 12 : 16 },
            2: { halign: 'center', cellWidth: pageFormat === 'a5' ? 12 : 16 },
            3: { halign: 'left' },
            4: { halign: 'right', cellWidth: pageFormat === 'a5' ? 18 : 22 },
            5: { halign: 'right', cellWidth: pageFormat === 'a5' ? 15 : 18 },
            6: { halign: 'right', cellWidth: pageFormat === 'a5' ? 18 : 24 },
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        margin: { left: margin, right: margin },
    });

    const finalY = doc.lastAutoTable.finalY + 4;

    // Resumen de Totales (Abajo a la derecha)
    const totalsBoxW = pageFormat === 'a5' ? 60 : 70;
    const totalsBoxX = pageWidth - margin - totalsBoxW;
    let ty = finalY;

    const totalVal = parseFloat(sale.total || 0);
    const subtotalVal = parseFloat(sale.base_imponible ?? totalVal / 1.18);
    const igvVal = parseFloat(sale.igv ?? totalVal - subtotalVal);
    const descVal = parseFloat(sale.descuento || 0);

    const printTotalRow = (label, value, bold = false) => {
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(
            bold
                ? pageFormat === 'a5'
                    ? 9
                    : 10
                : pageFormat === 'a5'
                  ? 7.5
                  : 8.5,
        );
        doc.setTextColor(bold ? 79 : 71, bold ? 70 : 85, bold ? 229 : 105);
        doc.text(label, totalsBoxX, ty);
        doc.text(value, pageWidth - margin, ty, { align: 'right' });
        ty += bold ? 5.5 : 4.5;
    };

    if (descVal > 0) {
        printTotalRow('DESCUENTO TOTAL:', `- S/ ${descVal.toFixed(2)}`);
    }
    printTotalRow('OP. GRAVADA:', `S/ ${subtotalVal.toFixed(2)}`);
    printTotalRow('I.G.V. (18%):', `S/ ${igvVal.toFixed(2)}`);
    printTotalRow('IMPORTE TOTAL:', `S/ ${totalVal.toFixed(2)}`, true);

    // Mensaje final
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(pageFormat === 'a5' ? 7 : 8);
    doc.setTextColor(148, 163, 184);
    doc.text(
        'Representación impresa de Comprobante de Pago Electrónico. Gracias por su preferencia.',
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - (pageFormat === 'a5' ? 6 : 8),
        { align: 'center' },
    );

    return doc.output('blob');
}
