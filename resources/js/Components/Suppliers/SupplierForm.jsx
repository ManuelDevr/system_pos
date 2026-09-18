import React from 'react';
import { User, Mail, Phone, FileText, Home, MessageSquare } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';

const FormInput = ({ label, id, icon: Icon, error, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="w-4 h-4 text-slate-400" />
      </span>
      <input id={id} {...props} className={`w-full pl-10 pr-3 py-2 bg-slate-100 text-sm text-slate-800 border-transparent focus:border-indigo-500 focus:ring-0 rounded-lg ${error ? 'border-red-500' : ''}`} />
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const FormTextArea = ({ label, id, icon: Icon, className, error, ...props }) => (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
      <div className="relative">
        <span className="absolute top-3 left-0 flex items-center pl-3">
          <Icon className="w-4 h-4 text-slate-400" />
        </span>
        <textarea id={id} {...props} rows="3" className={`w-full pl-10 pr-3 py-2 bg-slate-100 text-sm text-slate-800 border-transparent focus:border-indigo-500 focus:ring-0 rounded-lg ${error ? 'border-red-500' : ''}`} />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );

const SupplierForm = ({ onClose, supplierToEdit }) => {
  const isEditMode = !!supplierToEdit;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    nombre: supplierToEdit?.nombre || '',
    ruc: supplierToEdit?.ruc || '',
    telefono: supplierToEdit?.telefono || '',
    email: supplierToEdit?.email || '',
    direccion: supplierToEdit?.direccion || '',
    notas: supplierToEdit?.notas || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const options = {
        onSuccess: () => {
            toast.success(isEditMode ? 'Proveedor actualizado' : 'Proveedor registrado');
            onClose();
            reset();
        },
        onError: () => {
            toast.error('Corrige los errores en el formulario');
        }
    };

    if (isEditMode) {
      put(route('proveedores.update', supplierToEdit.id), options);
    } else {
      post(route('proveedores.store'), options);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <FormInput
        label="Nombre"
        id="nombre"
        name="nombre"
        value={data.nombre}
        onChange={e => setData('nombre', e.target.value)}
        icon={User}
        placeholder="Nombre del proveedor"
        error={errors.nombre}
        required
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="RUC"
          id="ruc"
          name="ruc"
          value={data.ruc}
          onChange={e => setData('ruc', e.target.value.replace(/\D/g, ''))}
          icon={FileText}
          placeholder="12345678901"
          error={errors.ruc}
          maxLength="11"
        />
        <FormInput
          label="Teléfono"
          id="telefono"
          name="telefono"
          value={data.telefono}
          onChange={e => setData('telefono', e.target.value.replace(/\D/g, ''))}
          icon={Phone}
          type="tel"
          placeholder="987654321"
          error={errors.telefono}
          maxLength="9"
        />
      </div>
      <FormInput
        label="Correo Electrónico"
        id="email"
        name="email"
        value={data.email}
        onChange={e => setData('email', e.target.value)}
        icon={Mail}
        type="email"
        placeholder="proveedor@ejemplo.com"
        error={errors.email}
      />
      <FormInput
        label="Dirección"
        id="direccion"
        name="direccion"
        value={data.direccion}
        onChange={e => setData('direccion', e.target.value)}
        icon={Home}
        placeholder="Dirección del proveedor"
        error={errors.direccion}
      />
      <FormTextArea
        label="Notas"
        id="notas"
        name="notas"
        value={data.notas}
        onChange={e => setData('notas', e.target.value)}
        icon={MessageSquare}
        placeholder="Notas adicionales..."
        error={errors.notas}
      />

      <div className="flex justify-end gap-3 pt-4">
        <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="h-10 px-5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2"
        >
          Cancelar
        </button>
        <button
            type="submit"
            disabled={processing}
            className="h-10 px-5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          {processing ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Guardar Proveedor')}
        </button>
      </div>
    </form>
  );
};

export default SupplierForm;
