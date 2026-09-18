import React, { useState } from 'react';
import { Plus, X, Trash2, Scale, Save, Barcode, ChevronRight, Package, ListPlus, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { useForm, usePage, router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import JsBarcode from 'jsbarcode';
import jsPDF from 'jspdf';
import { formatFactor } from '@/Utils/format';

export default function ProductUnitManager({ product, onClose }) {
  const { unidades, productos: allProducts = [] } = usePage().props;
  const [showForm, setShowForm] = useState(false);
  const [editingConversion, setEditingConversion] = useState(null);
  
  const { data, setData, post, put, processing, reset, errors, clearErrors } = useForm({
    unidad_id: '',
    cantidad: 1,
    factor: '',
    codigo_barras: '',
    precio_compra: 0,
    precio_venta: '',
    tasa_descuento: 0,
  });

  const handleOpenAdd = () => {
    setEditingConversion(null);
    reset();
    clearErrors();
    setShowForm(true);
  };

  const handleOpenEdit = (conv) => {
    setEditingConversion(conv);
    setData({
        unidad_id: conv.unidad_id,
        cantidad: conv.cantidad || 1,
        factor: conv.factor,
        codigo_barras: conv.codigo_barras || '',
        precio_compra: conv.precio_compra || 0,
        precio_venta: conv.precio_venta,
        tasa_descuento: conv.tasa_descuento || 0,
    });
    clearErrors();
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const options = {
      onSuccess: () => {
        toast.success(editingConversion ? 'Presentación actualizada' : 'Nueva presentación añadida');
        reset();
        setShowForm(false);
        setEditingConversion(null);
        router.reload({ only: ['productos'] });
      },
      onError: (err) => toast.error(Object.values(err)[0])
    };

    if (editingConversion) {
        put(route('productos.conversiones.update', editingConversion.id), options);
    } else {
        post(route('productos.conversiones.store', product.id), options);
    }
  };

  const handleToggleStatus = (id) => {
    router.patch(route('productos.conversiones.toggle', id), {}, {
        onSuccess: () => {
            toast.success('Estado actualizado');
            router.reload({ only: ['productos'] });
        }
    });
  };

  const handlePrintLabel = (conv) => {
    if (!conv.codigo_barras) {
        toast.error('Esta presentación no tiene código de barras');
        return;
    }

    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [50, 30]
    });

    // Configurar texto envuelto
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    
    // Envolver nombre largo
    const nombreCompleto = `${product.nombre} - ${conv.unidad.nombre}`;
    const textoEnvuelto = doc.splitTextToSize(nombreCompleto, 45); // Ancho máximo del label es 50mm, dejamos margen
    
    // Escribir texto (centrado)
    doc.text(textoEnvuelto, 25, 5, { align: 'center' });

    const canvas = document.createElement('canvas');
    try {
        JsBarcode(canvas, conv.codigo_barras, {
            format: conv.codigo_barras.length === 13 ? "EAN13" : "CODE128",
            width: 1.5, // Reducir un poco el ancho para mayor compatibilidad
            height: 35,
            displayValue: true,
            fontSize: 12
        });
    } catch (e) {
        JsBarcode(canvas, conv.codigo_barras, {
            format: "CODE128",
            width: 1.5,
            height: 35,
            displayValue: true,
            fontSize: 12
        });
    }

    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 5, 10, 40, 15);
    doc.setFontSize(6);
    doc.text(`S/ ${parseFloat(conv.precio_venta).toFixed(2)}`, 25, 27, { align: 'center' });
    window.open(doc.output('bloburl'), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header con Botón de Agregar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Scale size={20} />
            </div>
            <div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Unidades Equivalentes</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Unidad Base: {product.unidad_medida}</p>
            </div>
        </div>

        {!showForm && (
            <button 
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-100 active:scale-95"
            >
                <ListPlus size={16} />
                Nueva Conversión
            </button>
        )}
      </div>

      {/* Formulario Desplegable */}
      {showForm && (
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-6">
                <h5 className="text-xs font-black text-slate-700 uppercase tracking-widest">
                    {editingConversion ? `Editando: ${editingConversion.unidad.nombre}` : 'Configurar Nueva Conversión'}
                </h5>
                <button onClick={() => { setShowForm(false); setEditingConversion(null); }} className="text-slate-400 hover:text-rose-500 transition-colors">
                    <X size={18} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Seleccionar Unidad</label>
                        <select 
                            value={data.unidad_id} 
                            onChange={e => setData('unidad_id', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border-slate-200 focus:ring-indigo-500 rounded-xl text-sm font-bold text-slate-700 shadow-sm"
                            required
                        >
                            <option value="">Elegir unidad...</option>
                            {unidades.filter(u => u.nombre !== product.unidad_medida).map(u => <option key={u.id} value={u.id}>{u.nombre} ({u.abreviatura})</option>)}
                        </select>
                        {errors.unidad_id && <p className="text-[10px] text-red-500 mt-1">{errors.unidad_id}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Equivale a (Cantidad)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                step="0.0001" 
                                value={data.factor} 
                                onChange={e => setData('factor', e.target.value)}
                                placeholder="Ej: 12"
                                className="w-full px-4 py-2.5 bg-white border-slate-200 focus:ring-indigo-500 rounded-xl text-sm font-bold shadow-sm"
                                required
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">{product.unidad_medida}</span>
                        </div>
                        {errors.factor && <p className="text-[10px] text-red-500 mt-1">{errors.factor}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Precio de Venta (S/)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">S/</span>
                            <input 
                                type="number" 
                                step="0.01" 
                                value={data.precio_venta} 
                                onChange={e => setData('precio_venta', e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-10 pr-4 py-2.5 bg-white border-slate-200 focus:ring-indigo-500 rounded-xl text-sm font-bold shadow-sm text-indigo-600"
                                required
                            />
                        </div>
                        {errors.precio_venta && <p className="text-[10px] text-red-500 mt-1">{errors.precio_venta}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Descuento (%) (Opcional)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                step="0.01" 
                                min="0"
                                max="99.99"
                                value={data.tasa_descuento} 
                                onChange={e => setData('tasa_descuento', e.target.value)}
                                placeholder="0"
                                className="w-full px-4 py-2.5 bg-white border-slate-200 focus:ring-indigo-500 rounded-xl text-sm font-bold shadow-sm text-rose-500"
                            />
                        </div>
                        {errors.tasa_descuento && <p className="text-[10px] text-red-500 mt-1">{errors.tasa_descuento}</p>}
                    </div>

                    <div className="lg:col-span-2 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Código de Barras Específico (Opcional)</label>
                        <div className="flex gap-2">
                            <div className="relative flex-grow">
                                <Barcode size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input 
                                    type="text" 
                                    value={data.codigo_barras} 
                                    onChange={e => setData('codigo_barras', e.target.value)}
                                    placeholder="Escanear código..."
                                    className="w-full pl-12 pr-4 py-2.5 bg-white border-slate-200 focus:ring-indigo-500 rounded-xl text-sm font-bold shadow-sm"
                                />
                            </div>
                            <button 
                                type="button"
                                onClick={() => {
                                    let isUnique = false;
                                    let generatedCode = '';
                                    let attempts = 0;
                                    while (!isUnique && attempts < 100) {
                                        attempts++;
                                        generatedCode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
                                        const existsInProducts = allProducts.some(p => p.codigo_barras === generatedCode || (p.conversiones && p.conversiones.some(c => c.codigo_barras === generatedCode)));
                                        if (!existsInProducts) {
                                            isUnique = true;
                                        }
                                    }
                                    setData('codigo_barras', generatedCode);
                                    toast.success('Código numérico generado correctamente');
                                }}
                                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all font-bold text-xs flex items-center gap-2 border border-indigo-100 whitespace-nowrap"
                                title="Generar código de barras numérico único"
                            >
                                <Plus size={14} />
                                Generar
                            </button>
                        </div>
                        {errors.codigo_barras && <p className="text-[10px] text-red-500 mt-1">{errors.codigo_barras}</p>}
                    </div>

                    <div className="flex items-end">
                        <button 
                            type="submit" 
                            disabled={processing}
                            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Save size={18} /> 
                            {processing ? 'Guardando...' : (editingConversion ? 'Actualizar Cambios' : 'Guardar Presentación')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
      )}

      {/* Tabla de Presentaciones */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Unidad Presentación</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Factor de Conversión</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Precio Venta</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Código de Barras</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-6">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {product.conversiones && product.conversiones.length > 0 ? product.conversiones.map((conv) => {
                        const isActive = conv.estado === 'Activo';
                        return (
                            <tr key={conv.id} className={`hover:bg-slate-50/30 transition-colors group ${!isActive ? 'opacity-60' : ''}`}>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-sm ${isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                            {conv.unidad.abreviatura}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${isActive ? 'text-slate-700' : 'text-slate-400 line-through'}`}>{conv.unidad.nombre}</p>
                                            {!isActive && <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">Inactivo</span>}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 border border-slate-200">
                                        <span className="text-indigo-600">1</span>
                                        <ChevronRight size={12} className="text-slate-300" />
                                        <span>{formatFactor(conv.factor)} {product.unidad_medida}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <span className={`text-sm font-black ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>S/ {parseFloat(conv.precio_venta).toFixed(2)}</span>
                                </td>
                                <td className="p-4 text-center">
                                    {conv.codigo_barras ? (
                                        <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-mono font-bold text-slate-500">{conv.codigo_barras}</span>
                                    ) : (
                                        <span className="text-slate-300 text-[10px] uppercase font-bold">Sin Código</span>
                                    )}
                                </td>
                                <td className="p-4 text-right pr-6">
                                    <div className="flex gap-2 justify-end">
                                        <button 
                                            onClick={() => handlePrintLabel(conv)}
                                            className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                            title="Imprimir Etiqueta"
                                        >
                                            <Barcode size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleOpenEdit(conv)}
                                            className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                                            title="Editar"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleToggleStatus(conv.id)}
                                            className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                            title={isActive ? 'Desactivar' : 'Activar'}
                                        >
                                            {isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    }) : (
                        <tr>
                            <td colSpan="5" className="p-12 text-center">
                                <div className="flex flex-col items-center opacity-30">
                                    <Package size={48} className="text-slate-300 mb-2" />
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Sin presentaciones registradas</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button 
            onClick={onClose}
            className="px-8 py-3 bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
        >
            Cerrar Ventana
        </button>
      </div>
    </div>
  );
}
