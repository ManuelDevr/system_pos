import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { ChevronLeft, FilePlus2, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

export default function Create({ ventas, motivos, serie }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVenta, setSelectedVenta] = useState(null);
    const [motivoCodigo, setMotivoCodigo] = useState('01');
    const [motivoDescripcion, setMotivoDescripcion] = useState('');
    const [total, setTotal] = useState('');

    const filteredVentas = useMemo(
        () =>
            ventas.filter(
                (venta) =>
                    (venta.nro_comprobante || '')
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    (venta.cliente_nombre || '')
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
            ),
        [ventas, searchTerm],
    );

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!selectedVenta) {
            toast.error('Selecciona la venta afectada');
            return;
        }

        router.post(
            route('notas-debito.store'),
            {
                venta_id: selectedVenta.id,
                motivo_codigo: motivoCodigo,
                motivo_descripcion: motivoDescripcion,
                total: Number(total),
            },
            {
                onError: (err) => toast.error(Object.values(err).join(', ')),
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Nueva Nota de Debito" />
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.get(route('notas-debito.index'))}
                        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800">
                            Nueva Nota de Debito
                        </h1>
                        <p className="text-sm font-medium text-slate-500">
                            Serie {serie}. El correlativo lo asigna la
                            Plataforma SUNAT.
                        </p>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-600">
                                Comprobante afectado
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    className="w-full rounded-xl border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-0"
                                    placeholder="Buscar por comprobante o cliente..."
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(event.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div className="custom-scrollbar max-h-60 space-y-2 overflow-y-auto rounded-xl border border-slate-100 p-2">
                            {filteredVentas.map((venta) => (
                                <button
                                    type="button"
                                    key={venta.id}
                                    onClick={() => {
                                        setSelectedVenta(venta);
                                        setSearchTerm('');
                                    }}
                                    className={`w-full rounded-xl px-4 py-3 text-left text-sm transition-all ${
                                        selectedVenta?.id === venta.id
                                            ? 'bg-indigo-600 text-white'
                                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="font-mono font-bold">
                                                {venta.nro_comprobante}
                                            </span>
                                            <span className="ml-3 text-xs opacity-70">
                                                {venta.cliente_nombre ||
                                                    'Cliente varios'}
                                            </span>
                                        </div>
                                        <span className="font-black">
                                            S/{' '}
                                            {parseFloat(venta.total).toFixed(2)}
                                        </span>
                                    </div>
                                </button>
                            ))}
                            {filteredVentas.length === 0 && (
                                <p className="p-4 text-center text-sm font-medium text-slate-400">
                                    No hay ventas emitidas ante SUNAT para
                                    afectar.
                                </p>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-600">
                                    Motivo (Catalogo 10)
                                </label>
                                <select
                                    className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-0"
                                    value={motivoCodigo}
                                    onChange={(event) =>
                                        setMotivoCodigo(event.target.value)
                                    }
                                >
                                    {Object.entries(motivos).map(
                                        ([codigo, descripcion]) => (
                                            <option key={codigo} value={codigo}>
                                                {codigo} - {descripcion}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-600">
                                    Monto adicional (con IGV)
                                </label>
                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-0"
                                    placeholder="0.00"
                                    value={total}
                                    onChange={(event) =>
                                        setTotal(event.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-600">
                                Descripcion del motivo
                            </label>
                            <textarea
                                rows={3}
                                maxLength={250}
                                className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-0"
                                placeholder="Ej: Intereses moratorios por 30 dias de atraso"
                                value={motivoDescripcion}
                                onChange={(event) =>
                                    setMotivoDescripcion(event.target.value)
                                }
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() =>
                                    router.get(route('notas-debito.index'))
                                }
                                className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={
                                    !selectedVenta ||
                                    !motivoDescripcion ||
                                    Number(total) <= 0
                                }
                                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 disabled:bg-slate-300"
                            >
                                <FilePlus2 size={16} /> Emitir Nota de Debito
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
