import React, { useEffect, useState } from 'react';
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
  is_renewal: boolean;
  renewal_date: string | null;
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
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : localSearchTerm;

  const handleSearchChange = (val: string) => {
    if (externalSetSearchTerm) {
      externalSetSearchTerm(val);
    } else {
      setLocalSearchTerm(val);
    }
    setCurrentPage(1);
  };

  const fetchSalespersons = (url = `/api/salespersons/?search=${searchTerm}&archived=${isArchiveMode}&page=${currentPage}`) => {
    setIsLoading(true);
    axios.get(url)
      .then(res => {
        setSalespersons(res.data.results || res.data);
        setNextUrl(res.data.next);
        setPrevUrl(res.data.previous);
        setTotalCount(res.data.count || (Array.isArray(res.data) ? res.data.length : 0));
      })
      .catch(() => showNotification('Failed to load salespersons.', 'error'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchSalespersons();
  }, [searchTerm, isArchiveMode, currentPage]);

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
                <th className="px-6 py-4 text-[10px] font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100">Renewal</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 text-center no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Loading records...</p>
                    </div>
                  </td>
                </tr>
              ) : salespersons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4 py-10">
                      <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[24px] flex items-center justify-center mb-2">
                        {searchTerm ? (
                          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        ) : (
                          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                        )}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-slate-800">{searchTerm ? "No Matches Found" : "No Records Found"}</h3>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto">
                          {searchTerm ? (
                            <>We couldn't find any matches for '<span className="text-blue-600 font-black">{searchTerm}</span>'. Try a different term.</>
                          ) : (
                            "There are currently no records registered in the system."
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                salespersons.map((sp) => (
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
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-600 text-sm">{sp.is_renewal ? 'RENEWAL' : 'NEW'}</div>
                      {sp.is_renewal && sp.renewal_date && (
                        <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5 tracking-tighter">Date: {sp.renewal_date}</div>
                      )}
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

        {totalCount >= 50 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-slate-700">
            <span className="text-sm text-slate-400">Showing up to 50 records per page</span>
            <div className="flex gap-2">
              <button onClick={() => prevUrl && fetchSalespersons(prevUrl)} disabled={!prevUrl} className="px-4 py-2 text-sm font-medium text-white bg-slate-700 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Previous</button>
              <button onClick={() => nextUrl && fetchSalespersons(nextUrl)} disabled={!nextUrl} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalespersonRegistry;
