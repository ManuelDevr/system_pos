import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { FileText, Plus, User, DollarSign } from 'lucide-react';

export default function Index({ notas }) {
  return (
    <AuthenticatedLayout>
      <Head title="Notas de Crédito" />
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Notas de Crédito</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Anulaciones y modificaciones de comprobantes</p>
          </div>
          <Link href={route('notas-credito.create')} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100">
            <Plus size={18} />
            Nueva Nota de Crédito
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="p-4">N° Comprobante</th>
                  <th className="p-4">Venta Origen</th>
                  <th className="p-4">Motivo</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4">Emisor</th>
                  <th className="p-4">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {notas.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-slate-400 font-medium">
                      <FileText size={48} className="mx-auto text-slate-200 mb-2" />
                      No hay notas de crédito registradas
                    </td>
                  </tr>
                ) : notas.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-800 text-sm">{n.nro_comprobante}</td>
                    <td className="p-4">
                      <span className="font-mono text-sm text-indigo-600 font-bold">{n.venta?.nro_comprobante || '-'}</span>
                    </td>
                    <td className="p-4 text-slate-600 text-sm max-w-[250px] truncate">{n.motivo}</td>
                    <td className="p-4 text-right font-black text-slate-800">S/ {parseFloat(n.total).toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${n.estado === 'Emitido' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                        {n.estado}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{n.user?.name || '-'}</td>
                    <td className="p-4 text-sm text-slate-500">{new Date(n.created_at).toLocaleDateString('es-PE')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
