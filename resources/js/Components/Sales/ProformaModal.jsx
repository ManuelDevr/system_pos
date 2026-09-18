import React, { useEffect, useRef } from 'react';
import { X, Printer, FileText, Star } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import ProformaA4 from './ProformaA4';

export default function ProformaModal({ isOpen, proforma, onClose, autoPrint = false }) {
    const a4Ref = useRef();
    const lastPrintedRef = useRef(null);

    const printA4 = useReactToPrint({
        contentRef: a4Ref,
        documentTitle: `Proforma_${proforma?.nro_cotizacion || 'Documento'}`,
    });

    useEffect(() => {
        if (isOpen && proforma && autoPrint && lastPrintedRef.current !== proforma.id) {
            lastPrintedRef.current = proforma.id;
            const t = setTimeout(() => printA4(), 600);
            return () => clearTimeout(t);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, proforma]);

    if (!isOpen || !proforma) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="hidden">
                <ProformaA4 ref={a4Ref} proforma={proforma} />
            </div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
                <div className="p-8 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-amber-50 rounded-full flex items-center justify-center">
                        <Star size={32} className="text-amber-500" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800">
                        Proforma generada
                    </h3>
                    <p className="text-sm font-bold font-mono text-slate-400">
                        {proforma.nro_cotizacion} — S/ {parseFloat(proforma.total).toFixed(2)}
                    </p>
                    <p className="text-sm text-slate-500 font-medium">
                        El sistema elaboró el PDF A4 con el diseño de factura.
                        Puedes guardarlo o imprimirlo.
                    </p>
                </div>

                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        Cerrar
                    </button>
                    <button
                        onClick={printA4}
                        className="flex-1 py-3 bg-violet-600 text-white font-bold text-sm rounded-xl hover:bg-violet-700 transition-all shadow-md shadow-violet-100 flex items-center justify-center gap-2"
                    >
                        {autoPrint ? <FileText size={16} /> : <Printer size={16} />}
                        Imprimir / PDF
                    </button>
                </div>
            </div>
        </div>
    );
}