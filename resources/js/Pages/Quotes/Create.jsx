import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    ChevronLeft,
    FileText,
    Minus,
    Phone,
    Plus,
    Search,
    Sparkles,
    Trash2,
    User,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

export default function Create({ productos, lastNumber }) {
    const [clienteNombre, setClienteNombre] = useState('');
    const [clienteTelefono, setClienteTelefono] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [items, setItems] = useState([]);

    const filteredProducts = useMemo(() => {
        if (!searchTerm.trim()) return [];
        const search = searchTerm.toLowerCase();
        return productos
            .filter(
                (p) =>
                    p.nombre.toLowerCase().includes(search) ||
                    (p.sku && p.sku.toLowerCase().includes(search)) ||
                    (p.codigo_barras && p.codigo_barras.includes(search)),
            )
            .slice(0, 12);
    }, [productos, searchTerm]);

    const addItem = (producto) => {
        const exists = items.find((i) => i.producto_id === producto.id);
        if (exists) {
            updateItem(exists.producto_id, 'cantidad', (parseFloat(exists.cantidad) || 1) + 1);
        } else {
            setItems([
                ...items,
                {
                    producto_id: producto.id,
                    producto_nombre: producto.nombre,
                    unidad_medida: producto.unidad_medida,
                    cantidad: '1',
                    precio_unitario: String(parseFloat(producto.precio_venta) || 0),
                    descuento: '0',
                },
            ]);
        }
        setSearchTerm('');
    };

    const updateItem = (producto_id, field, value) => {
        setItems((prev) =>
            prev.map((i) =>
                i.producto_id === producto_id ? { ...i, [field]: value } : i,
            ),
        );
    };

    const changeQty = (producto_id, delta) => {
        setItems((prev) =>
            prev.map((i) => {
                if (i.producto_id !== producto_id) return i;
                const current = parseFloat(i.cantidad);
                const qty = Number.isFinite(current) ? current : 1;
                const next = delta < 0 ? Math.max(qty - 1, 0.01) : qty + 1;
                return { ...i, cantidad: String(Number(next.toFixed(2))) };
            }),
        );
    };

    const removeItem = (producto_id) => {
        setItems(items.filter((i) => i.producto_id !== producto_id));
    };

    const totals = useMemo(() => {
        let bruto = 0;
        let desc = 0;
        items.forEach((i) => {
            const q = parseFloat(i.cantidad) || 0;
            const p = parseFloat(i.precio_unitario) || 0;
            const d = parseFloat(i.descuento) || 0;
            bruto += q * p;
            desc += d;
        });
        const subtotal = Math.max(bruto - desc, 0);
        const igv = subtotal * 0.18;
        return { subtotal, descuento: desc, igv, total: subtotal + igv };
    }, [items]);

    const preventSubmit = (e) => {
        if (e.key === 'Enter') e.preventDefault();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (items.length === 0) {
            toast.error('Agrega al menos un producto');
            return;
        }
        router.post(
            route('cotizaciones.store'),
            {
                cliente_nombre: clienteNombre,
                cliente_telefono: clienteTelefono,
                tipo_comprobante: 'Proforma',
                observaciones: observaciones,
                items: items.map((i) => ({
                    producto_id: i.producto_id,
                    cantidad: i.cantidad,
                    precio_unitario: i.precio_unitario,
                    descuento: i.descuento,
                })),
            },
            {
                onSuccess: () => toast.success('Proforma generada'),
                onError: (err) => toast.error(Object.values(err).join(', ')),
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Nueva Proforma" />

            <div className="-mx-2 -mt-2 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:-mx-4 sm:-mt-4 sm:p-6 lg:-mx-6 lg:-mt-6">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <button
                        onClick={() => router.get(route('cotizaciones.index'))}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-100 active:scale-95"
                    >
                        <ChevronLeft size={16} /> Volver
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Sparkles size={20} className="text-violet-600" />
                            <h1 className="text-xl font-black uppercase tracking-tight text-slate-800 sm:text-2xl">
                                Nueva Proforma
                            </h1>
                        </div>
                        <p className="mt-0.5 text-xs font-medium text-slate-500">
                            Genera una proforma A4 para tu cliente
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-violet-700">
                            {lastNumber || 'PRO-000001'}
                        </span>
                        <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700">
                            IGV 18%
                        </span>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-6 lg:grid-cols-3"
                >
                    {/* Columna izquierda: Datos Generales */}
                    <div className="lg:col-span-1">
                        <section className="space-y-5 rounded-2xl border border-slate-200 p-5 sm:p-6">
                            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-600">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                                    <User size={16} />
                                </span>
                                Datos Generales
                            </h2>

                            {/* Tipo de Comprobante (fijo: Proforma) */}
                            <div className="space-y-2">
                                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500">
                                    Tipo de Comprobante
                                </label>
                                <div className="flex items-center justify-between rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
                                    <span className="flex items-center gap-2 text-sm font-black text-violet-700">
                                        <FileText size={16} />
                                        PROFORMA
                                    </span>
                                    <span className="text-[10px] font-bold uppercase text-violet-400">
                                        No editable
                                    </span>
                                </div>
                            </div>

                            {/* Cliente */}
                            <div className="space-y-3">
                                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500">
                                    Cliente (opcional)
                                </label>
                                <div className="space-y-2.5">
                                    <div className="relative">
                                        <User
                                            size={15}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />
                                        <input
                                            type="text"
                                            value={clienteNombre}
                                            onChange={(e) =>
                                                setClienteNombre(e.target.value)
                                            }
                                            placeholder="Nombre del cliente"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-violet-500 focus:ring-0"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Phone
                                            size={15}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />
                                        <input
                                            type="tel"
                                            value={clienteTelefono}
                                            onChange={(e) =>
                                                setClienteTelefono(
                                                    e.target.value.replace(
                                                        /\D/g,
                                                        '',
                                                    ),
                                                )
                                            }
                                            maxLength="9"
                                            placeholder="Teléfono (opcional)"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-violet-500 focus:ring-0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Observaciones */}
                            <div className="space-y-2">
                                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500">
                                    Observaciones
                                </label>
                                <textarea
                                    rows={2}
                                    value={observaciones}
                                    onChange={(e) =>
                                        setObservaciones(e.target.value)
                                    }
                                    placeholder="Notas adicionales..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-violet-500 focus:ring-0"
                                />
                            </div>

                            {/* Botón Guardar */}
                            <button
                                type="submit"
                                disabled={items.length === 0}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-violet-100 transition-all hover:bg-violet-700 active:scale-[0.98] disabled:opacity-40 disabled:hover:bg-violet-600"
                            >
                                <Sparkles size={20} />
                                Generar Proforma
                            </button>
                            <p className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                La proforma no afecta al stock
                            </p>
                        </section>
                    </div>

                    {/* Columna derecha: Detalles de la Proforma */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        <div className="flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-600">
                                Detalles de la Proforma
                            </h2>
                            <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-500">
                                {items.length} producto
                                {items.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {/* Buscar Producto */}
                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                type="text"
                                autoFocus
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar producto por nombre o código..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-4 text-sm font-medium text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-violet-500 focus:ring-0"
                            />
                            {filteredProducts.length > 0 &&
                                searchTerm.trim() && (
                                    <div className="custom-scrollbar absolute z-30 mt-2 w-full overflow-hidden overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl">
                                        {filteredProducts.map((p) => (
                                            <button
                                                type="button"
                                                key={p.id}
                                                onClick={() => addItem(p)}
                                                className="flex w-full items-center gap-3 border-b border-slate-50 px-4 py-2.5 text-left transition-colors last:border-0 hover:bg-violet-50"
                                            >
                                                <span className="text-slate-400">
                                                    <Plus size={15} />
                                                </span>
                                                <span className="flex-1 truncate text-sm font-bold text-slate-800">
                                                    {p.nombre}
                                                </span>
                                                <span className="text-sm font-semibold text-violet-600">
                                                    S/ {p.precio_venta}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                        </div>

                        {/* Tabla de productos */}
                        <div className="overflow-hidden rounded-2xl border border-slate-200">
                            <div className="custom-scrollbar max-h-[40vh] overflow-y-auto">
                                <table className="w-full text-left">
                                    <thead className="sticky top-0 z-10 bg-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3">
                                                Producto
                                            </th>
                                            <th className="px-3 py-3 text-center">
                                                Cant.
                                            </th>
                                            <th className="px-3 py-3 text-right">
                                                P. Unit.
                                            </th>
                                            <th className="px-3 py-3 text-right">
                                                Desc. (S/)
                                            </th>
                                            <th className="px-3 py-3 text-right">
                                                Total
                                            </th>
                                            <th className="px-2 py-3 text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {items.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-4 py-14 text-center"
                                                >
                                                    <p className="text-sm font-semibold text-slate-400">
                                                        No hay productos en la
                                                        proforma
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                        {items.map((item) => (
                                            <tr key={item.producto_id}>
                                                <td className="px-4 py-3">
                                                    <p className="max-w-[180px] truncate text-sm font-bold text-slate-800">
                                                        {item.producto_nombre}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        Cód: {item.producto_id}
                                                    </p>
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                changeQty(
                                                                    item.producto_id,
                                                                    -1,
                                                                )
                                                            }
                                                            className="p-1.5 text-slate-500 hover:text-violet-600"
                                                        >
                                                            <Minus size={13} />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min="0.01"
                                                            step="any"
                                                            value={item.cantidad}
                                                            onChange={(e) =>
                                                                updateItem(
                                                                    item.producto_id,
                                                                    'cantidad',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            onKeyDown={
                                                                preventSubmit
                                                            }
                                                            className="w-11 bg-transparent text-center text-sm font-black text-slate-800 focus:outline-none"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                changeQty(
                                                                    item.producto_id,
                                                                    1,
                                                                )
                                                            }
                                                            className="p-1.5 text-slate-500 hover:text-violet-600"
                                                        >
                                                            <Plus size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-right">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="any"
                                                        value={
                                                            item.precio_unitario
                                                        }
                                                        onChange={(e) =>
                                                            updateItem(
                                                                item.producto_id,
                                                                'precio_unitario',
                                                                e.target.value,
                                                            )
                                                        }
                                                        onKeyDown={
                                                            preventSubmit
                                                        }
                                                        className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-right text-sm font-bold text-slate-700 focus:border-violet-500 focus:ring-0"
                                                    />
                                                </td>
                                                <td className="px-3 py-3 text-right">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="any"
                                                        value={item.descuento}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                item.producto_id,
                                                                'descuento',
                                                                e.target.value,
                                                            )
                                                        }
                                                        onKeyDown={
                                                            preventSubmit
                                                        }
                                                        className="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-right text-sm font-bold text-slate-700 focus:border-violet-500 focus:ring-0"
                                                    />
                                                </td>
                                                <td className="px-3 py-3 text-right text-sm font-black text-slate-800">
                                                    S/{' '}
                                                    {(
                                                        Math.max(
                                                            (parseFloat(
                                                                item.cantidad,
                                                            ) || 0) *
                                                                (parseFloat(
                                                                    item.precio_unitario,
                                                                ) || 0) -
                                                                (parseFloat(
                                                                    item.descuento,
                                                                ) || 0),
                                                            0,
                                                        )
                                                    ).toFixed(2)}
                                                </td>
                                                <td className="px-2 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeItem(
                                                                item.producto_id,
                                                            )
                                                        }
                                                        className="p-1.5 text-slate-300 transition-colors hover:text-red-500"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Resumen horizontal: Subtotal / IGV / Total */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                    Subtotal
                                </p>
                                <p className="mt-1 text-lg font-black text-slate-700">
                                    S/ {totals.subtotal.toFixed(2)}
                                </p>
                                {totals.descuento > 0 && (
                                    <p className="mt-0.5 text-[10px] font-bold text-rose-500">
                                        - Descuento: S/ {totals.descuento.toFixed(2)}
                                    </p>
                                )}
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                    IGV (18%)
                                </p>
                                <p className="mt-1 text-lg font-black text-slate-700">
                                    S/ {totals.igv.toFixed(2)}
                                </p>
                            </div>
                            <div className="rounded-xl border border-violet-200 bg-violet-600 p-4 text-center shadow-lg shadow-violet-100">
                                <p className="text-[11px] font-black uppercase tracking-widest text-violet-100">
                                    Total
                                </p>
                                <p className="mt-1 text-2xl font-black text-white">
                                    S/ {totals.total.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}