import React from 'react';
import { 
  NavDashboardIcon, NavFolderIcon, NavArchiveIcon, NavAboutIcon, 
  HelpIcon, UsersIcon
} from './Icons';

interface SidebarProps {
  currentView: 'dashboard' | 'active' | 'archive' | 'cloud' | 'about' | 'salespersons';
  setCurrentView: (view: 'dashboard' | 'active' | 'archive' | 'cloud' | 'about' | 'salespersons') => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  setShowHelp: (show: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setCurrentView, 
  isSidebarOpen, 
  setShowHelp 
}) => {
  return (
    <aside className={`w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full shadow-2xl z-[60] transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <img src="/static/trackerApp/DHSUD_LOGO.png" alt="Logo" className="w-10 h-10 object-contain shrink-0" />
        <div className="overflow-hidden">
          <h2 className="text-[10px] font-bold text-white uppercase tracking-widest leading-relaxed whitespace-normal">Housing and Real Estate Development Regulation Division</h2>
          <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wider truncate">Negros Island Region</p>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1.5 mt-6">
        <p className="px-5 pt-4 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Overview</p>
        <button onClick={() => setCurrentView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${currentView === 'dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
          <NavDashboardIcon /> Dashboard
        </button>
        <button onClick={() => setCurrentView('active')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${currentView === 'active' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
          <NavFolderIcon /> Projects
        </button>
        <button onClick={() => setCurrentView('salespersons')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${currentView === 'salespersons' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
          <UsersIcon /> Salespersons
        </button>
        
        <p className="px-5 pt-4 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data Management</p>
        <button onClick={() => setCurrentView('archive')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${currentView === 'archive' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
          <NavArchiveIcon /> Archives
        </button>
        <button onClick={() => setCurrentView('cloud')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${currentView === 'cloud' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
          <NavDashboardIcon /> Cloud Backup
        </button>
        
        <p className="px-5 pt-4 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">System & Info</p>
        <button onClick={() => setCurrentView('about')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${currentView === 'about' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
          <NavAboutIcon /> About
        </button>
      </nav>
      <div className="p-4 border-t border-slate-800 mt-auto">
        <button onClick={() => setShowHelp(true)} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <HelpIcon /> Help Guide
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
