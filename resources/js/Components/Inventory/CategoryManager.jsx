import React, { useState, useMemo } from 'react';
import { Plus, X, Edit, Save, GitBranch, ChevronRight, ChevronDown, Layers, Search, Tag, FolderOpen, AlertCircle } from 'lucide-react';
import { useForm, router } from '@inertiajs/react';
import toast from 'react-hot-toast';

/* ────────────────────────────────────────────
   Formulario de crear / editar categoría
──────────────────────────────────────────── */
const CategoryForm = ({ categoryToEdit, onCancel, isSub }) => {
  const isEdit = !!categoryToEdit && !isSub;

  const { data, setData, post, put, processing, reset, errors } = useForm({
    nombre: isEdit ? categoryToEdit.nombre : '',
    parent_id: isSub ? categoryToEdit.id : (categoryToEdit?.parent_id || null),
    descripcion: isEdit ? categoryToEdit.descripcion : '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const options = {
      onSuccess: () => {
        toast.success(isEdit ? 'Categoría actualizada' : 'Categoría creada');
        onCancel();
      }
    };
    if (isEdit) {
      put(route('categorias.update', categoryToEdit.id), options);
    } else {
      post(route('categorias.store'), options);
    }
  };

  const title = isSub
    ? `Nueva subcategoría de "${categoryToEdit.nombre}"`
    : isEdit
    ? 'Editar Categoría'
    : 'Nueva Categoría Principal';

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header del formulario */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2.5 rounded-xl ${isSub ? 'bg-violet-100' : isEdit ? 'bg-amber-100' : 'bg-indigo-100'}`}>
          {isSub ? <GitBranch size={18} className="text-violet-600" /> :
           isEdit ? <Edit size={18} className="text-amber-600" /> :
           <Plus size={18} className="text-indigo-600" />}
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isSub ? 'Se creará como subcategoría' : isEdit ? 'Modifica los datos de la categoría' : 'Se añadirá al árbol principal'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Nombre <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={data.nombre}
            onChange={e => setData('nombre', e.target.value)}
            className="w-full px-4 py-2.5 bg-white text-sm text-slate-800 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl outline-none transition-all"
            placeholder="Ej: Herramientas Eléctricas"
            autoFocus
          />
          {errors.nombre && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <AlertCircle size={12} /> {errors.nombre}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Descripción <span className="text-slate-400 font-normal normal-case">(opcional)</span>
          </label>
          <textarea
            value={data.descripcion}
            onChange={e => setData('descripcion', e.target.value)}
            className="w-full px-4 py-2.5 bg-white text-sm text-slate-800 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl outline-none transition-all resize-none"
            rows="3"
            placeholder="Descripción breve de la categoría..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-10 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={processing}
            className="flex-1 h-10 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-sm shadow-indigo-200"
          >
            <Save size={15} />
            {processing ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ────────────────────────────────────────────
   Ítem del árbol de categorías
──────────────────────────────────────────── */
const CategoryItem = ({ category, onEdit, onAddSub, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = category.children && category.children.length > 0;
  const isActive = category.estado === 'Activo';

  return (
    <div>
      <div
        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 ${
          isActive ? 'hover:bg-indigo-50/60' : 'opacity-50'
        }`}
        style={{ paddingLeft: `${(depth * 20) + 12}px` }}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {/* Indicador de árbol */}
          {depth > 0 && (
            <div className="w-4 h-px bg-slate-200 shrink-0" />
          )}

          {/* Toggle hijos */}
          {hasChildren ? (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors shrink-0"
            >
              {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </button>
          ) : (
            <div className="w-6 shrink-0" />
          )}

          {/* Ícono de categoría */}
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            depth === 0
              ? isActive ? 'bg-indigo-100' : 'bg-slate-100'
              : isActive ? 'bg-violet-50' : 'bg-slate-100'
          }`}>
            {depth === 0
              ? <FolderOpen size={13} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
              : <Tag size={12} className={isActive ? 'text-violet-500' : 'text-slate-400'} />
            }
          </div>

          {/* Nombre */}
          <span className={`text-sm truncate ${
            isActive
              ? depth === 0 ? 'font-semibold text-slate-800' : 'font-medium text-slate-700'
              : 'line-through text-slate-400'
          }`}>
            {category.nombre}
          </span>

          {/* Badge de subcats */}
          {hasChildren && isOpen === false && (
            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full shrink-0">
              {category.children.length}
            </span>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {!category.parent_id && (
            <button
              onClick={() => onAddSub(category)}
              className="p-1.5 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
              title="Añadir Subcategoría"
            >
              <GitBranch size={13} />
            </button>
          )}
          <button
            onClick={() => onEdit(category)}
            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit size={13} />
          </button>
        </div>
      </div>

      {/* Hijos */}
      {hasChildren && isOpen && (
        <div className="space-y-0.5">
          {category.children.map(child => (
            <CategoryItem
              key={child.id}
              category={child}
              onEdit={onEdit}
              onAddSub={onAddSub}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────
   Manager principal
──────────────────────────────────────────── */
const CategoryManager = ({ categories = [] }) => {
  const [view, setView] = useState('list');
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSub, setIsSub] = useState(false);
  const [search, setSearch] = useState('');

  const handleAddParent = () => {
    setEditingCategory(null);
    setIsSub(false);
    setView('form');
  };

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setIsSub(false);
    setView('form');
  };

  const handleAddSub = (parent) => {
    setEditingCategory(parent);
    setIsSub(true);
    setView('form');
  };

  // Estadísticas
  const totalPrincipales = categories.length;
  const totalSubs = categories.reduce((acc, c) => acc + (c.children?.length || 0), 0);
  const totalActivas = categories.filter(c => c.estado === 'Activo').length;

  // Filtrado por búsqueda (en nombre de categoría o subcategoría)
  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories
      .map(cat => {
        const matchParent = cat.nombre.toLowerCase().includes(q);
        const matchedChildren = (cat.children || []).filter(ch => ch.nombre.toLowerCase().includes(q));
        if (matchParent || matchedChildren.length > 0) {
          return { ...cat, children: matchParent ? (cat.children || []) : matchedChildren };
        }
        return null;
      })
      .filter(Boolean);
  }, [categories, search]);

  return (
    <div className="space-y-6">
      {/* ── Banner de encabezado ── */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 rounded-2xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-56 h-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-6 w-40 h-40 rounded-full bg-white" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-7 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/20">
              <Layers size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Categorías</h1>
              <p className="text-indigo-200 text-sm mt-0.5">Organiza tus productos en categorías y subcategorías</p>
            </div>
          </div>
          {view === 'list' && (
            <button
              onClick={handleAddParent}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 font-semibold text-sm rounded-xl hover:bg-indigo-50 transition-colors shadow-sm shrink-0"
            >
              <Plus size={16} />
              Nueva Categoría
            </button>
          )}
        </div>
      </div>

      {/* ── Estadísticas rápidas ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Categorías Principales', value: totalPrincipales, color: 'indigo', icon: FolderOpen },
          { label: 'Subcategorías', value: totalSubs, color: 'violet', icon: Tag },
          { label: 'Activas', value: totalActivas, color: 'emerald', icon: Layers },
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
        {view === 'form' ? (
          <div className="p-6">
            <CategoryForm
              categoryToEdit={editingCategory}
              onCancel={() => setView('list')}
              isSub={isSub}
            />
          </div>
        ) : (
          <>
            {/* Barra de herramientas */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="relative flex-1 w-full">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar categoría..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-xl outline-none transition-all text-slate-700"
                />
              </div>
              <p className="text-xs text-slate-400 shrink-0">
                {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
              </p>
            </div>

            {/* Lista de categorías */}
            <div className="p-3 min-h-[300px] max-h-[520px] overflow-y-auto space-y-0.5">
              {filtered.length > 0 ? (
                filtered.map(cat => (
                  <CategoryItem
                    key={cat.id}
                    category={cat}
                    onEdit={handleEdit}
                    onAddSub={handleAddSub}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-slate-100 rounded-2xl mb-3">
                    <Layers size={28} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">
                    {search ? 'Sin resultados' : 'Sin categorías'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {search ? 'Intenta con otro término de búsqueda' : 'Crea tu primera categoría haciendo clic en "Nueva Categoría"'}
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

export default CategoryManager;
