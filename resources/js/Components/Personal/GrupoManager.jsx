import React, { useState, useMemo } from 'react';
import { Users, Shield, Search, Check, X, Edit, ToggleRight, ToggleLeft, KeyRound } from 'lucide-react';
import { router } from '@inertiajs/react';
import toast from 'react-hot-toast';

const ROLE_STYLES = {
  Administrador: 'bg-rose-50 text-red-700 border-red-100',
  Cajero: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

const getRoleStyle = (nombre) => ROLE_STYLES[nombre] || 'bg-indigo-50 text-indigo-700 border-indigo-100';

const GrupoManager = ({ grupos = [] }) => {
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({ codigo: '', descripcion: '' });
  const [search, setSearch] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({ codigo: '', nombre: '', descripcion: '' });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!createData.codigo.trim() || !createData.nombre.trim()) {
      toast.error('El código y nombre son obligatorios');
      return;
    }
    router.post(route('grupos.store'), createData, {
      onSuccess: () => {
        toast.success('Grupo creado exitosamente');
        setShowCreateModal(false);
        setCreateData({ codigo: '', nombre: '', descripcion: '' });
      },
      onError: (err) => {
        Object.values(err).forEach(e => toast.error(e));
      }
    });
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditingData({ codigo: item.codigo, descripcion: item.descripcion || '' });
  };

  const handleUpdateItem = (item) => {
    if (!editingData.codigo.trim()) {
      toast.error('El código es obligatorio');
      return;
    }
    router.put(route('grupos.update', editingId), editingData, {
      onSuccess: () => {
        toast.success('Grupo actualizado');
        setEditingId(null);
      },
      onError: (err) => toast.error(err.codigo?.[0] || 'Error al actualizar el grupo'),
    });
  };

  const handleToggleStatus = (id) => {
    router.patch(route('grupos.toggle', id), {}, {
      onSuccess: () => toast.success('Estado del grupo actualizado'),
    });
  };

  const totalActivos = grupos.filter(g => g.estado === 'Activo').length;
  const totalInactivos = grupos.length - totalActivos;

  const filtered = useMemo(() => {
    if (!search.trim()) return grupos;
    const q = search.toLowerCase();
    return grupos.filter(g =>
      (g.codigo?.toLowerCase().includes(q)) ||
      (g.nombre?.toLowerCase().includes(q)) ||
      (g.descripcion?.toLowerCase().includes(q))
    );
  }, [grupos, search]);

  return (
    <div className="space-y-6">
      <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-700 rounded-2xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-56 h-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-6 w-40 h-40 rounded-full bg-white" />
        </div>
        <div className="relative z-10 flex items-center gap-4 px-7 py-6">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/20">
            <Users size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Grupo de Personal</h1>
            <p className="text-indigo-200 text-sm mt-0.5">Grupos registrados en el sistema y el personal que pertenece a cada uno</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Grupos', value: grupos.length, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Shield },
          { label: 'Activos', value: totalActivos, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: ToggleRight },
          { label: 'Inactivos', value: totalInactivos, color: 'text-slate-600', bg: 'bg-slate-50', icon: ToggleLeft },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
              <div className={`p-1.5 rounded-lg ${bg}`}>
                <Icon size={13} className={color} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-800">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código, grupo o descripción..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-xl outline-none transition-all text-slate-700"
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shrink-0"
          >
            <Shield size={16} />
            Crear Rol
          </button>
          <p className="text-xs text-slate-400 shrink-0">
            {filtered.length} {filtered.length === 1 ? 'grupo' : 'grupos'}
          </p>
        </div>

        <div className="overflow-x-auto min-h-[300px] max-h-[520px] overflow-y-auto">
          {filtered.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Código</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grupo</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descripción</th>
                  <th className="text-center px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Usuarios</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado</th>
                  <th className="text-right px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acciones</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Permisos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((item) => {
                  const isEditing = editingId === item.id;
                  const isActive = item.estado === 'Activo';
                  const roleStyle = getRoleStyle(item.nombre);

                  return (
                    <tr key={item.id} className={`group transition-colors ${isActive ? 'hover:bg-indigo-50/30' : 'opacity-60'}`}>
                      <td className="px-5 py-3.5">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingData.codigo}
                            onChange={(e) => setEditingData({ ...editingData, codigo: e.target.value })}
                            className="w-24 px-2 py-1 text-sm text-slate-800 border border-indigo-400 ring-1 ring-indigo-400 rounded-lg font-semibold outline-none"
                            autoFocus
                          />
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                            {item.codigo}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${roleStyle}`}>
                          <Shield size={10} />
                          {item.nombre}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingData.descripcion}
                            onChange={(e) => setEditingData({ ...editingData, descripcion: e.target.value })}
                            className="w-full min-w-[180px] px-2 py-1 text-sm text-slate-800 border border-indigo-400 ring-1 ring-indigo-400 rounded-lg font-semibold outline-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateItem(item);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                          />
                        ) : (
                          <span className={`text-sm ${isActive ? 'text-slate-600' : 'text-slate-400'}`}>
                            {item.descripcion || '—'}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1.5 text-sm font-black text-slate-800">
                          <Users size={13} className="text-indigo-400" />
                          {item.total_usuarios}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className={`flex gap-1 justify-end ${isEditing ? '' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleUpdateItem(item)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Guardar"
                              >
                                <Check size={15} />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Cancelar"
                              >
                                <X size={15} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleToggleStatus(item.id)}
                                title={isActive ? 'Desactivar' : 'Activar'}
                                className={`p-1.5 rounded-lg transition-colors ${isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}
                              >
                                {isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                              </button>
                              <button
                                onClick={() => startEditing(item)}
                                className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <KeyRound size={13} className="text-slate-400" />
                          <div className="min-w-[110px]">
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm font-black text-slate-800">{item.permisos_otorgados}</span>
                              <span className="text-xs text-slate-400 font-semibold">/ {item.permisos_total}</span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${item.permisos_total > 0 && item.permisos_otorgados === item.permisos_total ? 'bg-green-500' : 'bg-indigo-500'}`}
                                style={{ width: `${item.permisos_total > 0 ? Math.round((item.permisos_otorgados / item.permisos_total) * 100) : 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-slate-100 rounded-2xl mb-3">
                <Shield size={28} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-600 mb-1">
                {search ? 'Sin resultados' : 'Sin grupos registrados'}
              </p>
              <p className="text-xs text-slate-400">
                {search ? 'Intenta con otro término de búsqueda' : 'Crea usuarios con un rol para que aparezcan sus grupos aquí'}
              </p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Shield size={18} className="text-indigo-600" />
                Crear Nuevo Rol
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Código</label>
                <input
                  type="text"
                  value={createData.codigo}
                  onChange={(e) => setCreateData({ ...createData, codigo: e.target.value })}
                  placeholder="Ej: ROL-CONT"
                  className="w-full px-4 py-2 text-sm bg-white border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-xl outline-none transition-all text-slate-700"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre del Rol</label>
                <input
                  type="text"
                  value={createData.nombre}
                  onChange={(e) => setCreateData({ ...createData, nombre: e.target.value })}
                  placeholder="Ej: Contador"
                  className="w-full px-4 py-2 text-sm bg-white border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-xl outline-none transition-all text-slate-700"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Descripción</label>
                <input
                  type="text"
                  value={createData.descripcion}
                  onChange={(e) => setCreateData({ ...createData, descripcion: e.target.value })}
                  placeholder="Descripción del rol"
                  className="w-full px-4 py-2 text-sm bg-white border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-xl outline-none transition-all text-slate-700"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
                >
                  Guardar Rol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrupoManager;