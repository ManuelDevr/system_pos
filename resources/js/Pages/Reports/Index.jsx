import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { FileDown, FileSpreadsheet, FileText, Calendar, ChevronDown, Building2, Receipt, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Index() {
  const ahora = new Date();
  const [year, setYear] = useState(ahora.getFullYear());
  const [month, setMonth] = useState(ahora.getMonth() + 1);
  const [exporting, setExporting] = useState(null);

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const handleExport = (type, format) => {
    setExporting(`${type}-${format}`);
    const routeName = type === 'rvie' ? 'reportes.rvie.export' : 'reportes.rce.export';
    router.get(route(routeName), { year, month, format }, {
      preserveState: true,
      onFinish: () => setExporting(null),
      onError: (err) => {
        toast.error(Object.values(err).join(', '));
        setExporting(null);
      },
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Contabilidad y Reportes" />
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Contabilidad y Reportes</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Reportes SIRE para SUNAT</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600">
              <Calendar size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Seleccionar Periodo</h3>
              <p className="text-xs text-slate-500">Elige el mes y año del reporte</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="relative">
              <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm font-bold min-w-[160px]">
                {meses.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <input type="number" min="2020" max="2100" value={year} onChange={(e) => setYear(parseInt(e.target.value) || 2026)} className="w-24 pl-4 pr-3 py-2.5 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm font-bold text-center" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600">
                <TrendingUp size={22} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">RVIE</h3>
                <p className="text-xs text-slate-500 font-medium">Registro de Ventas e Ingresos Electrónico</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Reporte con la estructura exacta que solicita SUNAT para el libro electrónico de ventas (RVIE).
              Incluye todas las ventas del periodo con desglose de IGV.
            </p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => handleExport('rvie', 'xlsx')} disabled={exporting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl transition-colors shadow-sm">
                <FileSpreadsheet size={16} />
                {exporting === 'rvie-xlsx' ? 'Exportando...' : 'Excel'}
              </button>
              <button onClick={() => handleExport('rvie', 'csv')} disabled={exporting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:text-slate-300 disabled:bg-white text-slate-700 font-bold text-sm rounded-xl transition-colors">
                <FileText size={16} />
                {exporting === 'rvie-csv' ? 'Exportando...' : 'CSV'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
                <Receipt size={22} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">RCE</h3>
                <p className="text-xs text-slate-500 font-medium">Registro de Compras Electrónico</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Reporte con el resumen de todas las facturas de proveedores ingresadas al sistema.
              Incluye desglose de Base Imponible e IGV para crédito fiscal.
            </p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => handleExport('rce', 'xlsx')} disabled={exporting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl transition-colors shadow-sm">
                <FileSpreadsheet size={16} />
                {exporting === 'rce-xlsx' ? 'Exportando...' : 'Excel'}
              </button>
              <button onClick={() => handleExport('rce', 'csv')} disabled={exporting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:text-slate-300 disabled:bg-white text-slate-700 font-bold text-sm rounded-xl transition-colors">
                <FileText size={16} />
                {exporting === 'rce-csv' ? 'Exportando...' : 'CSV'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
          <h3 className="font-bold text-slate-800 text-sm">Estructura del Reporte</h3>
          <div className="text-xs text-slate-500 space-y-1">
            <p><span className="font-bold text-slate-700">RVIE:</span> Periodo, Correlativo, Fecha, Tipo Comp., Serie, Número, Documento Cliente, RUC/DNI, Razón Social, Base Imponible, IGV, Total, Moneda (PEN), Estado</p>
            <p><span className="font-bold text-slate-700">RCE:</span> Periodo, Correlativo, Fecha Emisión, Fecha Venc., Tipo Comp., Serie, Número, RUC Proveedor, Tipo Doc., Razón Social, Base Imponible, IGV, Total, Moneda (PEN), Estado</p>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
