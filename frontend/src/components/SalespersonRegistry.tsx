import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { SearchIcon, EditIcon, TrashIcon, PrinterIcon, ArchiveIcon, RestoreIcon } from './Icons';

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
  onAdd?: () => void;
  onEdit?: (salesperson: Salesperson) => void;
  onView?: (salesperson: Salesperson) => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  requestConfirm: (title: string, message: string, action: () => void, confirmText: string, confirmColor: string) => void;
  searchTerm: string;
  setSearchTerm?: (val: string) => void;
  isArchiveMode?: boolean;
}

const SalespersonRegistry: React.FC<SalespersonRegistryProps> = ({ 
  onAdd, onEdit, onView, showNotification, requestConfirm, 
  searchTerm: externalSearchTerm, setSearchTerm: externalSetSearchTerm, isArchiveMode = false 
}) => {
  const location = useLocation();

  useEffect(() => {
    handleSearchChange('');
  }, [location.pathname, isArchiveMode]);

  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 50;

  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : localSearchTerm;

  const handleSearchChange = (val: string) => {
    if (externalSetSearchTerm) {
      externalSetSearchTerm(val);
    } else {
      setLocalSearchTerm(val);
    }
    setCurrentPage(1);
  };

  const fetchSalespersons = () => {
    setIsLoading(true);
    axios.get(`/api/salespersons/?search=${searchTerm}&archived=${isArchiveMode}&page=${currentPage}`)
      .then(res => {
        if (res.data.results) {
          setSalespersons(res.data.results);
          setTotalCount(res.data.count);
        } else {
          setSalespersons(Array.isArray(res.data) ? res.data : []);
          setTotalCount(Array.isArray(res.data) ? res.data.length : 0);
        }
      })
      .catch(() => showNotification('Failed to load salespersons.', 'error'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchSalespersons();
  }, [searchTerm, isArchiveMode, currentPage]);

  const sortedData = useMemo(() => [...salespersons], [salespersons]);
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const paginatedData = sortedData;

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

  const handleRestore = (id: number) => {
    requestConfirm(
      "Restore Salesperson",
      "Move this record back to active list?",
      () => {
        axios.patch(`/api/salespersons/${id}/`, { date_archived: null })
          .then(() => {
            showNotification("Salesperson restored.", "success");
            fetchSalespersons();
          })
          .catch(() => showNotification("Failed to restore record.", "error"));
      },
      "Restore",
      "bg-emerald-600"
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

      {!isArchiveMode && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Salesperson Registry</h1>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">Real Estate Salesperson Registrations</p>
          </div>
          <button 
            onClick={onAdd}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span> Add Salesperson
          </button>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-4 md:p-8 main-container print:bg-white print:shadow-none print:border-0 print:p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 no-print">
          <div className="relative w-full sm:w-96 bg-white/50 border border-slate-200 shadow-sm rounded-2xl focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input 
              type="text" 
              placeholder="Search by name or PRN..." 
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="block w-full pl-12 pr-4 py-3 bg-transparent leading-5 placeholder-slate-400 focus:outline-none transition-all font-bold text-slate-700"
            />
          </div>
          {!isArchiveMode && (
            <div className="flex gap-2 w-full sm:w-auto">
               <button onClick={() => window.print()} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition-all font-bold text-sm">
                  <PrinterIcon /> Print Report
               </button>
            </div>
          )}
        </div>

        <div className="w-full overflow-x-auto pb-4">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100">Salesperson Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100">PRN / PRC No</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100">Contact</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100">Location</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 text-center no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Loading records...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                       <p className="text-slate-800 font-black uppercase tracking-widest text-sm">No salespersons found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((sp) => (
                  <tr key={sp.id} className="hover:bg-slate-50/80 transition-colors cursor-default border-b border-slate-100 last:border-0 group">
                    <td className="px-6 py-4">
                      <div 
                        onClick={() => onView && onView(sp)}
                        className={`font-semibold text-slate-900 transition-colors ${onView ? 'group-hover:text-blue-600 cursor-pointer hover:underline' : ''}`}
                      >
                        {sp.last_name}, {sp.first_name} {sp.middle_name} {sp.suffix}
                      </div>
                      <div className="text-[10px] font-bold text-slate-600 uppercase mt-0.5 tracking-tighter">ID: {sp.id.toString().padStart(5, '0')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-slate-600 text-sm">{sp.prn || '---'}</div>
                      <div className="text-[10px] font-bold text-blue-600 uppercase mt-0.5 tracking-widest">{sp.prc_accre_no || 'No PRC No'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-600 text-sm">{sp.phone_no || '---'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-600 text-sm">{sp.city_municipality}</div>
                      <div className="text-[10px] font-bold text-slate-600 uppercase">{sp.province}</div>
                    </td>
                    <td className="px-6 py-4 no-print" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center gap-2">
                        {!isArchiveMode ? (
                          <>
                            <button onClick={() => onEdit && onEdit(sp)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit">
                              <EditIcon />
                            </button>
                            <button onClick={() => handleArchive(sp.id)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all" title="Archive">
                              <ArchiveIcon />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleRestore(sp.id)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Restore">
                               <RestoreIcon />
                            </button>
                            <button onClick={() => handleHardDelete(sp.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete Forever">
                              <TrashIcon />
                            </button>
                          </>
                        )}
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
