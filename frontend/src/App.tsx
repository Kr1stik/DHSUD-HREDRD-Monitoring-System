import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import * as XLSX from 'xlsx';

import Sidebar from './components/Sidebar';
import ProjectFormModal from './components/ProjectFormModal';
import SalespersonFormModal from './components/SalespersonFormModal';
import Dashboard from './components/Dashboard';
import CloudBackup from './components/CloudBackup';
import ProjectRegistry from './components/ProjectRegistry';
import SalespersonRegistry from './components/SalespersonRegistry';
import { PrinterIcon, MenuIcon, CloseIcon } from './components/Icons';
import { type Application } from './utils/constants';

// 🌐 API CONFIGURATION
const API_URL = '/api/applications/';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;
axios.defaults.baseURL = window.location.origin;


// ==========================================
// 🚀 PRINT REPORT MODAL
// ==========================================

const PrintReportModal = ({ data, onClose }: { data: Application[], onClose: () => void }) => {
  const stats = {
    approved: data.filter(a => a.status_of_application === 'Approved').length,
    ongoing: data.filter(a => a.status_of_application === 'Ongoing').length,
    endorsed: data.filter(a => a.status_of_application === 'Endorsed to HREDRB').length,
    denied: data.filter(a => a.status_of_application === 'Denied').length,
  };

  return (
    <div className="fixed inset-0 bg-white z-[200] overflow-y-auto p-8 print:absolute print:inset-0 print:bg-white print:z-[9999] print:block">
      <style>{`
        @media print { 
          @page { margin: 10mm; } 
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } 
          table { width: 100% !important; font-size: 10pt; table-layout: fixed; } 
          th, td { word-wrap: break-word; white-space: normal !important; padding: 4px !important; }
        }
      `}</style>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8 print:hidden">
          <button onClick={onClose} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">Close Preview</button>
          <button onClick={() => window.print()} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2">
            <PrinterIcon />
            Print Document
          </button>
        </div>

        <div className="flex items-center justify-center gap-6 mb-8 border-b-4 border-slate-900 pb-6">
          <img src="/static/trackerApp/DHSUD_LOGO.png" alt="Logo" className="w-20 h-20 object-contain" />
          <div className="text-center">
            <h2 className="text-xl font-black uppercase text-slate-800 leading-tight">Republic of the Philippines</h2>
            <h1 className="text-2xl font-black uppercase text-slate-900 leading-tight">Department of Human Settlements and Urban Development</h1>
            <h3 className="text-lg font-bold text-slate-600">Negros Island Region (NIR)</h3>
          </div>
        </div>

        <div className="text-center mb-10">
          <h4 className="text-2xl font-black text-slate-900 pt-2 underline decoration-4 underline-offset-8">Project Status & Accomplishment Report</h4>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-4">Date Generated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-10">
          {Object.entries(stats).map(([label, count]) => (
            <div key={label} className="border-2 border-slate-900 p-4 rounded-2xl text-center bg-slate-50">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
              <p className="text-2xl font-black text-slate-900">{count}</p>
            </div>
          ))}
        </div>

        <table className="w-full text-[11px] border-collapse border-2 border-slate-900">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="border border-slate-900 px-3 py-3 text-left font-black uppercase tracking-wider">Project Name</th>
              <th className="border border-slate-900 px-3 py-3 text-left font-black uppercase tracking-wider">Location</th>
              <th className="border border-slate-900 px-3 py-3 text-left font-black uppercase tracking-wider">Category</th>
              <th className="border border-slate-900 px-3 py-3 text-left font-black uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((app, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="border border-slate-300 px-3 py-2 font-black text-slate-900">{app.name_of_proj}</td>
                <td className="border border-slate-300 px-3 py-2 font-bold text-slate-700">{app.mun_city}, {app.prov}</td>
                <td className="border border-slate-300 px-3 py-2 font-bold text-slate-600">{app.main_or_compliance}</td>
                <td className="border border-slate-300 px-3 py-2 font-black text-slate-900">{app.status_of_application}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-16 grid grid-cols-2 gap-20">
           <div className="text-center">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-12">Prepared By:</p>
              <div className="h-px bg-slate-900 w-64 mx-auto mb-1"></div>
              <p className="text-xs font-black uppercase text-slate-900">Administrative Officer / Staff</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase">HREDRD NIR</p>
           </div>
           <div className="text-center">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-12">Approved By:</p>
              <div className="h-px bg-slate-900 w-64 mx-auto mb-1"></div>
              <p className="text-xs font-black uppercase text-slate-900">Regional Director</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase">DHSUD NIR</p>
           </div>
        </div>

        <div className="mt-20 border-t border-slate-200 pt-4 hidden print:block">
           <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              <span>DHSUD-NIR-HREDRD-v1.0</span>
              <span>Generated via Monitoring System | {new Date().toLocaleString()}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<'dashboard' | 'active' | 'archive' | 'cloud' | 'about' | 'salespersons'>('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  const [salespersonModalConfig, setSalespersonModalConfig] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    data: any;
  }>({
    isOpen: false,
    mode: 'create',
    data: null
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showHelp, setShowHelp] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingApp, setEditingApp] = useState<Application | null>(null)
  const [viewingApp, setViewingApp] = useState<Application | null>(null)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  
  const [syncFolder, setSyncFolder] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // 🛡️ SECURITY: Detect if current user is on LAN instead of the Main Server PC
  const isRemote = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

  // State to trigger refresh in child component
  const [salespersonRefreshKey, setSalespersonRefreshKey] = useState(0);
  const handleRefreshSalespersons = () => setSalespersonRefreshKey(prev => prev + 1);

  const checkGoogleStatus = () => {
    setIsCheckingStatus(true);
    axios.get('/api/google-status/')
      .then(res => {
        if (res.data.connected) setConnectedEmail(res.data.email);
        else setConnectedEmail(null);
      })
      .catch(() => setConnectedEmail(null))
      .finally(() => setIsCheckingStatus(false));
  };

  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean; title: string; message: string; action: (() => void) | null; confirmText: string; confirmColor: string;
  }>({
    show: false, title: '', message: '', action: null, confirmText: 'Confirm', confirmColor: 'bg-blue-600'
  })

  const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  }

  const requestConfirm = (title: string, message: string, action: () => void, confirmText: string, confirmColor: string) => {
    setConfirmDialog({ show: true, title, message, action, confirmText, confirmColor });
  }

  const fetchApplications = (silent: boolean = false) => {
    if (!silent) setIsLoading(true);
    axios.get(API_URL)
      .then(response => {
        const data = response.data.results || response.data;
        setApplications(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setApplications([]);
        if (err.response?.status === 507) {
          showNotification("Google Drive Storage Full", "warning");
        } else {
          showNotification("Failed to load projects from server.", "error");
        }
      })
      .finally(() => { if (!silent) setIsLoading(false); });
  }

  const handleCloudSync = async () => {
    const performSync = () => {
      setIsSyncing(true);
      axios.post('/api/backup/', { folder_name: syncFolder || 'Manual_Backups' })
        .then((res) => { 
          showNotification(res.data.message || "Backup successfully uploaded to Google Drive!", "success"); 
          setSyncFolder(''); 
        })
        .catch(() => showNotification("Cloud sync failed. Check server connection or API keys.", "error"))
        .finally(() => setIsSyncing(false))
    };

    if (!syncFolder) {
      requestConfirm(
        "Default Folder Notice",
        "You didn't specify a folder name. The backup will be saved to the default folder 'Manual_Backups' in your Google Drive. Do you want to continue?",
        performSync,
        "Continue",
        "bg-blue-600"
      );
    } else {
      performSync();
    }
  }

  useEffect(() => { 
    fetchApplications();
    checkGoogleStatus();
  }, [])

  useEffect(() => {
    setSelectedItems([]);
    setIsBulkMode(false);
    setCurrentPage(1); 
    setIsSidebarOpen(false); // Close sidebar on view change (mobile)

  }, [currentView, searchTerm]);

  const activeApps = applications.filter(app => app.status_of_application !== 'Archived')
  const archivedApps = applications.filter(app => app.status_of_application === 'Archived')
  const displayApps = currentView === 'active' ? activeApps : archivedApps

  // PERFORMANCE: Memoize stats to prevent recalculation on every render
  const stats = useMemo(() => ({
    ongoing: activeApps.filter(a => a.status_of_application === 'Ongoing').length,
    approved: activeApps.filter(a => a.status_of_application === 'Approved').length,
    denied: activeApps.filter(a => a.status_of_application === 'Denied').length,
    endorsed: activeApps.filter(a => a.status_of_application === 'Endorsed to HREDRB').length,
  }), [activeApps]);

  const chartData = useMemo(() => [
    { name: 'Ongoing', count: stats.ongoing, color: '#3b82f6' },
    { name: 'Approved', count: stats.approved, color: '#10b981' },
    { name: 'Endorsed', count: stats.endorsed, color: '#f59e0b' },
    { name: 'Denied', count: stats.denied, color: '#ef4444' },
  ], [stats]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#64748b', '#ef4444'];
  
  const pieChartDataRaw = useMemo(() => {
    const counts = activeApps.reduce((acc, app) => {
      const type = app.proj_type || 'Unspecified';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(counts)
      .map((key) => ({ name: key, value: counts[key] }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [activeApps]);

  const pieChartData = useMemo(() => {
    const top5 = pieChartDataRaw.slice(0, 5);
    const others = pieChartDataRaw.slice(5);
    const result = [...top5];
    if (others.length > 0) {
      const othersCount = others.reduce((acc, curr) => acc + curr.value, 0);
      result.push({ name: 'Others', value: othersCount });
    }
    return result;
  }, [pieChartDataRaw]);

  const filteredApps = useMemo(() => displayApps.filter(app => {
    return app.name_of_proj.toLowerCase().includes(searchTerm.toLowerCase()) || 
           app.mun_city.toLowerCase().includes(searchTerm.toLowerCase());
  }), [displayApps, searchTerm]);

  const sortedApps = useMemo(() => [...filteredApps].sort((a, b) => b.id - a.id), [filteredApps]); 
  const totalPages = Math.ceil(sortedApps.length / itemsPerPage);
  const paginatedApps = useMemo(() => sortedApps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [sortedApps, currentPage]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedItems(paginatedApps.map(app => app.id));
    else setSelectedItems([]);
  };

  const toggleSelection = (id: number) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleBulkAction = async (action: 'archive' | 'restore' | 'delete') => {
    const title = action.charAt(0).toUpperCase() + action.slice(1);
    const message = `Are you sure you want to ${action} ${selectedItems.length} selected items?`;
    
    requestConfirm(
      `${title} Selected`,
      message,
      async () => {
        setIsLoading(true);
        try {
          await axios.post('/api/projects/bulk-action/', { action, ids: selectedItems });
          
          showNotification(`Successfully ${action}d ${selectedItems.length} items.`, "success");
          setSelectedItems([]);
          fetchApplications();
        } catch (err) {
          showNotification(`Bulk ${action} failed.`, "error");
        } finally {
          setIsLoading(false);
        }
      },
      `Confirm ${title}`,
      action === 'delete' ? "bg-red-600" : "bg-blue-600"
    );
  };

  const handleExport = (format: 'xlsx' | 'csv') => {
    const dataToExport = sortedApps.map(app => ({
      'Type of Application': app.type_of_application || '', 'Status of Application': app.status_of_application || '', 'New or Amended CRLS': app.crls_options?.join(', ') || '', 'Main or Compliance': app.main_or_compliance || '', 'Date Filed': app.date_filed || '', 'Date Issued': app.date_issued || '', 'Date Completion': app.date_completion || '', 'CR No.': app.cr_no || '', 'LS No.': app.ls_no || '', 'Name of Proj': app.name_of_proj || '', 'Proj Owner Dev': app.proj_owner_dev || '', 'Prov': app.prov || '', 'Mun/City': app.mun_city || '', 'Street/Brgy': app.street_brgy || '', 'Proj Type': app.proj_type || ''
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Projects");
    XLSX.writeFile(wb, `DHSUD_Export.${format}`);
    showNotification(`Exported as ${format.toUpperCase()}!`, "success");
  };

  const handleSoftDelete = (id: number) => {
    requestConfirm("Archive Project", "Move this project to archives?", () => {
      axios.patch(`${API_URL}${id}/`, { status_of_application: 'Archived', date_archived: new Date().toISOString() })
        .then(() => { fetchApplications(true); showNotification("Archived.", "success"); })
        .catch(() => showNotification("Failed.", "error"));
    }, "Archive", "bg-orange-500");
  }

  const handleRestore = (id: number) => {
    requestConfirm("Restore Project", "Move back to active list?", () => {
      axios.patch(`${API_URL}${id}/`, { status_of_application: 'Ongoing', date_archived: null })
        .then(() => { fetchApplications(true); showNotification("Restored.", "success"); })
        .catch(() => showNotification("Failed.", "error"));
    }, "Restore", "bg-emerald-600");
  }

  const handleHardDelete = (id: number) => {
    requestConfirm("Permanent Deletion", "This cannot be undone. Delete forever?", () => {
      axios.delete(`${API_URL}${id}/`)
        .then(() => { fetchApplications(true); showNotification("Deleted.", "success"); })
        .catch(() => showNotification("Failed.", "error"));
    }, "Delete", "bg-red-600");
  }

  const getStatusBadge = (status: string) => {
    let dotColor = 'bg-blue-500';
    if (status === 'Approved') dotColor = 'bg-emerald-500';
    if (status === 'Denied') dotColor = 'bg-red-500';
    if (status === 'Endorsed to HREDRB') dotColor = 'bg-amber-500';
    if (status === 'Archived') dotColor = 'bg-slate-400';
    
    return (
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full shrink-0 shadow-sm ${dotColor}`}></div>
        <span className="font-bold text-slate-700">{status}</span>
      </div>
    );
  };

  const [showChartModal, setShowChartModal] = useState<{show: boolean, title: string, data: any[]}>({show: false, title: '', data: []});

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 relative overflow-x-hidden">
      
      {/* MOBILE HEADER */}
      <header className="md:hidden fixed top-0 w-full h-16 bg-slate-900 text-white px-4 flex justify-between items-center z-[50] shadow-md">
        <div className="flex items-center gap-3 overflow-hidden">
          <img src="/static/trackerApp/DHSUD_LOGO.png" alt="Logo" className="w-8 h-8 object-contain shrink-0" />
          <span className="font-black tracking-tight truncate text-lg">
            {currentView === 'active' ? 'Projects' : currentView === 'archive' ? 'Archives' : currentView.charAt(0).toUpperCase() + currentView.slice(1)}
          </span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg shrink-0">
          {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </header>

      {/* TOAST NOTIFICATIONS */}
      {toast.show && (
        <div className={`fixed top-20 md:top-8 right-4 md:right-8 z-[150] min-w-[280px] sm:min-w-[320px] max-w-md text-white rounded-2xl shadow-2xl p-4 flex items-center gap-4 animate-in slide-in-from-top-8 fade-in ${
          toast.type === 'success' ? 'bg-emerald-600' : 
          toast.type === 'error' ? 'bg-red-600' : 
          toast.type === 'warning' ? 'bg-amber-500' : 'bg-blue-600'
        }`}>
          <div className="shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            {toast.type === 'success' ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-black uppercase tracking-widest opacity-80">{toast.type}</p>
            <p className="text-sm font-bold leading-tight">{toast.message}</p>
          </div>
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        setShowHelp={setShowHelp} 
      />

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 p-4 sm:p-8 md:ml-64 mt-16 md:mt-0 transition-all duration-300 flex flex-col`}>
        <div className="max-w-6xl mx-auto w-full">
          
          {currentView === 'dashboard' && (
            <Dashboard 
              stats={stats} 
              chartData={chartData} 
              pieChartDataRaw={pieChartDataRaw} 
              pieChartData={pieChartData} 
              COLORS={COLORS} 
              setShowChartModal={setShowChartModal} 
            />
          )}

          {(currentView === 'active' || currentView === 'archive') && (
            <ProjectRegistry 
              currentView={currentView}
              isBulkMode={isBulkMode}
              setIsBulkMode={setIsBulkMode}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              paginatedApps={paginatedApps}
              setShowReport={setShowReport}
              setEditingApp={setEditingApp}
              setIsModalOpen={setIsModalOpen}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleBulkAction={handleBulkAction}
              isLoading={isLoading}
              handleSelectAll={handleSelectAll}
              toggleSelection={toggleSelection}
              setViewingApp={setViewingApp}
              getStatusBadge={getStatusBadge}
              handleSoftDelete={handleSoftDelete}
              handleRestore={handleRestore}
              handleHardDelete={handleHardDelete}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          )}

          {currentView === 'salespersons' && (
            <SalespersonRegistry 
              key={salespersonRefreshKey}
              onAdd={() => {
                setSalespersonModalConfig({ isOpen: true, mode: 'create', data: null });
              }}
              onEdit={(sp) => {
                setSalespersonModalConfig({ isOpen: true, mode: 'edit', data: sp });
              }}
              onView={(sp) => {
                setSalespersonModalConfig({ isOpen: true, mode: 'view', data: sp });
              }}
              showNotification={showNotification}
              requestConfirm={requestConfirm}
            />
          )}

          {currentView === 'cloud' && (
            <CloudBackup 
              connectedEmail={connectedEmail}
              isCheckingStatus={isCheckingStatus}
              syncFolder={syncFolder}
              setSyncFolder={setSyncFolder}
              handleCloudSync={handleCloudSync}
              isSyncing={isSyncing}
              isRemote={isRemote}
              setConnectedEmail={setConnectedEmail}
              showNotification={showNotification}
              requestConfirm={requestConfirm}
            />
          )}

          {currentView === 'about' && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-8 animate-in fade-in">
              <h1 className="text-3xl font-black text-slate-800">About System</h1>
              <div className="space-y-4 text-slate-500 leading-relaxed text-lg">
                <p>The Housing and Real Estate Development Regulation Division (HREDRD) Monitoring System is a dedicated digital platform designed to streamline the tracking and management of project applications, Certificates of Registration (CR), and Licenses to Sell (LS).</p>
                <p>Purpose-built for the Negros Island Region, the system ensures local data integrity and provides real-time analytics for regional administrators to monitor the progress of housing developments and compliance entries.</p>
                <p>The architecture leverages an offline-first, local area network (LAN) approach, allowing multiple employees to access and update records simultaneously without requiring a public internet connection, ensuring maximum security and speed for office operations.</p>
                <p>Built with resilience in mind, this system features multi-user LAN support via PostgreSQL, automated daily local database snapshots, and secure Google Drive integration to ensure DHSUD data is never lost.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group">
                   <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Lead Developer</p>
                   <h3 className="text-2xl font-black text-slate-800 mb-4">Wenard Roy Barrera</h3>
                   <a href="https://kr1stik.cosedevs.com/" target="_blank" className="inline-flex items-center gap-2 text-blue-600 font-black text-sm hover:gap-3 transition-all">
                      View Portfolio
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                   </a>
                </div>
                <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Technical Support</p>
                   <h3 className="text-xl font-black text-slate-800">John Eric Bayer</h3>
                </div>
                <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Technical Support</p>
                   <h3 className="text-xl font-black text-slate-800">Jefferson Inere</h3>
                </div>
              </div>
            </div>
          )}
        </div>
        <footer className="mt-auto py-6 text-center text-slate-400 font-bold text-xs tracking-widest uppercase">DHSUD | {new Date().getFullYear()}</footer>
      </main>

      {/* VIEW DETAILS MODAL */}
      {viewingApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight leading-tight">{viewingApp.name_of_proj}</h2>
                <button onClick={() => setViewingApp(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><CloseIcon /></button>
              </div>
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Owner / Developer</p>
                      <p className="font-medium text-slate-700">{viewingApp.proj_owner_dev || 'Not Specified'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Type</p>
                      <p className="font-medium text-slate-700">{viewingApp.proj_type || 'N/A'}</p>
                    </div>
                 </div>

                 <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                        {getStatusBadge(viewingApp.status_of_application)}
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Category</p>
                        <p className="font-medium text-slate-700">{viewingApp.main_or_compliance}</p>
                    </div>
                 </div>

                 <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Credentials & Certifications</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="font-mono font-medium text-blue-700">CR: {viewingApp.cr_no || 'None'}</p>
                            <p className="font-mono font-medium text-blue-700 mt-1">LS: {viewingApp.ls_no || 'None'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Options</p>
                            <div className="flex flex-wrap gap-1">
                                {viewingApp.crls_options && viewingApp.crls_options.length > 0 ? (
                                    viewingApp.crls_options.map((opt, i) => (
                                        <span key={i} className="px-2 py-1 bg-white rounded-md text-xs font-bold text-blue-700 shadow-sm border border-blue-100">{opt}</span>
                                    ))
                                ) : (
                                    <span className="text-xs font-medium text-blue-400 italic">None selected</span>
                                )}
                            </div>
                        </div>
                    </div>
                 </div>

                 <div className="p-5 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Important Timeline</p>
                    <div className={`grid grid-cols-1 ${viewingApp.status_of_application === 'Archived' ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-4`}>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date Filed</p>
                            <p className="font-medium text-slate-700">{viewingApp.date_filed ? new Date(viewingApp.date_filed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}) : '---'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date Issued</p>
                            <p className="font-medium text-slate-700">{viewingApp.date_issued ? new Date(viewingApp.date_issued).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}) : '---'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date Completion</p>
                            <p className="font-medium text-slate-700">{viewingApp.date_completion ? new Date(viewingApp.date_completion).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}) : '---'}</p>
                        </div>
                        {viewingApp.status_of_application === 'Archived' && (
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date Archived</p>
                            <p className="font-medium text-slate-700">{viewingApp.date_archived ? new Date(viewingApp.date_archived).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}) : '---'}</p>
                          </div>
                        )}
                    </div>
                 </div>

                 <div className="p-5 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Address</p>
                    <p className="font-medium text-slate-700 leading-relaxed">{viewingApp.street_brgy}, {viewingApp.mun_city}, {viewingApp.prov}</p>
                 </div>
              </div>
              <button onClick={() => setViewingApp(null)} className="w-full mt-8 py-4 bg-slate-800 text-white rounded-2xl font-bold shadow-xl transition-all active:scale-95">Close Details</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG */}
      {confirmDialog.show && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-[130]">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm p-8 animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-slate-800 text-center mb-3">{confirmDialog.title}</h3>
            <p className="text-slate-500 text-center mb-8 font-medium">{confirmDialog.message}</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => { confirmDialog.action?.(); setConfirmDialog({ ...confirmDialog, show: false }); }} className={`w-full py-3.5 text-white rounded-xl font-black ${confirmDialog.confirmColor}`}>{confirmDialog.confirmText}</button>
              <button onClick={() => setConfirmDialog({ ...confirmDialog, show: false })} className="w-full py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* PROJECT FORM MODAL */}
      {isModalOpen && (
        <ProjectFormModal 
          appToEdit={editingApp} 
          onClose={() => setIsModalOpen(false)} 
          onSave={() => { fetchApplications(); setIsModalOpen(false); }}
          showNotification={showNotification}
          requestConfirm={requestConfirm}
          handleExport={handleExport}
        />
      )}

      {/* HELP MODAL */}
      {showHelp && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-[130]">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-slate-800 mb-4">Quick Guide</h3>
            <div className="space-y-4 text-slate-600 font-medium">
              <p>• <strong className="text-slate-800">Dashboard:</strong> Real-time charts of all active projects.</p>
              <p>• <strong className="text-slate-800">Projects:</strong> View and manage all your active registration applications.</p>
              <p>• <strong className="text-slate-800">Cloud Backup:</strong> Save a secure copy of your database to Google Drive using the 'Save to Google Drive' button.</p>
              <p>• <strong className="text-slate-800">Switching Accounts:</strong> If your Google Drive is full, go to the Cloud Backup tab and click 'Switch Account' to safely disconnect and log in with a new one.</p>
              <p>• <strong className="text-slate-800">Import/Export:</strong> Use the Bulk Import tab in the "+ New Project" modal to upload CSV/Excel files.</p>
              <p>• <strong className="text-slate-800">Archives:</strong> Store old projects. They can be restored or permanently deleted at any time.</p>
            </div>
            <button onClick={() => setShowHelp(false)} className="w-full mt-8 py-4 bg-blue-600 text-white rounded-2xl font-black">Got it</button>
          </div>
        </div>
      )}

      {/* CHART FULL REPORT MODAL */}
      {showChartModal.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[150]">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">{showChartModal.title}</h3>
              <button onClick={() => setShowChartModal({show: false, title: '', data: []})} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><CloseIcon /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {showChartModal.data.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="font-bold text-slate-700">{item.name}</span>
                  <span className="bg-white px-3 py-1 rounded-lg font-black text-blue-600 shadow-sm border border-slate-200">{item.count || item.value}</span>
                </div>
              ))}
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button onClick={() => setShowChartModal({show: false, title: '', data: []})} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black">Close Report</button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT REPORT MODAL */}
      {showReport && (
        <PrintReportModal 
          data={filteredApps} 
          onClose={() => setShowReport(false)} 
        />
      )}

      {/* SALESPERSON FORM MODAL */}
      {salespersonModalConfig.isOpen && (
        <SalespersonFormModal 
          isOpen={salespersonModalConfig.isOpen}
          mode={salespersonModalConfig.mode}
          salesperson={salespersonModalConfig.data}
          onClose={() => setSalespersonModalConfig({ ...salespersonModalConfig, isOpen: false })}
          onSuccess={() => {
            handleRefreshSalespersons();
            showNotification(
              salespersonModalConfig.mode === 'create' ? "Salesperson registered!" : "Record updated!", 
              "success"
            );
          }}
        />
      )}

    </div>
  )
}