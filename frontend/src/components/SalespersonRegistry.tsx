import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { SearchIcon, EditIcon, TrashIcon, PrinterIcon, ArchiveIcon } from './Icons';

interface Salesperson {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix: string;
  prn: string;
  prc_accre_no: string;
  phone_no: string;
  city_municipality: string;
  province: string;
  date_archived: string | null;
}

interface SalespersonRegistryProps {
  onAdd: () => void;
  onEdit: (salesperson: Salesperson) => void;
  onView: (salesperson: Salesperson) => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  requestConfirm: (title: string, message: string, action: () => void, confirmText: string, confirmColor: string) => void;
}

const SalespersonRegistry: React.FC<SalespersonRegistryProps> = ({ onAdd, onEdit, onView, showNotification, requestConfirm }) => {
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchSalespersons = () => {
    setIsLoading(true);
    axios.get('/api/salespersons/')
      .then(res => {
        const data = res.data.results || res.data;
        setSalespersons(Array.isArray(data) ? data : []);
      })
      .catch(() => showNotification('Failed to load salespersons.', 'error'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchSalespersons();
  }, []);

  const activeSalespersons = useMemo(() => {
    return salespersons.filter(sp => !sp.date_archived);
  }, [salespersons]);

  const filteredData = useMemo(() => {
    return activeSalespersons.filter(sp => 
      sp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sp.prn?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeSalespersons, searchTerm]);

  const sortedData = useMemo(() => [...filteredData].sort((a, b) => b.id - a.id), [filteredData]);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [sortedData, currentPage]);

  const handleArchive = (id: number) => {
    requestConfirm(
      "Archive Salesperson",
      "Move this record to archives?",
      () => {
        axios.patch(`/api/salespersons/${id}/`, { date_archived: new Date().toISOString() })
          .then(() => {
            showNotification("Salesperson archived.", "success");
            fetchSalespersons();
          })
          .catch(() => showNotification("Failed to archive record.", "error"));
      },
      "Archive",
      "bg-orange-500"
    );
  };

  const handleHardDelete = (id: number) => {
    requestConfirm(
      "Permanent Deletion",
      "Are you sure you want to permanently delete this record? This cannot be undone.",
      () => {
        axios.delete(`/api/salespersons/${id}/`)
          .then(() => {
            showNotification("Salesperson permanently deleted.", "success");
            fetchSalespersons();
          })
          .catch(() => showNotification("Failed to delete record.", "error"));
      },
      "Delete Forever",
      "bg-red-600"
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; p: 0 !important; }
          .main-container { margin: 0 !important; padding: 0 !important; }
          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { border: 1px solid #e2e8f0 !important; padding: 8px !important; }
        }
      `}</style>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Salesperson Registry</h1>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">Real Estate Salesperson Registrations</p>
        </div>
        <button 
          onClick={onAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <span className="text-xl">+</span> Add Salesperson
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden main-container">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50 no-print">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input 
              type="text" 
              placeholder="Search by name or PRN..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl leading-5 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
             <button onClick={() => window.print()} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl font-black text-slate-600 hover:bg-slate-50 transition-all">
                <PrinterIcon /> Print Report
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Salesperson Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">PRN / PRC No</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Contact</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Location</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="text-slate-400 font-bold animate-pulse">Loading registry...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                       <p className="text-slate-300 font-black text-4xl">:(</p>
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No salespersons found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((sp) => (
                  <tr key={sp.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div 
                        onClick={() => onView(sp)}
                        className="font-black text-slate-800 group-hover:text-blue-600 transition-colors cursor-pointer hover:underline"
                      >
                        {sp.last_name}, {sp.first_name} {sp.middle_name} {sp.suffix}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-tighter">ID: {sp.id.toString().padStart(5, '0')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-slate-600 text-sm">{sp.prn || '---'}</div>
                      <div className="text-[10px] font-black text-blue-500 uppercase mt-0.5 tracking-widest">{sp.prc_accre_no || 'No PRC No'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-600 text-sm">{sp.phone_no || '---'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700 text-sm">{sp.city_municipality}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">{sp.province}</div>
                    </td>
                    <td className="px-6 py-4 no-print" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center gap-2">
                        <button onClick={() => onEdit(sp)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit">
                          <EditIcon />
                        </button>
                        <button onClick={() => handleArchive(sp.id)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all" title="Archive">
                          <ArchiveIcon />
                        </button>
                        <button onClick={() => handleHardDelete(sp.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete Forever">
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!isLoading && totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center no-print">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Page {currentPage} of {totalPages}</p>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-all"
              >
                Previous
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalespersonRegistry;
