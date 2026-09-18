import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Package, Plus, Minus, AlertTriangle, Search, Calendar, User, FileText, TrendingUp, TrendingDown, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Adjustments({ productos, ajustes }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tipo, setTipo] = useState('ENTRADA');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filteredProducts = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct || !cantidad || !motivo) {
      toast.error('Completa todos los campos');
      return;
    }

    router.post(route('inventory.adjustments.store'), {
      producto_id: selectedProduct.id,
      tipo,
      cantidad,
      motivo,
    }, {
      onSuccess: () => {
        setSelectedProduct(null);
        setCantidad('');
        setMotivo('');
        setShowForm(false);
        toast.success('Ajuste registrado');
      },
      onError: (err) => {
        toast.error(Object.values(err).join(', '));
      }
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Ajustes de Inventario" />
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-200">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Ajustes de Inventario</h1>
              <p className="text-sm text-slate-500 font-medium">Entradas y salidas manuales de stock</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="h-11 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cancelar' : 'Nuevo Ajuste'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Package size={18} /></div>
              Registrar Ajuste Manual
            </h3>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm"
                placeholder="Buscar producto por nombre o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
              {filteredProducts.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setSelectedProduct(p); setSearchTerm(''); }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    selectedProduct?.id === p.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{p.nombre}</span>
                  <span className={`ml-2 text-xs font-mono ${selectedProduct?.id === p.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                    Stock: {parseInt(p.stock, 10)} {p.unidad_medida}
                  </span>
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">Sin resultados</p>
              )}
            </div>

            {selectedProduct && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600"><Package size={18} /></div>
                    <div>
                      <p className="font-bold text-slate-800">{selectedProduct.nombre}</p>
                      <p className="text-xs text-slate-400 font-mono">Stock actual: <span className="font-bold text-slate-600">{parseInt(selectedProduct.stock, 10)}</span> {selectedProduct.unidad_medida}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelectedProduct(null)} className="text-xs text-rose-500 font-bold hover:text-rose-700 flex items-center gap-1"><X size={14} /> Cambiar</button>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setTipo('ENTRADA')} className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${tipo === 'ENTRADA' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:border-emerald-200'}`}>
                    <Plus size={16} className="inline mr-1" /> Entrada
                  </button>
                  <button type="button" onClick={() => setTipo('SALIDA')} className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${tipo === 'SALIDA' ? 'bg-rose-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:border-rose-200'}`}>
                    <Minus size={16} className="inline mr-1" /> Salida
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Cantidad</label>
                    <input type="number" step="0.01" min="0.01" value={cantidad} onChange={(e) => setCantidad(e.target.value)} className="w-full px-4 py-2.5 bg-white border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm font-bold" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Motivo del Ajuste</label>
                    <input type="text" value={motivo} onChange={(e) => setMotivo(e.target.value)} className="w-full px-4 py-2.5 bg-white border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm" placeholder="Ej: Ajuste físico, merma, sobrante..." />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => { setShowForm(false); setSelectedProduct(null); setCantidad(''); setMotivo(''); }} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 transition-all">Cancelar</button>
              <button type="submit" disabled={!selectedProduct || !cantidad || !motivo} className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 shadow-md transition-all active:scale-95 flex items-center gap-2">
                <Package size={16} /> Registrar Ajuste
              </button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800">Historial de Ajustes</h3>
              <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-black rounded-full">{ajustes.length} registros</span>
            </div>
          </div>

          {ajustes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                <AlertTriangle size={32} />
              </div>
              <p className="text-slate-800 font-bold">Sin ajustes registrados</p>
              <p className="text-sm text-slate-400 mt-1">Presiona "Nuevo Ajuste" para registrar una entrada o salida manual de stock.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Producto</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Cantidad</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Stock Anterior</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Stock Actual</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Motivo</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Registrado por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {ajustes.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-sm text-slate-600 font-medium whitespace-nowrap">{a.fecha}</td>
                      <td className="p-4 text-sm text-slate-800 font-bold">{a.producto}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black rounded-full ${
                          a.tipo === 'ENTRADA' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {a.tipo === 'ENTRADA' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {a.tipo}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-bold text-right font-mono">{a.cantidad}</td>
                      <td className="p-4 text-sm text-slate-600 text-right font-mono">{a.stock_anterior}</td>
                      <td className="p-4 text-sm font-bold text-right font-mono">{a.stock_actual}</td>
                      <td className="p-4 text-sm text-slate-600 max-w-[200px] truncate" title={a.motivo}>{a.motivo}</td>
                      <td className="p-4 text-sm text-slate-500 whitespace-nowrap">{a.usuario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
