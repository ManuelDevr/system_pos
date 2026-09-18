import React, { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Search, Filter, ArrowUpCircle, ArrowDownCircle, ClipboardList, Calendar, User, Package, Image as ImageIcon, Download, X } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import toast from 'react-hot-toast';
import { generateEnhancedPDF } from '@/Utils/pdfGenerator';
import logoSrc from '@/Assets/Logo.jpg';

export default function Kardex({ movimientos, productos, filters }) {
    const { auth, config } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(filters.producto_id || '');
    const [selectedType, setSelectedType] = useState(filters.tipo || 'TODOS');
    const [startDate, setStartDate] = useState(filters.fecha_inicio || '');
    const [endDate, setEndDate] = useState(filters.fecha_fin || '');

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(15);

    const filteredMovimientos = useMemo(() => {
        return movimientos.filter(m => {
            const matchesSearch = m.producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 m.producto.sku.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesProduct = !selectedProduct || m.producto_id === parseInt(selectedProduct);
            const matchesType = selectedType === 'TODOS' || m.tipo_movimiento === selectedType;
            
            return matchesSearch && matchesProduct && matchesType;
        });
    }, [movimientos, searchTerm, selectedProduct, selectedType]);

    const totalPages = Math.ceil(filteredMovimientos.length / rowsPerPage);
    const currentMovimientos = useMemo(() => 
        filteredMovimientos.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage),
        [filteredMovimientos, currentPage, rowsPerPage]
    );

    const applyFilters = () => {
        router.get(route('kardex.index'), {
            producto_id: selectedProduct,
            tipo: selectedType,
            fecha_inicio: startDate,
            fecha_fin: endDate
        }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSelectedProduct('');
        setSelectedType('TODOS');
        setStartDate('');
        setEndDate('');
        router.get(route('kardex.index'));
    };

    const exportToPDF = async () => {
        const headers = ['Fecha', 'Producto', 'Tipo', 'Motivo', 'Cant.', 'Stock Ant.', 'Stock Post.'];
        const body = filteredMovimientos.map(m => [
            new Date(m.created_at).toLocaleString(),
            m.producto.nombre,
            m.tipo_movimiento,
            m.motivo,
            parseInt(m.cantidad, 10),
            parseInt(m.stock_anterior, 10),
            parseInt(m.stock_actual, 10)
        ]);

        const productoNombre = selectedProduct
            ? productos.find(p => p.id === parseInt(selectedProduct))?.nombre || '---'
            : 'Todos los productos';

        const tipoLabels = { TODOS: 'Todos los movimientos', ENTRADA: 'Solo Entradas', SALIDA: 'Solo Salidas' };

        let fechaVal = new Date().toLocaleString();
        if (startDate || endDate) {
            fechaVal = `${startDate || '...'} al ${endDate || '...'}`;
        }

        await generateEnhancedPDF({
            title: 'REPORTE DE KARDEX',
            filename: 'Kardex_Ferreteria_CMA',
            headers,
            body,
            config,
            logoUrl: logoSrc,
            metadata: {
                fecha: fechaVal,
                usuario: auth.user.name,
                producto: productoNombre,
                tipo: tipoLabels[selectedType],
            },
        });
        toast.success('Reporte Kardex generado');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Kardex Permanente" />

            <div className="bg-white shadow-sm rounded-2xl border border-slate-200 flex flex-col min-h-[600px] overflow-hidden">
                <header className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input 
                                    type="text" 
                                    className="w-full md:w-80 pl-10 pr-4 py-2.5 bg-white border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm"
                                    placeholder="Filtrar por nombre o SKU..."
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                />
                            </div>

                            <select
                                value={selectedProduct}
                                onChange={(e) => { setSelectedProduct(e.target.value); setCurrentPage(1); }}
                                className="w-full md:w-64 px-4 py-2.5 bg-white border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm font-bold text-slate-700"
                            >
                                <option value="">Todos los productos</option>
                                {productos.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>

                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input 
                                        type="date" 
                                        className="w-40 pl-10 pr-3 py-2.5 bg-white border-slate-200 rounded-xl text-xs font-bold"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <span className="text-slate-400 font-black text-xs">AL</span>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input 
                                        type="date" 
                                        className="w-40 pl-10 pr-3 py-2.5 bg-white border-slate-200 rounded-xl text-xs font-bold"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    onClick={applyFilters}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                                >
                                    Filtrar
                                </button>
                                <button 
                                    onClick={clearFilters}
                                    className="p-3 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-xl transition-all"
                                    title="Limpiar Filtros"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button 
                                onClick={exportToPDF} 
                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition-all shadow-sm font-bold text-sm"
                            >
                                <Download size={18} className="text-emerald-600" />
                                <span>Descargar PDF</span>
                            </button>
                        </div>
                    </div>
                </header>

                <div className="overflow-x-auto flex-grow custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="p-4">Fecha y Hora</th>
                                <th className="p-4">Producto</th>
                                <th className="p-4 text-center">Tipo</th>
                                <th className="p-4">Motivo</th>
                                <th className="p-4 text-center">Cant.</th>
                                <th className="p-4 text-center">Stock Ant.</th>
                                <th className="p-4 text-center">Stock Post.</th>
                                <th className="p-4">Usuario</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-slate-100">
                            {currentMovimientos.length > 0 ? (
                                currentMovimientos.map((m) => (
                                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700">{new Date(m.created_at).toLocaleDateString()}</span>
                                                <span className="text-[10px] text-slate-400">{new Date(m.created_at).toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center text-slate-400">
                                                    {m.producto.imagen_url ? (
                                                        <img src={m.producto.imagen_url} alt={m.producto.nombre} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon size={16} />
                                                    )}
                                                </div>
                                                <div className="max-w-[200px]">
                                                    <p className="font-bold text-slate-800 truncate">{m.producto.nombre}</p>
                                                    <p className="text-[10px] font-mono text-slate-400">{m.producto.sku}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase border ${
                                                m.tipo_movimiento === 'ENTRADA' 
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                                : 'bg-rose-50 text-rose-700 border-rose-100'
                                            }`}>
                                                {m.tipo_movimiento === 'ENTRADA' ? <ArrowUpCircle size={10} /> : <ArrowDownCircle size={10} />}
                                                {m.tipo_movimiento}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs font-medium text-slate-600">
                                            {m.motivo}
                                        </td>
                                        <td className={`p-4 text-center font-black ${m.tipo_movimiento === 'ENTRADA' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {m.tipo_movimiento === 'ENTRADA' ? '+' : '-'}{parseInt(m.cantidad, 10)}
                                        </td>
                                        <td className="p-4 text-center font-bold text-slate-400">
                                            {parseInt(m.stock_anterior, 10)}
                                        </td>
                                        <td className="p-4 text-center font-black text-slate-800">
                                            {parseInt(m.stock_actual, 10)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[10px] font-bold">
                                                    {m.user.name.charAt(0)}
                                                </div>
                                                <span className="text-xs font-bold text-slate-600">{m.user.name.split(' ')[0]}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="p-20 text-center opacity-40">
                                        <ClipboardList size={48} className="mx-auto text-slate-300 mb-2" />
                                        <p className="font-bold text-slate-400">No se registran movimientos en el Kardex</p>
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
                    totalRecords={filteredMovimientos.length}
                />
            </div>
        </AuthenticatedLayout>
    );
}
