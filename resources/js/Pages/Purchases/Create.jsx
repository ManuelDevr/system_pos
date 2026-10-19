import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { ChevronLeft, Package, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

export default function Create({ productos, lastNumber, sucursales = [] }) {
    const [proveedor, setProveedor] = useState('');
    const [rucDni, setRucDni] = useState('');
    const [direccion, setDireccion] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [tipoComprobante, setTipoComprobante] = useState('Boleta');
    const [sucursalId, setSucursalId] = useState(() => {
        const principal = sucursales.find((s) => s.principal) ?? sucursales[0];
        return principal ? principal.id : '';
    });
    const [observaciones, setObservaciones] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [items, setItems] = useState([]);

    const filteredProducts = productos.filter(
        (p) =>
            p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())),
    );

    const addItem = (producto) => {
        const exists = items.find((i) => i.producto_id === producto.id);
        if (exists) {
            toast.error('Este producto ya está agregado');
            return;
        }
        setItems([
            ...items,
            {
                producto_id: producto.id,
                producto_nombre: producto.nombre,
                unidad_medida: producto.unidad_medida,
                cantidad: 1,
                precio_compra: parseFloat(producto.precio_compra) || 0,
            },
        ]);
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
        const sub = items.reduce(
            (acc, i) =>
                acc +
                (parseFloat(i.cantidad) || 0) *
                    (parseFloat(i.precio_compra) || 0),
            0,
        );
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

        router.post(
            route('compras.store'),
            {
                proveedor,
                ruc_dni: rucDni,
                direccion,
                telefono,
                email,
                tipo_comprobante: tipoComprobante,
                sucursal_id: sucursalId || null,
                observaciones,
                items: items.map((i) => ({
                    producto_id: i.producto_id,
                    cantidad: i.cantidad,
                    precio_compra: i.precio_compra,
                })),
            },
            {
                onError: (err) => toast.error(Object.values(err).join(', ')),
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Nueva Compra" />

            <form
                onSubmit={handleSubmit}
                className="mx-auto max-w-5xl space-y-6"
            >
                <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    router.get(route('compras.index'))
                                }
                                className="rounded-xl bg-slate-50 p-2 text-slate-500 transition-colors hover:bg-slate-100"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div>
                                <h2 className="text-lg font-black uppercase tracking-tight text-slate-800">
                                    Nueva Compra
                                </h2>
                                <p className="font-mono text-xs text-slate-500">
                                    {lastNumber}
                                </p>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95"
                        >
                            Registrar Compra
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
                                Proveedor *
                            </label>
                            <input
                                type="text"
                                value={proveedor}
                                onChange={(e) => setProveedor(e.target.value)}
                                className="w-full rounded-xl border-slate-200 bg-white px-4 py-2.5 text-sm font-bold focus:border-indigo-500 focus:ring-0"
                                placeholder="Nombre del proveedor"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
                                RUC / DNI
                            </label>
                            <input
                                type="text"
                                value={rucDni}
                                onChange={(e) => setRucDni(e.target.value)}
                                className="w-full rounded-xl border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-0"
                                placeholder="20123456789"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
                                Teléfono
                            </label>
                            <input
                                type="text"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                className="w-full rounded-xl border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-0"
                                placeholder="999888777"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
                                Dirección
                            </label>
                            <input
                                type="text"
                                value={direccion}
                                onChange={(e) => setDireccion(e.target.value)}
                                className="w-full rounded-xl border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-0"
                                placeholder="Av. Principal 123"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-0"
                                placeholder="proveedor@email.com"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
                                Tipo Comprobante
                            </label>
                            <select
                                value={tipoComprobante}
                                onChange={(e) =>
                                    setTipoComprobante(e.target.value)
                                }
                                className="w-full rounded-xl border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:ring-0"
                            >
                                <option value="Boleta">Boleta</option>
                                <option value="Factura">Factura</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
                                Sucursal destino
                            </label>
                            <select
                                value={sucursalId}
                                onChange={(e) => setSucursalId(e.target.value)}
                                className="w-full rounded-xl border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:ring-0"
                            >
                                {sucursales.map((sucursal) => (
                                    <option
                                        key={sucursal.id}
                                        value={sucursal.id}
                                    >
                                        {sucursal.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
                            Observaciones
                        </label>
                        <textarea
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            className="w-full rounded-xl border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-0"
                            rows="2"
                            placeholder="Notas adicionales..."
                        />
                    </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-slate-50/30 px-6 py-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                className="w-full rounded-xl border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-0"
                                placeholder="Buscar producto para agregar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {searchTerm && (
                            <div className="custom-scrollbar mt-2 max-h-40 space-y-1 overflow-y-auto">
                                {filteredProducts.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => addItem(p)}
                                        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left text-sm font-bold transition-all hover:border-indigo-200 hover:bg-indigo-50"
                                    >
                                        <span>{p.nombre}</span>
                                        <span className="font-mono text-xs text-slate-400">
                                            Stock: {parseInt(p.stock, 10)} | S/{' '}
                                            {parseFloat(
                                                p.precio_compra || 0,
                                            ).toFixed(2)}
                                        </span>
                                    </button>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <p className="py-3 text-center text-xs font-bold text-slate-400">
                                        Sin resultados
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <tr>
                                    <th className="p-4">Producto</th>
                                    <th className="w-[120px] p-4 text-center">
                                        Unidad
                                    </th>
                                    <th className="w-[120px] p-4 text-center">
                                        Cantidad
                                    </th>
                                    <th className="w-[150px] p-4 text-right">
                                        P. Compra
                                    </th>
                                    <th className="w-[150px] p-4 text-right">
                                        Subtotal
                                    </th>
                                    <th className="w-[60px] p-4 text-center"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="p-4 text-sm font-bold text-slate-700">
                                            {item.producto_nombre}
                                        </td>
                                        <td className="p-4 text-center text-sm text-slate-500">
                                            {item.unidad_medida}
                                        </td>
                                        <td className="p-4 text-center">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={item.cantidad}
                                                onChange={(e) =>
                                                    updateItem(
                                                        idx,
                                                        'cantidad',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-20 rounded-lg border-slate-200 bg-white px-2 py-1.5 text-center text-sm font-bold focus:border-indigo-500 focus:ring-0"
                                            />
                                        </td>
                                        <td className="p-4 text-right">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={item.precio_compra}
                                                onChange={(e) =>
                                                    updateItem(
                                                        idx,
                                                        'precio_compra',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-28 rounded-lg border-slate-200 bg-white px-2 py-1.5 text-right text-sm font-bold focus:border-indigo-500 focus:ring-0"
                                            />
                                        </td>
                                        <td className="p-4 text-right font-bold text-slate-800">
                                            S/{' '}
                                            {(
                                                (parseFloat(item.cantidad) ||
                                                    0) *
                                                (parseFloat(
                                                    item.precio_compra,
                                                ) || 0)
                                            ).toFixed(2)}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(idx)}
                                                className="rounded-lg p-1.5 text-rose-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="p-12 text-center"
                                        >
                                            <div className="flex flex-col items-center opacity-40">
                                                <Package
                                                    size={40}
                                                    className="mb-2 text-slate-300"
                                                />
                                                <p className="text-sm font-bold text-slate-400">
                                                    Busca y selecciona productos
                                                    para agregar
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="bg-indigo-50/50">
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="p-4 text-right text-xs font-bold uppercase text-slate-500"
                                    >
                                        Subtotal
                                    </td>
                                    <td className="p-4 text-right font-bold text-slate-700">
                                        S/ {totals.subtotal.toFixed(2)}
                                    </td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="p-4 text-right text-xs font-bold uppercase text-slate-500"
                                    >
                                        IGV (18%)
                                    </td>
                                    <td className="p-4 text-right font-bold text-slate-700">
                                        S/ {totals.igv.toFixed(2)}
                                    </td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="p-4 text-right text-sm font-bold uppercase text-slate-800"
                                    >
                                        Total
                                    </td>
                                    <td className="p-4 text-right text-lg font-black text-indigo-600">
                                        S/ {totals.total.toFixed(2)}
                                    </td>
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
