import React, { useState, useMemo } from 'react';
import { Plus, X, Edit, Check, ToggleLeft, ToggleRight, Ruler, Search, ArrowLeft, PlusCircle } from 'lucide-react';
import { useForm, router } from '@inertiajs/react';
import toast from 'react-hot-toast';

/* Paleta de colores para badges de abreviatura */
const BADGE_COLORS = [
  'bg-sky-100 text-sky-700',
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
];

const getBadgeColor = (name = '') => {
  const i = (name.charCodeAt(0) || 0) % BADGE_COLORS.length;
  return BADGE_COLORS[i];
};

/* ────────────────────────────────────────────
   Formulario de añadir unidad
──────────────────────────────────────────── */
const AddUnitForm = ({ onBack, processing, data, setData, onSubmit }) => (
  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
    <div className="flex items-center gap-3 mb-6">
      <button
        onClick={onBack}
        className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors"
      >
        <ArrowLeft size={18} />
      </button>
      <div>
        <h3 className="text-base font-bold text-slate-800">Nueva Unidad de Medida</h3>
        <p className="text-xs text-slate-400 mt-0.5">Define el nombre y su abreviatura</p>
      </div>
    </div>

    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Nombre <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={data.nombre}
            onChange={(e) => setData('nombre', e.target.value)}
            placeholder="Ej: Kilogramo, Litro, Metro..."
            className="w-full px-4 py-2.5 bg-white text-sm text-slate-800 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 rounded-xl outline-none transition-all"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Abreviatura <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={data.abreviatura}
            onChange={(e) => setData('abreviatura', e.target.value)}
            placeholder="Ej: kg, L, m..."
            className="w-full px-4 py-2.5 bg-white text-sm text-slate-800 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 rounded-xl outline-none transition-all"
          />
        </div>
      </div>

      {/* Preview */}
      {(data.nombre || data.abreviatura) && (
        <div className="flex items-center gap-3 p-3.5 bg-sky-50 rounded-xl border border-sky-100">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${getBadgeColor(data.nombre)}`}>
            {data.abreviatura || '—'}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{data.nombre || 'Nombre...'}</p>
            <p className="text-xs text-slate-500">Vista previa de la unidad</p>
          </div>
        </div>
      )}

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
          className="flex-1 h-10 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-sm shadow-sky-200"
        >
          <Plus size={15} />
          {processing ? 'Guardando...' : 'Registrar Unidad'}
        </button>
      </div>
    </form>
  </div>
);

/* ────────────────────────────────────────────
   Manager principal
──────────────────────────────────────────── */
const UnitManager = ({ units = [] }) => {
  const [view, setView] = useState('list');
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({ nombre: '', abreviatura: '' });
  const [search, setSearch] = useState('');

  const { data, setData, post, processing, reset } = useForm({
    nombre: '',
    abreviatura: '',
  });

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!data.nombre.trim() || !data.abreviatura.trim()) {
      toast.error('Nombre y abreviatura son requeridos');
      return;
    }
    post(route('unidades.store'), {
      onSuccess: () => {
        toast.success('Unidad añadida');
        reset();
        setView('list');
      },
    });
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditingData({ nombre: item.nombre, abreviatura: item.abreviatura });
  };

  const handleUpdateItem = (item) => {
    if (!editingData.nombre.trim() || !editingData.abreviatura.trim()) {
      toast.error('Nombre y abreviatura son requeridos');
      return;
    }
    router.put(route('unidades.update', editingId), {
      ...editingData,
      estado: item.estado,
    }, {
      onSuccess: () => {
        toast.success('Unidad actualizada');
        setEditingId(null);
      },
    });
  };

  const handleToggleStatus = (id) => {
    router.patch(route('unidades.toggle', id), {}, {
      onSuccess: () => toast.success('Estado actualizado'),
    });
  };

  // Estadísticas
  const totalActivas = units.filter(u => u.estado === 'Activo').length;
  const totalInactivas = units.length - totalActivas;

  // Filtrado
  const filtered = useMemo(() => {
    if (!search.trim()) return units;
    const q = search.toLowerCase();
    return units.filter(u =>
      u.nombre.toLowerCase().includes(q) ||
      u.abreviatura.toLowerCase().includes(q)
    );
  }, [units, search]);

  return (
    <div className="space-y-6">
      {/* ── Banner ── */}
      <div className="relative bg-gradient-to-br from-sky-600 via-sky-700 to-teal-700 rounded-2xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-56 h-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-6 w-40 h-40 rounded-full bg-white" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-7 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/20">
              <Ruler size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Unidades de Medida</h1>
              <p className="text-sky-200 text-sm mt-0.5">Gestiona las unidades utilizadas en tus productos</p>
            </div>
          </div>
          {view === 'list' && (
            <button
              onClick={() => setView('add')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-sky-700 font-semibold text-sm rounded-xl hover:bg-sky-50 transition-colors shadow-sm shrink-0"
            >
              <Plus size={16} />
              Nueva Unidad
            </button>
          )}
        </div>
      </div>

      {/* ── Estadísticas ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Unidades', value: units.length, color: 'sky', icon: Ruler },
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
            <AddUnitForm
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
                  placeholder="Buscar por nombre o abreviatura..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 rounded-xl outline-none transition-all text-slate-700"
                />
              </div>
              <p className="text-xs text-slate-400 shrink-0">
                {filtered.length} {filtered.length === 1 ? 'unidad' : 'unidades'}
              </p>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto min-h-[300px] max-h-[520px] overflow-y-auto">
              {filtered.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unidad</th>
                      <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Abreviatura</th>
                      <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado</th>
                      <th className="text-right px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((item) => {
                      const isEditing = editingId === item.id;
                      const isActive = item.estado === 'Activo';
                      const badgeColor = getBadgeColor(item.nombre);

                      return (
                        <tr
                          key={item.id}
                          className={`group transition-colors ${isActive ? 'hover:bg-sky-50/30' : 'opacity-60'}`}
                        >
                          {/* Nombre */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${isActive ? badgeColor : 'bg-slate-100 text-slate-400'}`}>
                                {item.abreviatura}
                              </div>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingData.nombre}
                                  onChange={e => setEditingData({ ...editingData, nombre: e.target.value })}
                                  className="w-40 px-2 py-1 text-sm text-slate-800 border border-sky-400 ring-1 ring-sky-400 rounded-lg font-semibold outline-none"
                                  autoFocus
                                />
                              ) : (
                                <span className={`text-sm font-semibold ${isActive ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                                  {item.nombre}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Abreviatura */}
                          <td className="px-5 py-3.5">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editingData.abreviatura}
                                onChange={e => setEditingData({ ...editingData, abreviatura: e.target.value })}
                                className="w-20 px-2 py-1 text-sm text-slate-800 border border-sky-400 ring-1 ring-sky-400 rounded-lg font-semibold text-center outline-none"
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleUpdateItem(item);
                                  if (e.key === 'Escape') setEditingId(null);
                                }}
                              />
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                                {item.abreviatura}
                              </span>
                            )}
                          </td>

                          {/* Estado */}
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>

                          {/* Acciones */}
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-slate-100 rounded-2xl mb-3">
                    <Ruler size={28} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">
                    {search ? 'Sin resultados' : 'Sin unidades registradas'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {search ? 'Intenta con otro término' : 'Añade tu primera unidad con el botón "Nueva Unidad"'}
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

export default UnitManager;
