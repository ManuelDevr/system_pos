import React, { useState, useMemo } from 'react';
import { Plus, X, Edit, Check, ToggleLeft, ToggleRight, Bookmark, Search, ArrowLeft, AlertCircle, Hash } from 'lucide-react';
import { useForm, router } from '@inertiajs/react';
import toast from 'react-hot-toast';

/* Paleta de colores para avatares */
const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-pink-100 text-pink-700',
  'bg-cyan-100 text-cyan-700',
];

const getColor = (name) => {
  const i = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[i];
};

/* ────────────────────────────────────────────
   Formulario de añadir marca
──────────────────────────────────────────── */
const AddBrandForm = ({ onBack, processing, data, setData, onSubmit }) => (
  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
    <div className="flex items-center gap-3 mb-6">
      <button
        onClick={onBack}
        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
      >
        <ArrowLeft size={18} />
      </button>
      <div>
        <h3 className="text-base font-bold text-slate-800">Nueva Marca</h3>
        <p className="text-xs text-slate-400 mt-0.5">Añade una nueva marca al catálogo</p>
      </div>
    </div>

    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
          Nombre de la marca <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={data.nombre}
          onChange={(e) => setData('nombre', e.target.value)}
          placeholder="Ej: Stanley, Bosch, Milwaukee..."
          className="w-full px-4 py-2.5 bg-white text-sm text-slate-800 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl outline-none transition-all"
          autoFocus
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 h-10 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={processing}
          className="flex-1 h-10 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-sm shadow-indigo-200"
        >
          <Plus size={15} />
          {processing ? 'Guardando...' : 'Añadir Marca'}
        </button>
      </div>
    </form>
  </div>
);

/* ────────────────────────────────────────────
   Manager principal
──────────────────────────────────────────── */
const BrandManager = ({ brands = [] }) => {
  const [view, setView] = useState('list');
  const [editingId, setEditingId] = useState(null);
  const [editingNombre, setEditingNombre] = useState('');
  const [search, setSearch] = useState('');

  const { data, setData, post, processing, reset } = useForm({ nombre: '' });

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!data.nombre.trim()) {
      toast.error('El nombre de la marca no puede estar vacío.');
      return;
    }
    post(route('marcas.store'), {
      onSuccess: () => {
        toast.success('Marca añadida');
        reset();
        setView('list');
      },
      onError: (err) => toast.error(err.nombre || 'Error al añadir marca'),
    });
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditingNombre(item.nombre);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingNombre('');
  };

  const handleUpdateItem = (item) => {
    if (!editingNombre.trim()) {
      toast.error('El nombre no puede estar vacío.');
      return;
    }
    router.put(route('marcas.update', editingId), {
      nombre: editingNombre.trim(),
      estado: item.estado,
    }, {
      onSuccess: () => {
        toast.success('Marca actualizada');
        cancelEditing();
      },
    });
  };

  const handleToggleStatus = (id) => {
    router.patch(route('marcas.toggle', id), {}, {
      onSuccess: () => toast.success('Estado actualizado'),
    });
  };

  // Estadísticas
  const totalActivas = brands.filter(b => b.estado === 'Activo').length;
  const totalInactivas = brands.length - totalActivas;

  // Filtrado
  const filtered = useMemo(() => {
    if (!search.trim()) return brands;
    return brands.filter(b => b.nombre.toLowerCase().includes(search.toLowerCase()));
  }, [brands, search]);

  return (
    <div className="space-y-6">
      {/* ── Banner ── */}
      <div className="relative bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-700 rounded-2xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-56 h-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-6 w-40 h-40 rounded-full bg-white" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-7 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/20">
              <Bookmark size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Marcas</h1>
              <p className="text-violet-200 text-sm mt-0.5">Administra las marcas de tus productos</p>
            </div>
          </div>
          {view === 'list' && (
            <button
              onClick={() => setView('add')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-violet-700 font-semibold text-sm rounded-xl hover:bg-violet-50 transition-colors shadow-sm shrink-0"
            >
              <Plus size={16} />
              Nueva Marca
            </button>
          )}
        </div>
      </div>

      {/* ── Estadísticas ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total de Marcas', value: brands.length, color: 'violet', icon: Bookmark },
          { label: 'Activas', value: totalActivas, color: 'emerald', icon: ToggleRight },
          { label: 'Inactivas', value: totalInactivas, color: 'slate', icon: ToggleLeft },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
              <div className={`p-1.5 rounded-lg bg-${color}-50`}>
                <Icon size={13} className={`text-${color}-500`} />
              </div>
            </div>
            <p className={`text-2xl font-black text-${color}-600`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Panel principal ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {view === 'add' ? (
          <div className="p-6">
            <AddBrandForm
              onBack={() => setView('list')}
              processing={processing}
              data={data}
              setData={setData}
              onSubmit={handleAddItem}
            />
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="relative flex-1 w-full">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar marca..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-xl outline-none transition-all text-slate-700"
                />
              </div>
              <p className="text-xs text-slate-400 shrink-0">
                {filtered.length} {filtered.length === 1 ? 'marca' : 'marcas'}
              </p>
            </div>

            {/* Lista */}
            <div className="p-4 min-h-[300px] max-h-[520px] overflow-y-auto">
              {filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filtered.map((item) => {
                    const isEditing = editingId === item.id;
                    const isActive = item.estado === 'Activo';
                    const avatarColor = getColor(item.nombre);

                    return (
                      <div
                        key={item.id}
                        className={`group relative flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 ${
                          isActive
                            ? 'bg-white border-slate-200 hover:border-violet-200 hover:shadow-sm'
                            : 'bg-slate-50 border-slate-100 opacity-60'
                        }`}
                      >
                        {/* Avatar */}
                        {!isEditing && (
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                            isActive ? avatarColor : 'bg-slate-100 text-slate-400'
                          }`}>
                            {item.nombre.charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Nombre / Input edición */}
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingNombre}
                              onChange={e => setEditingNombre(e.target.value)}
                              className="w-full px-2 py-1 text-sm text-slate-800 border border-indigo-400 ring-1 ring-indigo-400 rounded-lg font-semibold outline-none"
                              autoFocus
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleUpdateItem(item);
                                if (e.key === 'Escape') cancelEditing();
                              }}
                            />
                          ) : (
                            <>
                              <p className={`text-sm font-semibold truncate ${isActive ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                                {item.nombre}
                              </p>
                              <p className={`text-[10px] font-medium mt-0.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {isActive ? '● Activa' : '○ Inactiva'}
                              </p>
                            </>
                          )}
                        </div>

                        {/* Acciones */}
                        <div className={`flex gap-1 shrink-0 ${isEditing ? '' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`}>
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
                                onClick={cancelEditing}
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
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-slate-100 rounded-2xl mb-3">
                    <Bookmark size={28} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">
                    {search ? 'Sin resultados' : 'Sin marcas registradas'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {search ? 'Intenta con otro término' : 'Añade tu primera marca con el botón "Nueva Marca"'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BrandManager;
