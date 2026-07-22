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
      // Call parent function to update state locally without refreshing
      if (onUpdateStats) onUpdateStats(wallpaper._id, action);
    } catch (error) {
      console.error(`Failed to record ${action}:`, error);
    }
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
      // Fallback if CORS blocks blob download
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
      onClick={onPreview}
      onMouseEnter={() => {
        setIsHovered(true);
        recordAction('view'); // Record view on hover
      }} 
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-3d relative rounded-2xl overflow-hidden glass-card border border-[var(--glass-border)] aspect-[4/5] md:aspect-video lg:aspect-[4/5] flex flex-col group">
        
        {/* Image Area */}
        <div className="flex-1 relative overflow-hidden bg-black">
          <img 
            src={wallpaper.url} 
            alt={wallpaper.name} 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out opacity-90 group-hover:opacity-100"
            loading="lazy"
          />
          {/* Overlay Actions */}
          <div className={`absolute top-4 right-4 flex flex-col gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 md:opacity-0 opacity-100'}`}>
            <button onClick={handleLike} className={`p-2.5 rounded-full backdrop-blur-md transition-all ${isLiked ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.6)]' : 'bg-black/60 text-white hover:bg-red-600'}`}>
              <Heart size={18} className={isLiked ? "fill-current" : ""} />
            </button>
            <button onClick={handleFav} className={`p-2.5 rounded-full backdrop-blur-md transition-all ${isFav ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.6)]' : 'bg-black/60 text-white hover:bg-yellow-500 hover:text-black'}`}>
              <Star size={18} className={isFav ? "fill-current" : ""} />
            </button>
          </div>
          
          <div className="absolute top-4 left-4">
             <span className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full brand-font tracking-wider shadow-[0_0_10px_rgba(220,38,38,0.5)]">
               {wallpaper.wallpaperId}
             </span>
          </div>
        </div>

        {/* Bottom Details Area */}
        <div className="p-5 glass border-t border-[var(--glass-border)] z-10 relative">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold truncate flex-1 pr-2 text-[var(--text-main)]">{wallpaper.name}</h3>
          </div>
          
          <div className="flex items-center gap-3 text-[var(--text-muted)] text-xs font-bold mb-4 uppercase tracking-wider">
            <span className="flex items-center gap-1"><Eye size={14} className="text-red-500" /> {wallpaper.views || 0}</span>
            <span className="flex items-center gap-1"><Download size={14} className="text-red-500" /> {wallpaper.downloads || 0}</span>
            <span className="bg-[var(--glass-border)] px-2 py-0.5 rounded text-[var(--text-main)]">{wallpaper.category}</span>
          </div>
          
          <div className="flex gap-2">
            <button onClick={handleDownload} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] uppercase tracking-widest text-sm">
              <Download size={18} /> FULL HD
            </button>
            <button onClick={handleShare} className="p-3 theme-input rounded-lg hover:text-red-500 transition-colors">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}