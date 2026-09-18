import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Building, Image as ImageIcon, Save, Upload, X, MapPin, Phone, Mail, FileText, ShieldCheck, Key, Globe, FileSpreadsheet, Percent } from 'lucide-react';
import toast from 'react-hot-toast';

const FormSection = ({ title, icon: Icon, children }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
    <h3 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-6">
      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
        <Icon size={20} />
      </div>
      <span>{title}</span>
    </h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const FormInput = ({ label, id, icon: Icon, error, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1 tracking-widest">{label}</label>
    <div className="relative">
      {Icon && <span className="absolute inset-y-0 left-0 flex items-center pl-3"><Icon className="w-4 h-4 text-slate-400" /></span>}
      <input id={id} {...props} className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-3 py-2.5 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm font-medium ${error ? 'border-red-500' : ''}`} />
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const SelectInput = ({ label, id, icon: Icon, options, error, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1 tracking-widest">{label}</label>
    <div className="relative">
      {Icon && <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Icon className="w-4 h-4 text-slate-400" /></span>}
      <select id={id} {...props} className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-10 py-2.5 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm font-medium appearance-none ${error ? 'border-red-500' : ''}`}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
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
    igv: configuracion?.igv ?? 18.00,
    certificado_digital: null,
    certificado_digital_remove: false,
  });

  const getLogoUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `/storage/${path}`;
  };

  const [logoPreview, setLogoPreview] = useState(getLogoUrl(configuracion?.logo_empresa));
  const [certNombre, setCertNombre] = useState(configuracion?.certificado_digital ? configuracion.certificado_digital.split('/').pop() : null);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) { setData('logo', file); setLogoPreview(URL.createObjectURL(file)); }
  };

  const handleCertChange = (e) => {
    const file = e.target.files[0];
    if (file) { setData('certificado_digital', file); setCertNombre(file.name); setData('certificado_digital_remove', false); }
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
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Configuración del Sistema</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Datos de la empresa, facturación electrónica y sucursales</p>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <FormSection title="Datos de la Empresa" icon={Building}>
              <FormInput label="Nombre de la Ferretería" id="nombre_empresa" value={data.nombre_empresa} onChange={e => setData('nombre_empresa', e.target.value)} icon={Building} placeholder="Ej: Ferretería CMA S.A.C." error={errors.nombre_empresa} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="RUC" id="ruc" value={data.ruc} onChange={e => setData('ruc', e.target.value)} icon={FileText} placeholder="20123456789" error={errors.ruc} />
                <FormInput label="Teléfono de Contacto" id="telefono" value={data.telefono} onChange={e => setData('telefono', e.target.value)} icon={Phone} placeholder="01-2345678" error={errors.telefono} />
              </div>
              <FormInput label="Dirección Fiscal" id="direccion" value={data.direccion} onChange={e => setData('direccion', e.target.value)} icon={MapPin} placeholder="Av. Principal 123, Ciudad" error={errors.direccion} />
                <FormInput label="Correo de Contacto" id="correo" value={data.correo} onChange={e => setData('correo', e.target.value)} icon={Mail} placeholder="correo@ferreteria.com" error={errors.correo} />
            </FormSection>

            <FormSection title="Parámetros de Facturación Electrónica" icon={ShieldCheck}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Usuario SOL Secundario" id="sol_usuario" value={data.sol_usuario} onChange={e => setData('sol_usuario', e.target.value)} icon={Key} placeholder="USUARIO_SOL" error={errors.sol_usuario} />
                <FormInput label="Clave SOL Secundaria" id="sol_clave" type="password" value={data.sol_clave} onChange={e => setData('sol_clave', e.target.value)} icon={Key} placeholder="********" error={errors.sol_clave} />
              </div>
              <SelectInput label="Entorno" id="entorno" icon={Globe} value={data.entorno} onChange={e => setData('entorno', e.target.value)} options={[{ value: 'Beta', label: 'Beta (Pruebas)' }, { value: 'Produccion', label: 'Producción' }]} error={errors.entorno} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Serie Factura (F001)" id="serie_factura" value={data.serie_factura} onChange={e => setData('serie_factura', e.target.value)} icon={FileSpreadsheet} placeholder="F001" error={errors.serie_factura} />
                <FormInput label="Serie Boleta (B001)" id="serie_boleta" value={data.serie_boleta} onChange={e => setData('serie_boleta', e.target.value)} icon={FileSpreadsheet} placeholder="B001" error={errors.serie_boleta} />
                <FormInput label="Serie Nota Crédito" id="serie_nota_credito" value={data.serie_nota_credito} onChange={e => setData('serie_nota_credito', e.target.value)} icon={FileSpreadsheet} placeholder="FC01" error={errors.serie_nota_credito} />
                <FormInput label="Serie Nota Débito" id="serie_nota_debito" value={data.serie_nota_debito} onChange={e => setData('serie_nota_debito', e.target.value)} icon={FileSpreadsheet} placeholder="FD01" error={errors.serie_nota_debito} />
                <FormInput label="IGV (%)" id="igv" type="number" step="0.01" min="0" max="100" value={data.igv} onChange={e => setData('igv', parseFloat(e.target.value) || 0)} icon={Percent} placeholder="18.00" error={errors.igv} />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-widest">Certificado Digital (.pfx / .cer)</label>
                <div className="flex items-center gap-4">
                  {certNombre ? (
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <FileText size={18} className="text-indigo-500" />
                      <span className="text-sm font-medium text-slate-700">{certNombre}</span>
                      <button type="button" onClick={removeCert} className="p-1 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100"><X size={14} /></button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-xl border border-dashed border-slate-300 cursor-pointer hover:border-indigo-400 transition-colors">
                      <Upload size={18} className="text-slate-400" />
                      <span className="text-sm font-medium text-slate-500">Seleccionar archivo</span>
                      <input type="file" className="hidden" accept=".pfx,.cer,.p12" onChange={handleCertChange} />
                    </label>
                  )}
                </div>
              </div>
            </FormSection>

            <div className="flex justify-end">
              <button type="submit" disabled={processing} className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
                <Save size={18} /> Guardar Cambios
              </button>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <FormSection title="Logotipo" icon={ImageIcon}>
              <div className="flex flex-col items-center gap-6">
                <div className="w-full aspect-square bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-200 group hover:border-indigo-300 transition-all">
                  {logoPreview ? (
                    <div className="relative w-full h-full group">
                      <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain p-4" />
                      <button type="button" onClick={() => { setLogoPreview(null); setData('logo', null); }} className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><X size={14} /></button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2 p-8">
                      <Upload size={32} className="text-slate-300" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Subir Logotipo</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                    </label>
                  )}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">PNG o JPG transparente<br/>Máximo 1MB</p>
              </div>
            </FormSection>
          </div>
        </form>

      </div>
    </AuthenticatedLayout>
  );
}
