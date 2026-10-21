import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Eye,
    EyeOff,
    Layers,
    Package,
    Plug,
    RefreshCw,
    Search,
    Star,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, tone }) => {
    const tones = {
        indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
        emerald:
            'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
        rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
        slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    };
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
                <div
                    className={`rounded-xl p-2.5 ${tones[tone] || tones.slate}`}
                >
                    <Icon size={18} />
                </div>
                <div>
                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                        {value}
                    </p>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        {label}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default function Index({
    productos,
    categorias,
    resumen,
    logs,
    errores,
    filtro,
    ultimaSync,
    syncConfig,
}) {
    const [busqueda, setBusqueda] = useState('');
    const [seleccion, setSeleccion] = useState([]);
    const [tab, setTab] = useState('catalogo');

    const productosFiltrados = useMemo(() => {
        const q = busqueda.trim().toLowerCase();
        if (!q) return productos;
        return productos.filter(
            (p) =>
                p.nombre?.toLowerCase().includes(q) ||
                p.sku?.toLowerCase().includes(q),
        );
    }, [productos, busqueda]);

    const toggleSeleccion = (id) => {
        setSeleccion((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    const aplicarFiltro = (nuevo) => {
        router.get(
            route('tienda.index'),
            { filtro: nuevo },
            { preserveState: true, preserveScroll: true },
        );
    };

    const bulk = (accion) => {
        if (seleccion.length === 0)
            return toast.error('Selecciona al menos un producto');
        router.post(
            route('tienda.productos.bulk'),
            { ids: seleccion, accion },
            {
                onSuccess: () => {
                    setSeleccion([]);
                    toast.success('Productos actualizados');
                },
                onError: () => toast.error('Error al actualizar'),
            },
        );
    };

    const toggleProducto = (p, campo) => {
        router.put(
            route('tienda.productos.update', p.id),
            { [campo]: !p[campo] },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Actualizado'),
                onError: () => toast.error('Error al actualizar'),
            },
        );
    };

    const toggleCategoria = (c) => {
        router.put(
            route('tienda.categorias.update', c.id),
            { visible_tienda: !c.visible_tienda },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Categoría actualizada'),
                onError: () => toast.error('Error al actualizar'),
            },
        );
    };

    const guardarOrden = (c, valor) => {
        router.put(
            route('tienda.categorias.update', c.id),
            { orden_tienda: valor === '' ? null : Number(valor) },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Orden guardado'),
            },
        );
    };

    const accionSync = (ruta, mensaje) => {
        router.post(
            route(ruta),
            {},
            {
                onSuccess: () => toast.success(mensaje),
                onError: () => toast.error('No se pudo ejecutar la acción'),
            },
        );
    };

    const BadgePublicado = ({ p }) => {
        const publicado =
            p.estado === 'Activo' &&
            p.visible_tienda &&
            (p.categoria?.visible_tienda ?? true) &&
            p.categoria;
        if (publicado) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <CheckCircle2 size={11} /> Publicado
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <EyeOff size={11} /> Oculto
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de tienda web" />
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100">
                            Tienda web
                        </h1>
                        <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                            Controla qué productos y categorías se publican en
                            cma-shop
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() =>
                                accionSync(
                                    'tienda.test-connection',
                                    'Conexión verificada',
                                )
                            }
                            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            <Plug size={14} /> Probar conexión
                        </button>
                        <button
                            onClick={() =>
                                accionSync(
                                    'tienda.sync.productos',
                                    'Sincronización de productos encolada',
                                )
                            }
                            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            <RefreshCw size={14} /> Sync productos
                        </button>
                        <button
                            onClick={() =>
                                accionSync(
                                    'tienda.sync.categorias',
                                    'Sincronización de categorías encolada',
                                )
                            }
                            className="flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95 dark:shadow-none"
                        >
                            <Layers size={14} /> Sync categorías
                        </button>
                    </div>
                </div>

                {!syncConfig.habilitado && (
                    <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
                        <AlertTriangle size={18} />
                        La sincronización está deshabilitada
                        (SYNC_ENABLED=false). Los cambios no llegarán a la
                        tienda.
                    </div>
                )}
                {(!syncConfig.url_configurada ||
                    !syncConfig.token_configurado ||
                    !syncConfig.secreto_configurado) && (
                    <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
                        <AlertTriangle size={18} />
                        Falta configuración de conexión con la tienda (URL,
                        token o secreto).
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <StatCard
                        icon={Package}
                        label="Publicados"
                        value={resumen.publicados}
                        tone="emerald"
                    />
                    <StatCard
                        icon={EyeOff}
                        label="Ocultos"
                        value={resumen.ocultos}
                        tone="slate"
                    />
                    <StatCard
                        icon={Star}
                        label="Destacados"
                        value={resumen.destacados}
                        tone="amber"
                    />
                    <StatCard
                        icon={AlertTriangle}
                        label="Agotados"
                        value={resumen.agotados}
                        tone="rose"
                    />
                </div>

                <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
                    {[
                        { id: 'catalogo', label: 'Catálogo' },
                        {
                            id: 'categorias',
                            label: `Categorías (${resumen.categorias_visibles})`,
                        },
                        { id: 'sync', label: 'Sincronización' },
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`-mb-px border-b-2 px-4 py-2 text-sm font-bold transition-all ${tab === t.id ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {tab === 'catalogo' && (
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                {[
                                    'todos',
                                    'publicados',
                                    'ocultos',
                                    'destacados',
                                ].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => aplicarFiltro(f)}
                                        className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize transition-all ${filtro === f ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <Search
                                    size={15}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    value={busqueda}
                                    onChange={(e) =>
                                        setBusqueda(e.target.value)
                                    }
                                    placeholder="Buscar por nombre o SKU"
                                    className="h-10 w-64 rounded-xl border-slate-200 bg-white pl-9 text-sm font-medium dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                />
                            </div>
                        </div>

                        {seleccion.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-500/30 dark:bg-indigo-500/10">
                                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                    {seleccion.length} seleccionados
                                </span>
                                <button
                                    onClick={() => bulk('publicar')}
                                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white"
                                >
                                    Publicar
                                </button>
                                <button
                                    onClick={() => bulk('ocultar')}
                                    className="rounded-lg bg-slate-600 px-3 py-1.5 text-xs font-bold text-white"
                                >
                                    Ocultar
                                </button>
                                <button
                                    onClick={() => bulk('destacar')}
                                    className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white"
                                >
                                    Destacar
                                </button>
                                <button
                                    onClick={() => bulk('quitar_destacado')}
                                    className="rounded-lg bg-slate-400 px-3 py-1.5 text-xs font-bold text-white"
                                >
                                    Quitar destacado
                                </button>
                            </div>
                        )}

                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-4 py-3"></th>
                                        <th className="px-4 py-3">Producto</th>
                                        <th className="px-4 py-3">Categoría</th>
                                        <th className="px-4 py-3">Stock</th>
                                        <th className="px-4 py-3">Estado</th>
                                        <th className="px-4 py-3 text-right">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {productosFiltrados.map((p) => (
                                        <tr
                                            key={p.id}
                                            className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                                        >
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={seleccion.includes(
                                                        p.id,
                                                    )}
                                                    onChange={() =>
                                                        toggleSeleccion(p.id)
                                                    }
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-bold text-slate-800 dark:text-slate-100">
                                                    {p.nombre}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {p.sku}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                                {p.categoria?.nombre || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                                {p.stock}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap items-center gap-1">
                                                    <BadgePublicado p={p} />
                                                    {p.destacado_tienda && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                                                            <Star size={11} />{' '}
                                                            Destacado
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() =>
                                                            toggleProducto(
                                                                p,
                                                                'visible_tienda',
                                                            )
                                                        }
                                                        title={
                                                            p.visible_tienda
                                                                ? 'Ocultar'
                                                                : 'Publicar'
                                                        }
                                                        className="rounded-lg p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                                                    >
                                                        {p.visible_tienda ? (
                                                            <Eye size={16} />
                                                        ) : (
                                                            <EyeOff size={16} />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            toggleProducto(
                                                                p,
                                                                'destacado_tienda',
                                                            )
                                                        }
                                                        title={
                                                            p.destacado_tienda
                                                                ? 'Quitar destacado'
                                                                : 'Destacar'
                                                        }
                                                        className={`rounded-lg p-2 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${p.destacado_tienda ? 'text-amber-500' : 'text-slate-400'}`}
                                                    >
                                                        <Star size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {productosFiltrados.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-16 text-center text-slate-400"
                                            >
                                                No hay productos para este
                                                filtro.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {tab === 'categorias' && (
                    <div className="space-y-3">
                        {categorias.map((c) => (
                            <div
                                key={c.id}
                                className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`rounded-xl p-2.5 ${c.visible_tienda ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}
                                        >
                                            <Layers size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-slate-100">
                                                {c.nombre}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {c.children?.length || 0}{' '}
                                                subcategorías · {c.estado}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                                            Orden
                                            <input
                                                type="number"
                                                min="0"
                                                defaultValue={
                                                    c.orden_tienda ?? ''
                                                }
                                                onBlur={(e) =>
                                                    guardarOrden(
                                                        c,
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-9 w-20 rounded-lg border-slate-200 bg-white px-2 text-sm font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                            />
                                        </label>
                                        <button
                                            onClick={() => toggleCategoria(c)}
                                            className={`flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-bold transition-all ${c.visible_tienda ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}
                                        >
                                            {c.visible_tienda ? (
                                                <>
                                                    <Eye size={14} /> Visible
                                                </>
                                            ) : (
                                                <>
                                                    <EyeOff size={14} /> Oculta
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {c.children?.length > 0 && (
                                    <div className="mt-3 space-y-1 border-l-2 border-slate-100 pl-4 dark:border-slate-800">
                                        {c.children.map((h) => (
                                            <div
                                                key={h.id}
                                                className="flex items-center justify-between py-1"
                                            >
                                                <span className="text-sm text-slate-600 dark:text-slate-300">
                                                    {h.nombre}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        toggleCategoria(h)
                                                    }
                                                    className={`text-xs font-bold ${h.visible_tienda ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}
                                                >
                                                    {h.visible_tienda
                                                        ? 'Visible'
                                                        : 'Oculta'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'sync' && (
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                Última sincronización correcta
                            </p>
                            <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">
                                {ultimaSync
                                    ? `${ultimaSync.tipo} · ${ultimaSync.referencia} · ${new Date(ultimaSync.created_at).toLocaleString('es-PE')}`
                                    : 'Sin registros'}
                            </p>
                        </div>

                        {errores.length > 0 && (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/30 dark:bg-rose-500/10">
                                <p className="flex items-center gap-2 text-sm font-bold text-rose-700 dark:text-rose-400">
                                    <XCircle size={16} /> {errores.length}{' '}
                                    errores recientes
                                </p>
                                <button
                                    onClick={() =>
                                        accionSync(
                                            'tienda.reintentar',
                                            'Reintento encolado',
                                        )
                                    }
                                    className="mt-3 rounded-xl bg-rose-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white"
                                >
                                    Reintentar todo
                                </button>
                            </div>
                        )}

                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-4 py-3">Fecha</th>
                                        <th className="px-4 py-3">Tipo</th>
                                        <th className="px-4 py-3">
                                            Referencia
                                        </th>
                                        <th className="px-4 py-3">Acción</th>
                                        <th className="px-4 py-3">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {logs.map((l) => (
                                        <tr key={l.id}>
                                            <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                                                {new Date(
                                                    l.created_at,
                                                ).toLocaleString('es-PE')}
                                            </td>
                                            <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-300">
                                                {l.tipo}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                                                {l.referencia}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                                {l.accion}
                                            </td>
                                            <td className="px-4 py-3">
                                                {l.estado === 'ok' ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                        <CheckCircle2
                                                            size={13}
                                                        />{' '}
                                                        OK
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                                                        <XCircle size={13} />{' '}
                                                        Error
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {logs.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-4 py-16 text-center text-slate-400"
                                            >
                                                Sin registros de sincronización.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
