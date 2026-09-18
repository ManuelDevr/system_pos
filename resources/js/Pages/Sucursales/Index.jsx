import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Store, Plus, Trash2, ToggleRight, ToggleLeft, MapPin, Phone, FileText, X, Check, Building } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Index({ sucursales }) {
  const [form, setForm] = useState({ nombre: '', direccion: '', telefono: '', ruc: '', serie_factura: '', serie_boleta: '', principal: false });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const resetForm = () => {
    setForm({ nombre: '', direccion: '', telefono: '', ruc: '', serie_factura: '', serie_boleta: '', principal: false });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (s) => {
    setForm({ nombre: s.nombre, direccion: s.direccion || '', telefono: s.telefono || '', ruc: s.ruc || '', serie_factura: s.serie_factura || '', serie_boleta: s.serie_boleta || '', principal: s.principal });
    setEditing(s);
    setShowForm(true);
  };

  const handleSave = () => {
    const isEdit = !!editing;
    const method = isEdit ? 'put' : 'post';
    const params = isEdit ? { sucursal: editing.id } : {};

    router[method](isEdit ? route('sucursales.update', params) : route('sucursales.store'), form, {
      onSuccess: () => { toast.success(isEdit ? 'Sucursal actualizada' : 'Sucursal agregada'); resetForm(); },
      onError: (err) => toast.error(Object.values(err).join(', ')),
    });
  };

  const handleToggle = (s) => {
    router.patch(route('sucursales.toggle', s.id), {}, {
      onSuccess: () => toast.success('Estado actualizado'),
      onError: () => toast.error('Error al cambiar estado'),
    });
  };

  const handleDelete = (s) => {
    if (!confirm('¿Eliminar esta sucursal?')) return;
    router.delete(route('sucursales.destroy', s.id), {
      onSuccess: () => toast.success('Sucursal eliminada'),
      onError: () => toast.error('Error al eliminar'),
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Sucursales" />
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Sucursales</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Gestiona las sucursales de la empresa</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="h-11 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cancelar' : 'Nueva Sucursal'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Building size={18} /></div>
              {editing ? 'Editar Sucursal' : 'Nueva Sucursal'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-widest">Nombre</label>
                <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm font-medium" placeholder="Sucursal Centro" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-widest">RUC</label>
                <input type="text" value={form.ruc} onChange={e => setForm({ ...form, ruc: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm font-medium" placeholder="20123456789" maxLength="11" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-widest">Dirección</label>
                <input type="text" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm font-medium" placeholder="Av. Principal 456" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-widest">Teléfono</label>
                <input type="text" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm font-medium" placeholder="01-9876543" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-widest">Serie Factura</label>
                <input type="text" value={form.serie_factura} onChange={e => setForm({ ...form, serie_factura: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm font-medium" placeholder="F001" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-widest">Serie Boleta</label>
                <input type="text" value={form.serie_boleta} onChange={e => setForm({ ...form, serie_boleta: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm font-medium" placeholder="B001" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.principal} onChange={e => setForm({ ...form, principal: e.target.checked })} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm font-bold text-slate-600">Sucursal principal</span>
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancelar</button>
              <button type="button" onClick={handleSave} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-sm transition-all active:scale-95 flex items-center gap-2">
                <Check size={16} /> {editing ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {sucursales.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <Store size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">No hay sucursales registradas</p>
              <p className="text-xs text-slate-400 mt-1">Haz clic en "Nueva Sucursal" para agregar una</p>
            </div>
          )}

          {sucursales.map(s => (
            <div key={s.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 transition-all shadow-sm">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${s.principal ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                  <Store size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-lg">{s.nombre}</span>
                    {s.principal && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full">Principal</span>}
                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full ${s.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {s.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                    {s.direccion && <span className="flex items-center gap-1"><MapPin size={12} /> {s.direccion}</span>}
                    {s.telefono && <span className="flex items-center gap-1"><Phone size={12} /> {s.telefono}</span>}
                    {s.ruc && <span className="flex items-center gap-1"><FileText size={12} /> RUC: {s.ruc}</span>}
                  </div>
                  {(s.serie_factura || s.serie_boleta) && (
                    <div className="flex gap-3 mt-1.5 text-[10px] font-bold text-slate-400">
                      {s.serie_factura && <span>Factura: {s.serie_factura}</span>}
                      {s.serie_boleta && <span>Boleta: {s.serie_boleta}</span>}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(s)} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all text-xs font-bold">Editar</button>
                <button onClick={() => handleToggle(s)} className={`p-2.5 rounded-xl border transition-all ${s.activo ? 'bg-white border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-300' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
                  {s.activo ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                </button>
                {!s.principal && (
                  <button onClick={() => handleDelete(s)} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-300 transition-all"><Trash2 size={16} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
