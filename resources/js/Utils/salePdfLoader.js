/**
 * Re-exportador y puente para el visor de comprobantes de venta
 */
export {
    abrirVisorVenta,
    cargarPdfVenta,
    nombrePdfVenta,
    cargarPdfVenta as obtenerVentaPdfBlob,
} from './salePdf';
export { visorPdf } from './visorPdf';
