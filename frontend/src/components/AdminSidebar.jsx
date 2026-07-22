// frontend/src/components/AdminSidebar.jsx

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, FileImage, Settings, LogOut } from 'lucide-react';

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Analytics Dashboard' },
    { path: '/admin/upload', icon: UploadCloud, label: 'Upload Wallpaper' },
    { path: '/admin/manage', icon: FileImage, label: 'Manage & History' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    navigate('/');
  };

  return (
    <aside className="w-full md:w-72 glass border-r border-[var(--glass-border)] flex flex-col h-full shrink-0">
      <div className="p-6 overflow-y-auto flex-1">
        <p className="text-[var(--text-muted)] font-black uppercase tracking-widest text-xs mb-6 pl-2">Admin Panel v2.0</p>
        <nav className="space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path} 
                to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all text-sm uppercase tracking-wide ${
                  isActive 
                    ? 'bg-red-600/10 text-red-500 border border-red-600/30 shadow-[0_0_15px_rgba(220,38,38,0.1)]' 
                    : 'text-[var(--text-muted)] hover:bg-[var(--input-bg)] hover:text-[var(--text-main)]'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-red-500' : ''} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-6 border-t border-[var(--glass-border)]">
         <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-red-500 font-bold uppercase tracking-wider py-3 border border-red-500/30 rounded-xl hover:bg-red-600 hover:text-white transition-all">
           <LogOut size={18} /> Secure Logout
         </button>
      </div>
    </aside>
  );
}
