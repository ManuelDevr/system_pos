import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { ChevronLeft, Search, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const today = () => new Date().toISOString().slice(0, 10);

export default function Create({ ventas, motivos, serie, empresa }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVenta, setSelectedVenta] = useState(null);

    const [form, setForm] = useState({
        serie: serie || 'T001',
        fecha_emision: today(),
        fecha_traslado: today(),
        motivo_traslado: '01',
        modalidad: '02',
        destinatario_tipo_doc: '6',
        destinatario_num_doc: '',
        destinatario_razon_social: '',
        partida_ubigeo: '',
        partida_direccion: empresa?.direccion || '',
        llegada_ubigeo: '',
        llegada_direccion: '',
        peso_total: '1',
        und_peso_total: 'KGM',
        num_bultos: '',
        observacion: '',
        transportista_num_doc: '',
        transportista_razon_social: '',
        transportista_nro_mtc: '',
        vehiculo_placa: '',
        conductor_tipo_doc: '1',
        conductor_num_doc: '',
        conductor_nombres: '',
        conductor_apellidos: '',
        conductor_licencia: '',
    });

    const [manualItem, setManualItem] = useState({
        descripcion: '',
        cantidad: '1',
        unidad: 'NIU',
    });

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

    const setField = (field, value) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const selectVenta = (venta) => {
        setSelectedVenta(venta);
        setSearchTerm('');
        setForm((prev) => ({
            ...prev,
            destinatario_tipo_doc: venta.cliente_tipo_doc === 'RUC' ? '6' : '1',
            destinatario_num_doc:
                venta.cliente_documento || venta.cliente?.ruc_dni || '',
            destinatario_razon_social:
                venta.cliente_nombre || venta.cliente?.nombre || '',
            llegada_direccion:
                venta.cliente?.direccion || prev.llegada_direccion,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const payload = {
            ...form,
            peso_total: Number(form.peso_total),
            num_bultos: form.num_bultos ? Number(form.num_bultos) : null,
        };

        if (selectedVenta) {
            payload.venta_id = selectedVenta.id;
        } else {
            payload.items = [
                {
                    descripcion: manualItem.descripcion,
                    cantidad: Number(manualItem.cantidad),
                    unidad: manualItem.unidad,
                },
            ];
        }

        router.post(route('guias.store'), payload, {
            onError: (err) => toast.error(Object.values(err).join(', ')),
        });
    };

    const inputClass =
        'w-full px-4 py-2.5 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm';
    const labelClass =
        'block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5';

    return (
        <AuthenticatedLayout>
            <Head title="Nueva Guia de Remision" />
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.get(route('guias.index'))}
                        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800">
                            Nueva Guia de Remision
                        </h1>
                        <p className="text-sm font-medium text-slate-500">
                            {empresa?.razon_social || 'Empresa'} · RUC{' '}
                            {empresa?.ruc}
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                    <section className="space-y-3">
                        <label className={labelClass}>
                            Venta asociada (opcional)
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                className="w-full rounded-xl border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-0"
                                placeholder="Buscar venta por comprobante o cliente..."
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                            />
                        </div>

                        <div className="custom-scrollbar max-h-48 space-y-2 overflow-y-auto rounded-xl border border-slate-100 p-2">
                            {filteredVentas.map((venta) => (
                                <button
                                    type="button"
                                    key={venta.id}
                                    onClick={() => selectVenta(venta)}
                                    className={`w-full rounded-xl px-4 py-2.5 text-left text-sm transition-all ${
                                        selectedVenta?.id === venta.id
                                            ? 'bg-indigo-600 text-white'
                                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono font-bold">
                                            {venta.nro_comprobante ||
                                                `#${venta.id}`}
                                        </span>
                                        <span className="text-xs font-bold">
                                            {venta.cliente_nombre ||
                                                'Cliente varios'}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {selectedVenta && (
                            <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
                                Se trasladaran{' '}
                                {selectedVenta.detalles?.length || 0}{' '}
                                producto(s) de la venta{' '}
                                {selectedVenta.nro_comprobante}.
                            </p>
                        )}

                        {!selectedVenta && (
                            <div className="grid gap-3 md:grid-cols-[1fr_120px_140px]">
                                <input
                                    className={inputClass}
                                    placeholder="Descripcion del producto a trasladar"
                                    value={manualItem.descripcion}
                                    onChange={(event) =>
                                        setManualItem({
                                            ...manualItem,
                                            descripcion: event.target.value,
                                        })
                                    }
                                />
                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    className={inputClass}
                                    value={manualItem.cantidad}
                                    onChange={(event) =>
                                        setManualItem({
                                            ...manualItem,
                                            cantidad: event.target.value,
                                        })
                                    }
                                />
                                <select
                                    className={inputClass}
                                    value={manualItem.unidad}
                                    onChange={(event) =>
                                        setManualItem({
                                            ...manualItem,
                                            unidad: event.target.value,
                                        })
                                    }
                                >
                                    <option value="NIU">NIU - Unidad</option>
                                    <option value="KGM">KGM - Kilogramo</option>
                                    <option value="MTR">MTR - Metro</option>
                                    <option value="BX">BX - Caja</option>
                                    <option value="ZZ">ZZ - Servicio</option>
                                </select>
                            </div>
                        )}
                    </section>

                    <div className="grid gap-4 md:grid-cols-4">
                        <div>
                            <label className={labelClass}>Serie</label>
                            <input
                                className={inputClass}
                                maxLength={4}
                                value={form.serie}
                                onChange={(event) =>
                                    setField(
                                        'serie',
                                        event.target.value.toUpperCase(),
                                    )
                                }
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Fecha emision</label>
                            <input
                                type="date"
                                className={inputClass}
                                value={form.fecha_emision}
                                onChange={(event) =>
                                    setField(
                                        'fecha_emision',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Fecha traslado</label>
                            <input
                                type="date"
                                className={inputClass}
                                value={form.fecha_traslado}
                                onChange={(event) =>
                                    setField(
                                        'fecha_traslado',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Motivo</label>
                            <select
                                className={inputClass}
                                value={form.motivo_traslado}
                                onChange={(event) =>
                                    setField(
                                        'motivo_traslado',
                                        event.target.value,
                                    )
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
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <label className={labelClass}>Modalidad</label>
                            <select
                                className={inputClass}
                                value={form.modalidad}
                                onChange={(event) =>
                                    setField('modalidad', event.target.value)
                                }
                            >
                                <option value="01">
                                    01 - Transporte publico
                                </option>
                                <option value="02">
                                    02 - Transporte privado
                                </option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Peso total</label>
                            <input
                                type="number"
                                min="0.001"
                                step="0.001"
                                className={inputClass}
                                value={form.peso_total}
                                onChange={(event) =>
                                    setField('peso_total', event.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Bultos</label>
                            <input
                                type="number"
                                min="1"
                                className={inputClass}
                                value={form.num_bultos}
                                onChange={(event) =>
                                    setField('num_bultos', event.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <label className={labelClass}>
                                Destinatario doc.
                            </label>
                            <select
                                className={inputClass}
                                value={form.destinatario_tipo_doc}
                                onChange={(event) =>
                                    setField(
                                        'destinatario_tipo_doc',
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="6">RUC</option>
                                <option value="1">DNI</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Numero</label>
                            <input
                                className={inputClass}
                                value={form.destinatario_num_doc}
                                onChange={(event) =>
                                    setField(
                                        'destinatario_num_doc',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Razon social</label>
                            <input
                                className={inputClass}
                                value={form.destinatario_razon_social}
                                onChange={(event) =>
                                    setField(
                                        'destinatario_razon_social',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                            <div>
                                <label className={labelClass}>
                                    Partida - Ubigeo
                                </label>
                                <input
                                    className={inputClass}
                                    maxLength={6}
                                    value={form.partida_ubigeo}
                                    onChange={(event) =>
                                        setField(
                                            'partida_ubigeo',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className={labelClass}>
                                    Partida - Direccion
                                </label>
                                <input
                                    className={inputClass}
                                    value={form.partida_direccion}
                                    onChange={(event) =>
                                        setField(
                                            'partida_direccion',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className={labelClass}>
                                    Llegada - Ubigeo
                                </label>
                                <input
                                    className={inputClass}
                                    maxLength={6}
                                    value={form.llegada_ubigeo}
                                    onChange={(event) =>
                                        setField(
                                            'llegada_ubigeo',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className={labelClass}>
                                    Llegada - Direccion
                                </label>
                                <input
                                    className={inputClass}
                                    value={form.llegada_direccion}
                                    onChange={(event) =>
                                        setField(
                                            'llegada_direccion',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {form.modalidad === '01' ? (
                        <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-3">
                            <div>
                                <label className={labelClass}>
                                    Transportista RUC
                                </label>
                                <input
                                    className={inputClass}
                                    maxLength={11}
                                    value={form.transportista_num_doc}
                                    onChange={(event) =>
                                        setField(
                                            'transportista_num_doc',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className={labelClass}>
                                    Razon social
                                </label>
                                <input
                                    className={inputClass}
                                    value={form.transportista_razon_social}
                                    onChange={(event) =>
                                        setField(
                                            'transportista_razon_social',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Nro MTC</label>
                                <input
                                    className={inputClass}
                                    value={form.transportista_nro_mtc}
                                    onChange={(event) =>
                                        setField(
                                            'transportista_nro_mtc',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-3">
                            <div>
                                <label className={labelClass}>
                                    Placa vehiculo
                                </label>
                                <input
                                    className={inputClass}
                                    maxLength={8}
                                    value={form.vehiculo_placa}
                                    onChange={(event) =>
                                        setField(
                                            'vehiculo_placa',
                                            event.target.value.toUpperCase(),
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className={labelClass}>
                                    Conductor doc.
                                </label>
                                <input
                                    className={inputClass}
                                    maxLength={15}
                                    value={form.conductor_num_doc}
                                    onChange={(event) =>
                                        setField(
                                            'conductor_num_doc',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Licencia</label>
                                <input
                                    className={inputClass}
                                    maxLength={20}
                                    value={form.conductor_licencia}
                                    onChange={(event) =>
                                        setField(
                                            'conductor_licencia',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Nombres</label>
                                <input
                                    className={inputClass}
                                    value={form.conductor_nombres}
                                    onChange={(event) =>
                                        setField(
                                            'conductor_nombres',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Apellidos</label>
                                <input
                                    className={inputClass}
                                    value={form.conductor_apellidos}
                                    onChange={(event) =>
                                        setField(
                                            'conductor_apellidos',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className={labelClass}>
                                    Observacion
                                </label>
                                <input
                                    className={inputClass}
                                    value={form.observacion}
                                    onChange={(event) =>
                                        setField(
                                            'observacion',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => router.get(route('guias.index'))}
                            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700"
                        >
                            <Truck size={16} /> Emitir Guia
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
