import React, { useState, useRef } from 'react';
import {
    X,
    AlertTriangle,
    Printer,
    FileText,
    Ticket as TicketIcon,
    CheckCircle,
    XCircle,
    Clock3,
} from 'lucide-react';
import { router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import Ticket from './Ticket';
import InvoiceA4 from './InvoiceA4';

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
        router.patch(route('ventas.cancel', sale.id), {}, {
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
            }
        });
    };

    const openPdf = (format) => {
        if (!sale.sunat_pdf_url) return false;
        const target =
            format === 'A4'
                ? sale.sunat_pdf_url.replace(/\/getPDF\/[^/]+/, '/getPDF/A4')
                : sale.sunat_pdf_url;
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Componentes Ocultos para Impresión Local */}
            <div className="hidden">
                <Ticket ref={ticketRef} sale={sale} />
                <InvoiceA4 ref={a4Ref} sale={sale} />
            </div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Detalle de Venta</h3>
                        <p className="text-xs text-slate-500 font-mono">{sale.nro_comprobante}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Cliente</p>
                            <p className="text-sm font-bold text-slate-700 truncate">{sale.nombre_cliente || sale.cliente?.nombre || 'General'}</p>
                            {sale.documento_cliente || sale.cliente?.ruc_dni ? (
                                <p className="text-[10px] font-mono font-bold text-slate-400 mt-0.5">{sale.documento_cliente || sale.cliente?.ruc_dni}</p>
                            ) : null}
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Vendedor</p>
                            <p className="text-sm font-bold text-slate-700 truncate">{sale.user?.name}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Fecha</p>
                            <p className="text-sm font-bold text-slate-700">{new Date(sale.created_at).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Pago</p>
                            <p className="text-sm font-bold text-indigo-600">{sale.metodo_pago}</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Estado</p>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-black ${ventaCls}`}>
                                {sale.estado === 'Anulado' ? <XCircle size={12} /> : <CheckCircle size={12} />}
                                {sale.estado}
                            </span>
                            <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-black ${sunatInfo.className}`}>
                                <SunatIcon size={12} />
                                {sunatInfo.text}
                            </span>
                            {sunatInfo.docId && (
                                <span className="rounded-lg bg-white px-2.5 py-1 font-mono text-[11px] font-bold text-slate-600">
                                    {sunatInfo.docId}
                                </span>
                            )}
                        </div>
                        {['ERROR', 'EXCEPCION'].includes(sale.sunat_status) && sale.sunat_cdr && (
                            <p className="mt-2 text-xs font-bold text-rose-600 break-words">{sale.sunat_cdr}</p>
                        )}
                        {sale.sunat_status === 'ACEPTADO' && sale.sunat_response_at && (
                            <p className="mt-2 text-[10px] font-bold text-slate-400">
                                Aceptado: {new Date(sale.sunat_response_at).toLocaleString('es-PE', { timeZone: 'America/Lima' })}
                            </p>
                        )}
                    </div>

                    <div className="rounded-xl border border-slate-100 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
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
                                        <td className="p-3 font-medium text-slate-700">{item.producto.nombre}</td>
                                        <td className="p-3 text-center font-bold text-slate-600">{item.cantidad}</td>
                                        <td className="p-3 text-right text-slate-600">S/ {parseFloat(item.precio_unitario).toFixed(2)}</td>
                                        <td className="p-3 text-right font-bold text-slate-800">S/ {parseFloat(item.subtotal).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-indigo-50/50">
                                <tr>
                                    <td colSpan="3" className="p-3 text-right font-bold text-slate-500 uppercase text-xs">Total</td>
                                    <td className="p-3 text-right font-black text-indigo-600 text-lg">S/ {parseFloat(sale.total).toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="relative">
                        <button 
                            onClick={() => setPrintMenuOpen((o) => !o)}
                            className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-sm rounded-xl transition-all flex items-center gap-2 border border-indigo-200"
                        >
                            <Printer size={18} /> Imprimir
                        </button>

                        {printMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10 cursor-default"
                                    onClick={() => setPrintMenuOpen(false)}
                                />
                                <div className="absolute bottom-full left-0 mb-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl z-20">
                                    <div className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                        {sale.sunat_pdf_url ? 'Desde PDF oficial de SUNAT' : 'Formato local'}
                                    </div>
                                    <button
                                        onClick={printA4Action}
                                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-indigo-50"
                                    >
                                        <FileText size={16} className="text-rose-500 shrink-0" />
                                        <span>PDF (A4)</span>
                                    </button>
                                    <button
                                        onClick={printTicketAction}
                                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-indigo-50 border-t border-slate-100"
                                    >
                                        <TicketIcon size={16} className="text-violet-500 shrink-0" />
                                        <span>Ticket 80mm</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 transition-colors"
                        >
                            Cerrar
                        </button>
                        {sale.estado !== 'Anulado' && (
                            <button 
                                className="px-6 py-2 bg-rose-600 text-white font-bold text-sm rounded-xl hover:bg-rose-700 transition-all shadow-md shadow-rose-100"
                                onClick={() => { setShowConfirm(true); setPrintMenuOpen(false); }}
                            >
                                Anular Venta
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center space-y-4">
                            <div className="w-16 h-16 mx-auto bg-rose-50 rounded-full flex items-center justify-center">
                                <AlertTriangle size={32} className="text-rose-600" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800">Anular Venta</h3>
                            <p className="text-sm text-slate-500 font-medium">
                                Esta acción no se puede deshacer. El stock de todos los productos será devuelto automáticamente.
                            </p>
                            <p className="text-xs font-bold text-slate-400">
                                {sale.nro_comprobante} — S/ {parseFloat(sale.total).toFixed(2)}
                            </p>
                        </div>
                        <div className="px-6 pb-6 flex gap-3">
                            <button 
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleCancel}
                                className="flex-1 py-3 bg-rose-600 text-white font-bold text-sm rounded-xl hover:bg-rose-700 transition-all shadow-md shadow-rose-100"
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