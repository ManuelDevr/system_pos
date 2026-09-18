import React, { useEffect, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FileText, Plus, Printer, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import ProformaModal from '@/Components/Sales/ProformaModal';

export default function Index({ proformas }) {
  const { flash } = usePage().props;
  const [showProforma, setShowProforma] = useState(null);
  const handledRef = useRef(null);

  // Al crear una proforma, el sistema elabora el PDF A4 automáticamente.
  useEffect(() => {
    if (flash?.last_proforma && handledRef.current !== flash.last_proforma.id) {
      handledRef.current = flash.last_proforma.id;
      setShowProforma({ proforma: flash.last_proforma, autoPrint: true });
    }
  }, [flash]);

  const handleConvert = (id) => {
    if (!confirm('¿Convertir esta proforma en venta? Se descontará del stock actual.')) return;
    router.post(route('cotizaciones.convert', id), {}, {
      onSuccess: () => toast.success('Proforma convertida en venta'),
      onError: (err) => toast.error(Object.values(err).join(', ')),
    });
  };

  const stateBadge = (estado) => {
    const styles = {
      Pendiente: 'bg-amber-100 text-amber-700',
      Aprobada: 'bg-emerald-100 text-emerald-700',
      Convertida: 'bg-indigo-100 text-indigo-700',
      Rechazada: 'bg-rose-100 text-rose-700',
    };
    return <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${styles[estado] || 'bg-slate-100 text-slate-500'}`}>{estado}</span>;
  };

  return (
    <AuthenticatedLayout>
      <Head title="Proformas" />
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Proformas</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Documentos preliminares con diseño A4 de factura</p>
          </div>
          <Link href={route('cotizaciones.create')} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100">
            <Plus size={18} />
            Nueva Proforma
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="p-4">N°</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4 text-right">Subtotal</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4">Vendedor</th>
                  <th className="p-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {proformas.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-12 text-center text-slate-400 font-medium">
                      <FileText size={48} className="mx-auto text-slate-200 mb-2" />
                      No hay proformas registradas
                    </td>
                  </tr>
                ) : proformas.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-800 text-sm">{c.nro_cotizacion}</td>
                    <td className="p-4 text-slate-600 text-sm">{c.cliente_nombre || 'Sin cliente'}</td>
                    <td className="p-4 text-slate-600 text-sm">Proforma</td>
                    <td className="p-4 text-right font-mono text-sm text-slate-600">S/ {parseFloat(c.subtotal).toFixed(2)}</td>
                    <td className="p-4 text-right font-black text-slate-800">S/ {parseFloat(c.total).toFixed(2)}</td>
                    <td className="p-4 text-center">{stateBadge(c.estado)}</td>
                    <td className="p-4 text-sm text-slate-600">{c.user?.name || '-'}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setShowProforma({ proforma: c, autoPrint: false })}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-1"
                          title="Imprimir / PDF A4"
                        >
                          <Printer size={12} />
                          PDF
                        </button>
                        {c.estado !== 'Convertida' && c.estado !== 'Rechazada' ? (
                          <button
                            onClick={() => handleConvert(c.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-sm flex items-center gap-1 disabled:bg-slate-300"
                            title="Convertir en Boleta/Factura"
                          >
                            <RefreshCw size={12} />
                            Convertir
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            {c.estado === 'Convertida' ? 'Vendido' : 'Rechazado'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ProformaModal
        isOpen={!!showProforma}
        proforma={showProforma?.proforma || null}
        autoPrint={showProforma?.autoPrint || false}
        onClose={() => setShowProforma(null)}
      />
    </AuthenticatedLayout>
  );
}