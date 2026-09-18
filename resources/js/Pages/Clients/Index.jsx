import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { FaSearch, FaPlus, FaEdit, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import CommonModal from '@/Components/CommonModal';
import ClientForm from '@/Components/Clients/ClientForm';
import Pagination from '@/Components/Pagination';
import toast from 'react-hot-toast';

const ClientRow = React.memo(({ client, onEdit, onToggleStatus, isAdmin }) => (
  <tr className="hover:bg-slate-50 transition-colors">
    <td className="p-3 whitespace-nowrap">
      <div className="font-medium text-slate-800 truncate" title={client.nombre}>{client.nombre}</div>
    </td>
    <td className="p-3 whitespace-nowrap">
      <div className="text-slate-600 truncate" title={client.email}>{client.email || '-'}</div>
    </td>
    <td className="p-3 whitespace-nowrap">
      <div className="text-slate-600">{client.telefono || '-'}</div>
    </td>
    <td className="p-3 whitespace-nowrap text-center">
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${client.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
        {client.estado}
      </span>
    </td>
    <td className="p-3 whitespace-nowrap">
      <div className="flex gap-2 justify-center">
        <button 
            onClick={() => onEdit(client)} 
            className="p-2 rounded bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors" 
            title="Editar"
        >
            <FaEdit size={14} />
        </button>
        {isAdmin && (
            <button 
                onClick={() => onToggleStatus(client)} 
                className={`p-2 rounded transition-colors ${client.estado === 'Activo' ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`} 
                title={client.estado === 'Activo' ? 'Desactivar' : 'Activar'}
            >
                {client.estado === 'Activo' ? <FaToggleOff size={14} /> : <FaToggleOn size={14} />}
            </button>
        )}
      </div>
    </td>
  </tr>
));

export default function Index({ clientes }) {
  const { auth } = usePage().props;
  const isAdmin = auth.user.rol === 'Administrador';

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleOpenModal = (client = null) => {
    setEditingClient(client);
    setModalOpen(true);
  };

  const handleToggleStatus = (client) => {
    router.patch(route('clientes.toggle', client.id), {}, {
        onSuccess: () => toast.success('Estado actualizado'),
    });
  };

  const filteredClients = useMemo(() => {
    let filtered = clientes.filter(client =>
      client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.telefono && client.telefono.includes(searchTerm)) ||
      (client.ruc_dni && client.ruc_dni.includes(searchTerm))
    );
    if (!showInactive) {
      filtered = filtered.filter(client => client.estado === 'Activo');
    }
    return filtered;
  }, [clientes, searchTerm, showInactive]);

  const totalPages = Math.ceil(filteredClients.length / rowsPerPage);
  const currentClients = useMemo(() => 
    filteredClients.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage),
    [filteredClients, currentPage, rowsPerPage]
  );

  return (
    <AuthenticatedLayout>
      <Head title="Gestión de Clientes" />

      <div className="bg-white shadow-sm rounded-xl border border-slate-200 flex flex-col min-h-[500px]">
        <header className="px-5 py-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-semibold text-slate-800 text-lg">Gestión de Clientes ({filteredClients.length})</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showInactive"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out rounded border-slate-300 focus:ring-indigo-500"
                />
                <label htmlFor="showInactive" className="ml-2 text-sm text-slate-600">Mostrar inactivos</label>
              </div>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  className="w-full md:w-64 pl-9 pr-3 py-2 bg-slate-50 text-slate-800 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-lg text-sm transition-colors"
                  placeholder="Buscar por nombre, DNI, tel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => handleOpenModal()} 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors shadow-sm"
              >
                <FaPlus size={12} />
                <span>Nuevo Cliente</span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-0 overflow-x-auto flex-grow custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="text-xs font-bold uppercase text-slate-400 bg-slate-50/50 sticky top-0 z-10 border-b border-slate-100">
              <tr>
                <th className="p-4 w-[25%]">Nombre</th>
                <th className="p-4 w-[25%]">Correo</th>
                <th className="p-4 w-[20%]">Teléfono</th>
                <th className="p-4 w-[15%] text-center">Estado</th>
                <th className="p-4 w-[15%] text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {currentClients.length > 0 ? (
                currentClients.map((client) => (
                  <ClientRow
                    key={client.id}
                    client={client}
                    onEdit={handleOpenModal}
                    onToggleStatus={handleToggleStatus}
                    isAdmin={isAdmin}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="flex flex-col items-center">
                        <Users className="w-12 h-12 text-slate-200 mb-3" />
                        <p className="text-slate-500 font-medium">No se encontraron clientes</p>
                    </div>
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
          totalRecords={filteredClients.length}
        />
      </div>

      <CommonModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingClient ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
      >
        <ClientForm 
            onClose={() => setModalOpen(false)} 
            clientToEdit={editingClient} 
        />
      </CommonModal>
    </AuthenticatedLayout>
  );
}
