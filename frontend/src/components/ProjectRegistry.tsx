import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  EditIcon, ArchiveIcon, RestoreIcon, TrashIcon, 
  SearchIcon, CloudIcon, BulkIcon, PrinterIcon 
} from './Icons';
import EmptyState from './EmptyState';
import { type Application } from '../utils/constants';

interface ProjectRegistryProps {
  currentView: 'active' | 'archive';
  isBulkMode: boolean;
  setIsBulkMode: (val: boolean) => void;
  selectedItems: number[];
  setSelectedItems: (items: number[]) => void;
  paginatedApps: Application[];
  setShowReport: (val: boolean) => void;
  setEditingApp: (app: Application | null) => void;
  setIsModalOpen: (val: boolean) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  handleBulkAction: (action: 'archive' | 'restore' | 'delete') => void;
  isLoading: boolean;
  handleSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleSelection: (id: number) => void;
  setViewingApp: (app: Application | null) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  handleSoftDelete: (id: number) => void;
  handleRestore: (id: number) => void;
  handleHardDelete: (id: number) => void;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
}

const ProjectRegistry: React.FC<ProjectRegistryProps> = ({
  currentView,
  isBulkMode,
  setIsBulkMode,
  selectedItems,
  setSelectedItems,
  paginatedApps,
  setShowReport,
  setEditingApp,
  setIsModalOpen,
  searchTerm,
  setSearchTerm,
  handleBulkAction,
  isLoading,
  handleSelectAll,
  toggleSelection,
  setViewingApp,
  getStatusBadge,
  handleSoftDelete,
  handleRestore,
  handleHardDelete,
  currentPage,
  totalPages,
  setCurrentPage
}) => {
  const location = useLocation();

  useEffect(() => {
    setSearchTerm('');
  }, [location.pathname, currentView]);

  return (
    <div className="space-y-6 animate-in fade-in print:bg-white print:p-0">
      <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-4 print:hidden">
        <h1 className="text-2xl font-bold text-slate-800">{currentView === 'active' ? 'Project Registry' : 'Archives'}</h1>
        <div className="flex items-center gap-2">
            {isBulkMode && (
              <button 
                onClick={() => selectedItems.length === paginatedApps.length ? setSelectedItems([]) : setSelectedItems(paginatedApps.map(app => app.id))} 
                className="md:hidden px-3 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                {selectedItems.length === paginatedApps.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
            <button onClick={() => setIsBulkMode(!isBulkMode)} className={`p-2.5 rounded-xl border transition-all ${isBulkMode ? 'bg-slate-800 text-white' : 'bg-white border-slate-300 text-slate-600'}`}><BulkIcon /></button>
            <button onClick={() => setShowReport(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition-all font-bold text-sm">
              <PrinterIcon />
              Print Report
            </button>
            {currentView === 'active' && (
              <button onClick={() => { setEditingApp(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm sm:text-base">+ New Project</button>
            )}
            
        </div>
      </div>

      <div className="flex gap-3 print:hidden">
        <div className="relative flex-1 bg-white/50 border border-slate-200 shadow-sm rounded-2xl focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <span className="absolute inset-y-0 left-4 flex items-center"><SearchIcon /></span>
          <input type="text" placeholder="Search projects..." className="w-full pl-12 pr-4 py-3 bg-transparent outline-none font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* BULK ACTION BAR - Minimal Design */}
      {selectedItems.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-slate-200 p-3 mb-4 rounded-xl shadow-sm w-full animate-in fade-in print:hidden">
          <div className="flex items-center gap-3 mb-3 sm:mb-0">
            <span className="bg-blue-100 text-blue-700 font-black px-3 py-1 rounded-lg text-sm">{selectedItems.length}</span>
            <span className="text-slate-600 font-bold text-sm">Items Selected</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentView === 'active' ? (
              <button onClick={() => handleBulkAction('archive')} className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg text-sm font-bold transition-all">
                <ArchiveIcon /> Archive
              </button>
            ) : (
              <button onClick={() => handleBulkAction('restore')} className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg text-sm font-bold transition-all">
                <RestoreIcon /> Restore
              </button>
            )}
            <button onClick={() => handleBulkAction('delete')} className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition-all">
              <TrashIcon /> Delete
            </button>
            <button onClick={() => setSelectedItems([])} className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-sm font-bold transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-4 md:p-8 overflow-hidden w-full max-w-full print:bg-white print:shadow-none print:border-0 print:p-0">
        {isLoading ? (
          <div className="px-6 py-20 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Loading records...</p>
            </div>
          </div>
        ) : paginatedApps.length === 0 ? (
          <EmptyState 
            title={searchTerm ? "No Matches Found" : "Registry is Empty"} 
            message={searchTerm ? `We couldn't find any projects matching "${searchTerm}". Try a different term.` : `There are no ${currentView} projects to display right now.`}
            action={!searchTerm && currentView === 'active' && (
              <button onClick={() => { setEditingApp(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">+ Add Your First Project</button>
            )}
          />
        ) : (
          <div className="overflow-x-auto w-full rounded-xl">
            <table className="w-full md:min-w-[900px] text-left border-separate border-spacing-0">
              <thead className="hidden md:table-header-group">
                <tr className="bg-slate-50 border-b border-slate-200">
                  {isBulkMode && <th className="px-6 py-4 w-12 border-b border-slate-200"><input type="checkbox" checked={paginatedApps.length > 0 && paginatedApps.every(a => selectedItems.includes(a.id))} onChange={handleSelectAll} /></th>}
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200">Project Info</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200">Location</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200">Certifications</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-800 uppercase tracking-wider text-right border-b border-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody className="flex flex-col md:table-row-group divide-y divide-slate-100">
                {paginatedApps.map(app => {
                  const isSelected = selectedItems.includes(app.id);
                  return (
                    <tr 
                      key={app.id} 
                      onClick={() => toggleSelection(app.id)}
                      className={`flex flex-col relative py-5 px-4 gap-1 md:table-row md:py-0 md:px-0 md:gap-0 hover:bg-slate-50/80 transition-colors cursor-default border-b border-slate-100 last:border-0 group border-2 ${
                        isSelected 
                          ? 'bg-blue-50/80 border-blue-400 ring-4 ring-blue-500/10 md:ring-0 md:border-transparent md:bg-blue-50/50' 
                          : 'border-transparent'
                      }`}
                    >
                      {isBulkMode && (
                        <td className="block md:table-cell px-2 py-1 md:px-6 md:py-5" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleSelection(app.id)} />
                        </td>
                      )}
                      <td className="block md:table-cell px-2 py-1 md:px-6 md:py-5">
                        <div className="flex items-center gap-2">
                          {isSelected && <div className="md:hidden w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></div>}
                          <button 
                            onClick={(e) => { e.stopPropagation(); setViewingApp(app); }} 
                            className="font-semibold text-blue-600 text-lg hover:underline text-left block truncate max-w-[calc(100%-100px)] md:max-w-xs"
                          >
                            {app.name_of_proj}
                          </button>
                          {app.drive_link && <CloudIcon color={app.status_of_application === 'Approved' ? 'text-emerald-500' : 'text-blue-500'} />}
                        </div>
                        <span className="text-xs font-bold text-slate-600 mt-1 block uppercase tracking-tight">{app.proj_type}</span>
                      </td>
                      <td className="block md:table-cell px-2 py-1 md:px-6 md:py-5">
                        <p className="font-semibold text-slate-700">{app.mun_city}</p>
                        <p className="text-xs font-bold text-slate-600">{app.prov}</p>
                      </td>
                      <td className="block md:table-cell px-2 py-1 md:px-6 md:py-5">
                        {getStatusBadge(app.status_of_application)}
                      </td>
                      <td className="block md:table-cell px-2 py-1 md:px-6 md:py-5">
                        <div className="flex flex-col gap-1">
                            {app.cr_no && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md w-fit">CR: {app.cr_no}</span>}
                            {app.ls_no && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">LS: {app.ls_no}</span>}
                            {(!app.cr_no && !app.ls_no) && <span className="text-xs text-slate-400 italic font-medium">None</span>}
                        </div>
                      </td>
                      <td className="absolute top-4 right-2 flex gap-1 bg-transparent md:relative md:top-auto md:right-auto md:table-cell md:px-6 md:py-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          {currentView === 'active' ? (
                            <>
                              <button onClick={() => {setEditingApp(app); setIsModalOpen(true);}} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><EditIcon /></button>
                              <button onClick={() => handleSoftDelete(app.id)} className="p-2 text-slate-400 hover:text-orange-600 transition-colors"><ArchiveIcon /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleRestore(app.id)} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"><RestoreIcon /></button>
                              <button onClick={() => handleHardDelete(app.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><TrashIcon /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 print:hidden">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 border rounded-xl disabled:opacity-30 font-bold text-sm">Prev</button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 border rounded-xl disabled:opacity-30 font-bold text-sm">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectRegistry;
