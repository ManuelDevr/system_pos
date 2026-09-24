import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import {
    Building,
    FileSpreadsheet,
    FileText,
    Globe,
    Image as ImageIcon,
    Key,
    Mail,
    MapPin,
    Percent,
    Phone,
    Save,
    Search,
    ShieldCheck,
    Upload,
    X,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const FormSection = ({ title, icon: Icon, children }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 flex items-center gap-3 text-lg font-bold text-slate-800">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <Icon size={20} />
            </div>
            <span>{title}</span>
        </h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const FormInput = ({ label, id, icon: Icon, error, ...props }) => (
    <div>
        <label
            htmlFor={id}
            className="mb-1 ml-1 block text-xs font-bold uppercase tracking-widest text-slate-500"
        >
            {label}
        </label>
        <div className="relative">
            {Icon && (
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icon className="h-4 w-4 text-slate-400" />
                </span>
            )}
            <input
                id={id}
                {...props}
                className={`w-full ${Icon ? 'pl-10' : 'pl-4'} rounded-xl border-slate-200 bg-slate-50 py-2.5 pr-3 text-sm font-medium focus:border-indigo-500 focus:ring-0 ${error ? 'border-red-500' : ''}`}
            />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

const SelectInput = ({ label, id, icon: Icon, options, error, ...props }) => (
    <div>
        <label
            htmlFor={id}
            className="mb-1 ml-1 block text-xs font-bold uppercase tracking-widest text-slate-500"
        >
            {label}
        </label>
        <div className="relative">
            {Icon && (
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icon className="h-4 w-4 text-slate-400" />
                </span>
            )}
            <select
                id={id}
                {...props}
                className={`w-full ${Icon ? 'pl-10' : 'pl-4'} appearance-none rounded-xl border-slate-200 bg-slate-50 py-2.5 pr-10 text-sm font-medium focus:border-indigo-500 focus:ring-0 ${error ? 'border-red-500' : ''}`}
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

export default function Index({ configuracion }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'POST',
        nombre_empresa: configuracion?.nombre_empresa || '',
        ruc: configuracion?.ruc || '',
        direccion: configuracion?.direccion || '',
        telefono: configuracion?.telefono || '',
        correo: configuracion?.correo || '',
        logo: null,
        sol_usuario: configuracion?.sol_usuario || '',
        sol_clave: configuracion?.sol_clave || '',
        entorno: configuracion?.entorno || 'Beta',
        serie_factura: configuracion?.serie_factura || '',
        serie_boleta: configuracion?.serie_boleta || '',
        serie_nota_credito: configuracion?.serie_nota_credito || '',
        serie_nota_debito: configuracion?.serie_nota_debito || '',
        igv: configuracion?.igv ?? 18.0,
        certificado_digital: null,
        certificado_digital_remove: false,
        facturacion_provider: configuracion?.facturacion_provider || '',
        sunat_plataforma_base_url:
            configuracion?.sunat_plataforma_base_url || '',
        sunat_plataforma_api_key: configuracion?.sunat_plataforma_api_key || '',
        sunat_plataforma_api_secret:
            configuracion?.sunat_plataforma_api_secret || '',
        sunat_webhook_secret: configuracion?.sunat_webhook_secret || '',
        apisperu_base_url: configuracion?.apisperu_base_url || '',
        apisperu_token: configuracion?.apisperu_token || '',
    });

    const getLogoUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http://') || path.startsWith('https://'))
            return path;
        return `/storage/${path}`;
    };

    const [logoPreview, setLogoPreview] = useState(
        getLogoUrl(configuracion?.logo_empresa),
    );
    const [certNombre, setCertNombre] = useState(
        configuracion?.certificado_digital
            ? configuracion.certificado_digital.split('/').pop()
            : null,
    );

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleCertChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('certificado_digital', file);
            setCertNombre(file.name);
            setData('certificado_digital_remove', false);
        }
    };

    const removeCert = () => {
        setData('certificado_digital', null);
        setData('certificado_digital_remove', true);
        setCertNombre(null);
    };

    const handleSave = (e) => {
        e.preventDefault();
        post(route('configuracion.update'), {
            forceFormData: true,
            onSuccess: () => toast.success('Configuración guardada'),
            onError: () => toast.error('Error al guardar'),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Configuración" />
            <div className="mx-auto max-w-5xl space-y-8">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800">
                        Configuración del Sistema
                    </h1>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                        Datos de la empresa, facturación electrónica y
                        sucursales
                    </p>
                </div>

                <form
                    onSubmit={handleSave}
                    className="grid grid-cols-1 gap-6 lg:grid-cols-3"
                >
                    <div className="space-y-6 lg:col-span-2">
                        <FormSection
                            title="Datos de la Empresa"
                            icon={Building}
                        >
                            <FormInput
                                label="Nombre de la Ferretería"
                                id="nombre_empresa"
                                value={data.nombre_empresa}
                                onChange={(e) =>
                                    setData('nombre_empresa', e.target.value)
                                }
                                icon={Building}
                                placeholder="Ej: Ferretería CMA S.A.C."
                                error={errors.nombre_empresa}
                            />
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormInput
                                    label="RUC"
                                    id="ruc"
                                    value={data.ruc}
                                    onChange={(e) =>
                                        setData('ruc', e.target.value)
                                    }
                                    icon={FileText}
                                    placeholder="20123456789"
                                    error={errors.ruc}
                                />
                                <FormInput
                                    label="Teléfono de Contacto"
                                    id="telefono"
                                    value={data.telefono}
                                    onChange={(e) =>
                                        setData('telefono', e.target.value)
                                    }
                                    icon={Phone}
                                    placeholder="01-2345678"
                                    error={errors.telefono}
                                />
                            </div>
                            <FormInput
                                label="Dirección Fiscal"
                                id="direccion"
                                value={data.direccion}
                                onChange={(e) =>
                                    setData('direccion', e.target.value)
                                }
                                icon={MapPin}
                                placeholder="Av. Principal 123, Ciudad"
                                error={errors.direccion}
                            />
                            <FormInput
                                label="Correo de Contacto"
                                id="correo"
                                value={data.correo}
                                onChange={(e) =>
                                    setData('correo', e.target.value)
                                }
                                icon={Mail}
                                placeholder="correo@ferreteria.com"
                                error={errors.correo}
                            />
                        </FormSection>

                        <FormSection
                            title="Parámetros de Facturación Electrónica"
                            icon={ShieldCheck}
                        >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormInput
                                    label="Usuario SOL Secundario"
                                    id="sol_usuario"
                                    value={data.sol_usuario}
                                    onChange={(e) =>
                                        setData('sol_usuario', e.target.value)
                                    }
                                    icon={Key}
                                    placeholder="USUARIO_SOL"
                                    error={errors.sol_usuario}
                                />
                                <FormInput
                                    label="Clave SOL Secundaria"
                                    id="sol_clave"
                                    type="password"
                                    value={data.sol_clave}
                                    onChange={(e) =>
                                        setData('sol_clave', e.target.value)
                                    }
                                    icon={Key}
                                    placeholder="********"
                                    error={errors.sol_clave}
                                />
                            </div>
                            <SelectInput
                                label="Entorno"
                                id="entorno"
                                icon={Globe}
                                value={data.entorno}
                                onChange={(e) =>
                                    setData('entorno', e.target.value)
                                }
                                options={[
                                    { value: 'Beta', label: 'Beta (Pruebas)' },
                                    {
                                        value: 'Produccion',
                                        label: 'Producción',
                                    },
                                ]}
                                error={errors.entorno}
                            />

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormInput
                                    label="Serie Factura (F001)"
                                    id="serie_factura"
                                    value={data.serie_factura}
                                    onChange={(e) =>
                                        setData('serie_factura', e.target.value)
                                    }
                                    icon={FileSpreadsheet}
                                    placeholder="F001"
                                    error={errors.serie_factura}
                                />
                                <FormInput
                                    label="Serie Boleta (B001)"
                                    id="serie_boleta"
                                    value={data.serie_boleta}
                                    onChange={(e) =>
                                        setData('serie_boleta', e.target.value)
                                    }
                                    icon={FileSpreadsheet}
                                    placeholder="B001"
                                    error={errors.serie_boleta}
                                />
                                <FormInput
                                    label="Serie Nota Crédito"
                                    id="serie_nota_credito"
                                    value={data.serie_nota_credito}
                                    onChange={(e) =>
                                        setData(
                                            'serie_nota_credito',
                                            e.target.value,
                                        )
                                    }
                                    icon={FileSpreadsheet}
                                    placeholder="FC01"
                                    error={errors.serie_nota_credito}
                                />
                                <FormInput
                                    label="Serie Nota Débito"
                                    id="serie_nota_debito"
                                    value={data.serie_nota_debito}
                                    onChange={(e) =>
                                        setData(
                                            'serie_nota_debito',
                                            e.target.value,
                                        )
                                    }
                                    icon={FileSpreadsheet}
                                    placeholder="FD01"
                                    error={errors.serie_nota_debito}
                                />
                                <FormInput
                                    label="IGV (%)"
                                    id="igv"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={data.igv}
                                    onChange={(e) =>
                                        setData(
                                            'igv',
                                            parseFloat(e.target.value) || 0,
                                        )
                                    }
                                    icon={Percent}
                                    placeholder="18.00"
                                    error={errors.igv}
                                />
                            </div>

                            <div>
                                <label className="mb-2 ml-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
                                    Certificado Digital (.pfx / .cer)
                                </label>
                                <div className="flex items-center gap-4">
                                    {certNombre ? (
                                        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                                            <FileText
                                                size={18}
                                                className="text-indigo-500"
                                            />
                                            <span className="text-sm font-medium text-slate-700">
                                                {certNombre}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={removeCert}
                                                className="rounded-lg bg-rose-50 p-1 text-rose-500 hover:bg-rose-100"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 transition-colors hover:border-indigo-400">
                                            <Upload
                                                size={18}
                                                className="text-slate-400"
                                            />
                                            <span className="text-sm font-medium text-slate-500">
                                                Seleccionar archivo
                                            </span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept=".pfx,.cer,.p12"
                                                onChange={handleCertChange}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </FormSection>

                        <FormSection
                            title="Facturación en la Nube (Plataforma-Sunat)"
                            icon={Globe}
                        >
                            <p className="-mt-2 text-xs font-medium text-slate-500">
                                Emite boletas y facturas a través de la
                                Plataforma-Sunat (api.cma-shop.com). Si dejas
                                los campos vacíos, se usan las variables de
                                entorno del servidor (.env / Dokploy).
                            </p>
                            <SelectInput
                                label="Proveedor de Facturación"
                                id="facturacion_provider"
                                icon={ShieldCheck}
                                value={data.facturacion_provider}
                                onChange={(e) =>
                                    setData(
                                        'facturacion_provider',
                                        e.target.value,
                                    )
                                }
                                options={[
                                    {
                                        value: '',
                                        label: 'Auto (según .env / Dokploy)',
                                    },
                                    {
                                        value: 'plataforma',
                                        label: 'Plataforma-Sunat (en la nube)',
                                    },
                                    {
                                        value: 'apisunat',
                                        label: 'APISUNAT (actual)',
                                    },
                                ]}
                                error={errors.facturacion_provider}
                            />
                            <FormInput
                                label="URL Base de la Plataforma"
                                id="sunat_plataforma_base_url"
                                value={data.sunat_plataforma_base_url}
                                onChange={(e) =>
                                    setData(
                                        'sunat_plataforma_base_url',
                                        e.target.value,
                                    )
                                }
                                icon={Globe}
                                placeholder="https://api.cma-shop.com/api/v1"
                                error={errors.sunat_plataforma_base_url}
                            />
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormInput
                                    label="API Key"
                                    id="sunat_plataforma_api_key"
                                    value={data.sunat_plataforma_api_key}
                                    onChange={(e) =>
                                        setData(
                                            'sunat_plataforma_api_key',
                                            e.target.value,
                                        )
                                    }
                                    icon={Key}
                                    placeholder="X-Api-Key del tenant"
                                    error={errors.sunat_plataforma_api_key}
                                />
                                <FormInput
                                    label="API Secret"
                                    id="sunat_plataforma_api_secret"
                                    type="password"
                                    value={data.sunat_plataforma_api_secret}
                                    onChange={(e) =>
                                        setData(
                                            'sunat_plataforma_api_secret',
                                            e.target.value,
                                        )
                                    }
                                    icon={Key}
                                    placeholder="X-Api-Secret del tenant"
                                    error={errors.sunat_plataforma_api_secret}
                                />
                            </div>
                            <FormInput
                                label="Webhook Secret (firma del PDF y estados)"
                                id="sunat_webhook_secret"
                                type="password"
                                value={data.sunat_webhook_secret}
                                onChange={(e) =>
                                    setData(
                                        'sunat_webhook_secret',
                                        e.target.value,
                                    )
                                }
                                icon={Key}
                                placeholder="Mismo valor que SUNAT_WEBHOOK_SECRET en la plataforma"
                                error={errors.sunat_webhook_secret}
                            />
                        </FormSection>

                        <FormSection
                            title="Consultas DNI/RUC (ApisPeru)"
                            icon={Search}
                        >
                            <p className="-mt-2 text-xs font-medium text-slate-500">
                                Token usado para validar DNI (8) y RUC (11) de
                                clientes al vender. Si lo dejas vacío, se usa la
                                variable de entorno APISPERU_TOKEN.
                            </p>
                            <FormInput
                                label="Token ApisPeru"
                                id="apisperu_token"
                                type="password"
                                value={data.apisperu_token}
                                onChange={(e) =>
                                    setData('apisperu_token', e.target.value)
                                }
                                icon={Key}
                                placeholder="Token de dniruc.apisperu.com"
                                error={errors.apisperu_token}
                            />
                            <FormInput
                                label="URL Base ApisPeru (opcional)"
                                id="apisperu_base_url"
                                value={data.apisperu_base_url}
                                onChange={(e) =>
                                    setData('apisperu_base_url', e.target.value)
                                }
                                icon={Globe}
                                placeholder="https://dniruc.apisperu.com"
                                error={errors.apisperu_base_url}
                            />
                        </FormSection>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex h-12 items-center gap-2 rounded-2xl bg-indigo-600 px-8 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
                            >
                                <Save size={18} /> Guardar Cambios
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6 lg:col-span-1">
                        <FormSection title="Logotipo" icon={ImageIcon}>
                            <div className="flex flex-col items-center gap-6">
                                <div className="group flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition-all hover:border-indigo-300">
                                    {logoPreview ? (
                                        <div className="group relative h-full w-full">
                                            <img
                                                src={logoPreview}
                                                alt="Logo Preview"
                                                className="h-full w-full object-contain p-4"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setLogoPreview(null);
                                                    setData('logo', null);
                                                }}
                                                className="absolute right-2 top-2 rounded-full bg-rose-500 p-1.5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex cursor-pointer flex-col items-center gap-2 p-8">
                                            <Upload
                                                size={32}
                                                className="text-slate-300"
                                            />
                                            <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                                                Subir Logotipo
                                            </span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                            />
                                        </label>
                                    )}
                                </div>
                                <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    PNG o JPG transparente
                                    <br />
                                    Máximo 1MB
                                </p>
                            </div>
                        </FormSection>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
