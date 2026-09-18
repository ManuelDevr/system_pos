import React, { useEffect } from 'react';
import { User, Mail, Phone, Plus, X, Save, FileText, Home } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';

const FormInput = ({ label, id, icon: Icon, error, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="w-4 h-4 text-slate-400" />
      </span>
      <input 
        id={id} 
        {...props} 
        className={`w-full pl-10 pr-3 py-2 bg-slate-100 text-sm text-slate-800 border-transparent focus:border-indigo-500 focus:ring-0 rounded-lg ${error ? 'border-red-500' : ''}`} 
      />
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
        <textarea 
            id={id} 
            {...props} 
            rows="3" 
            className={`w-full pl-10 pr-3 py-2 bg-slate-100 text-sm text-slate-800 border-transparent focus:border-indigo-500 focus:ring-0 rounded-lg ${error ? 'border-red-500' : ''}`} 
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );

const ClientForm = ({ onClose, clientToEdit }) => {
  const isEditMode = !!clientToEdit;
  
  const { data, setData, post, put, processing, errors, reset } = useForm({
    nombre: clientToEdit?.nombre || '',
    ruc_dni: clientToEdit?.ruc_dni || '',
    telefono: clientToEdit?.telefono || '',
    email: clientToEdit?.email || '',
    direccion: clientToEdit?.direccion || '',
    estado: clientToEdit?.estado || 'Activo',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const options = {
        onSuccess: () => {
            toast.success(isEditMode ? 'Cliente actualizado' : 'Cliente registrado');
            onClose();
            reset();
        },
        onError: () => {
            toast.error('Corrige los errores en el formulario');
        }
    };

    if (isEditMode) {
      put(route('clientes.update', clientToEdit.id), options);
    } else {
      post(route('clientes.store'), options);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <FormInput 
        label="Nombre Completo" 
        id="nombre" 
        name="nombre" 
        value={data.nombre} 
        onChange={e => setData('nombre', e.target.value)} 
        icon={User} 
        placeholder="Nombre del cliente" 
        error={errors.nombre}
        required 
      />
      <FormInput
        label="DNI / RUC"
        id="ruc_dni"
        name="ruc_dni"
        value={data.ruc_dni}
        onChange={e => setData('ruc_dni', e.target.value.replace(/\D/g, ''))}
        icon={FileText}
        placeholder="Documento de identidad"
        error={errors.ruc_dni}
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
      <FormInput 
        label="Correo Electrónico" 
        id="email" 
        name="email" 
        value={data.email} 
        onChange={e => setData('email', e.target.value)} 
        icon={Mail} 
        type="email" 
        placeholder="cliente@ejemplo.com" 
        error={errors.email}
      />
      <FormTextArea 
        label="Dirección" 
        id="direccion" 
        name="direccion" 
        value={data.direccion} 
        onChange={e => setData('direccion', e.target.value)} 
        icon={Home} 
        placeholder="Dirección del cliente" 
        error={errors.direccion}
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
          {processing ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Guardar Cliente')}
        </button>
      </div>
    </form>
  );
};

export default ClientForm;
