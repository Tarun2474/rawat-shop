// frontend/src/components/Navbar.jsx

import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import logoImg from '../assets/logo.png'; // 🌟 Yahan image import ki hai

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminLoggedIn = !!sessionStorage.getItem('adminToken');

  return (
    <>
      <nav className="glass sticky top-0 z-50 px-6 py-3 flex justify-between items-center transition-colors border-b border-[var(--glass-border)]">
       {/* Logo Image + Brand Name */}
<Link to="/" className="flex items-center gap-3 cursor-pointer group">
  <div className="w-10 h-10 flex items-center justify-center group-hover:scale-105 transition-transform">
    <img 
      src={logoImg} 
      alt="Rawat Shop Logo" 
      className="w-full h-full object-contain"
    />
  </div>
  <span className="brand-font text-2xl font-black tracking-widest text-[var(--text-main)] group-hover:text-red-500 transition-colors">
    RAWAT<span className="text-red-600">SHOP</span>
  </span>
</Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={`text-lg font-bold uppercase tracking-wider transition-colors hover:text-red-500 ${location.pathname === '/' ? 'text-red-600' : 'text-[var(--text-muted)]'}`}>
            Wallpapers
          </Link>
          <Link to="/stickers" className={`relative text-lg font-bold uppercase tracking-wider transition-colors hover:text-red-500 ${location.pathname === '/stickers' ? 'text-red-600' : 'text-[var(--text-muted)]'}`}>
            Stickers
            <span className="absolute -top-3 -right-6 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse">SOON</span>
          </Link>
          
          <div className="h-6 w-px bg-[var(--glass-border)] mx-2"></div>
          
          <button onClick={toggleTheme} className="text-[var(--text-muted)] hover:text-red-500 transition-colors cursor-pointer">
            {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
          </button>

          <button onClick={() => navigate(isAdminLoggedIn ? '/admin/dashboard' : '/admin')} className="text-[var(--text-muted)] hover:text-red-500 transition-colors font-bold uppercase tracking-wider cursor-pointer">
            Admin
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <button onClick={toggleTheme} className="text-[var(--text-muted)] cursor-pointer">
            {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          <button className="text-[var(--text-main)] p-2 cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[69px] bg-[var(--bg-main)] backdrop-blur-xl z-40 flex flex-col p-6 gap-6 border-b border-[var(--glass-border)] shadow-2xl animate-in slide-in-from-top duration-300">
          <Link 
            to="/" 
            onClick={() => setMobileMenuOpen(false)} 
            className="text-xl font-black uppercase tracking-wider text-left text-[var(--text-main)] hover:text-red-500 p-2 border-b border-[var(--glass-border)]"
          >
            Wallpapers
          </Link>
          <Link 
            to="/stickers" 
            onClick={() => setMobileMenuOpen(false)} 
            className="text-xl font-black uppercase tracking-wider text-left text-[var(--text-main)] hover:text-red-500 p-2 border-b border-[var(--glass-border)] flex items-center justify-between"
          >
            Stickers <span className="text-xs bg-red-600 text-white px-2.5 py-1 rounded-full">SOON</span>
          </Link>
          <button 
            onClick={() => { navigate(isAdminLoggedIn ? '/admin/dashboard' : '/admin'); setMobileMenuOpen(false); }} 
            className="text-xl font-black uppercase tracking-wider text-left text-red-500 hover:text-red-400 p-2 cursor-pointer"
          >
            Admin Panel
          </button>
        </div>
      )}
    </>
  );
}