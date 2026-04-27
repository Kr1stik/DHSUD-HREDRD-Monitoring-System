import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  NavDashboardIcon, NavFolderIcon, NavArchiveIcon, NavAboutIcon,
  UsersIcon
} from './Icons';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  currentUser: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  currentUser
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => { 
    try { 
      localStorage.removeItem('dhsud_session');
      localStorage.removeItem('google_cloud_linked');
      const isDev = import.meta.env.DEV;
      const rawUrl = import.meta.env.VITE_API_URL || 'https://dhsud-hredrd-monitoring-system.onrender.com';
      const cleanBaseUrl = rawUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
      const API_BASE_URL = isDev ? 'http://localhost:8000' : cleanBaseUrl;
      await axios.post(`${API_BASE_URL}/api/auth/logout/`); 
    } catch(e) { 
      console.error(e); 
    } finally { 
      window.location.reload(); 
    } 
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* OVERLAY FOR MOBILE */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[55] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside className={`w-64 bg-slate-900/95 backdrop-blur-2xl border-r border-slate-800/50 shadow-2xl text-slate-300 flex flex-col fixed h-full z-[60] transition-transform duration-300 md:translate-x-0 print:hidden overflow-y-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800/50 flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain shrink-0" />
          <div className="overflow-hidden">
            <h2 className="text-[10px] font-bold text-white uppercase tracking-widest leading-relaxed whitespace-normal">Housing and Real Estate Development Regulation Division</h2>
            <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wider truncate">Negros Island Region</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 mt-6">
          <p className="px-5 pt-4 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Overview</p>
          <button onClick={() => { navigate('/dashboard'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${isActive('/dashboard') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-slate-800/50'}`}>
            <NavDashboardIcon /> Dashboard
          </button>
          <button onClick={() => { navigate('/projects'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${isActive('/projects') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-slate-800/50'}`}>
            <NavFolderIcon /> Projects
          </button>
          <button onClick={() => { navigate('/salespersons'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${isActive('/salespersons') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-slate-800/50'}`}>
            <UsersIcon /> Salespersons
          </button>

          <p className="px-5 pt-4 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data Management</p>
          <button onClick={() => { navigate('/archives'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${isActive('/archives') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-slate-800/50'}`}>
            <NavArchiveIcon /> Archives
          </button>
          <button onClick={() => { navigate('/cloud-backup'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${isActive('/cloud-backup') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-slate-800/50'}`}>
            <NavDashboardIcon /> Cloud Backup
          </button>

          <p className="px-5 pt-4 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">System & Info</p>
          <button onClick={() => { navigate('/about'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${isActive('/about') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-slate-800/50'}`}>
            <NavAboutIcon /> About
          </button>
        </nav>

        <div className="p-4 mt-auto">
          {currentUser && (
            <button 
              onClick={() => setShowLogoutConfirm(true)} 
              className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold rounded-xl transition-all border border-red-500/10 hover:border-red-500/30"
            >
              Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-white text-center mb-2">Logout</h3>
            <p className="text-slate-400 text-center mb-8 font-medium">Are you sure you want to logout?</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleLogout}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl shadow-xl shadow-red-600/20 transition-all active:scale-95"
              >
                Yes, Logout
              </button>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-2xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
