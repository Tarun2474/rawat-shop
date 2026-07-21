// frontend/src/pages/AdminLogin.jsx

import React, { useState } from 'react';
import { UserCog, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminLogin() {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 Yeh theek kar diya hai
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/admin/login`, {
        adminId,
        password
      });

      if (data.success) {
        // Save token securely in localStorage
        localStorage.setItem('adminToken', data.token);
        // Redirect to admin dashboard
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Access Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-[var(--bg-color)]">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 relative overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/20 blur-2xl rounded-full"></div>
        
        {/* === BACK BUTTON === */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[var(--text-muted)] hover:text-red-500 transition-colors font-black uppercase text-xs tracking-wider mb-6 relative z-10"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600/10 border border-red-600/50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
             <UserCog className="text-red-500" size={32} />
          </div>
          <h2 className="text-3xl font-black brand-font mb-2 text-[var(--text-main)]">ADMIN <span className="text-red-500">PORTAL</span></h2>
          <p className="text-[var(--text-muted)] font-bold">Secure Dashboard Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && <div className="bg-red-900/20 border border-red-500 text-red-500 p-3 rounded-lg text-center font-bold animate-pulse">{error}</div>}
          
          <div>
            <label className="block text-[var(--text-muted)] text-xs font-black uppercase tracking-wider mb-2">Admin ID</label>
            <input 
              type="text" 
              value={adminId} 
              onChange={(e) => setAdminId(e.target.value)} 
              required
              className="w-full theme-input rounded-lg py-3 px-4 focus:outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(220,38,38,0.2)] transition-all font-bold"
              placeholder="Enter Admin ID"
            />
          </div>

          {/* === PASSWORD FIELD WITH SHOW/HIDE BUTTON === */}
          <div>
            <label className="block text-[var(--text-muted)] text-xs font-black uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                className="w-full theme-input rounded-lg py-3 px-4 pr-16 focus:outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(220,38,38,0.2)] transition-all font-bold"
                placeholder="Enter Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold uppercase text-gray-400 hover:text-white px-2 py-1"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>
          {/* =========================================== */}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-600 text-white font-black uppercase tracking-widest py-4 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:bg-red-500 transition-all mt-4 brand-font text-lg disabled:opacity-50"
          >
            {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
          </button>
        </form>
      </div>
    </div>
  );
}