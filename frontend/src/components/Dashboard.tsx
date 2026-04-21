import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

interface DashboardProps {
  stats: {
    ongoing: number;
    approved: number;
    endorsed: number;
    denied: number;
  };
  backendStats?: {
    total_projects: number;
    total_salespersons: number;
    new_salespersons_this_month: number;
  };
  chartData: any[];
  pieChartDataRaw: any[];
  pieChartData: any[];
  COLORS: string[];
  setShowChartModal: (modal: { show: boolean, title: string, data: any[] }) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, backendStats, chartData, pieChartDataRaw, pieChartData, COLORS, setShowChartModal }) => {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Analytics Overview</h1>
        {backendStats && (
          <div className="flex gap-4">
            <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Total Salespersons</p>
              <p className="text-xl font-black text-blue-600">{backendStats.total_salespersons}</p>
            </div>
            <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">New This Month</p>
              <p className="text-xl font-black text-emerald-600">+{backendStats.new_salespersons_this_month}</p>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {[
          { label: 'Ongoing', val: stats.ongoing, color: 'blue' },
          { label: 'Approved', val: stats.approved, color: 'emerald' },
          { label: 'Endorsed', val: stats.endorsed, color: 'amber' },
          { label: 'Denied', val: stats.denied, color: 'red' }
        ].map(s => (
          <div key={s.label} className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
            <p className="text-2xl sm:text-4xl font-bold text-slate-800 mt-1">{s.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 h-fit">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Status Breakdown</h3>
            <button onClick={() => setShowChartModal({show: true, title: 'Application Status Breakdown', data: chartData})} className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-widest">Full Report</button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={45}>
                  {chartData.map((d, i) => (<Cell key={i} fill={d.color} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 h-fit">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Project Types</h3>
            <button onClick={() => setShowChartModal({show: true, title: 'All Project Types', data: pieChartDataRaw})} className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-widest">Full Report</button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieChartData} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                  {pieChartData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(v) => <span className="text-xs font-medium text-slate-600">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
