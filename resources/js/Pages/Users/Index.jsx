import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { FaSearch, FaPlus, FaEdit, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { Users, Shield, Mail, Phone, UserPlus } from 'lucide-react';
import CommonModal from '@/Components/CommonModal';
import UserForm from '@/Components/Users/UserForm';
import Pagination from '@/Components/Pagination';
import toast from 'react-hot-toast';

const getRoleStyles = (role) => {
  const styles = {
    'Administrador': 'bg-rose-50 text-red-700 border-red-100',
    'Cajero': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };
  return styles[role] || 'bg-slate-50 text-slate-700 border-slate-100';
};

const UserRow = React.memo(({ user, onEdit, onToggleStatus, currentAuthId }) => {
  const isActive = user.estado === 'Activo';
  const isSelf = user.id === currentAuthId;

  return (
    <tr className={`hover:bg-slate-50/50 transition-colors ${!isActive ? 'opacity-60 grayscale-[0.3]' : ''}`}>
      <td className="p-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-slate-800">{user.name} {isSelf && <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded ml-1">TÚ</span>}</div>
            <div className="text-xs text-slate-500">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="p-4 whitespace-nowrap">
        <div className="text-sm text-slate-600 font-medium">{user.telefono || '---'}</div>
      </td>
      <td className="p-4 whitespace-nowrap text-center">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getRoleStyles(user.rol)}`}>
          <Shield size={10} />
          {user.rol}
        </span>
      </td>
      <td className="p-4 whitespace-nowrap text-center">
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
          {user.estado}
        </span>
      </td>
      <td className="p-4 whitespace-nowrap">
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => onEdit(user)} 
            className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors" 
            title="Editar"
          >
            <FaEdit size={14} />
          </button>
          {!isSelf && (
            <button 
                onClick={() => onToggleStatus(user)} 
                className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`} 
                title={isActive ? 'Desactivar' : 'Activar'}
            >
                {isActive ? <FaToggleOff size={16} /> : <FaToggleOn size={16} />}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});

export default function Index({ usuarios }) {
  const { auth, roles } = usePage().props;
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredUsers = useMemo(() => {
    return usuarios.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = showInactive ? true : u.estado === 'Activo';
      return matchesSearch && matchesStatus;
    });
  }, [usuarios, searchTerm, showInactive]);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const currentUsers = useMemo(() => 
    filteredUsers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage),
    [filteredUsers, currentPage, rowsPerPage]
  );

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleToggleStatus = (user) => {
    router.patch(route('usuarios.toggle', user.id), {}, {
        onSuccess: () => toast.success('Estado actualizado'),
        onError: (err) => toast.error(err.error || 'Error al actualizar')
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Gestión de Usuarios" />

      <div className="bg-white shadow-sm rounded-2xl border border-slate-200 flex flex-col min-h-[550px] overflow-hidden">
        <header className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white text-slate-800 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-xl text-sm transition-all shadow-sm"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm">
                <input 
                  type="checkbox" 
                  id="show-inactive"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="show-inactive" className="ml-2 text-xs font-bold text-slate-500 uppercase tracking-tighter cursor-pointer">Ver Inactivos</label>
              </div>

              <button 
                onClick={() => handleOpenModal()} 
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-2 text-sm font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
              >
                <UserPlus size={18} />
                <span>Nuevo Usuario</span>
              </button>
            </div>
          </div>
        </header>

        <div className="overflow-x-auto flex-grow custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="p-4 w-[35%]">Usuario / Personal</th>
                <th className="p-4 w-[20%]">Teléfono</th>
                <th className="p-4 w-[15%] text-center">Rol</th>
                <th className="p-4 w-[15%] text-center">Estado</th>
                <th className="p-4 w-[15%] text-right pr-6">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onEdit={handleOpenModal}
                    onToggleStatus={handleToggleStatus}
                    currentAuthId={auth.user.id}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-16 text-center text-slate-400">
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(val) => { setRowsPerPage(val); setCurrentPage(1); }}
          totalRecords={filteredUsers.length}
        />
      </div>

      <CommonModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingUser ? 'Actualizar Información del Usuario' : 'Registrar Nuevo Miembro del Personal'}
      >
        <UserForm 
            userToEdit={editingUser} 
            roles={roles}
            onClose={() => setModalOpen(false)} 
        />
      </CommonModal>
    </AuthenticatedLayout>
  );
}
