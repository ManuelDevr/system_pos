import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    Calendar,
    Download,
    Package,
    Receipt,
    TrendingDown,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

const money = (value) =>
    new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2,
    }).format(Number(value ?? 0));

export default function Utilidad({
    desde,
    hasta,
    resumen,
    por_dia,
    por_metodo,
    top_productos,
}) {
    const [filters, setFilters] = useState({ desde, hasta });
    const [loading, setLoading] = useState(false);

    const applyFilters = (event) => {
        event.preventDefault();
        setLoading(true);
        router.get(route('reportes.utilidad'), filters, {
            preserveState: true,
            onFinish: () => setLoading(false),
        });
    };

    const exportCsv = () => {
        router.get(route('reportes.utilidad.export'), filters, {
            preserveState: true,
        });
    };

    const utilidadPositiva = Number(resumen.utilidad) >= 0;

    const cards = [
        {
            label: 'Ventas del periodo',
            value: money(resumen.ventas),
            icon: Receipt,
            color: 'bg-emerald-100 text-emerald-600',
        },
        {
            label: 'Costo de ventas',
            value: money(resumen.costo),
            icon: TrendingDown,
            color: 'bg-amber-100 text-amber-600',
        },
        {
            label: 'Utilidad bruta',
            value: money(resumen.utilidad),
            icon: TrendingUp,
            color: utilidadPositiva
                ? 'bg-indigo-100 text-indigo-600'
                : 'bg-rose-100 text-rose-600',
        },
        {
            label: 'Margen',
            value: `${resumen.margen}%`,
            icon: TrendingUp,
            color: 'bg-sky-100 text-sky-600',
        },
        {
            label: 'Transacciones',
            value: resumen.transacciones,
            icon: Package,
            color: 'bg-slate-100 text-slate-600',
        },
        {
            label: 'Ticket promedio',
            value: money(resumen.ticket_promedio),
            icon: Wallet,
            color: 'bg-violet-100 text-violet-600',
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Reporte de Utilidad" />
            <div className="mx-auto max-w-6xl space-y-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800">
                            Reporte de Utilidad
                        </h1>
                        <p className="mt-1 text-sm font-medium text-slate-500">
                            Ventas menos costo de ventas (método costo promedio)
                        </p>
                    </div>

                    <form
                        onSubmit={applyFilters}
                        className="flex flex-wrap items-end gap-3"
                    >
                        <div>
                            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                                Desde
                            </label>
                            <input
                                type="date"
                                value={filters.desde}
                                onChange={(event) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        desde: event.target.value,
                                    }))
                                }
                                className="rounded-xl border-slate-200 bg-slate-50 text-sm font-bold focus:border-indigo-500 focus:ring-0"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                                Hasta
                            </label>
                            <input
                                type="date"
                                value={filters.hasta}
                                onChange={(event) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        hasta: event.target.value,
                                    }))
                                }
                                className="rounded-xl border-slate-200 bg-slate-50 text-sm font-bold focus:border-indigo-500 focus:ring-0"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:bg-slate-300"
                        >
                            <Calendar size={16} />{' '}
                            {loading ? 'Calculando...' : 'Aplicar'}
                        </button>
                        <button
                            type="button"
                            onClick={exportCsv}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                        >
                            <Download size={16} /> CSV
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {cards.map((card) => (
                        <div
                            key={card.label}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`rounded-xl p-2.5 ${card.color}`}
                                >
                                    <card.icon size={20} />
                                </div>
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                    {card.label}
                                </p>
                            </div>
                            <p className="mt-4 text-2xl font-black text-slate-800">
                                {card.value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-6 py-4">
                            <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
                                Productos con mayor utilidad
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">Producto</th>
                                        <th className="px-4 py-3 text-right">
                                            Cant.
                                        </th>
                                        <th className="px-4 py-3 text-right">
                                            Ventas
                                        </th>
                                        <th className="px-4 py-3 text-right">
                                            Utilidad
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {top_productos.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-4 py-6 text-center text-slate-400"
                                            >
                                                Sin ventas en el periodo
                                            </td>
                                        </tr>
                                    )}
                                    {top_productos.map((item) => (
                                        <tr
                                            key={item.producto}
                                            className="hover:bg-slate-50"
                                        >
                                            <td className="px-4 py-3 font-medium text-slate-700">
                                                {item.producto}
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-600">
                                                {item.cantidad}
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-600">
                                                {money(item.ventas)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-emerald-600">
                                                {money(item.utilidad)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-6 py-4">
                                <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
                                    Por método de pago
                                </h2>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {por_metodo.length === 0 && (
                                    <p className="px-6 py-6 text-center text-sm text-slate-400">
                                        Sin movimientos
                                    </p>
                                )}
                                {por_metodo.map((item) => (
                                    <div
                                        key={item.metodo}
                                        className="flex items-center justify-between px-6 py-3"
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-slate-700">
                                                {item.metodo}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {item.cantidad} ventas
                                            </p>
                                        </div>
                                        <p className="text-sm font-black text-slate-700">
                                            {money(item.total)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-6 py-4">
                                <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
                                    Detalle diario
                                </h2>
                            </div>
                            <div className="max-h-72 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3">Día</th>
                                            <th className="px-4 py-3 text-right">
                                                Ventas
                                            </th>
                                            <th className="px-4 py-3 text-right">
                                                Utilidad
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {por_dia.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={3}
                                                    className="px-4 py-6 text-center text-slate-400"
                                                >
                                                    Sin datos
                                                </td>
                                            </tr>
                                        )}
                                        {por_dia.map((item) => (
                                            <tr
                                                key={item.dia}
                                                className="hover:bg-slate-50"
                                            >
                                                <td className="px-4 py-2.5 font-medium text-slate-600">
                                                    {item.dia}
                                                </td>
                                                <td className="px-4 py-2.5 text-right text-slate-600">
                                                    {money(item.ventas)}
                                                </td>
                                                <td
                                                    className={`px-4 py-2.5 text-right font-bold ${
                                                        item.utilidad >= 0
                                                            ? 'text-emerald-600'
                                                            : 'text-rose-600'
                                                    }`}
                                                >
                                                    {money(item.utilidad)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
