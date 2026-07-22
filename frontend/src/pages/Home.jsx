// frontend/src/pages/Home.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Download, Eye, Heart } from 'lucide-react';
import axios from 'axios';
import WallpaperCard from '../components/WallpaperCard';

const MAIN_CATEGORIES = ['Latest', 'Premium', 'Mobile Wallpapers', 'Laptop Wallpapers', 'Tablet Wallpapers'];
const SUB_CATEGORIES = ['Gaming', 'Anime', 'Nature', 'Cars', 'Bikes', 'Technology', 'Superheroes', 'Marvel', 'DC', 'Movies', 'Space', 'Abstract', 'Dark', 'AMOLED', 'Minimal', 'Sports', 'Fantasy', 'Sci-Fi'];

export default function Home() {
  const [wallpapers, setWallpapers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMainCat, setActiveMainCat] = useState('Latest');
  const [activeSubCat, setActiveSubCat] = useState('All');
  const [loading, setLoading] = useState(true);

  // State for Full-Screen Preview Modal
  const [previewWallpaper, setPreviewWallpaper] = useState(null);

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
      const matchesMain = activeMainCat === 'Latest' || w.mainCategory === activeMainCat;
      const matchesSub = activeSubCat === 'All' || w.category === activeSubCat;
      return matchesSearch && matchesMain && matchesSub;
    });
  }, [wallpapers, searchQuery, activeMainCat, activeSubCat]);

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
          <p className="text-[var(--text-muted)] text-lg md:text-xl max-w-2xl mx-auto mb-10 font-bold">
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
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto w-full px-4 md:px-8 py-10 flex-1">
        
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
            All Sub-Categories
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

        {/* 3-Column Desktop Grid / 1-Col Mobile */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
          </div>
        ) : filteredWallpapers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredWallpapers.map((wp) => (
              <WallpaperCard 
                key={wp._id} 
                wallpaper={wp} 
                onUpdateStats={handleUpdateStats} 
                onPreview={() => setPreviewWallpaper(wp)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-card rounded-2xl border-dashed border-2 border-[var(--glass-border)]">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full theme-input mb-4 shadow-lg">
              <Search className="text-red-500" size={32} />
            </div>
            <h3 className="text-3xl font-black mb-2 brand-font text-red-500">NO RESULTS</h3>
            <p className="text-[var(--text-muted)] font-bold">Try adjusting your search query or category filters.</p>
          </div>
        )}
      </div>

      {/* Full-Screen Preview Modal */}
      {previewWallpaper && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewWallpaper(null)}
        >
          {/* Close / Back Button */}
          <button 
            onClick={() => setPreviewWallpaper(null)}
            className="absolute top-6 right-6 z-50 p-3 rounded-full bg-neutral-900/80 text-white border border-neutral-700 hover:bg-red-600 transition-colors shadow-lg"
          >
            <X size={24} />
          </button>

          {/* Modal Container */}
          <div 
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={previewWallpaper.url} 
              alt={previewWallpaper.name} 
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-neutral-800"
            />
            
            {/* Wallpaper Info & Actions bar */}
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
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded-lg text-sm transition-all shadow-lg flex items-center gap-2"
                >
                  <Download size={16} /> Download Wallpaper
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="text-center py-6 text-gray-500 text-sm mt-auto border-t border-[var(--glass-border)]">
        © {new Date().getFullYear()} RAWAT SHOP. All rights reserved.
      </footer>
    </div> 
  );
}