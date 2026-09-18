import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus, Package, FileText, Download, Filter, Calendar, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateEnhancedPDF } from '@/Utils/pdfGenerator';
import logoSrc from '@/Assets/Logo.jpg';

export default function Index({ compras }) {
  const { auth, config } = usePage().props;

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCompras = useMemo(() => {
    return compras.filter(c => {
      const q = searchTerm.toLowerCase();
      if (searchTerm && !c.nro_comprobante.toLowerCase().includes(q) && !c.proveedor.toLowerCase().includes(q)) return false;
      const fecha = new Date(c.created_at);
      if (fechaInicio && fecha < new Date(fechaInicio + 'T00:00:00')) return false;
      if (fechaFin && fecha > new Date(fechaFin + 'T23:59:59')) return false;
      return true;
    });
  }, [compras, searchTerm, fechaInicio, fechaFin]);

  const activas = filteredCompras.filter(c => c.estado !== 'Anulado');
  const anuladas = filteredCompras.filter(c => c.estado === 'Anulado');
  const totalActivas = activas.reduce((sum, c) => sum + parseFloat(c.total || 0), 0);
  const totalAnuladas = anuladas.reduce((sum, c) => sum + parseFloat(c.total || 0), 0);

  const handleExportPDF = async () => {
    const headers = ['Nro', 'Proveedor', 'Productos', 'Total', 'Fecha'];
    const body = filteredCompras.map(c => [
      c.nro_comprobante,
      c.proveedor,
      c.detalles.length + ' producto(s)',
      `S/ ${parseFloat(c.total).toFixed(2)}`,
      new Date(c.created_at).toLocaleDateString(),
    ]);

    await generateEnhancedPDF({
      title: 'REPORTE DE COMPRAS',
      filename: 'Compras_CMA',
      headers,
      body,
      config,
      logoUrl: logoSrc,
      metadata: {
        fecha: new Date().toLocaleString(),
        usuario: auth.user.name,
      },
    });
    toast.success('Reporte generado');
  };

  return (
    <AuthenticatedLayout>
      <Head title="Compras" />

      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 flex-1 min-w-0 w-full sm:w-auto">
            <Search size={16} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-700 font-semibold focus:outline-none placeholder:text-slate-400"
              placeholder="Buscar por comprobante o proveedor..."
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 min-w-[140px] w-full sm:w-auto">
            <Calendar size={16} className="text-slate-400 flex-shrink-0" />
            <input
              type="date"
              value={fechaInicio}
              onChange={e => setFechaInicio(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-700 font-semibold focus:outline-none [color-scheme:light]"
            />
          </div>
          <span className="text-slate-300 text-sm self-center hidden sm:inline">—</span>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 min-w-[140px] w-full sm:w-auto">
            <Calendar size={16} className="text-slate-400 flex-shrink-0" />
            <input
              type="date"
              value={fechaFin}
              onChange={e => setFechaFin(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-700 font-semibold focus:outline-none [color-scheme:light]"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto sm:ml-auto">
            <button
              onClick={() => {}}
              className="h-11 px-5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center gap-2 text-sm font-bold transition-all shadow-lg shadow-purple-200 active:scale-95 flex-1 sm:flex-none justify-center"
            >
              <Filter size={16} />
              Filtrar
            </button>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm min-w-[150px] flex-1">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Activas</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 leading-tight">S/ {totalActivas.toFixed(2)}</p>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">{activas.length} compras</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm min-w-[150px] flex-1">
            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Anuladas</p>
            <p className="text-xl sm:text-2xl font-black text-red-600 mt-1 leading-tight">S/ {totalAnuladas.toFixed(2)}</p>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">{anuladas.length} compras</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-2xl border border-slate-200 flex flex-col min-h-[600px] overflow-hidden">
        <header className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Compras</h2>
              <p className="text-xs text-slate-500 font-bold">Registro de compras y entrada de stock</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition-all shadow-sm font-bold text-sm"
              >
                <Download size={18} className="text-indigo-600" />
                PDF
              </button>
              <Link
                href={route('compras.create')}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 active:scale-95"
              >
                <Plus size={20} />
                Nueva Compra
              </Link>
            </div>
          </div>
        </header>

        <div className="overflow-x-auto flex-grow custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="p-4">Comprobante</th>
                <th className="p-4">Proveedor</th>
                <th className="p-4 text-center">Productos</th>
                <th className="p-4 text-right">Subtotal</th>
                <th className="p-4 text-right">IGV</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4 text-center">Fecha</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {filteredCompras.length > 0 ? filteredCompras.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-slate-800 text-xs font-mono">{c.nro_comprobante}</span>
                  </td>
                  <td className="p-4">
                    <div className="max-w-[200px]">
                      <p className="font-bold text-slate-700 truncate">{c.proveedor}</p>
                      {c.ruc_dni && <p className="text-[10px] text-slate-400 font-mono">{c.ruc_dni}</p>}
                    </div>
                  </td>
                  <td className="p-4 text-center text-sm font-bold text-slate-600">
                    {c.detalles.length}
                  </td>
                  <td className="p-4 text-right font-bold text-slate-600">
                    S/ {parseFloat(c.subtotal).toFixed(2)}
                  </td>
                  <td className="p-4 text-right font-bold text-slate-600">
                    S/ {parseFloat(c.igv).toFixed(2)}
                  </td>
                  <td className="p-4 text-right font-black text-indigo-600">
                    S/ {parseFloat(c.total).toFixed(2)}
                  </td>
                  <td className="p-4 text-center text-xs text-slate-500">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="p-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <Package size={48} className="text-slate-300 mb-2" />
                      <p className="font-bold text-slate-400">No hay compras registradas</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
