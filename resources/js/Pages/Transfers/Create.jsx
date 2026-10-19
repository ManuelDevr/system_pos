import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowLeftRight, Package, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

export default function Create({ sucursales, productos, origenId, stocks }) {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState('');
    const [cantidad, setCantidad] = useState('');

    const form = useForm({
        sucursal_origen_id: origenId ? String(origenId) : '',
        sucursal_destino_id: '',
        observaciones: '',
        items: [],
    });

    const origenStock = (productoId) => Number(stocks?.[productoId] ?? 0);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return productos.slice(0, 20);
        return productos
            .filter(
                (p) =>
                    p.nombre.toLowerCase().includes(term) ||
                    (p.sku ?? '').toLowerCase().includes(term),
            )
            .slice(0, 20);
    }, [productos, search]);

    const productosById = useMemo(
        () => Object.fromEntries(productos.map((p) => [p.id, p])),
        [productos],
    );

    const destinos = sucursales.filter(
        (s) => String(s.id) !== String(form.data.sucursal_origen_id),
    );

    const handleOrigen = (value) => {
        form.setData('sucursal_origen_id', value);
        form.setData('sucursal_destino_id', '');
        form.setData('items', []);
        router.get(
            route('transferencias.create'),
            { origen_id: value },
            { preserveState: true, replace: true },
        );
    };

    const addItem = () => {
        const productoId = Number(selected);
        const qty = Number(cantidad);

        if (!productoId || !qty || qty <= 0) {
            toast.error('Selecciona un producto y una cantidad valida');
            return;
        }

        const producto = productosById[productoId];
        if (!producto) return;

        if (qty > origenStock(productoId)) {
            toast.error(
                `Stock insuficiente en origen (${origenStock(productoId)})`,
            );
            return;
        }

        if (form.data.items.some((item) => item.producto_id === productoId)) {
            toast.error('El producto ya esta en la lista');
            return;
        }

        form.setData('items', [
            ...form.data.items,
            { producto_id: productoId, nombre: producto.nombre, cantidad: qty },
        ]);
        setSelected('');
        setCantidad('');
    };

    const removeItem = (productoId) => {
        form.setData(
            'items',
            form.data.items.filter((item) => item.producto_id !== productoId),
        );
    };

    const submit = (e) => {
        e.preventDefault();

        if (!form.data.sucursal_origen_id || !form.data.sucursal_destino_id) {
            toast.error('Selecciona sucursal de origen y destino');
            return;
        }

        if (form.data.items.length === 0) {
            toast.error('Agrega al menos un producto');
            return;
        }

        form.post(route('transferencias.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Nueva transferencia" />
            <form onSubmit={submit} className="mx-auto max-w-5xl space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                router.get(route('transferencias.index'))
                            }
                            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition-all hover:text-indigo-600"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800">
                                Nueva transferencia
                            </h1>
                            <p className="text-sm font-medium text-slate-500">
                                Traslada stock entre sucursales
                            </p>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="flex h-11 items-center gap-2 rounded-2xl bg-indigo-600 px-5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
                    >
                        <ArrowLeftRight size={16} /> Registrar
                    </button>
                </div>

                {form.errors.error && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                        {form.errors.error}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
                            Sucursal origen
                        </label>
                        <select
                            value={form.data.sucursal_origen_id}
                            onChange={(e) => handleOrigen(e.target.value)}
                            className="w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium focus:border-indigo-500 focus:ring-0"
                        >
                            <option value="">Seleccionar</option>
                            {sucursales.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.nombre}
                                </option>
                            ))}
                        </select>
                        {form.errors.sucursal_origen_id && (
                            <p className="mt-1 text-xs text-rose-600">
                                {form.errors.sucursal_origen_id}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
                            Sucursal destino
                        </label>
                        <select
                            value={form.data.sucursal_destino_id}
                            onChange={(e) =>
                                form.setData(
                                    'sucursal_destino_id',
                                    e.target.value,
                                )
                            }
                            className="w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium focus:border-indigo-500 focus:ring-0"
                        >
                            <option value="">Seleccionar</option>
                            {destinos.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.nombre}
                                </option>
                            ))}
                        </select>
                        {form.errors.sucursal_destino_id && (
                            <p className="mt-1 text-xs text-rose-600">
                                {form.errors.sucursal_destino_id}
                            </p>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
                            Observaciones
                        </label>
                        <input
                            type="text"
                            value={form.data.observaciones}
                            onChange={(e) =>
                                form.setData('observaciones', e.target.value)
                            }
                            className="w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium focus:border-indigo-500 focus:ring-0"
                            placeholder="Opcional"
                        />
                    </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                        <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600">
                            <Package size={18} />
                        </div>
                        Productos a transferir
                    </h3>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_160px_auto]">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="rounded-xl border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium focus:border-indigo-500 focus:ring-0"
                            placeholder="Buscar producto por nombre o SKU"
                        />
                        <select
                            value={selected}
                            onChange={(e) => setSelected(e.target.value)}
                            className="rounded-xl border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium focus:border-indigo-500 focus:ring-0"
                        >
                            <option value="">Producto</option>
                            {filtered.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.nombre} ({origenStock(p.id)})
                                </option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                step="0.0001"
                                min="0.0001"
                                value={cantidad}
                                onChange={(e) => setCantidad(e.target.value)}
                                className="w-28 rounded-xl border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium focus:border-indigo-500 focus:ring-0"
                                placeholder="Cant."
                            />
                            <button
                                type="button"
                                onClick={addItem}
                                className="flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-slate-900"
                            >
                                <Plus size={14} /> Agregar
                            </button>
                        </div>
                    </div>

                    {form.data.items.length === 0 ? (
                        <p className="py-6 text-center text-sm font-medium text-slate-400">
                            Aun no hay productos en la transferencia
                        </p>
                    ) : (
                        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
                            {form.data.items.map((item) => (
                                <div
                                    key={item.producto_id}
                                    className="flex items-center justify-between gap-3 px-4 py-3"
                                >
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">
                                            {item.nombre}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Cantidad: {item.cantidad} ·
                                            Disponible en origen:{' '}
                                            {origenStock(item.producto_id)}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeItem(item.producto_id)
                                        }
                                        className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:border-rose-300 hover:text-rose-600"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
