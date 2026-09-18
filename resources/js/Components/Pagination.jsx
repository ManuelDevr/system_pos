import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  rowsPerPage, 
  onRowsPerPageChange,
  totalRecords 
}) => {
  const startRecord = (currentPage - 1) * rowsPerPage + 1;
  const endRecord = Math.min(currentPage * rowsPerPage, totalRecords);

  return (
    <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
      <div className="text-sm text-slate-500">
        Mostrando <span className="font-medium text-slate-700">{totalRecords > 0 ? startRecord : 0}</span> a <span className="font-medium text-slate-700">{endRecord}</span> de <span className="font-medium text-slate-700">{totalRecords}</span> registros
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Filas por página:</span>
          <select 
            value={rowsPerPage} 
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            className="text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-1"
          >
            {[5, 10, 15, 20, 50].map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onPageChange(currentPage - 1)} 
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaChevronLeft size={14} />
          </button>
          
          <div className="text-sm font-medium text-slate-700">
            Página {currentPage} de {totalPages || 1}
          </div>

          <button 
            onClick={() => onPageChange(currentPage + 1)} 
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
