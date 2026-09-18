import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Receipt, FileSpreadsheet, FileText, Calendar, ChevronDown, DollarSign, ShoppingCart, ListOrdered } from 'lucide-react';

export default function Rce({ year: initialYear, month: initialMonth, summary, preview }) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [exporting, setExporting] = useState(null);

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const handleFilter = () => {
    router.get(route('reportes.rce'), { year, month }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleExport = (format) => {
    setExporting(format);
    const url = route('reportes.rce.export', { year, month, format });
    window.location.href = url;
    setTimeout(() => setExporting(null), 5000);
  };

  return (
    <AuthenticatedLayout>
      <Head title="RCE - Reporte de Compras" />
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-200">
              <Receipt size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">RCE</h1>
              <p className="text-sm text-slate-500 font-medium">Registro de Compras Electrónico — SUNAT</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Mes</label>
              <div className="relative">
                <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border-slate-200 focus:border-amber-500 focus:ring-0 rounded-xl text-sm font-bold min-w-[170px] cursor-pointer">
                  {meses.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Año</label>
              <input type="number" min="2020" max="2100" value={year} onChange={(e) => setYear(parseInt(e.target.value) || 2026)} className="w-24 px-4 py-2.5 bg-slate-50 border-slate-200 focus:border-amber-500 focus:ring-0 rounded-xl text-sm font-bold text-center" />
            </div>
            <button onClick={handleFilter} className="h-11 px-6 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-sm flex items-center gap-2">
              <Calendar size={16} /> Consultar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600"><ListOrdered size={18} /></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registros</span>
            </div>
            <p className="text-3xl font-black text-slate-800">{summary.total_registros}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600"><DollarSign size={18} /></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Imponible</span>
            </div>
            <p className="text-3xl font-black text-slate-800">S/ {Number(summary.total_base_imponible).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600"><Receipt size={18} /></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IGV</span>
            </div>
            <p className="text-3xl font-black text-slate-800">S/ {Number(summary.total_igv).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-violet-100 text-violet-600"><ShoppingCart size={18} /></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
            </div>
            <p className="text-3xl font-black text-slate-800">S/ {Number(summary.total_general).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-700">Vista Previa</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full">{Math.min(preview.length, 25)} de {summary.total_registros} registros</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha</th>
                  <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Comprobante</th>
                  <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo</th>
                  <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Proveedor</th>
                  <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {preview.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 text-sm text-slate-700 font-medium">{row.fecha}</td>
                    <td className="p-3 text-sm text-slate-700 font-mono font-bold">{row.comprobante}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${row.tipo === 'Factura' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                        {row.tipo}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-slate-600">{row.proveedor}</td>
                    <td className="p-3 text-sm text-slate-700 font-bold text-right">S/ {row.total}</td>
                  </tr>
                ))}
                {preview.length === 0 && (
                  <tr><td colSpan="5" className="p-8 text-center text-sm text-slate-400 font-medium">No hay compras en este período</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Exportar Reporte</h3>
              <p className="text-xs text-slate-500 mt-0.5">Descarga el RCE con formato SUNAT para {meses[month - 1]} {year}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleExport('xlsx')} disabled={exporting !== null} className="h-11 px-6 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl transition-all active:scale-95 shadow-sm flex items-center gap-2">
                <FileSpreadsheet size={18} />
                {exporting === 'xlsx' ? 'Exportando...' : 'Excel'}
              </button>
              <button onClick={() => handleExport('csv')} disabled={exporting !== null} className="h-11 px-6 bg-white border-2 border-slate-200 hover:border-amber-300 hover:text-amber-700 disabled:text-slate-300 disabled:border-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all active:scale-95 flex items-center gap-2">
                <FileText size={18} />
                {exporting === 'csv' ? 'Exportando...' : 'CSV'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
