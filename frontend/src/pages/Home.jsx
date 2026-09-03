// frontend/src/pages/Home.jsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Download, Eye, Heart, Shield, MessageSquare, ChevronLeft, ChevronRight, Sparkles, Flame, Zap, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import WallpaperCard from '../components/WallpaperCard';

const MAIN_CATEGORIES = ['Latest', 'Premium', 'Mobile Wallpapers', 'Laptop Wallpapers', 'Tablet Wallpapers'];
const SUB_CATEGORIES = [
  'Gaming', 'Valorant', 'GTA V', 'Cyberpunk', 'God of War', 
  'Anime', 'Solo Leveling', 'Naruto', 'Jujutsu Kaisen', 'Demon Slayer', 
  'Bikes', 'Cafe Racer', 'Supercars', 'Cars', 
  'Dark', 'AMOLED', 'Neon', 'Sci-Fi', 'Superheroes', 'Marvel', 'DC', 'Minimal', 'Abstract'
];

const ITEMS_PER_PAGE = 15; // 3 columns × 5 rows = 15 wallpapers per page

export default function Home() {
  const [wallpapers, setWallpapers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMainCat, setActiveMainCat] = useState('Latest');
  const [activeSubCat, setActiveSubCat] = useState('All');
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // State for Full-Screen Preview Modal
  const [previewWallpaper, setPreviewWallpaper] = useState(null);

  // Cover Flow State & Logic Refs
  const coverflowCardsRef = useRef([]);
  const [cfPosition, setCfPosition] = useState(0);
  const [isCfDragging, setIsCfDragging] = useState(false);
  const cfStartX = useRef(0);
  const cfLastX = useRef(0);
  const cfDragStartPos = useRef(0);
  const cfVelocity = useRef(0);
  const cfLastMoveTime = useRef(0);
  const coverflowContainerRef = useRef(null);

  // Default 6 Cover Flow Wallpapers (WLP001 to WLP006)
  const coverflowItems = useMemo(() => [
    { wallpaperId: 'WLP001', name: 'Cyberpunk Neon', url: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=90' },
    { wallpaperId: 'WLP002', name: 'Valorant Fade', url: 'https://images.unsplash.com/photo-1534791547706-68c6c8c6f1c7?auto=format&fit=crop&w=900&q=90' },
    { wallpaperId: 'WLP003', name: 'GTA V Sunset', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=90' },
    { wallpaperId: 'WLP004', name: 'Dark Samurai', url: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=900&q=90' },
    { wallpaperId: 'WLP005', name: 'Anime Vibes', url: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=90' },
    { wallpaperId: 'WLP006', name: 'Supercar Night', url: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&q=90' },
  ], []);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch wallpapers from backend database
  useEffect(() => {
    const fetchWallpapers = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/wallpapers`);
        if (data.success) {
          setWallpapers(data.data);
        }
      } catch (error) {
        console.error("Error fetching wallpapers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWallpapers();
  }, [API_URL]);

  // Automatically open preview modal if URL has ?wallpaper=WLP001
  useEffect(() => {
    if (wallpapers.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const wpId = params.get('wallpaper');
      if (wpId) {
        const foundWp = wallpapers.find(w => w.wallpaperId === wpId);
        if (foundWp) {
          setPreviewWallpaper(foundWp);
          window.history.replaceState({}, document.title, window.location.pathname);
          axios.patch(`${API_URL}/wallpapers/${foundWp._id}/stats`, { action: 'view' })
            .then(() => {
              setWallpapers(prev => prev.map(w => w._id === foundWp._id ? { ...w, views: w.views + 1 } : w));
            })
            .catch(err => console.error("Failed to record view:", err));
        }
      }
    }
  }, [wallpapers]);

  // Reset to page 1 whenever search query or categories change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeMainCat, activeSubCat]);

  // Update stats locally in state when user clicks view/like/download
  const handleUpdateStats = (id, action) => {
    setWallpapers(prevWallpapers => 
      prevWallpapers.map(wp => {
        if (wp._id === id) {
          if (action === 'view') return { ...wp, views: wp.views + 1 };
          if (action === 'download') return { ...wp, downloads: wp.downloads + 1 };
          if (action === 'like') return { ...wp, likes: wp.likes + 1 };
          if (action === 'fav') return { ...wp, favs: wp.favs + 1 };
        }
        return wp;
      })
    );
  };

  // Filter logic
  const filteredWallpapers = useMemo(() => {
    return wallpapers.filter(w => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = w.name.toLowerCase().includes(q) || w.wallpaperId.toLowerCase().includes(q) || w.category.toLowerCase().includes(q);
      const matchesMain = activeMainCat === 'Latest' || (Array.isArray(w.mainCategory) ? w.mainCategory.includes(activeMainCat) : w.mainCategory === activeMainCat);
      const matchesSub = activeSubCat === 'All' || w.category.toLowerCase() === activeSubCat.toLowerCase();
      return matchesSearch && matchesMain && matchesSub;
    });
  }, [wallpapers, searchQuery, activeMainCat, activeSubCat]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredWallpapers.length / ITEMS_PER_PAGE);
  const currentWallpapers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredWallpapers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredWallpapers, currentPage]);

  // ==========================================
  // COVER FLOW CAROUSEL INTERACTION LOGIC
  // ==========================================
  const totalCfCards = coverflowItems.length;

  const nextCfCard = () => {
    setCfPosition(prev => prev + 1);
  };

  const prevCfCard = () => {
    setCfPosition(prev => prev - 1);
  };

  // Render Cover Flow styles dynamically based on cfPosition
  useEffect(() => {
    const cardElements = coverflowCardsRef.current;
    if (!cardElements.length) return;

    const getCardWidth = () => cardElements[0]?.getBoundingClientRect().width || 160;
    const getSpacing = () => {
      const width = window.innerWidth;
      if (width <= 390) return getCardWidth() * 0.39;
      if (width <= 700) return getCardWidth() * 0.41;
      if (width <= 1100) return getCardWidth() * 0.43;
      return getCardWidth() * 0.44;
    };

    const cardWidth = getCardWidth();
    const spacing = getSpacing();

    cardElements.forEach((card, index) => {
      if (!card) return;
      let relative = index - cfPosition;
      if (relative > totalCfCards / 2) relative -= totalCfCards;
      if (relative < -totalCfCards / 2) relative += totalCfCards;

      const abs = Math.abs(relative);
      let x = 0, scale = 1, rotate = 0, opacity = 1, zIndex = 50, blur = 0;

      if (abs < 0.001) {
        x = 0; scale = 1; rotate = 0; opacity = 1; zIndex = 100; blur = 0;
      } else if (abs <= 1) {
        const t = abs;
        x = Math.sign(relative) * spacing * t;
        scale = 1 - (0.10 * t);
        rotate = Math.sign(relative) * (8 * t);
        opacity = 1 - (0.13 * t);
        zIndex = 90;
      } else if (abs <= 2) {
        const t = abs - 1;
        x = Math.sign(relative) * (spacing + spacing * 0.70 * t);
        scale = 0.90 - (0.10 * t);
        rotate = Math.sign(relative) * (8 + 4 * t);
        opacity = 0.87 - (0.27 * t);
        zIndex = 70;
      } else if (abs <= 3) {
        const t = abs - 2;
        x = Math.sign(relative) * (spacing * 1.70 + spacing * 0.65 * t);
        scale = 0.80 - (0.08 * t);
        rotate = Math.sign(relative) * (12 + 3 * t);
        opacity = 0.60 - (0.25 * t);
        zIndex = 50;
        blur = 0.5;
      } else {
        x = Math.sign(relative) * spacing * 3.0;
        scale = 0.70;
        rotate = Math.sign(relative) * 15;
        opacity = 0;
        zIndex = 1;
        blur = 2;
      }

      const y = abs < 1 ? 0 : Math.min(abs, 3) * 2;

      card.style.zIndex = zIndex;
      card.style.opacity = opacity;
      card.style.filter = `brightness(${1 - Math.min(abs, 3) * 0.16}) blur(${blur}px)`;
      card.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0) scale(${scale}) rotateY(${rotate}deg)`;
    });
  }, [cfPosition, totalCfCards]);

  return (
    <div className="w-full flex-1 flex flex-col relative">
      {/* Hero Section */}
      <div className="relative w-full h-[45vh] min-h-[350px] flex items-center justify-center overflow-hidden border-b border-[var(--glass-border)]">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[150px] mix-blend-screen"></div>
          <div className="absolute inset-0 dark:bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter brand-font text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-800 animate-float drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]">
            RAWAT <span className="text-[var(--text-main)] drop-shadow-none">SHOP</span>
          </h1>
          <p className="text-[var(--text-muted)] text-lg md:text-xl max-w-2xl mx-auto mb-8 font-bold">
            Premium 3D Gaming Wallpapers. Original Quality. Zero Compression.
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-2xl relative group">
            <div className="absolute inset-0 bg-red-600/20 rounded-full blur-xl group-hover:bg-red-600/30 transition-all duration-300"></div>
            <div className="relative flex items-center glass rounded-full overflow-hidden border border-[var(--glass-border)] focus-within:border-red-500 focus-within:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all">
              <Search className="ml-6 text-[var(--text-muted)]" size={24} />
              <input 
                type="text" 
                placeholder="Search Name, ID (WLP001), or Category..." 
                className="w-full bg-transparent border-none py-5 px-4 text-[var(--text-main)] text-lg placeholder-[var(--text-muted)] focus:outline-none font-semibold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* =====================================================
               NEW STACKED COVER FLOW SECTION (Below Search Bar)
          ===================================================== */}
          <div className="relative w-full max-w-3xl mt-6 flex items-center justify-center">
            {/* Left Button */}
            <button 
              onClick={prevCfCard}
              className="absolute left-0 z-50 w-11 h-11 rounded-full bg-[#111] border border-white/12 text-white text-xl flex items-center justify-center hover:bg-[#e50914] hover:border-[#e50914] transition-all shadow-lg cursor-pointer"
              aria-label="Previous"
            >
              &#139;
            </button>

            {/* Coverflow Window */}
            <div 
              className="w-full h-[320px] sm:h-[355px] relative overflow-hidden select-none touch-pan-y"
              ref={coverflowContainerRef}
            >
              <div className="absolute inset-0 pointer-events-none">
                {coverflowItems.map((item, index) => (
                  <div 
                    key={item.wallpaperId}
                    ref={el => coverflowCardsRef.current[index] = el}
                    onClick={() => setCfPosition(index)}
                    className="absolute left-1/2 top-1/2 w-[160px] sm:w-[200px] h-[235px] sm:h-[295px] rounded-2xl overflow-hidden cursor-pointer pointer-events-auto bg-[#111] shadow-[0_20px_45px_rgba(0,0,0,0.55)] transition-transform duration-500 ease-out"
                    style={{ transformOrigin: 'center center' }}
                  >
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover pointer-events-none select-none" draggable="false" />
                    <div className="absolute left-3 bottom-3 py-1 px-2.5 rounded-lg bg-[#e50914] text-white text-[10px] font-extrabold tracking-wide shadow-md">
                      {item.wallpaperId}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Button */}
            <button 
              onClick={nextCfCard}
              className="absolute right-0 z-50 w-11 h-11 rounded-full bg-[#111] border border-white/12 text-white text-xl flex items-center justify-center hover:bg-[#e50914] hover:border-[#e50914] transition-all shadow-lg cursor-pointer"
              aria-label="Next"
            >
              &#155;
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto w-full px-2 sm:px-4 md:px-8 py-10 flex-1">
        
        {/* Main Categories */}
        <div className="flex gap-4 overflow-x-auto pb-4 mb-4 scrollbar-hide snap-x border-b border-[var(--glass-border)]">
          {MAIN_CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => { setActiveMainCat(cat); setActiveSubCat('All'); }}
              className={`snap-start whitespace-nowrap pb-3 font-black uppercase tracking-wider text-sm transition-all border-b-4 ${
                activeMainCat === cat 
                  ? 'border-red-600 text-red-600' 
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sub Categories */}
        <div className="flex gap-3 overflow-x-auto pb-8 mb-4 scrollbar-hide snap-x">
          <button 
            onClick={() => setActiveSubCat('All')}
            className={`snap-start whitespace-nowrap px-5 py-2 rounded-lg font-bold uppercase tracking-wider text-xs transition-all border ${
              activeSubCat === 'All' 
                ? 'bg-red-600 text-white border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
                : 'theme-input hover:border-red-500/50 hover:text-red-500'
            }`}
          >
            All Categories
          </button>
          {SUB_CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveSubCat(cat)}
              className={`snap-start whitespace-nowrap px-5 py-2 rounded-lg font-bold uppercase tracking-wider text-xs transition-all border ${
                activeSubCat === cat 
                  ? 'bg-red-600 text-white border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
                  : 'theme-input hover:border-red-500/50 hover:text-red-500'
            }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3-Column Grid for Mobile, Tablet & Desktop / 15 Wallpapers per page */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
          </div>
        ) : currentWallpapers.length > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-3 md:gap-8">
              {currentWallpapers.map((wp) => (
                <WallpaperCard 
                  key={wp._id} 
                  wallpaper={wp} 
                  onUpdateStats={handleUpdateStats} 
                  onPreview={() => setPreviewWallpaper(wp)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 sm:gap-3 mt-12">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-2 rounded-xl glass border border-[var(--glass-border)] text-[var(--text-main)] font-bold flex items-center gap-1 sm:gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-500 transition-all cursor-pointer text-xs sm:text-sm"
                >
                  <ChevronLeft size={16} /> Prev
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                    <button
                      key={num}
                      onClick={() => setCurrentPage(num)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl font-bold transition-all cursor-pointer text-xs sm:text-sm ${
                        currentPage === num
                          ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-600'
                          : 'glass text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--glass-border)]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 sm:px-4 py-2 rounded-xl glass border border-[var(--glass-border)] text-[var(--text-main)] font-bold flex items-center gap-1 sm:gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-500 transition-all cursor-pointer text-xs sm:text-sm"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 glass-card rounded-2xl border-dashed border-2 border-[var(--glass-border)]">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full theme-input mb-4 shadow-lg">
              <Search className="text-red-500" size={32} />
            </div>
            <h3 className="text-3xl font-black mb-2 brand-font text-red-500">NO RESULTS</h3>
            <p className="text-[var(--text-muted)] font-bold">Try adjusting your search query or category filters.</p>
          </div>
        )}

        {/* 🌟 DECORATED GAMING/SEO INFO SECTION */}
        <div className="mt-16 relative rounded-3xl p-6 md:p-10 glass-card border border-red-500/30 overflow-hidden shadow-[0_0_30px_rgba(220,38,38,0.15)]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-600/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-900/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-[var(--glass-border)]">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)]">
                  <Flame size={26} />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-[var(--text-main)] brand-font tracking-tight">
                    LEVEL UP YOUR <span className="text-red-500">SCREEN VIBE</span>
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">
                    Exclusive 3D Gaming & Anime Wallpapers Hub
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-red-500/40 text-red-500 font-black text-xs uppercase tracking-wider">
                <Zap size={16} /> 100% Original Quality
              </div>
            </div>

            <p className="text-[var(--text-muted)] text-sm md:text-base leading-relaxed font-semibold mb-8">
              Welcome to <strong className="text-[var(--text-main)]">RAWAT SHOP</strong> — the ultimate digital sanctuary for gamers, anime fans, and aesthetic riders. We hand-craft and curate zero-compression, razor-sharp visual masterpieces designed specifically to pop on high-refresh-rate mobile displays, tablet screens, and gaming desktop monitors.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass p-5 rounded-2xl border border-[var(--glass-border)] hover:border-red-500/50 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-500 flex items-center justify-center font-black mb-3 group-hover:scale-110 transition-transform">
                  <Sparkles size={20} />
                </div>
                <h4 className="text-[var(--text-main)] font-black text-base mb-1">Zero Compression HD</h4>
                <p className="text-[var(--text-muted)] text-xs leading-relaxed font-medium">
                  Every wallpaper retains its pristine pixels, deep blacks, and vibrant neon glows without losing clarity.
                </p>
              </div>

              <div className="glass p-5 rounded-2xl border border-[var(--glass-border)] hover:border-red-500/50 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-500 flex items-center justify-center font-black mb-3 group-hover:scale-110 transition-transform">
                  <Flame size={20} />
                </div>
                <h4 className="text-[var(--text-main)] font-black text-base mb-1">Trending Universes</h4>
                <p className="text-[var(--text-muted)] text-xs leading-relaxed font-medium">
                  Explore top-tier collections from Valorant, GTA V, Solo Leveling, Cyberpunk, and aggressive Cafe Racers.
                </p>
              </div>

              <div className="glass p-5 rounded-2xl border border-[var(--glass-border)] hover:border-red-500/50 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-500 flex items-center justify-center font-black mb-3 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={20} />
                </div>
                <h4 className="text-[var(--text-main)] font-black text-base mb-1">Instant Direct DL</h4>
                <p className="text-[var(--text-muted)] text-xs leading-relaxed font-medium">
                  One-tap full HD downloads straight to your device gallery with zero redirects or annoying ads.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Full-Screen Preview Modal */}
      {previewWallpaper && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewWallpaper(null)}
        >
          <button 
            onClick={() => setPreviewWallpaper(null)}
            className="absolute top-6 right-6 z-50 p-3 rounded-full bg-neutral-900/80 text-white border border-neutral-700 hover:bg-red-600 transition-colors shadow-lg cursor-pointer"
          >
            <X size={24} />
          </button>

          <div 
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={previewWallpaper.url} 
              alt={previewWallpaper.name} 
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-neutral-800"
            />
            
            <div className="mt-4 flex flex-wrap items-center justify-between w-full bg-neutral-900/90 border border-neutral-800 p-4 rounded-xl gap-4">
              <div>
                <h3 className="text-white font-bold text-lg">{previewWallpaper.name}</h3>
                <p className="text-xs text-red-500 font-black tracking-wider">{previewWallpaper.wallpaperId} • {previewWallpaper.category}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-xs font-bold flex items-center gap-1"><Eye size={14}/> {previewWallpaper.views}</span>
                <span className="text-gray-400 text-xs font-bold flex items-center gap-1"><Download size={14}/> {previewWallpaper.downloads}</span>
                <button 
                  onClick={async () => {
                    try {
                      const response = await fetch(previewWallpaper.url);
                      const blob = await response.blob();
                      const objectUrl = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = objectUrl;
                      link.download = `${previewWallpaper.name.replace(/\s+/g, '_')}_RAWAT_SHOP.jpg`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(objectUrl);
                    } catch (err) {
                      window.open(previewWallpaper.url, '_blank');
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded-lg text-sm transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <Download size={16} /> Download Wallpaper
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer with Links */}
      <footer className="w-full py-6 px-4 text-center text-gray-500 text-sm mt-auto border-t border-[var(--glass-border)] flex flex-col sm:flex-row items-center justify-center gap-4">
        <span>© {new Date().getFullYear()} RAWAT SHOP. All rights reserved.</span>
        <span className="hidden sm:inline">•</span>
        <Link to="/privacy-policy" className="text-gray-400 hover:text-red-500 font-semibold transition-colors flex items-center gap-1">
          <Shield size={14} /> Privacy Policy
        </Link>
        <span className="hidden sm:inline">•</span>
        <Link to="/contact" className="text-gray-400 hover:text-red-500 font-semibold transition-colors flex items-center gap-1">
          <MessageSquare size={14} /> Contact Us
        </Link>
      </footer>
    </div> 
  );
}