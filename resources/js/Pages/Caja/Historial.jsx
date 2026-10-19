import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Wallet } from 'lucide-react';

const money = (v) => `S/ ${parseFloat(v || 0).toFixed(2)}`;

export default function Historial({ cajas, filtros }) {
    const apply = (key, value) => {
        router.get(
            route('caja.historial'),
            { ...filtros, [key]: value },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Historial de Cajas" />

            <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div>
                    <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Desde
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <Calendar size={15} className="text-slate-400" />
                        <input
                            type="date"
                            value={filtros.desde || ''}
                            onChange={(e) => apply('desde', e.target.value)}
                            className="bg-transparent text-sm font-semibold [color-scheme:light] focus:outline-none"
                        />
                    </div>
                </div>
                <div>
                    <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Hasta
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <Calendar size={15} className="text-slate-400" />
                        <input
                            type="date"
                            value={filtros.hasta || ''}
                            onChange={(e) => apply('hasta', e.target.value)}
                            className="bg-transparent text-sm font-semibold [color-scheme:light] focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <header className="border-b border-slate-100 bg-slate-50/30 px-6 py-5">
                    <h2 className="flex items-center gap-2 text-lg font-black uppercase tracking-tight text-slate-800">
                        <Wallet size={18} className="text-indigo-600" />{' '}
                        Historial de Cajas
                    </h2>
                </header>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left text-sm">
                        <thead className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <tr>
                                <th className="p-4">Usuario</th>
                                <th className="p-4">Sucursal</th>
                                <th className="p-4 text-center">Estado</th>
                                <th className="p-4 text-right">Inicial</th>
                                <th className="p-4 text-right">Esperado</th>
                                <th className="p-4 text-right">Contado</th>
                                <th className="p-4 text-right">Diferencia</th>
                                <th className="p-4 text-center">Apertura</th>
                                <th className="p-4 text-center">Cierre</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {cajas.data.length > 0 ? (
                                cajas.data.map((c) => (
                                    <tr
                                        key={c.id}
                                        className="hover:bg-slate-50/50"
                                    >
                                        <td className="p-4 font-bold text-slate-700">
                                            {c.user?.name}
                                        </td>
                                        <td className="p-4 text-slate-500">
                                            {c.sucursal?.nombre ?? '—'}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span
                                                className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                                                    c.estado === 'Abierta'
                                                        ? 'bg-emerald-50 text-emerald-600'
                                                        : 'bg-slate-100 text-slate-500'
                                                }`}
                                            >
                                                {c.estado}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right text-slate-600">
                                            {money(c.monto_inicial)}
                                        </td>
                                        <td className="p-4 text-right text-slate-600">
                                            {money(c.monto_esperado)}
                                        </td>
                                        <td className="p-4 text-right text-slate-600">
                                            {money(c.monto_contado)}
                                        </td>
                                        <td
                                            className={`p-4 text-right font-bold ${parseFloat(c.diferencia || 0) === 0 ? 'text-slate-400' : parseFloat(c.diferencia) < 0 ? 'text-red-500' : 'text-emerald-600'}`}
                                        >
                                            {c.diferencia === null
                                                ? '—'
                                                : money(c.diferencia)}
                                        </td>
                                        <td className="p-4 text-center text-xs text-slate-500">
                                            {c.abierta_en
                                                ? new Date(
                                                      c.abierta_en,
                                                  ).toLocaleString()
                                                : '—'}
                                        </td>
                                        <td className="p-4 text-center text-xs text-slate-500">
                                            {c.cerrada_en
                                                ? new Date(
                                                      c.cerrada_en,
                                                  ).toLocaleString()
                                                : '—'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="9"
                                        className="p-16 text-center text-xs font-bold text-slate-400"
                                    >
                                        No hay cajas registradas
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {cajas.links && cajas.links.length > 3 && (
                    <div className="flex flex-wrap gap-1 border-t border-slate-100 p-4">
                        {cajas.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                preserveState
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                                    link.active
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
