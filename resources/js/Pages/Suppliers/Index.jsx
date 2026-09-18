import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { Plus, Edit, User, Mail, Phone, Home, FileText, ToggleLeft, ToggleRight } from 'lucide-react';
import CommonModal from '@/Components/CommonModal';
import SupplierForm from '@/Components/Suppliers/SupplierForm';
import toast from 'react-hot-toast';

export default function Index({ proveedores }) {
  const { auth } = usePage().props;
  const isAdmin = auth.user.rol === 'Administrador';

  const [showModal, setShowModal] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState(null);

  const openCreate = () => {
    setSupplierToEdit(null);
    setShowModal(true);
  };

  const openEdit = (supplier) => {
    setSupplierToEdit(supplier);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSupplierToEdit(null);
  };

  const handleToggleStatus = (supplier) => {
    router.patch(route('proveedores.toggle', supplier.id), {}, {
      onSuccess: () => toast.success('Estado actualizado'),
      onError: () => toast.error('Error al cambiar estado'),
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Proveedores" />
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Proveedores</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Gestiona tus proveedores</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100">
            <Plus size={18} />
            Nuevo Proveedor
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">RUC</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Teléfono</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {proveedores.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-slate-400 font-medium">
                      <User size={48} className="mx-auto text-slate-200 mb-2" />
                      No hay proveedores registrados
                    </td>
                  </tr>
                ) : proveedores.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{s.nombre}</div>
                    </td>
                    <td className="p-4 text-slate-600 font-mono text-sm">{s.ruc || '-'}</td>
                    <td className="p-4 text-slate-600 text-sm">{s.email || '-'}</td>
                    <td className="p-4 text-slate-600 text-sm">{s.telefono || '-'}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${s.estado ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                        {s.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(s)} className="p-2 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors" title="Editar">
                          <Edit size={14} />
                        </button>
                        {isAdmin && (
                          <button onClick={() => handleToggleStatus(s)} className={`p-2 rounded-lg transition-colors ${s.estado ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'}`} title={s.estado ? 'Desactivar' : 'Activar'}>
                            {s.estado ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CommonModal
        isOpen={showModal}
        onClose={closeModal}
        title={supplierToEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      >
        <SupplierForm onClose={closeModal} supplierToEdit={supplierToEdit} />
      </CommonModal>
    </AuthenticatedLayout>
  );
}
