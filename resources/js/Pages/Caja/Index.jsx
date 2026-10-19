import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Lock,
    Receipt,
    TrendingUp,
    Unlock,
    Wallet,
} from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const money = (v) => `S/ ${parseFloat(v || 0).toFixed(2)}`;

export default function Index({ caja, sucursales, ultimaCaja }) {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const abrirForm = useForm({
        monto_inicial: '',
        sucursal_id: '',
        notas: '',
    });
    const movForm = useForm({ tipo: 'Ingreso', monto: '', motivo: '' });
    const cerrarForm = useForm({ monto_contado: '', notas: '' });

    const handleAbrir = (e) => {
        e.preventDefault();
        abrirForm.post(route('caja.abrir'), {
            onSuccess: () => abrirForm.reset(),
        });
    };

    const handleMovimiento = (e) => {
        e.preventDefault();
        movForm.post(route('caja.movimiento'), {
            onSuccess: () => movForm.reset('monto', 'motivo'),
        });
    };

    const handleCerrar = (e) => {
        e.preventDefault();
        cerrarForm.post(route('caja.cerrar'), {
            onSuccess: () => cerrarForm.reset(),
        });
    };

    if (!caja) {
        return (
            <AuthenticatedLayout>
                <Head title="Caja" />
                <div className="mx-auto mt-10 max-w-lg">
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black uppercase tracking-tight text-slate-800">
                                    Abrir Caja
                                </h2>
                                <p className="text-xs font-bold text-slate-500">
                                    No tienes un turno abierto
                                </p>
                            </div>
                        </div>

                        {ultimaCaja && (
                            <p className="mb-4 text-xs text-slate-500">
                                Última caja cerrada:{' '}
                                {new Date(
                                    ultimaCaja.cerrada_en,
                                ).toLocaleString()}{' '}
                                — esperado {money(ultimaCaja.monto_esperado)}
                            </p>
                        )}

                        <form onSubmit={handleAbrir} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-slate-500">
                                    Monto inicial
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={abrirForm.data.monto_inicial}
                                    onChange={(e) =>
                                        abrirForm.setData(
                                            'monto_inicial',
                                            e.target.value,
                                        )
                                    }
                                    className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                    placeholder="0.00"
                                />
                                {abrirForm.errors.monto_inicial && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {abrirForm.errors.monto_inicial}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-slate-500">
                                    Sucursal (opcional)
                                </label>
                                <select
                                    value={abrirForm.data.sucursal_id}
                                    onChange={(e) =>
                                        abrirForm.setData(
                                            'sucursal_id',
                                            e.target.value,
                                        )
                                    }
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                >
                                    <option value="">Sin sucursal</option>
                                    {sucursales.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={abrirForm.processing}
                                className="h-11 w-full rounded-xl bg-indigo-600 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 disabled:opacity-50"
                            >
                                <Unlock size={16} className="mr-2 inline" />{' '}
                                Abrir Caja
                            </button>
                        </form>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title="Caja" />

            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tight text-slate-800">
                            Caja abierta
                        </h1>
                        <p className="text-xs font-bold text-slate-500">
                            Turno iniciado{' '}
                            {new Date(caja.abierta_en).toLocaleString()}
                            {caja.sucursal ? ` · ${caja.sucursal.nombre}` : ''}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Monto inicial
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-800">
                        {money(caja.monto_inicial)}
                    </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                        Ventas efectivo
                    </p>
                    <p className="mt-1 text-2xl font-black text-emerald-600">
                        {money(caja.total_ventas_efectivo)}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold text-slate-400">
                        {caja.cantidad_ventas} ventas (
                        {money(caja.total_ventas)})
                    </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                        Ingresos / Egresos
                    </p>
                    <p className="mt-1 text-2xl font-black text-indigo-600">
                        {money(caja.total_ingresos)}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold text-red-500">
                        - {money(caja.total_egresos)}
                    </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Esperado en caja
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-800">
                        {money(caja.monto_esperado_actual)}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
                    <header className="border-b border-slate-100 bg-slate-50/30 px-5 py-4">
                        <h2 className="text-sm font-black uppercase tracking-tight text-slate-800">
                            Movimientos del turno
                        </h2>
                    </header>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <tr>
                                    <th className="p-3">Tipo</th>
                                    <th className="p-3">Motivo</th>
                                    <th className="p-3">Usuario</th>
                                    <th className="p-3 text-right">Monto</th>
                                    <th className="p-3 text-center">Hora</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {caja.movimientos.length > 0 ? (
                                    caja.movimientos.map((m) => (
                                        <tr
                                            key={m.id}
                                            className="hover:bg-slate-50/50"
                                        >
                                            <td className="p-3">
                                                <span
                                                    className={`inline-flex items-center gap-1 text-xs font-bold ${m.tipo === 'Ingreso' ? 'text-emerald-600' : 'text-red-500'}`}
                                                >
                                                    {m.tipo === 'Ingreso' ? (
                                                        <ArrowUpCircle
                                                            size={14}
                                                        />
                                                    ) : (
                                                        <ArrowDownCircle
                                                            size={14}
                                                        />
                                                    )}
                                                    {m.tipo}
                                                </span>
                                            </td>
                                            <td className="p-3 text-slate-600">
                                                {m.motivo}
                                            </td>
                                            <td className="p-3 text-xs text-slate-500">
                                                {m.user?.name}
                                            </td>
                                            <td
                                                className={`p-3 text-right font-bold ${m.tipo === 'Ingreso' ? 'text-emerald-600' : 'text-red-500'}`}
                                            >
                                                {money(m.monto)}
                                            </td>
                                            <td className="p-3 text-center text-xs text-slate-400">
                                                {new Date(
                                                    m.created_at,
                                                ).toLocaleTimeString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="p-10 text-center text-xs font-bold text-slate-400"
                                        >
                                            Sin movimientos manuales
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-tight text-slate-800">
                            <TrendingUp size={16} className="text-indigo-600" />{' '}
                            Registrar movimiento
                        </h2>
                        <form onSubmit={handleMovimiento} className="space-y-3">
                            <select
                                value={movForm.data.tipo}
                                onChange={(e) =>
                                    movForm.setData('tipo', e.target.value)
                                }
                                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            >
                                <option value="Ingreso">Ingreso</option>
                                <option value="Egreso">Egreso</option>
                            </select>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={movForm.data.monto}
                                onChange={(e) =>
                                    movForm.setData('monto', e.target.value)
                                }
                                placeholder="Monto"
                                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                            {movForm.errors.monto && (
                                <p className="text-xs text-red-500">
                                    {movForm.errors.monto}
                                </p>
                            )}
                            <input
                                type="text"
                                value={movForm.data.motivo}
                                onChange={(e) =>
                                    movForm.setData('motivo', e.target.value)
                                }
                                placeholder="Motivo"
                                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                            {movForm.errors.motivo && (
                                <p className="text-xs text-red-500">
                                    {movForm.errors.motivo}
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={movForm.processing}
                                className="h-10 w-full rounded-xl bg-slate-800 text-sm font-bold text-white transition-all hover:bg-slate-900 disabled:opacity-50"
                            >
                                Registrar
                            </button>
                        </form>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-tight text-slate-800">
                            <Lock size={16} className="text-red-500" /> Cerrar
                            caja
                        </h2>
                        <form onSubmit={handleCerrar} className="space-y-3">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                                <span>Esperado</span>
                                <span className="text-slate-800">
                                    {money(caja.monto_esperado_actual)}
                                </span>
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={cerrarForm.data.monto_contado}
                                onChange={(e) =>
                                    cerrarForm.setData(
                                        'monto_contado',
                                        e.target.value,
                                    )
                                }
                                placeholder="Monto contado"
                                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                            {cerrarForm.errors.monto_contado && (
                                <p className="text-xs text-red-500">
                                    {cerrarForm.errors.monto_contado}
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={cerrarForm.processing}
                                className="h-10 w-full rounded-xl bg-red-500 text-sm font-bold text-white transition-all hover:bg-red-600 disabled:opacity-50"
                            >
                                <Receipt size={15} className="mr-1 inline" />{' '}
                                Cerrar turno
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
