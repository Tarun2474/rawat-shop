// frontend/src/pages/AdminSettings.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminSettings() {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('adminToken');
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!adminId && !password) {
      setStatus({ type: 'error', message: 'Please provide either a new ID or Password to update.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const { data } = await axios.put(`${API_URL}/admin/update`, {
        adminId: adminId || undefined,
        password: password || undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setStatus({ type: 'success', message: 'Credentials Updated Securely. Please login again with new credentials.' });
        // Logout user because token is invalid/old credentials changed
        setTimeout(() => {
          localStorage.removeItem('adminToken');
          navigate('/admin');
        }, 3000);
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update settings.' });
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="max-w-2xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black brand-font mb-1 text-[var(--text-main)]">SYSTEM <span className="text-red-500">SETTINGS</span></h2>
        <p className="text-[var(--text-muted)] font-bold">Manage admin authentication and security configuration.</p>
      </div>

      <div className="glass-card p-8 rounded-3xl border border-[var(--glass-border)] shadow-xl">
        <h3 className="text-xl font-black mb-6 pb-4 border-b border-[var(--glass-border)] text-[var(--text-main)]">Update Login Credentials</h3>
        
        {status.message && (
          <div className={`mb-6 p-4 font-bold border rounded-xl ${status.type === 'success' ? 'bg-green-500/20 text-green-500 border-green-500' : 'bg-red-500/20 text-red-500 border-red-500'}`}>
            {status.message}
          </div>
        )}
        
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="p-4 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl mb-6">
            <p className="text-sm font-bold text-[var(--text-muted)]">
              Note: Leave a field blank if you do not want to change it. Changing credentials will automatically log you out for security reasons.
            </p>
          </div>

          <div>
            <label className="block text-[var(--text-muted)] text-xs font-black uppercase tracking-wider mb-2">New Admin ID</label>
            <input type="text" value={adminId} onChange={e => setAdminId(e.target.value)} 
              className="w-full theme-input rounded-xl py-3.5 px-4 focus:outline-none focus:border-red-500 transition-all font-bold" 
              placeholder="Enter new admin username" />
          </div>
          <div>
            <label className="block text-[var(--text-muted)] text-xs font-black uppercase tracking-wider mb-2">New Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} 
              className="w-full theme-input rounded-xl py-3.5 px-4 focus:outline-none focus:border-red-500 transition-all font-bold" 
              placeholder="Enter new password" />
          </div>
          <button type="submit" disabled={loading} className="bg-red-600 text-white font-black py-4 px-8 rounded-xl uppercase tracking-widest hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all disabled:opacity-50">
            {loading ? 'SAVING...' : 'SAVE CHANGES TO DATABASE'}
          </button>
        </form>
      </div>
    </div>
  );
}
