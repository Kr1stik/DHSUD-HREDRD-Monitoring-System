import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import logo from '../assets/DHSUD_LOGO.png';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login/', { username, password });
      if (response.data.success) {
        toast.success('Welcome, Admin!', { duration: 5000 });
        localStorage.setItem('dhsud_session', 'active');
        onLogin(response.data.username);
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
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="w-full max-w-md px-6 z-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 space-y-8">
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="DHSUD Logo" className="w-24 h-24 object-contain mb-4 drop-shadow-lg" />
            <h2 className="text-3xl font-black text-white text-center tracking-tight">HREDRD</h2>
            <p className="text-slate-400 font-medium uppercase tracking-widest text-xs mt-1">Regional Portal</p>
          </div>

          <div className="text-center space-y-2">
            <p className="text-slate-400 font-medium">Please sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-300 ml-1">Username</label>
              <input 
                required
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
                placeholder="Enter your username"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-300 ml-1">Password</label>
              <div className="relative">
                <input 
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors focus:outline-none">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">
              Secured Access Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
