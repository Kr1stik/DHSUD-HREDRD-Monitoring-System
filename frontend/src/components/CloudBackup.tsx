import React from 'react';
import axios from 'axios';
import { CloudIcon } from './Icons';

interface CloudBackupProps {
  connectedEmail: string | null;
  isCheckingStatus: boolean;
  syncFolder: string;
  setSyncFolder: (folder: string) => void;
  handleCloudSync: () => Promise<void>;
  isSyncing: boolean;
  isRemote: boolean;
  setConnectedEmail: (email: string | null) => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  requestConfirm: (title: string, message: string, action: () => void, confirmText: string, confirmColor: string) => void;
}

const CloudBackup: React.FC<CloudBackupProps> = ({
  connectedEmail,
  isCheckingStatus,
  syncFolder,
  setSyncFolder,
  handleCloudSync,
  isSyncing,
  isRemote,
  setConnectedEmail,
  showNotification,
  requestConfirm
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-blue-600 text-white rounded-[28px] flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/40">
          <CloudIcon color="text-white" />
        </div>
        <h1 className="text-3xl font-black text-slate-800">Cloud Backup</h1>
        <p className="text-slate-500 font-medium">Securely sync your local database to Google Drive.</p>
      </div>

      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 space-y-6">
        {/* 📧 CLOUD ACCOUNT INDICATOR */}
        <div className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
          isCheckingStatus ? 'bg-slate-50 border-slate-100 animate-pulse' :
          connectedEmail ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'
        }`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            connectedEmail ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
          }`}>
            {isCheckingStatus ? (
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            )}
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Connected Account</p>
            <p className="text-lg font-black text-slate-800 truncate">
              {isCheckingStatus ? 'Checking...' : connectedEmail || 'No Google account connected.'}
            </p>
          </div>
          {!isCheckingStatus && connectedEmail && (
            <div className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">Active</div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Destination Folder Name</label>
          <input type="text" placeholder="e.g. DHSUD_Backups_2024" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-blue-500 focus:bg-white transition-all" value={syncFolder} onChange={(e) => setSyncFolder(e.target.value)} />
        </div>

        <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
          <div className="shrink-0 text-blue-600 mt-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-sm font-medium text-blue-700 leading-relaxed">This process will create a compressed SQL dump of your current records and upload it directly to your regional DHSUD Google Drive account.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={handleCloudSync} disabled={isSyncing || !connectedEmail} className="py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
            {isSyncing ? (
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : 'Save to Google Drive'}
          </button>

          {/* 🔄 SMART CONNECT/SWITCH BUTTON (Admin Only) */}
          {!isRemote ? (
            <button 
              onClick={() => {
                if (!connectedEmail) {
                  // 🔌 DIRECT CONNECT (Bypass Modal)
                  showNotification("Opening Google Login window...", "info");
                  axios.post('/api/connect-google/')
                    .then(res => {
                      setConnectedEmail(res.data.email);
                      showNotification("Successfully connected!", "success");
                    })
                    .catch((err) => {
                      if (err.response && err.response.data && err.response.data.message) {
                        showNotification(err.response.data.message, err.response.data.status || 'warning');
                      } else {
                        showNotification("Failed to connect account.", "error");
                      }
                    });
                } else {
                  // 🔄 SWITCH ACCOUNT (Keep Modal)
                  requestConfirm(
                    "Switch Google Account", 
                    "This will disconnect the current Google Drive account. The next sync will require a new login. Continue?", 
                    () => {
                      axios.post('/api/reset-google/')
                        .then(res => {
                          setConnectedEmail(null);
                          showNotification(res.data.message, "info");
                        })
                        .catch(() => showNotification("Failed to reset connection.", "error"));
                    }, 
                    "Disconnect Account", 
                    "bg-slate-800"
                  );
                }
              }} 
              className="py-5 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              {connectedEmail ? 'Switch Account' : 'Connect Account'}
            </button>
          ) : !connectedEmail && (
            <div className="py-4 px-6 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <p className="text-xs font-bold text-amber-800 leading-tight">
                Admin Action Required: Please ask the Server Administrator to connect the official DHSUD Google Drive account directly from the main server PC.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CloudBackup;
