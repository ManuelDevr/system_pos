import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftRight, Plus } from 'lucide-react';

export default function Index({ transferencias }) {
    const rows = transferencias?.data ?? [];

    return (
        <AuthenticatedLayout>
            <Head title="Transferencias de stock" />
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800">
                            Transferencias de stock
                        </h1>
                        <p className="mt-1 text-sm font-medium text-slate-500">
                            Movimientos de mercaderia entre sucursales
                        </p>
                    </div>
                    <Link
                        href={route('transferencias.create')}
                        className="flex h-11 items-center gap-2 rounded-2xl bg-indigo-600 px-5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95"
                    >
                        <Plus size={16} /> Nueva transferencia
                    </Link>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {rows.length === 0 ? (
                        <div className="py-16 text-center">
                            <ArrowLeftRight
                                size={48}
                                className="mx-auto mb-4 text-slate-300"
                            />
                            <p className="font-medium text-slate-500">
                                No hay transferencias registradas
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-widest text-slate-500">
                                <tr>
                                    <th className="px-5 py-3">#</th>
                                    <th className="px-5 py-3">Fecha</th>
                                    <th className="px-5 py-3">Origen</th>
                                    <th className="px-5 py-3">Destino</th>
                                    <th className="px-5 py-3">Items</th>
                                    <th className="px-5 py-3">Usuario</th>
                                    <th className="px-5 py-3">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((t) => (
                                    <tr
                                        key={t.id}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="px-5 py-4 font-bold text-slate-700">
                                            {t.id}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {new Date(
                                                t.created_at,
                                            ).toLocaleString('es-PE')}
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-slate-700">
                                            {t.origen?.nombre ?? '-'}
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-slate-700">
                                            {t.destino?.nombre ?? '-'}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {(t.items ?? []).length} producto(s)
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {t.user?.name ?? '-'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                                                {t.estado}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
