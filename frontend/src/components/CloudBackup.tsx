import React, { useState, useEffect } from 'react';
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
  setConnectedEmail,
  showNotification,
  requestConfirm
}) => {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
  
  // 🔄 CONNECTION STATES
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [isStatusLoading, setIsStatusLoading] = useState(true);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  // 📡 FETCH CONNECTION STATUS ON MOUNT
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/drive-status/`);
        setIsDriveConnected(res.data.is_connected);
      } catch (err) {
        setIsDriveConnected(false);
      } finally {
        setIsStatusLoading(false);
      }
    };
    checkStatus();
  }, []);

  const handleDisconnect = () => {
    requestConfirm(
      "Switch Google Account", 
      "This will disconnect the current Google Drive account. The next sync will require a new login. Continue?", 
      () => {
        axios.post(`${API_BASE_URL}/reset-google/`)
          .then(res => {
            setConnectedEmail(null);
            setIsDriveConnected(false);
            showNotification(res.data.message, "info");
          })
          .catch(() => showNotification("Failed to reset connection.", "error"));
      }, 
      "Disconnect Account", 
      "bg-slate-800"
    );
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;
    setIsUploadingFile(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('folder_name', syncFolder || 'Manual_Uploads');

    try {
      const res = await axios.post(`${API_BASE_URL}/upload-drive/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showNotification(res.data.message || "File uploaded successfully!", "success");
      setUploadFile(null);
    } catch (err) {
      showNotification("File upload failed. Check connection or API keys.", "error");
    } finally {
      setIsUploadingFile(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 px-4 sm:px-6 py-6 box-border">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-blue-600 text-white rounded-[28px] flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/40">
          <CloudIcon color="text-white" />
        </div>
        <h1 className="text-3xl font-black text-slate-800">Cloud Backup</h1>
        <p className="text-slate-500 font-medium">Securely sync your local database to Google Drive.</p>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 md:p-8 rounded-3xl space-y-6">
        {/* 📧 CLOUD ACCOUNT INDICATOR */}
        <div className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-center sm:items-center gap-4 transition-all ${
          isStatusLoading || isCheckingStatus ? 'bg-slate-50 border-slate-100 animate-pulse' :
          isDriveConnected ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'
        }`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            isDriveConnected ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
          }`}>
            {isStatusLoading || isCheckingStatus ? (
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            )}
          </div>
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Connected Account</p>
            <p className="text-lg font-black text-slate-800 truncate break-all">
              {isStatusLoading || isCheckingStatus ? 'Checking...' : (isDriveConnected ? (connectedEmail || 'Account Connected') : 'No Google account connected.')}
            </p>
          </div>
          {!(isStatusLoading || isCheckingStatus) && isDriveConnected && (
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">Active</div>
            </div>
          )}
        </div>
        
        {isDriveConnected && (
          <div className="space-y-6 animate-in fade-in duration-500">
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
          </div>
        )}

        <div className="flex flex-col gap-4">
          {isDriveConnected && (
            <button onClick={handleCloudSync} disabled={isSyncing} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
              {isSyncing ? (
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : 'Save to Google Drive'}
            </button>
          )}

          {/* 🔄 SMART CONNECT/SWITCH BUTTON */}
          {showSuccessBanner ? (
            <div className="w-full py-5 bg-emerald-50 border-2 border-emerald-100 text-emerald-700 rounded-2xl font-black text-lg flex items-center justify-center gap-3 animate-in zoom-in-95 duration-300">
              <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              ✓ Google Drive Linked
            </div>
          ) : (
            <button 
              onClick={() => {
                if (!isDriveConnected) {
                  // 🔌 DIRECT CONNECT (Bypass Modal)
                  showNotification("Opening Google Login window...", "info");
                  axios.post(`${API_BASE_URL}/connect-google/`)
                    .then(res => {
                      setConnectedEmail(res.data.email);
                      setIsDriveConnected(true);
                      setShowSuccessBanner(true);
                      showNotification("Successfully connected!", "success");
                      setTimeout(() => setShowSuccessBanner(false), 5000);
                    })
                    .catch((err) => {
                      if (err.response && err.response.data && err.response.data.message) {
                        showNotification(err.response.data.message, err.response.data.status || 'warning');
                      } else {
                        showNotification("Failed to connect account.", "error");
                      }
                    });
                } else {
                  // 🔄 SWITCH ACCOUNT
                  handleDisconnect();
                }
              }} 
              className="w-full py-5 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              {isDriveConnected ? 'Switch Account' : 'Connect Account'}
            </button>
          )}
        </div>
      </div>

      {/* 📁 MANUAL FILE UPLOAD SECTION */}
      {isDriveConnected && (
        <div className="bg-white p-6 sm:p-8 rounded-[32px] shadow-sm border border-slate-200 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
            <h2 className="text-xl font-black text-slate-800">Manual File Upload</h2>
          </div>

          <div className="p-8 border-4 border-dashed border-slate-100 rounded-[28px] hover:border-blue-200 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center gap-4 group relative">
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { if(e.target.files && e.target.files[0]) setUploadFile(e.target.files[0]); }} />
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-all shadow-sm">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-700">{uploadFile ? uploadFile.name : 'Select or drag a file here'}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Files will be uploaded to the folder specified above.</p>
            </div>
          </div>

          <button 
            onClick={handleFileUpload} 
            disabled={isUploadingFile || !uploadFile} 
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isUploadingFile ? (
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : 'Upload File'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CloudBackup;
