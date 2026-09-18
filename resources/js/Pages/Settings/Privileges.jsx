import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { ShieldCheck, Save, ShieldAlert, UserCog, Settings2, Shield, X } from 'lucide-react';
import toast from 'react-hot-toast';
import CommonModal from '@/Components/CommonModal';

export default function Privileges({ availablePermissions, permisosExistentes, roles }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  
  // Estado local para los permisos editables
  const [matrix, setMatrix] = useState({});

  // Cargar datos iniciales cuando cambian los permisos del servidor
  useEffect(() => {
    const initialState = {};
    roles.forEach(r => {
      const rol = r.id;
      initialState[rol] = {};
      availablePermissions.forEach(perm => {
        const exist = permisosExistentes.find(p => p.rol === rol && p.permiso === perm.key);
        initialState[rol][perm.key] = exist ? !!exist.permitido : (rol === 'Administrador');
      });
    });
    setMatrix(initialState);
  }, [permisosExistentes, availablePermissions, roles]);

  const { processing } = useForm();

  const handleOpenManager = (role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleTogglePermission = (rol, permissionKey) => {
    setMatrix(prev => ({
      ...prev,
      [rol]: {
        ...prev[rol],
        [permissionKey]: !prev[rol][permissionKey]
      }
    }));
  };

  const handleSaveRolePermissions = () => {
    const flatPrivilegios = [];
    Object.keys(matrix).forEach(rol => {
      Object.keys(matrix[rol]).forEach(permiso => {
        flatPrivilegios.push({
          rol,
          permiso,
          permitido: matrix[rol][permiso]
        });
      });
    });

    router.post(route('privilegios.update'), { privilegios: flatPrivilegios }, {
      onSuccess: () => {
          toast.success(`Privilegios actualizados correctamente`);
          setIsModalOpen(false);
          // Forzar refresco de la página para que el Sidebar se actualice
          window.location.reload();
      },
      onError: (errors) => {
          console.error(errors);
          toast.error('Error al guardar los privilegios');
      }
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Privilegios por Rol" />

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white shadow-sm rounded-3xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Perfil de Usuario</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Permisos Activos</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-10">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {roles.map((role) => {
                const activeCount = matrix[role.id] ? Object.values(matrix[role.id]).filter(v => v).length : 0;
                return (
                  <tr key={role.id} className="group hover:bg-slate-50/30 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${role.color} shadow-sm group-hover:scale-110 transition-transform`}>
                            <UserCog size={22} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">{role.name}</h4>
                            <p className="text-xs text-slate-400">{role.desc}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-black">
                            {activeCount} / {availablePermissions.length}
                        </span>
                    </td>
                    <td className="p-6 text-right pr-8">
                      <button 
                        onClick={() => handleOpenManager(role)}
                        className="p-3 bg-white border border-slate-200 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm hover:shadow-indigo-100 flex items-center justify-center ml-auto"
                      >
                        <Settings2 size={20} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <CommonModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Privilegios: ${selectedRole?.name}`}
        maxWidth="2xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {availablePermissions.map((perm) => (
              <label 
                key={perm.key} 
                className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:border-indigo-300 transition-all group"
              >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${matrix[selectedRole?.id]?.[perm.key] ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                        <Shield size={16} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">{perm.label}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{perm.key}</p>
                    </div>
                </div>
                <div className="relative inline-flex items-center">
                    <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={matrix[selectedRole?.id]?.[perm.key] || false}
                        onChange={() => handleTogglePermission(selectedRole.id, perm.key)}
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 h-12 bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
            >
                Cerrar
            </button>
            <button 
                onClick={handleSaveRolePermissions}
                disabled={processing}
                className="flex-[2] h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                <Save size={18} />
                {processing ? 'Guardando...' : 'Guardar y Aplicar'}
            </button>
          </div>
        </div>
      </CommonModal>
    </AuthenticatedLayout>
  );
}
