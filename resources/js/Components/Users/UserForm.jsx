import React from 'react';
import { User, Mail, Shield, Lock, X, Save, Phone, Plus } from 'lucide-react';
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
        className={`w-full pl-10 pr-3 py-2 bg-slate-50 text-sm text-slate-800 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-lg ${error ? 'border-red-500' : ''}`} 
      />
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const UserForm = ({ userToEdit, roles = [], onClose }) => {
  const isEdit = !!userToEdit;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: userToEdit?.name || '',
    email: userToEdit?.email || '',
    telefono: userToEdit?.telefono || '',
    password: '',
    rol: userToEdit?.rol || (roles.length > 0 ? roles[0] : 'Cajero'),
    estado: userToEdit?.estado || 'Activo',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const options = {
        onSuccess: () => {
            toast.success(isEdit ? 'Usuario actualizado' : 'Usuario creado');
            onClose();
        },
        onError: () => toast.error('Error al guardar usuario')
    };

    if (isEdit) {
      put(route('usuarios.update', userToEdit.id), options);
    } else {
      post(route('usuarios.store'), options);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput 
        label="Nombre Completo" 
        id="name" 
        name="name" 
        value={data.name} 
        onChange={e => setData('name', e.target.value)} 
        icon={User} 
        placeholder="Ej: Juan Pérez" 
        error={errors.name}
        required 
      />
      <FormInput 
        label="Correo Electrónico" 
        id="email" 
        name="email" 
        value={data.email} 
        onChange={e => setData('email', e.target.value)} 
        icon={Mail} 
        type="email" 
        placeholder="usuario@cma.com" 
        error={errors.email}
        required 
      />
      <FormInput 
        label="Teléfono" 
        id="telefono" 
        name="telefono" 
        value={data.telefono} 
        onChange={e => setData('telefono', e.target.value)} 
        icon={Phone} 
        placeholder="987654321" 
        error={errors.telefono}
      />
      
      {!isEdit && (
        <FormInput 
          label="Contraseña Temporal" 
          id="password" 
          name="password" 
          value={data.password} 
          onChange={e => setData('password', e.target.value)} 
          icon={Lock} 
          type="password" 
          placeholder="••••••••" 
          error={errors.password}
          required 
        />
      )}

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Rol en el Sistema</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Shield className="w-4 h-4 text-slate-400" />
          </span>
          <select 
            value={data.rol} 
            onChange={e => setData('rol', e.target.value)}
            className="w-full pl-10 pr-8 py-2 bg-slate-50 text-sm text-slate-800 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-lg appearance-none"
          >
            {roles.length > 0 ? (
              roles.map(rol => (
                <option key={rol} value={rol}>{rol}</option>
              ))
            ) : (
              <>
                <option value="Cajero">Cajero</option>
                <option value="Administrador">Administrador</option>
              </>
            )}
          </select>
        </div>
        {errors.rol && <p className="text-xs text-red-500 mt-1">{errors.rol}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button type="button" onClick={onClose} className="h-10 px-5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={processing} className="h-10 px-6 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all flex items-center gap-2">
          {isEdit ? <Save size={16} /> : <Plus size={16} />}
          {isEdit ? 'Guardar Cambios' : 'Registrar Usuario'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
