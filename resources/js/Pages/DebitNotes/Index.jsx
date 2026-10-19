import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FilePlus2, FileText, RefreshCw } from 'lucide-react';
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

export default function Index({ notas }) {
    const reenviar = (nota) => {
        router.post(
            route('notas-debito.reenviar', nota.id),
            {},
            {
                onSuccess: () => toast.success('Nota de debito reenviada'),
                onError: (err) => toast.error(Object.values(err).join(', ')),
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Notas de Debito" />
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800">
                            Notas de Debito
                        </h1>
                        <p className="text-sm font-medium text-slate-500">
                            Documentos que modifican al alza un comprobante
                            emitido
                        </p>
                    </div>
                    <Link
                        href={route('notas-debito.create')}
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700"
                    >
                        <FilePlus2 size={18} /> Nueva Nota
                    </Link>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px] border-collapse text-left">
                            <thead className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <tr>
                                    <th className="p-4">Comprobante</th>
                                    <th className="p-4">Venta afectada</th>
                                    <th className="p-4">Motivo</th>
                                    <th className="p-4 text-right">Monto</th>
                                    <th className="p-4 text-center">Estado</th>
                                    <th className="p-4 pr-6 text-right">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {notas.length > 0 ? (
                                    notas.map((nota) => (
                                        <tr
                                            key={nota.id}
                                            className="transition-colors hover:bg-slate-50/50"
                                        >
                                            <td className="p-4">
                                                <p className="font-mono font-bold text-slate-800">
                                                    {nota.nro_comprobante ||
                                                        `#${nota.id}`}
                                                </p>
                                                <p className="text-[10px] font-bold uppercase text-slate-400">
                                                    {nota.serie} ·{' '}
                                                    {new Date(
                                                        nota.created_at,
                                                    ).toLocaleDateString(
                                                        'es-PE',
                                                    )}
                                                </p>
                                            </td>
                                            <td className="p-4 font-mono text-xs font-bold text-slate-600">
                                                {nota.venta?.nro_comprobante ||
                                                    '-'}
                                            </td>
                                            <td className="p-4">
                                                <p className="font-bold text-slate-700">
                                                    {nota.motivo_codigo}
                                                </p>
                                                <p className="max-w-[260px] truncate text-xs text-slate-500">
                                                    {nota.motivo_descripcion}
                                                </p>
                                            </td>
                                            <td className="p-4 text-right font-black text-indigo-600">
                                                S/{' '}
                                                {parseFloat(nota.total).toFixed(
                                                    2,
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span
                                                    className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${getBadge(nota.estado)}`}
                                                >
                                                    {nota.estado}
                                                </span>
                                            </td>
                                            <td className="p-4 pr-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {nota.sunat_document_id && (
                                                        <button
                                                            onClick={() =>
                                                                reenviar(nota)
                                                            }
                                                            className="rounded-lg bg-slate-100 p-2 text-slate-500 transition-all hover:bg-indigo-50 hover:text-indigo-600"
                                                            title="Reenviar a SUNAT"
                                                        >
                                                            <RefreshCw
                                                                size={16}
                                                            />
                                                        </button>
                                                    )}
                                                    {nota.sunat_pdf_url && (
                                                        <a
                                                            href={route(
                                                                'notas-debito.pdf',
                                                                nota.id,
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
                                                <FileText
                                                    size={48}
                                                    className="mb-2 text-slate-300"
                                                />
                                                <p className="font-bold text-slate-400">
                                                    Aun no hay notas de debito
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
