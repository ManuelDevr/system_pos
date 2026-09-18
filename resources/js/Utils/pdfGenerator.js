import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const primaryColor = [79, 70, 229];
const textColor = [50, 50, 50];
const mutedColor = [130, 130, 130];
const borderColor = [210, 210, 210];

const addFooter = (doc) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount} - Generado por Sistema CMA`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
};

const addDataTable = (doc, headers, body, startY) => {
  autoTable(doc, {
    startY,
    head: [headers],
    body,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      fontSize: 9,
      halign: 'center',
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    }
  });
};

export const generateProfessionalPDF = ({ title, filename, headers, body, config, dateRange = null }) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(config?.nombre_empresa || 'Ferretería CMA', 15, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`RUC: ${config?.ruc || '---'} | Tel: ${config?.telefono || '---'} | ${config?.direccion || ''}`, 15, 23);

  let currentY = 50;
  doc.setTextColor(...textColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');

  const titleParts = title.split(' | ');
  titleParts.forEach((part, index) => {
    doc.text(part, 15, currentY + (index * 7));
  });

  currentY += (titleParts.length * 7) + 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedColor);
  doc.text(`Generado el: ${new Date().toLocaleString()}`, 15, currentY);

  if (dateRange) {
    doc.text(`Rango: ${dateRange.start || '...'} hasta ${dateRange.end || '...'}`, 15, currentY + 5);
  }

  addDataTable(doc, headers, body, currentY + 12);
  addFooter(doc);

  doc.save(`${filename}.pdf`);
};

export const generateEnhancedPDF = async ({ title, filename, headers, body, config, dateRange = null, logoUrl = null, metadata = null }) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;

  let currentY = margin;

  // 1. HEADER: Logo + company name left, company info box right
  if (logoUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = logoUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const logoDataUrl = canvas.toDataURL('image/jpeg');

    const logoSize = 22;
    doc.addImage(logoDataUrl, 'JPEG', margin, currentY, logoSize, logoSize);

    const nameY = currentY + logoSize + 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...textColor);
    doc.text(config?.nombre_empresa || 'Ferretería CMA', margin, nameY);

    const rightX = pageWidth - margin;
    const rucText = `RUC: ${config?.ruc || '---'}`;
    const telText = `Tel: ${config?.telefono || '---'}`;
    const dirText = `Dirección: ${config?.direccion || ''}`;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const maxW = Math.max(
      doc.getTextWidth(rucText),
      doc.getTextWidth(telText),
      doc.getTextWidth(dirText)
    );
    const boxPadX = 5;
    const boxPadTop = 7;
    const lineGap = 7;
    const boxPadBottom = 7;
    const boxW = maxW + boxPadX * 2;
    const boxH = boxPadTop + lineGap * 2 + boxPadBottom;
    const boxX = rightX - boxW;

    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(boxX, currentY, boxW, boxH, 2, 2, 'S');

    doc.setTextColor(...mutedColor);
    doc.text(rucText, boxX + boxPadX, currentY + boxPadTop);
    doc.text(telText, boxX + boxPadX, currentY + boxPadTop + lineGap);
    doc.text(dirText, boxX + boxPadX, currentY + boxPadTop + lineGap * 2);

    currentY = nameY + 9;
    doc.setTextColor(...textColor);
  } else {
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(config?.nombre_empresa || 'Ferretería CMA', 15, 15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`RUC: ${config?.ruc || '---'} | Tel: ${config?.telefono || '---'} | Direccion: ${config?.direccion || ''}`, 15, 23);
    currentY = 50;
  }

  // 2. TITLE
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(title, margin, currentY);
  currentY += 10;

  // 3. HORIZONTAL DIVIDER
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;

  // 4. METADATA GRID (dynamic columns)
  if (metadata) {
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);

    const writePair = (label, value, x, y, maxW) => {
      doc.setFont('helvetica', 'bold');
      const labelStr = label + ':';
      doc.text(labelStr, x, y);
      const labelW = doc.getTextWidth(labelStr);
      const availW = maxW - labelW - 3;
      doc.setFont('helvetica', 'normal');
      if (availW > 15) {
        const lines = doc.splitTextToSize(value || '---', availW);
        lines.forEach((l, i) => doc.text(l, x + labelW + 3, y + i * 4));
        return lines.length;
      }
      return 0;
    };

    const row1Items = [];
    if (metadata.fecha != null) row1Items.push({ label: 'Fecha', value: metadata.fecha });
    if (metadata.categoria != null) row1Items.push({ label: 'Categoría', value: metadata.categoria });
    if (metadata.nivelStock != null) row1Items.push({ label: 'Nivel de stock', value: metadata.nivelStock });
    if (metadata.producto != null) row1Items.push({ label: 'Producto', value: metadata.producto });
    if (metadata.tipo != null) row1Items.push({ label: 'Tipo', value: metadata.tipo });

    const row1Count = row1Items.length || 1;
    const colW = contentWidth / row1Count;
    const row1Y = currentY;

    row1Items.forEach((item, i) => {
      writePair(item.label, item.value, margin + colW * i, row1Y, colW);
    });

    if (metadata.usuario != null) {
      const row2Y = currentY + 5;
      writePair('Usuario', metadata.usuario, margin, row2Y, contentWidth);
      currentY = row2Y + 10;
    } else {
      currentY = row1Y + 10;
    }
  } else {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedColor);
    const metaText = `Generado el: ${new Date().toLocaleString()}`;
    doc.text(metaText, margin, currentY);

    if (dateRange) {
      doc.text(`Rango: ${dateRange.start || '...'} hasta ${dateRange.end || '...'}`, margin, currentY + 5);
      currentY += 12;
    } else {
      currentY += 8;
    }
  }

  // 5. TABLE
  addDataTable(doc, headers, body, currentY + 5);

  // 6. FOOTER
  addFooter(doc);

  doc.save(`${filename}.pdf`);
};
