import React from 'react';

const EmptyState = ({ title, message, action }: { title: string, message: string, action?: React.ReactNode }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-[32px] border border-slate-100 shadow-sm animate-in fade-in zoom-in-95">
    <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-[28px] flex items-center justify-center mb-6">
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 font-medium max-w-xs mb-8">{message}</p>
    {action}
  </div>
);

export default EmptyState;
