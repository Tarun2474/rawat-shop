// frontend/src/components/WallpaperCard.jsx

import React, { useState } from 'react';
import { Eye, Download, Heart, Star, Share2, Copy, Check, X, Send, MessageCircle } from 'lucide-react';
import axios from 'axios';

export default function WallpaperCard({ wallpaper, onUpdateStats, onPreview }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
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

  const handleShareClick = (e) => {
    e.stopPropagation();
    setShowShareModal(true);
  };

  const shareUrl = window.location.href;
  const shareText = `Check out this amazing wallpaper: ${wallpaper.name} on RAWAT SHOP!`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
  };

  const shareToTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const shareToPinterest = () => {
    window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(wallpaper.url)}&description=${encodeURIComponent(shareText)}`, '_blank');
  };

  const shareToInstagram = () => {
    // Instagram doesn't support direct web image/text sharing via URL intent, so we copy link and prompt user
    navigator.clipboard.writeText(shareUrl);
    alert("Link copied! You can now paste it in your Instagram story or post.");
  };

  const handleMoreApps = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: wallpaper.name,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <>
      <div 
        className="card-container cursor-pointer" 
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)} 
        onMouseLeave={() => setIsHovered(false)}
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
            
            <div className="flex gap-1">
              <button onClick={handleDownload} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-1.5 sm:py-2.5 rounded-md sm:rounded-lg flex items-center justify-center gap-1 transition-all shadow-sm uppercase tracking-wider text-[10px] sm:text-xs cursor-pointer">
                <Download size={12} className="sm:w-3.5 sm:h-3.5" /> FULL HD
              </button>
              <button onClick={handleShareClick} className="p-1.5 sm:p-2.5 theme-input rounded-md sm:rounded-lg hover:text-red-500 transition-colors cursor-pointer" title="Share">
                <Share2 size={12} className="sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* SHARE MODAL POPUP */}
      {showShareModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowShareModal(false)}
        >
          <div 
            className="glass-card w-full max-w-sm rounded-2xl p-6 border border-[var(--glass-border)] shadow-2xl relative animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-black brand-font text-[var(--text-main)] uppercase tracking-wider">Share Wallpaper</h3>
              <button 
                onClick={() => setShowShareModal(false)} 
                className="text-[var(--text-muted)] hover:text-red-500 transition-colors cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            {/* Share Options Grid */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              
              {/* WhatsApp */}
              <button 
                onClick={shareToWhatsApp}
                className="flex flex-col items-center gap-2 p-3 rounded-xl theme-input hover:bg-green-600/20 hover:border-green-500 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <MessageCircle size={24} />
                </div>
                <span className="text-xs font-bold text-[var(--text-main)]">WhatsApp</span>
              </button>

              {/* Telegram */}
              <button 
                onClick={shareToTelegram}
                className="flex flex-col items-center gap-2 p-3 rounded-xl theme-input hover:bg-sky-600/20 hover:border-sky-500 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Send size={22} />
                </div>
                <span className="text-xs font-bold text-[var(--text-main)]">Telegram</span>
              </button>

              {/* Pinterest */}
              <button 
                onClick={shareToPinterest}
                className="flex flex-col items-center gap-2 p-3 rounded-xl theme-input hover:bg-red-600/20 hover:border-red-500 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform font-black text-lg">
                  P
                </div>
                <span className="text-xs font-bold text-[var(--text-main)]">Pinterest</span>
              </button>

              {/* Instagram */}
              <button 
                onClick={shareToInstagram}
                className="flex flex-col items-center gap-2 p-3 rounded-xl theme-input hover:bg-pink-600/20 hover:border-pink-500 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform font-bold text-sm">
                  IG
                </div>
                <span className="text-xs font-bold text-[var(--text-main)]">Instagram</span>
              </button>

              {/* Copy Link */}
              <button 
                onClick={copyToClipboard}
                className="flex flex-col items-center gap-2 p-3 rounded-xl theme-input hover:bg-neutral-600/20 hover:border-neutral-500 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-neutral-700 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  {copied ? <Check size={22} className="text-green-400" /> : <Copy size={22} />}
                </div>
                <span className="text-xs font-bold text-[var(--text-main)]">{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>

              {/* More Apps (Native Share) */}
              <button 
                onClick={handleMoreApps}
                className="flex flex-col items-center gap-2 p-3 rounded-xl theme-input hover:bg-red-600/20 hover:border-red-500 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Share2 size={22} />
                </div>
                <span className="text-xs font-bold text-[var(--text-main)]">More Apps</span>
              </button>

            </div>

            {/* Quick URL Copy Bar */}
            <div className="flex items-center gap-2 p-2 rounded-xl theme-input border border-[var(--glass-border)]">
              <input 
                type="text" 
                readOnly 
                value={shareUrl} 
                className="bg-transparent text-xs text-[var(--text-muted)] w-full px-2 outline-none font-medium truncate"
              />
              <button 
                onClick={copyToClipboard}
                className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}