import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { Search, Filter, Eye, FileText, CheckCircle, XCircle, Clock, Calendar, Download, Trash2 } from 'lucide-react';
import CommonModal from '@/Components/CommonModal';
import SaleDetailModal from '@/Components/Sales/SaleDetailModal';
import Pagination from '@/Components/Pagination';
import toast from 'react-hot-toast';
import { generateEnhancedPDF } from '@/Utils/pdfGenerator';
import logoSrc from '@/Assets/Logo.jpg';

const getStatusBadge = (status) => {
  const styles = {
    'Pagado': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Anulado': 'bg-rose-50 text-rose-700 border-rose-100',
    'Pendiente': 'bg-amber-50 text-amber-700 border-amber-100',
  };
  return styles[status] || styles['Pendiente'];
};

const getSunatBadge = (status) => {
  const styles = {
    'ACEPTADO': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'PENDIENTE': 'bg-amber-50 text-amber-700 border-amber-100',
    'ERROR': 'bg-rose-50 text-rose-700 border-rose-100',
    'EXCEPCION': 'bg-rose-50 text-rose-700 border-rose-100',
  };
  return styles[status] || styles['PENDIENTE'];
};

const SunatMiniBadge = ({ sale }) => {
  if (!sale.sunat_envio && !sale.sunat_status) return null;

  const status = sale.sunat_status || 'PENDIENTE';
  const Icon = status === 'ACEPTADO' ? CheckCircle : status === 'PENDIENTE' ? Clock : XCircle;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getSunatBadge(status)}`}>
      <Icon size={9} /> {status}
    </span>
  );
};

const SaleRow = React.memo(({ sale, onOpenDetail }) => {
  const statusClass = getStatusBadge(sale.estado);
  const isAnulado = sale.estado === 'Anulado';

  return (
    <tr className={`hover:bg-slate-50/50 transition-colors ${isAnulado ? 'opacity-60' : ''}`}>
      <td className="p-4 whitespace-nowrap">
        <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-xs font-mono">{sale.nro_comprobante}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Ticket de Venta</span>
        </div>
      </td>
      <td className="p-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                <FileText size={16} />
            </div>
            <div className="max-w-[180px]">
                <p className="text-sm font-bold text-slate-700 truncate">{sale.nombre_cliente || sale.cliente?.nombre || 'Cliente General'}</p>
                <p className="text-[10px] text-slate-400 font-medium">Vendedor: {sale.user?.name}</p>
            </div>
        </div>
      </td>
      <td className="p-4 whitespace-nowrap text-center">
        <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-700">{new Date(sale.created_at).toLocaleDateString()}</span>
            <span className="text-[10px] text-slate-400 font-medium">{new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </td>
      <td className="p-4 whitespace-nowrap text-center text-xs font-bold text-slate-600 uppercase tracking-widest">
        {sale.metodo_pago}
      </td>
      <td className="p-4 whitespace-nowrap text-center">
        <div className="flex flex-col items-center gap-1">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusClass}`}>
            {sale.estado}
          </span>
          <SunatMiniBadge sale={sale} />
        </div>
      </td>
      <td className="p-4 whitespace-nowrap text-right">
        <span className="text-sm font-black text-indigo-600">S/ {parseFloat(sale.total).toFixed(2)}</span>
      </td>
      <td className="p-4 whitespace-nowrap text-right">
        <button 
            onClick={() => onOpenDetail(sale)} 
            className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
            title="Ver Detalle"
        >
            <Eye size={18} />
        </button>
      </td>
    </tr>
  );
});

export default function Index({ ventas }) {
  const { auth, config } = usePage().props;
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredSales = useMemo(() => {
    return ventas.filter(sale => {
      const matchesSearch = sale.nro_comprobante.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (sale.nombre_cliente || sale.cliente?.nombre || 'General').toLowerCase().includes(searchTerm.toLowerCase());
      
      const saleDate = sale.created_at.split('T')[0];
      const matchesDate = (!startDate || saleDate >= startDate) && (!endDate || saleDate <= endDate);
      
      return matchesSearch && matchesDate;
    });
  }, [ventas, searchTerm, startDate, endDate]);

  const totalPages = Math.ceil(filteredSales.length / rowsPerPage);
  const currentSales = useMemo(() => 
    filteredSales.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage),
    [filteredSales, currentPage, rowsPerPage]
  );

  const handleOpenDetail = (sale) => {
    setSelectedSale(sale);
    setDetailModalOpen(true);
  };

  const handleExportPDF = async () => {
    const headers = ['Nro', 'Cliente', 'Fecha', 'Pago', 'Estado', 'Total'];
    const body = filteredSales.map(s => [
      s.nro_comprobante,
      s.nombre_cliente || s.cliente?.nombre || 'General',
      new Date(s.created_at).toLocaleDateString(),
      s.metodo_pago,
      s.estado,
      `S/ ${parseFloat(s.total).toFixed(2)}`
    ]);

    let fechaVal = new Date().toLocaleString();
    if (startDate || endDate) {
      fechaVal = `${startDate || '...'} al ${endDate || '...'}`;
    }

    await generateEnhancedPDF({
        title: 'REPORTE DE VENTAS',
        filename: 'Ventas_Ferreteria_CMA',
        headers,
        body,
        config,
        logoUrl: logoSrc,
        metadata: {
            fecha: fechaVal,
            usuario: auth.user.name,
        },
    });
    toast.success('Reporte generado');
  };

  return (
    <AuthenticatedLayout>
      <Head title="Gestión de Ventas" />

      <div className="bg-white shadow-sm rounded-2xl border border-slate-200 flex flex-col min-h-[600px] overflow-hidden">
        <header className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm shadow-sm"
                  placeholder="Buscar venta..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <input 
                    type="date" 
                    className="px-3 py-2.5 bg-white border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm font-bold text-slate-700 shadow-sm"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                />
                <span className="text-slate-400 font-bold text-xs">al</span>
                <input 
                    type="date" 
                    className="px-3 py-2.5 bg-white border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm font-bold text-slate-700 shadow-sm"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                />
              </div>

              <button 
                onClick={handleExportPDF} 
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition-all shadow-sm font-bold text-sm"
              >
                <Download size={18} className="text-indigo-600" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </header>

        <div className="overflow-x-auto flex-grow custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="p-4">Comprobante</th>
                <th className="p-4">Cliente / Vendedor</th>
                <th className="p-4 text-center">Fecha y Hora</th>
                <th className="p-4 text-center">Método</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4 text-right pr-6">Detalle</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {currentSales.length > 0 ? (
                currentSales.map((sale) => (
                  <SaleRow
                    key={sale.id}
                    sale={sale}
                    onOpenDetail={handleOpenDetail}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                        <FileText size={48} className="text-slate-300 mb-2" />
                        <p className="font-bold text-slate-400">No se encontraron ventas</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(val) => { setRowsPerPage(val); setCurrentPage(1); }}
          totalRecords={filteredSales.length}
        />
      </div>

      <SaleDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        sale={selectedSale}
      />
    </AuthenticatedLayout>
  );
}
