import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : 'http://localhost:8000';
  const APP_MODE = import.meta.env.VITE_APP_MODE || 'PRODUCTION';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login/`, { username, password });
      if (response.data.success) {
        toast.success('Welcome, Admin!', { duration: 5000 });
        localStorage.setItem('dhsud_session', 'active');
        onLogin(response.data.username);
        navigate('/dashboard', { replace: true });
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* LEFT PANEL (The Form) */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <span className={`inline-block ${APP_MODE === 'PRODUCTION' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-red-100 text-red-700 border-red-200'} border text-xs font-bold px-3 py-1 rounded-full mb-4 w-max shadow-sm`}>
            {APP_MODE === 'PRODUCTION' ? 'OFFICIAL SYSTEM' : 'UAT / BETA MODE'}
          </span>
          <div className="mb-8">
            <img src="/logo.png" alt="DHSUD Logo" className="h-16 w-16 mb-4 object-contain" />
            <h1 className="text-xl font-bold text-slate-800 leading-tight">
              Department of Human Settlements and Urban Development (DHSUD)
            </h1>
            <p className="text-blue-600 font-semibold">HREDRD - NIR</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Username or Email</label>
              <input 
                required
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input 
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center mb-6">
              <label className="flex items-center text-sm text-slate-600 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all" 
                />
                Remember me
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
              Secured Access Only
            </p>
          </div>
        </div>

        {/* RIGHT PANEL (The Branding) */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-center items-center text-center text-white">
          <div className="space-y-4">
            <h2 className="text-4xl font-black tracking-tight">Welcome to HREDRD System</h2>
            <p className="text-blue-100 text-lg font-medium">Regional Data Management & Archiving</p>
          </div>
          
          <div className="mt-12 opacity-20">
            <svg className="w-48 h-48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
