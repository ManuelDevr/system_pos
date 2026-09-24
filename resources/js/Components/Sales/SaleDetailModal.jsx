import { getPdfUrls } from '@/Utils/sunatPdf';
import { router } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle,
    Clock3,
    FileText,
    Printer,
    Ticket as TicketIcon,
    X,
    XCircle,
} from 'lucide-react';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import InvoiceA4 from './InvoiceA4';
import Ticket from './Ticket';

export default function SaleDetailModal({ isOpen, onClose, sale }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [printMenuOpen, setPrintMenuOpen] = useState(false);
    const ticketRef = useRef();
    const a4Ref = useRef();

    const printTicket = useReactToPrint({
        contentRef: ticketRef,
        documentTitle: `Ticket_${sale?.nro_comprobante || 'Venta'}`,
    });

    const printA4 = useReactToPrint({
        contentRef: a4Ref,
        documentTitle: `Factura_${sale?.nro_comprobante || 'Venta'}`,
    });

    if (!isOpen || !sale) return null;

    const handleCancel = () => {
        router.patch(
            route('ventas.cancel', sale.id),
            {},
            {
                onSuccess: () => {
                    setShowConfirm(false);
                    setPrintMenuOpen(false);
                    onClose();
                    toast.success('Venta anulada correctamente');
                },
                onError: () => {
                    setShowConfirm(false);
                    onClose();
                    toast.error('Error al anular la venta');
                },
            },
        );
    };

    const openPdf = (format) => {
        if (!sale.sunat_pdf_url) return false;
        const { ticket, a4 } = getPdfUrls(sale.sunat_pdf_url);
        const target = format === 'A4' ? a4 : ticket;
        window.open(target, '_blank');
        return true;
    };

    const printA4Action = () => {
        if (!openPdf('A4')) printA4();
        setPrintMenuOpen(false);
    };

    const printTicketAction = () => {
        if (!openPdf('ticket80mm')) printTicket();
        setPrintMenuOpen(false);
    };

    const sunatInfo = (() => {
        if (!sale.sunat_envio && !sale.sunat_status) {
            return {
                text: 'No enviado a SUNAT',
                className: 'border-slate-200 bg-slate-100 text-slate-600',
                icon: XCircle,
                docId: null,
            };
        }

        const status = sale.sunat_status || 'PENDIENTE';
        const map = {
            ACEPTADO: 'border-emerald-200 bg-emerald-100 text-emerald-700',
            PENDIENTE: 'border-amber-200 bg-amber-100 text-amber-700',
            ERROR: 'border-rose-200 bg-rose-100 text-rose-700',
            EXCEPCION: 'border-rose-200 bg-rose-100 text-rose-700',
        };
        const icon =
            status === 'ACEPTADO'
                ? CheckCircle
                : status === 'PENDIENTE'
                  ? Clock3
                  : XCircle;

        return {
            text: `SUNAT: ${status}`,
            className: map[status] || map.PENDIENTE,
            icon,
            docId: sale.sunat_document_id,
        };
    })();

    const SunatIcon = sunatInfo.icon;
    const ventaCls =
        sale.estado === 'Anulado'
            ? 'border-slate-200 bg-slate-200 text-slate-600'
            : 'border-emerald-200 bg-emerald-100 text-emerald-700';

    return (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm duration-200">
            {/* Componentes Ocultos para Impresión Local */}
            <div className="hidden">
                <Ticket ref={ticketRef} sale={sale} />
                <InvoiceA4 ref={a4Ref} sale={sale} />
            </div>

            <div className="animate-in zoom-in-95 w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">
                            Detalle de Venta
                        </h3>
                        <p className="font-mono text-xs text-slate-500">
                            {sale.nro_comprobante}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="custom-scrollbar max-h-[70vh] space-y-6 overflow-y-auto p-6">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                            <p className="mb-1 text-[10px] font-bold uppercase text-slate-400">
                                Cliente
                            </p>
                            <p className="truncate text-sm font-bold text-slate-700">
                                {sale.nombre_cliente ||
                                    sale.cliente?.nombre ||
                                    'General'}
                            </p>
                            {sale.documento_cliente || sale.cliente?.ruc_dni ? (
                                <p className="mt-0.5 font-mono text-[10px] font-bold text-slate-400">
                                    {sale.documento_cliente ||
                                        sale.cliente?.ruc_dni}
                                </p>
                            ) : null}
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                            <p className="mb-1 text-[10px] font-bold uppercase text-slate-400">
                                Vendedor
                            </p>
                            <p className="truncate text-sm font-bold text-slate-700">
                                {sale.user?.name}
                            </p>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                            <p className="mb-1 text-[10px] font-bold uppercase text-slate-400">
                                Fecha
                            </p>
                            <p className="text-sm font-bold text-slate-700">
                                {new Date(sale.created_at).toLocaleDateString(
                                    'es-PE',
                                    { timeZone: 'America/Lima' },
                                )}
                            </p>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                            <p className="mb-1 text-[10px] font-bold uppercase text-slate-400">
                                Pago
                            </p>
                            <p className="text-sm font-bold text-indigo-600">
                                {sale.metodo_pago}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <p className="mb-2 text-[10px] font-bold uppercase text-slate-400">
                            Estado
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-black ${ventaCls}`}
                            >
                                {sale.estado === 'Anulado' ? (
                                    <XCircle size={12} />
                                ) : (
                                    <CheckCircle size={12} />
                                )}
                                {sale.estado}
                            </span>
                            <span
                                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-black ${sunatInfo.className}`}
                            >
                                <SunatIcon size={12} />
                                {sunatInfo.text}
                            </span>
                            {sunatInfo.docId && (
                                <span className="rounded-lg bg-white px-2.5 py-1 font-mono text-[11px] font-bold text-slate-600">
                                    {sunatInfo.docId}
                                </span>
                            )}
                        </div>
                        {['ERROR', 'EXCEPCION'].includes(sale.sunat_status) &&
                            sale.sunat_cdr && (
                                <p className="mt-2 break-words text-xs font-bold text-rose-600">
                                    {sale.sunat_cdr}
                                </p>
                            )}
                        {sale.sunat_status === 'ACEPTADO' &&
                            sale.sunat_response_at && (
                                <p className="mt-2 text-[10px] font-bold text-slate-400">
                                    Aceptado:{' '}
                                    {new Date(
                                        sale.sunat_response_at,
                                    ).toLocaleString('es-PE', {
                                        timeZone: 'America/Lima',
                                    })}
                                </p>
                            )}
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-100">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="p-3">Producto</th>
                                    <th className="p-3 text-center">Cant.</th>
                                    <th className="p-3 text-right">P. Unit</th>
                                    <th className="p-3 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sale.detalles.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="p-3 font-medium text-slate-700">
                                            {item.producto.nombre}
                                        </td>
                                        <td className="p-3 text-center font-bold text-slate-600">
                                            {item.cantidad}
                                        </td>
                                        <td className="p-3 text-right text-slate-600">
                                            S/{' '}
                                            {parseFloat(
                                                item.precio_unitario,
                                            ).toFixed(2)}
                                        </td>
                                        <td className="p-3 text-right font-bold text-slate-800">
                                            S/{' '}
                                            {parseFloat(item.subtotal).toFixed(
                                                2,
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-indigo-50/50">
                                <tr>
                                    <td
                                        colSpan="3"
                                        className="p-3 text-right text-xs font-bold uppercase text-slate-500"
                                    >
                                        Total
                                    </td>
                                    <td className="p-3 text-right text-lg font-black text-indigo-600">
                                        S/ {parseFloat(sale.total).toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 p-4">
                    <div className="relative">
                        <button
                            onClick={() => setPrintMenuOpen((o) => !o)}
                            className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-2.5 text-sm font-bold text-indigo-700 transition-all hover:bg-indigo-100"
                        >
                            <Printer size={18} /> Imprimir
                        </button>

                        {printMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10 cursor-default"
                                    onClick={() => setPrintMenuOpen(false)}
                                />
                                <div className="absolute bottom-full left-0 z-20 mb-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                                    <div className="border-b border-slate-100 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        {sale.sunat_pdf_url
                                            ? 'Desde PDF oficial de SUNAT'
                                            : 'Formato local'}
                                    </div>
                                    <button
                                        onClick={printA4Action}
                                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-indigo-50"
                                    >
                                        <FileText
                                            size={16}
                                            className="shrink-0 text-rose-500"
                                        />
                                        <span>PDF (A4)</span>
                                    </button>
                                    <button
                                        onClick={printTicketAction}
                                        className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-indigo-50"
                                    >
                                        <TicketIcon
                                            size={16}
                                            className="shrink-0 text-violet-500"
                                        />
                                        <span>Ticket 80mm</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="rounded-xl border border-slate-200 bg-white px-6 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100"
                        >
                            Cerrar
                        </button>
                        {sale.estado !== 'Anulado' && (
                            <button
                                className="rounded-xl bg-rose-600 px-6 py-2 text-sm font-bold text-white shadow-md shadow-rose-100 transition-all hover:bg-rose-700"
                                onClick={() => {
                                    setShowConfirm(true);
                                    setPrintMenuOpen(false);
                                }}
                            >
                                Anular Venta
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showConfirm && (
                <div className="animate-in fade-in fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm duration-200">
                    <div className="animate-in zoom-in-95 w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl duration-200">
                        <div className="space-y-4 p-6 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
                                <AlertTriangle
                                    size={32}
                                    className="text-rose-600"
                                />
                            </div>
                            <h3 className="text-xl font-black text-slate-800">
                                Anular Venta
                            </h3>
                            <p className="text-sm font-medium text-slate-500">
                                Esta acción no se puede deshacer. El stock de
                                todos los productos será devuelto
                                automáticamente.
                            </p>
                            <p className="text-xs font-bold text-slate-400">
                                {sale.nro_comprobante} — S/{' '}
                                {parseFloat(sale.total).toFixed(2)}
                            </p>
                        </div>
                        <div className="flex gap-3 px-6 pb-6">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCancel}
                                className="flex-1 rounded-xl bg-rose-600 py-3 text-sm font-bold text-white shadow-md shadow-rose-100 transition-all hover:bg-rose-700"
                            >
                                Sí, Anular
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
