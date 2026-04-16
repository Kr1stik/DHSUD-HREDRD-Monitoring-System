import React, { useState } from 'react';
import { HelpIcon, CloseIcon } from './Icons';

const FloatingHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('dashboard');

  const helpContent = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      text: 'View real-time analytics of all active projects. The charts provide a visual breakdown of project statuses and types.'
    },
    {
      id: 'projects',
      title: 'Projects',
      text: 'Manage your active registration applications. You can add new projects, edit existing ones, or move them to the archives.'
    },
    {
      id: 'backup',
      title: 'Cloud Backup',
      text: 'Securely save a copy of your database to Google Drive. You can specify a custom folder name for each backup.'
    },
    {
      id: 'archives',
      title: 'Archives',
      text: 'Store old or completed projects. Records here can be restored back to the active list or permanently deleted.'
    },
    {
      id: 'import',
      title: 'Import/Export',
      text: 'Use the Bulk Import feature in the New Project modal to upload data via CSV or Excel files. You can also export the registry to XLSX/CSV.'
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {isOpen ? (
        <div className="absolute bottom-20 right-0 w-80 bg-white rounded-[24px] shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="bg-slate-900 p-5 flex justify-between items-center">
            <div className="flex items-center gap-2 text-white">
              <HelpIcon />
              <span className="font-black uppercase tracking-widest text-xs">System Guide</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Accordion Content */}
          <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
            {helpContent.map((item) => (
              <div key={item.id} className="border border-slate-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveTab(activeTab === item.id ? null : item.id)}
                  className={`w-full p-4 text-left font-bold text-sm transition-all flex justify-between items-center ${
                    activeTab === item.id ? 'bg-blue-50 text-blue-600' : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.title}
                  <svg 
                    className={`w-4 h-4 transition-transform duration-300 ${activeTab === item.id ? 'rotate-180' : ''}`} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeTab === item.id && (
                  <div className="p-4 bg-white text-slate-500 text-sm leading-relaxed border-t border-slate-50 animate-in slide-in-from-top-2 fade-in">
                    {item.text}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DHSUD NIR | HREDRD</p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/40 flex items-center justify-center hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all group"
          title="Open System Guide"
        >
          <HelpIcon />
          <span className="absolute right-full mr-4 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Need Help?
          </span>
        </button>
      )}
    </div>
  );
};

export default FloatingHelp;
