// frontend/src/components/WallpaperCard.jsx

import React, { useState } from 'react';
import { Eye, Download, Heart, Star, Share2 } from 'lucide-react';
import axios from 'axios';

export default function WallpaperCard({ wallpaper, onUpdateStats, onPreview }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  // Calls backend to increment stats
  const recordAction = async (action) => {
    try {
      await axios.patch(`${API_URL}/wallpapers/${wallpaper._id}/stats`, { action });
      if (onUpdateStats) onUpdateStats(wallpaper._id, action);
    } catch (error) {
      console.error(`Failed to record ${action}:`, error);
    }
  };

  // View count ab sirf click par badhega
  const handleCardClick = () => {
    recordAction('view');
    if (onPreview) onPreview();
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    recordAction('download');
    
    try {
      const response = await fetch(wallpaper.url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `${wallpaper.name.replace(/\s+/g, '_')}_RAWAT_SHOP.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      window.open(wallpaper.url, '_blank');
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    if (!isLiked) recordAction('like');
  };

  const handleFav = (e) => {
    e.stopPropagation();
    setIsFav(!isFav);
    if (!isFav) recordAction('fav');
  };

  const handleShare = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  return (
    <div 
      className="card-container cursor-pointer" 
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-3d relative rounded-xl overflow-hidden glass-card border border-[var(--glass-border)] aspect-[3/4] sm:aspect-[4/5] flex flex-col group shadow-md">
        
        {/* Image Area */}
        <div className="flex-1 relative overflow-hidden bg-black min-h-[140px]">
          <img 
            src={wallpaper.url} 
            alt={wallpaper.name} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out opacity-95 group-hover:opacity-100"
            loading="lazy"
          />
          {/* Overlay Actions */}
          <div className={`absolute top-2 right-2 flex flex-col gap-1.5 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 md:opacity-0 opacity-100'}`}>
            <button onClick={handleLike} className={`p-2 rounded-full backdrop-blur-md transition-all ${isLiked ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.6)]' : 'bg-black/60 text-white hover:bg-red-600'}`}>
              <Heart size={14} className={isLiked ? "fill-current" : ""} />
            </button>
            <button onClick={handleFav} className={`p-2 rounded-full backdrop-blur-md transition-all ${isFav ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.6)]' : 'bg-black/60 text-white hover:bg-yellow-500 hover:text-black'}`}>
              <Star size={14} className={isFav ? "fill-current" : ""} />
            </button>
          </div>
          
          <div className="absolute top-2 left-2">
             <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded brand-font tracking-wider shadow">
               {wallpaper.wallpaperId}
             </span>
          </div>
        </div>

        {/* Bottom Details Area */}
        <div className="p-3 sm:p-4 glass border-t border-[var(--glass-border)] z-10 relative flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-main)] line-clamp-1 mb-1" title={wallpaper.name}>
              {wallpaper.name}
            </h3>
            
            <div className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] sm:text-xs font-bold mb-3 uppercase tracking-wider">
              <span className="flex items-center gap-0.5"><Eye size={12} className="text-red-500" /> {wallpaper.views || 0}</span>
              <span className="flex items-center gap-0.5"><Download size={12} className="text-red-500" /> {wallpaper.downloads || 0}</span>
              <span className="bg-[var(--glass-border)] px-1.5 py-0.5 rounded text-[var(--text-main)] truncate max-w-[80px]">{wallpaper.category}</span>
            </div>
          </div>
          
          <div className="flex gap-1.5">
            <button onClick={handleDownload} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm uppercase tracking-wider text-xs cursor-pointer">
              <Download size={14} /> FULL HD
            </button>
            <button onClick={handleShare} className="p-2 sm:p-2.5 theme-input rounded-lg hover:text-red-500 transition-colors cursor-pointer">
              <Share2 size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}