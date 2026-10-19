import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FileText, RefreshCw, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

const getBadge = (estado) => {
    const styles = {
        ACEPTADO: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        PENDIENTE: 'bg-amber-50 text-amber-700 border-amber-100',
        ENVIADO: 'bg-sky-50 text-sky-700 border-sky-100',
        ERROR: 'bg-rose-50 text-rose-700 border-rose-100',
        EXCEPCION: 'bg-rose-50 text-rose-700 border-rose-100',
    };
    return styles[estado] || styles.PENDIENTE;
};

export default function Index({ guias }) {
    const consultarEstado = (guia) => {
        router.post(
            route('guias.estado', guia.id),
            {},
            {
                onSuccess: () => toast.success('Estado actualizado'),
                onError: (err) => toast.error(Object.values(err).join(', ')),
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Guias de Remision" />
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800">
                            Guias de Remision
                        </h1>
                        <p className="text-sm font-medium text-slate-500">
                            GRE Remitente (tipo 09) para el traslado de
                            mercaderia
                        </p>
                    </div>
                    <Link
                        href={route('guias.create')}
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700"
                    >
                        <Truck size={18} /> Nueva Guia
                    </Link>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[860px] border-collapse text-left">
                            <thead className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <tr>
                                    <th className="p-4">Guia</th>
                                    <th className="p-4">Destinatario</th>
                                    <th className="p-4">Traslado</th>
                                    <th className="p-4">Venta</th>
                                    <th className="p-4 text-center">Estado</th>
                                    <th className="p-4 pr-6 text-right">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {guias.length > 0 ? (
                                    guias.map((guia) => (
                                        <tr
                                            key={guia.id}
                                            className="transition-colors hover:bg-slate-50/50"
                                        >
                                            <td className="p-4">
                                                <p className="font-mono font-bold text-slate-800">
                                                    {guia.nro_comprobante ||
                                                        `#${guia.id}`}
                                                </p>
                                                <p className="text-[10px] font-bold uppercase text-slate-400">
                                                    {guia.serie}
                                                </p>
                                            </td>
                                            <td className="p-4">
                                                <p className="max-w-[220px] truncate font-bold text-slate-700">
                                                    {
                                                        guia.destinatario_razon_social
                                                    }
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {guia.destinatario_num_doc}
                                                </p>
                                            </td>
                                            <td className="p-4 text-xs text-slate-600">
                                                <p className="font-bold">
                                                    {guia.motivo_traslado} ·{' '}
                                                    {guia.modalidad === '01'
                                                        ? 'Publico'
                                                        : 'Privado'}
                                                </p>
                                                <p>
                                                    {new Date(
                                                        guia.fecha_traslado,
                                                    ).toLocaleDateString(
                                                        'es-PE',
                                                    )}
                                                </p>
                                            </td>
                                            <td className="p-4 font-mono text-xs font-bold text-slate-600">
                                                {guia.venta?.nro_comprobante ||
                                                    '-'}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span
                                                    className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${getBadge(guia.estado)}`}
                                                >
                                                    {guia.estado}
                                                </span>
                                            </td>
                                            <td className="p-4 pr-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {guia.sunat_document_id && (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    consultarEstado(
                                                                        guia,
                                                                    )
                                                                }
                                                                className="rounded-lg bg-slate-100 p-2 text-slate-500 transition-all hover:bg-indigo-50 hover:text-indigo-600"
                                                                title="Consultar estado"
                                                            >
                                                                <RefreshCw
                                                                    size={16}
                                                                />
                                                            </button>
                                                            <a
                                                                href={route(
                                                                    'guias.pdf',
                                                                    guia.id,
                                                                )}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="rounded-lg bg-slate-100 p-2 text-slate-500 transition-all hover:bg-indigo-50 hover:text-indigo-600"
                                                                title="Ver PDF"
                                                            >
                                                                <FileText
                                                                    size={16}
                                                                />
                                                            </a>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="p-16 text-center"
                                        >
                                            <div className="flex flex-col items-center opacity-40">
                                                <Truck
                                                    size={48}
                                                    className="mb-2 text-slate-300"
                                                />
                                                <p className="font-bold text-slate-400">
                                                    Aun no hay guias de remision
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
