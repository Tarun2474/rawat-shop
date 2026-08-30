// frontend/src/components/WallpaperCard.jsx

import React, { useState } from 'react';
import { Eye, Download, Heart, Star, Share2, Copy, Send, Check } from 'lucide-react';
import axios from 'axios';

export default function WallpaperCard({ wallpaper, onUpdateStats, onPreview }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Toggle Share Menu
  const handleShareClick = (e) => {
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  // Copy Link Function
  const handleCopyLink = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(wallpaper.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowShareMenu(false);
  };

  // Share to Social Platforms
  const handleSocialShare = (platform, e) => {
    e.stopPropagation();
    const shareUrl = wallpaper.url;
    const text = `Check out this amazing wallpaper: ${wallpaper.name} on RAWAT SHOP!`;

    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + shareUrl)}`, '_blank');
    } else if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'native' && navigator.share) {
      navigator.share({
        title: wallpaper.name,
        text: text,
        url: shareUrl,
      }).catch(() => {});
    }
    setShowShareMenu(false);
  };

  return (
    <div 
      className="card-container cursor-pointer relative" 
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => { setIsHovered(false); setShowShareMenu(false); }}
    >
      <div className="card-3d relative rounded-xl overflow-hidden glass-card border border-[var(--glass-border)] flex flex-col group shadow-md">
        
        {/* Image Area */}
        <div className="relative overflow-hidden bg-black aspect-[3/4] sm:aspect-[4/5] min-h-[120px]">
          <img 
            src={wallpaper.url} 
            alt={wallpaper.name} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out opacity-95 group-hover:opacity-100"
            loading="lazy"
          />
          {/* Overlay Actions */}
          <div className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex flex-col gap-1 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-100 md:opacity-0'}`}>
            <button onClick={handleLike} className={`p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all ${isLiked ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.6)]' : 'bg-black/60 text-white hover:bg-red-600'}`}>
              <Heart size={12} className={`sm:w-3.5 sm:h-3.5 ${isLiked ? "fill-current" : ""}`} />
            </button>
            <button onClick={handleFav} className={`p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all ${isFav ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.6)]' : 'bg-black/60 text-white hover:bg-yellow-500 hover:text-black'}`}>
              <Star size={12} className={`sm:w-3.5 sm:h-3.5 ${isFav ? "fill-current" : ""}`} />
            </button>
          </div>
          
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
             <span className="bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded brand-font tracking-wider shadow">
               {wallpaper.wallpaperId}
             </span>
          </div>
        </div>

        {/* Bottom Details Area */}
        <div className="p-2 sm:p-4 glass border-t border-[var(--glass-border)] z-10 relative flex flex-col justify-between">
          <div>
            <h3 className="text-xs sm:text-base font-bold text-[var(--text-main)] line-clamp-1 mb-1" title={wallpaper.name}>
              {wallpaper.name}
            </h3>
            
            <div className="flex items-center gap-1.5 sm:gap-2 text-[var(--text-muted)] text-[9px] sm:text-xs font-bold mb-2 sm:mb-3 uppercase tracking-wider overflow-hidden">
              <span className="flex items-center gap-0.5"><Eye size={10} className="sm:w-3 sm:h-3 text-red-500" /> {wallpaper.views || 0}</span>
              <span className="flex items-center gap-0.5"><Download size={10} className="sm:w-3 sm:h-3 text-red-500" /> {wallpaper.downloads || 0}</span>
              <span className="bg-[var(--glass-border)] px-1 py-0.5 rounded text-[var(--text-main)] truncate max-w-[60px] sm:max-w-[80px]">{wallpaper.category}</span>
            </div>
          </div>
          
          <div className="flex gap-1 relative">
            <button onClick={handleDownload} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-1.5 sm:py-2.5 rounded-md sm:rounded-lg flex items-center justify-center gap-1 transition-all shadow-sm uppercase tracking-wider text-[10px] sm:text-xs cursor-pointer">
              <Download size={12} className="sm:w-3.5 sm:h-3.5" /> FULL HD
            </button>
            <button onClick={handleShareClick} className="p-1.5 sm:p-2.5 theme-input rounded-md sm:rounded-lg hover:text-red-500 transition-colors cursor-pointer relative" title="Share">
              <Share2 size={12} className="sm:w-3.5 sm:h-3.5" />
            </button>

            {/* SHARE POPUP MENU */}
            {showShareMenu && (
              <div 
                className="absolute bottom-12 right-0 z-50 glass-card p-2 rounded-xl border border-[var(--glass-border)] shadow-2xl flex flex-col gap-1.5 min-w-[150px] animate-in zoom-in-95 bg-black/95 backdrop-blur-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={handleCopyLink} 
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-[var(--text-main)] hover:bg-red-600 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />} 
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>

                <button 
                  onClick={(e) => handleSocialShare('whatsapp', e)} 
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-[var(--text-main)] hover:bg-green-600 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                >
                  🟢 WhatsApp
                </button>

                <button 
                  onClick={(e) => handleSocialShare('telegram', e)} 
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-[var(--text-main)] hover:bg-blue-500 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Send size={14} /> Telegram
                </button>

                {navigator.share && (
                  <button 
                    onClick={(e) => handleSocialShare('native', e)} 
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-[var(--text-main)] hover:bg-red-600 hover:text-white transition-colors flex items-center gap-2 cursor-pointer border-t border-[var(--glass-border)] mt-0.5 pt-2"
                  >
                    📤 More Apps
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}