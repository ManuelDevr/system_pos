import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { ChevronLeft, FileText, Search, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Create({ ventas, lastNumber }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [motivo, setMotivo] = useState('');

  const filteredVentas = ventas.filter(v =>
    (v.nro_comprobante && v.nro_comprobante.toLowerCase().includes(searchTerm.toLowerCase())) ||
    `s/ ${parseFloat(v.total).toFixed(2)}`.includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedVenta || !motivo) {
      toast.error('Selecciona una venta y escribe el motivo');
      return;
    }
    router.post(route('notas-credito.store'), {
      venta_id: selectedVenta.id,
      motivo,
    }, {
      onSuccess: () => toast.success('Nota de crédito emitida'),
      onError: (err) => toast.error(Object.values(err).join(', ')),
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Nueva Nota de Crédito" />
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.get(route('notas-credito.index'))} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Nueva Nota de Crédito</h1>
            <p className="text-sm text-slate-500 font-medium">Selecciona la venta a anular y especifica el motivo</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Buscar Venta</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input type="text" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm" placeholder="Buscar por n° comprobante o monto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar border border-slate-100 rounded-xl p-2">
              {filteredVentas.map(v => (
                <button type="button" key={v.id} onClick={() => { setSelectedVenta(v); setSearchTerm(''); }} className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${selectedVenta?.id === v.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold">{v.nro_comprobante || 'S/N'}</span>
                      <span className="ml-3 text-xs text-slate-400">{new Date(v.created_at).toLocaleDateString('es-PE')}</span>
                    </div>
                    <span className="font-black">S/ {parseFloat(v.total).toFixed(2)}</span>
                  </div>
                </button>
              ))}
            </div>

            {selectedVenta && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-amber-600 w-5 h-5 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-800">
                      Anularás la venta {selectedVenta.nro_comprobante}
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      Se revertirá el stock de todos los productos y se marcará la venta como Anulada.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Motivo de la Nota de Crédito</label>
              <textarea rows={3} className="w-full px-4 py-2.5 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm" placeholder="Ej: Producto devuelto por el cliente, error en la emisión..." value={motivo} onChange={(e) => setMotivo(e.target.value)} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => router.get(route('notas-credito.index'))} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100">
                Cancelar
              </button>
              <button type="submit" disabled={!selectedVenta || !motivo} className="px-6 py-2.5 bg-rose-600 text-white font-bold text-sm rounded-xl hover:bg-rose-700 disabled:bg-slate-300 shadow-md">
                Emitir Nota de Crédito
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
