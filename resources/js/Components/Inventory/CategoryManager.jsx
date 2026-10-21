import { useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ChevronDown,
    ChevronRight,
    Edit,
    FolderOpen,
    GitBranch,
    Layers,
    Plus,
    Save,
    Search,
    Tag,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

/* ────────────────────────────────────────────
   Formulario de crear / editar categoría
──────────────────────────────────────────── */
const CategoryForm = ({ categoryToEdit, onCancel, isSub }) => {
    const isEdit = !!categoryToEdit && !isSub;

    const { data, setData, post, put, processing, reset, errors } = useForm({
        nombre: isEdit ? categoryToEdit.nombre : '',
        parent_id: isSub
            ? categoryToEdit.id
            : categoryToEdit?.parent_id || null,
        descripcion: isEdit ? categoryToEdit.descripcion : '',
        visible_tienda: isEdit ? categoryToEdit.visible_tienda !== false : true,
        orden_tienda:
            isEdit && categoryToEdit.orden_tienda != null
                ? categoryToEdit.orden_tienda
                : '',
        estado: isEdit ? categoryToEdit.estado || 'Activo' : 'Activo',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                toast.success(
                    isEdit ? 'Categoría actualizada' : 'Categoría creada',
                );
                onCancel();
            },
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
            <div className="mb-6 flex items-center gap-3">
                <div
                    className={`rounded-xl p-2.5 ${isSub ? 'bg-violet-100' : isEdit ? 'bg-amber-100' : 'bg-indigo-100'}`}
                >
                    {isSub ? (
                        <GitBranch size={18} className="text-violet-600" />
                    ) : isEdit ? (
                        <Edit size={18} className="text-amber-600" />
                    ) : (
                        <Plus size={18} className="text-indigo-600" />
                    )}
                </div>
                <div>
                    <h3 className="text-base font-bold text-slate-800">
                        {title}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                        {isSub
                            ? 'Se creará como subcategoría'
                            : isEdit
                              ? 'Modifica los datos de la categoría'
                              : 'Se añadirá al árbol principal'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Nombre <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        value={data.nombre}
                        onChange={(e) => setData('nombre', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        placeholder="Ej: Herramientas Eléctricas"
                        autoFocus
                    />
                    {errors.nombre && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                            <AlertCircle size={12} /> {errors.nombre}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Descripción{' '}
                        <span className="font-normal normal-case text-slate-400">
                            (opcional)
                        </span>
                    </label>
                    <textarea
                        value={data.descripcion}
                        onChange={(e) => setData('descripcion', e.target.value)}
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        rows="3"
                        placeholder="Descripción breve de la categoría..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                            Orden en tienda
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={data.orden_tienda}
                            onChange={(e) =>
                                setData('orden_tienda', e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            placeholder="Opcional"
                        />
                        {errors.orden_tienda && (
                            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                                <AlertCircle size={12} /> {errors.orden_tienda}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                            Visible en tienda
                        </label>
                        <button
                            type="button"
                            onClick={() =>
                                setData('visible_tienda', !data.visible_tienda)
                            }
                            className={`flex h-[42px] w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-colors ${
                                data.visible_tienda
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-200 text-slate-600'
                            }`}
                        >
                            {data.visible_tienda ? 'Visible' : 'Oculta'}
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="h-10 flex-1 rounded-xl bg-slate-100 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700 disabled:opacity-50"
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
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-150 ${
                    isActive ? 'hover:bg-indigo-50/60' : 'opacity-50'
                }`}
                style={{ paddingLeft: `${depth * 20 + 12}px` }}
            >
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    {/* Indicador de árbol */}
                    {depth > 0 && (
                        <div className="h-px w-4 shrink-0 bg-slate-200" />
                    )}

                    {/* Toggle hijos */}
                    {hasChildren ? (
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                        >
                            {isOpen ? (
                                <ChevronDown size={13} />
                            ) : (
                                <ChevronRight size={13} />
                            )}
                        </button>
                    ) : (
                        <div className="w-6 shrink-0" />
                    )}

                    {/* Ícono de categoría */}
                    <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                            depth === 0
                                ? isActive
                                    ? 'bg-indigo-100'
                                    : 'bg-slate-100'
                                : isActive
                                  ? 'bg-violet-50'
                                  : 'bg-slate-100'
                        }`}
                    >
                        {depth === 0 ? (
                            <FolderOpen
                                size={13}
                                className={
                                    isActive
                                        ? 'text-indigo-600'
                                        : 'text-slate-400'
                                }
                            />
                        ) : (
                            <Tag
                                size={12}
                                className={
                                    isActive
                                        ? 'text-violet-500'
                                        : 'text-slate-400'
                                }
                            />
                        )}
                    </div>

                    {/* Nombre */}
                    <span
                        className={`truncate text-sm ${
                            isActive
                                ? depth === 0
                                    ? 'font-semibold text-slate-800'
                                    : 'font-medium text-slate-700'
                                : 'text-slate-400 line-through'
                        }`}
                    >
                        {category.nombre}
                    </span>

                    {/* Badge de subcats */}
                    {hasChildren && isOpen === false && (
                        <span className="shrink-0 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-500">
                            {category.children.length}
                        </span>
                    )}
                </div>

                {/* Acciones */}
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {!category.parent_id && (
                        <button
                            onClick={() => onAddSub(category)}
                            className="rounded-lg p-1.5 text-violet-600 transition-colors hover:bg-violet-50"
                            title="Añadir Subcategoría"
                        >
                            <GitBranch size={13} />
                        </button>
                    )}
                    <button
                        onClick={() => onEdit(category)}
                        className="rounded-lg p-1.5 text-amber-600 transition-colors hover:bg-amber-50"
                        title="Editar"
                    >
                        <Edit size={13} />
                    </button>
                </div>
            </div>

            {/* Hijos */}
            {hasChildren && isOpen && (
                <div className="space-y-0.5">
                    {category.children.map((child) => (
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
    const totalSubs = categories.reduce(
        (acc, c) => acc + (c.children?.length || 0),
        0,
    );
    const totalActivas = categories.filter((c) => c.estado === 'Activo').length;

    // Filtrado por búsqueda (en nombre de categoría o subcategoría)
    const filtered = useMemo(() => {
        if (!search.trim()) return categories;
        const q = search.toLowerCase();
        return categories
            .map((cat) => {
                const matchParent = cat.nombre.toLowerCase().includes(q);
                const matchedChildren = (cat.children || []).filter((ch) =>
                    ch.nombre.toLowerCase().includes(q),
                );
                if (matchParent || matchedChildren.length > 0) {
                    return {
                        ...cat,
                        children: matchParent
                            ? cat.children || []
                            : matchedChildren,
                    };
                }
                return null;
            })
            .filter(Boolean);
    }, [categories, search]);

    return (
        <div className="space-y-6">
            {/* ── Banner de encabezado ── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 shadow-lg">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -right-8 -top-8 h-56 w-56 rounded-full bg-white" />
                    <div className="absolute -bottom-10 -left-6 h-40 w-40 rounded-full bg-white" />
                </div>
                <div className="relative z-10 flex flex-col items-start justify-between gap-4 px-7 py-6 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                        <div className="rounded-2xl border border-white/20 bg-white/20 p-3 backdrop-blur-sm">
                            <Layers size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">
                                Categorías
                            </h1>
                            <p className="mt-0.5 text-sm text-indigo-200">
                                Organiza tus productos en categorías y
                                subcategorías
                            </p>
                        </div>
                    </div>
                    {view === 'list' && (
                        <button
                            onClick={handleAddParent}
                            className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50"
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
                    {
                        label: 'Categorías Principales',
                        value: totalPrincipales,
                        color: 'indigo',
                        icon: FolderOpen,
                    },
                    {
                        label: 'Subcategorías',
                        value: totalSubs,
                        color: 'violet',
                        icon: Tag,
                    },
                    {
                        label: 'Activas',
                        value: totalActivas,
                        color: 'emerald',
                        icon: Layers,
                    },
                ].map(({ label, value, color, icon: Icon }) => (
                    <div
                        key={label}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                {label}
                            </p>
                            <div className={`rounded-lg p-1.5 bg-${color}-50`}>
                                <Icon
                                    size={13}
                                    className={`text-${color}-500`}
                                />
                            </div>
                        </div>
                        <p className={`text-2xl font-black text-${color}-600`}>
                            {value}
                        </p>
                    </div>
                ))}
            </div>

            {/* ── Panel principal ── */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                        <div className="flex flex-col items-start gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:items-center">
                            <div className="relative w-full flex-1">
                                <Search
                                    size={15}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar categoría..."
                                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>
                            <p className="shrink-0 text-xs text-slate-400">
                                {filtered.length}{' '}
                                {filtered.length === 1
                                    ? 'resultado'
                                    : 'resultados'}
                            </p>
                        </div>

                        {/* Lista de categorías */}
                        <div className="max-h-[520px] min-h-[300px] space-y-0.5 overflow-y-auto p-3">
                            {filtered.length > 0 ? (
                                filtered.map((cat) => (
                                    <CategoryItem
                                        key={cat.id}
                                        category={cat}
                                        onEdit={handleEdit}
                                        onAddSub={handleAddSub}
                                    />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="mb-3 rounded-2xl bg-slate-100 p-4">
                                        <Layers
                                            size={28}
                                            className="text-slate-400"
                                        />
                                    </div>
                                    <p className="mb-1 text-sm font-semibold text-slate-600">
                                        {search
                                            ? 'Sin resultados'
                                            : 'Sin categorías'}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {search
                                            ? 'Intenta con otro término de búsqueda'
                                            : 'Crea tu primera categoría haciendo clic en "Nueva Categoría"'}
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
