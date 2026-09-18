import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Search, Plus, Trash2, Package, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Create({ productos, lastNumber }) {
  const [proveedor, setProveedor] = useState('');
  const [rucDni, setRucDni] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [tipoComprobante, setTipoComprobante] = useState('Boleta');
  const [observaciones, setObservaciones] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState([]);

  const filteredProducts = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addItem = (producto) => {
    const exists = items.find(i => i.producto_id === producto.id);
    if (exists) {
      toast.error('Este producto ya está agregado');
      return;
    }
    setItems([...items, {
      producto_id: producto.id,
      producto_nombre: producto.nombre,
      unidad_medida: producto.unidad_medida,
      cantidad: 1,
      precio_compra: parseFloat(producto.precio_compra) || 0,
    }]);
    setSearchTerm('');
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const totals = useMemo(() => {
    const sub = items.reduce((acc, i) => acc + (parseFloat(i.cantidad) || 0) * (parseFloat(i.precio_compra) || 0), 0);
    const igv = sub * 0.18;
    return {
      subtotal: sub,
      igv,
      total: sub + igv,
    };
  }, [items]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!proveedor) {
      toast.error('Ingresa el nombre del proveedor');
      return;
    }
    if (items.length === 0) {
      toast.error('Agrega al menos un producto');
      return;
    }

    router.post(route('compras.store'), {
      proveedor,
      ruc_dni: rucDni,
      direccion,
      telefono,
      email,
      tipo_comprobante: tipoComprobante,
      observaciones,
      items: items.map(i => ({
        producto_id: i.producto_id,
        cantidad: i.cantidad,
        precio_compra: i.precio_compra,
      })),
    }, {
      onError: (err) => toast.error(Object.values(err).join(', ')),
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Nueva Compra" />

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.get(route('compras.index'))}
                className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Nueva Compra</h2>
                <p className="text-xs text-slate-500 font-mono">{lastNumber}</p>
              </div>
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 active:scale-95"
            >
              Registrar Compra
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Proveedor *</label>
              <input
                type="text"
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm font-bold"
                placeholder="Nombre del proveedor"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">RUC / DNI</label>
              <input
                type="text"
                value={rucDni}
                onChange={(e) => setRucDni(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm"
                placeholder="20123456789"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Teléfono</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm"
                placeholder="999888777"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Dirección</label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm"
                placeholder="Av. Principal 123"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm"
                placeholder="proveedor@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Tipo Comprobante</label>
              <select
                value={tipoComprobante}
                onChange={(e) => setTipoComprobante(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm font-bold text-slate-700"
              >
                <option value="Boleta">Boleta</option>
                <option value="Factura">Factura</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Observaciones</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm"
              rows="2"
              placeholder="Notas adicionales..."
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 bg-white border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm"
                placeholder="Buscar producto para agregar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchTerm && (
              <div className="mt-2 max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                {filteredProducts.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addItem(p)}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center justify-between"
                  >
                    <span>{p.nombre}</span>
                    <span className="text-xs text-slate-400 font-mono">Stock: {parseInt(p.stock, 10)} | S/ {parseFloat(p.precio_compra || 0).toFixed(2)}</span>
                  </button>
                ))}
                {filteredProducts.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-3 font-bold">Sin resultados</p>
                )}
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="p-4">Producto</th>
                  <th className="p-4 text-center w-[120px]">Unidad</th>
                  <th className="p-4 text-center w-[120px]">Cantidad</th>
                  <th className="p-4 text-right w-[150px]">P. Compra</th>
                  <th className="p-4 text-right w-[150px]">Subtotal</th>
                  <th className="p-4 text-center w-[60px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-4 font-bold text-slate-700 text-sm">{item.producto_nombre}</td>
                    <td className="p-4 text-center text-sm text-slate-500">{item.unidad_medida}</td>
                    <td className="p-4 text-center">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={item.cantidad}
                        onChange={(e) => updateItem(idx, 'cantidad', e.target.value)}
                        className="w-20 px-2 py-1.5 bg-white border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-lg text-sm font-bold text-center"
                      />
                    </td>
                    <td className="p-4 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.precio_compra}
                        onChange={(e) => updateItem(idx, 'precio_compra', e.target.value)}
                        className="w-28 px-2 py-1.5 bg-white border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-lg text-sm font-bold text-right"
                      />
                    </td>
                    <td className="p-4 text-right font-bold text-slate-800">
                      S/ {((parseFloat(item.cantidad) || 0) * (parseFloat(item.precio_compra) || 0)).toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-12 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <Package size={40} className="text-slate-300 mb-2" />
                        <p className="font-bold text-slate-400 text-sm">Busca y selecciona productos para agregar</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-indigo-50/50">
                <tr>
                  <td colSpan="4" className="p-4 text-right font-bold text-slate-500 uppercase text-xs">Subtotal</td>
                  <td className="p-4 text-right font-bold text-slate-700">S/ {totals.subtotal.toFixed(2)}</td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan="4" className="p-4 text-right font-bold text-slate-500 uppercase text-xs">IGV (18%)</td>
                  <td className="p-4 text-right font-bold text-slate-700">S/ {totals.igv.toFixed(2)}</td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan="4" className="p-4 text-right font-bold text-slate-800 uppercase text-sm">Total</td>
                  <td className="p-4 text-right font-black text-indigo-600 text-lg">S/ {totals.total.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </form>
    </AuthenticatedLayout>
  );
}
