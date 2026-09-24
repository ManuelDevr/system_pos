import InvoiceA4 from '@/Components/Sales/InvoiceA4';
import Ticket from '@/Components/Sales/Ticket';
import { getPdfUrls } from '@/Utils/sunatPdf';
import { usePage } from '@inertiajs/react';
import {
    CheckCircle,
    FileText,
    Smartphone,
    Ticket as TicketIcon,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

export default function SaleOptionsModal({ isOpen, onClose, onNewSale, sale }) {
    const { config } = usePage().props;

    const ticketRef = useRef(null);
    const a4Ref = useRef(null);

    const [phoneInput, setPhoneInput] = useState('');
    const [phoneError, setPhoneError] = useState('');

    useEffect(() => {
        if (sale) {
            setPhoneInput(sale.cliente?.telefono || config?.telefono || '');
            setPhoneError('');
        }
    }, [sale, config?.telefono]);

    const printTicket = useReactToPrint({
        contentRef: ticketRef,
        documentTitle: `Ticket_${sale?.nro_comprobante || 'venta'}`,
    });

    const printA4 = useReactToPrint({
        contentRef: a4Ref,
        documentTitle: `Factura_${sale?.nro_comprobante || 'venta'}`,
    });

    if (!isOpen || !sale) return null;

    const fechaEmision = sale.created_at
        ? new Date(sale.created_at).toLocaleDateString('es-PE', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              timeZone: 'America/Lima',
          })
        : new Date().toLocaleDateString('es-PE', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
          });

    // PDF oficial (APISUNAT o Plataforma-Sunat): ticket 80mm y A4 según proveedor.
    const { ticket: pdfTicketUrl, a4: pdfA4Url } = getPdfUrls(
        sale.sunat_pdf_url,
    );

    const openPdf = (format) => {
        const target = format === 'A4' ? pdfA4Url : pdfTicketUrl;
        if (!target) return false;
        window.open(target, '_blank');
        return true;
    };

    const handleWhatsApp = () => {
        const phone = (phoneInput || '').replace(/\D/g, '');
        if (!phone) {
            setPhoneError('Ingresa el número de WhatsApp del cliente.');
            return;
        }
        if (!/^[1-9]\d{8,14}$/.test(phone)) {
            setPhoneError(
                'Número inválido. Usa código de país sin espacios ni "+" (ej: 51999888777).',
            );
            return;
        }
        setPhoneError('');

        const msg = encodeURIComponent('Gracias por su compra');
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    };

    const Row = ({ label, value, children }) => (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="mb-1 text-[10px] font-bold uppercase text-slate-400">
                {label}
            </p>
            {children || (
                <p className="truncate text-sm font-bold text-slate-700">
                    {value}
                </p>
            )}
        </div>
    );

    return (
        <div className="animate-in fade-in fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm duration-200">
            <div className="animate-in zoom-in-95 w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-2xl duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                            <CheckCircle
                                size={18}
                                className="text-violet-600"
                            />
                        </div>
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight text-slate-800">
                                Opciones de Venta
                            </h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Selecciona una acción
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6 p-6">
                    {/* Resumen de la Venta */}
                    <div className="grid grid-cols-2 gap-3">
                        <Row label="Código">
                            <p className="font-mono text-sm font-black text-slate-700">
                                {sale.nro_comprobante}
                            </p>
                        </Row>
                        <Row label="Estado">
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                                <CheckCircle size={12} /> Emitido
                            </span>
                        </Row>
                        <Row label="Fecha de Emisión" value={fechaEmision} />
                        <Row label="Total">
                            <p className="text-lg font-black text-indigo-600">
                                S/ {parseFloat(sale.total).toFixed(2)}
                            </p>
                        </Row>
                        <Row
                            label="Cliente"
                            value={
                                sale.nombre_cliente ||
                                sale.cliente?.nombre ||
                                'Clientes Varios'
                            }
                        />
                        <Row
                            label="Vendedor"
                            value={sale.user?.name || 'Cajero'}
                        />
                    </div>

                    {/* Acciones Inferiores */}
                    <div>
                        <p className="mb-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {pdfTicketUrl
                                ? 'Ticket 80mm y A4 abren el PDF oficial de SUNAT'
                                : 'Imprimir o enviar comprobante'}
                        </p>
                        <div className="mb-3">
                            <label
                                htmlFor="whatsapp-phone"
                                className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-400"
                            >
                                Número de WhatsApp del cliente
                            </label>
                            <input
                                id="whatsapp-phone"
                                type="tel"
                                inputMode="numeric"
                                value={phoneInput}
                                onChange={(e) => {
                                    setPhoneInput(e.target.value);
                                    setPhoneError('');
                                }}
                                placeholder="Ej: 51999888777"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all placeholder:font-normal placeholder:text-slate-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                            />
                            {phoneError ? (
                                <p className="mt-1 text-[11px] font-semibold text-rose-500">
                                    {phoneError}
                                </p>
                            ) : (
                                <p className="mt-1 text-[11px] font-medium text-slate-400">
                                    Envía un mensaje de agradecimiento; tú
                                    agregas el PDF de la venta manualmente.
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => {
                                    if (!openPdf('ticket80mm')) printTicket();
                                }}
                                className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-violet-100 transition-all hover:bg-violet-700 active:scale-[0.97]"
                            >
                                <TicketIcon size={16} />
                                {pdfTicketUrl ? 'Ticket 80mm (PDF)' : 'Ticket'}
                            </button>
                            <button
                                onClick={() => {
                                    if (!openPdf('A4')) printA4();
                                }}
                                className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-rose-100 transition-all hover:bg-rose-700 active:scale-[0.97]"
                            >
                                <FileText size={16} />
                                {pdfA4Url ? 'A4 (PDF)' : 'A4'}
                            </button>
                            <button
                                onClick={handleWhatsApp}
                                className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-700 active:scale-[0.97]"
                            >
                                <Smartphone size={16} /> WhatsApp
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 px-6 pb-6">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200"
                    >
                        Cerrar
                    </button>
                    <button
                        onClick={onNewSale}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-black text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-[0.98]"
                    >
                        Nueva Venta
                    </button>
                </div>
            </div>

            {/* Áreas de impresión ocultas */}
            <div className="hidden">
                <Ticket ref={ticketRef} sale={sale} />
                <InvoiceA4 ref={a4Ref} sale={sale} />
            </div>
        </div>
    );
}
