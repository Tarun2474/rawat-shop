// frontend/src/components/WallpaperCard.jsx

import React, { useState } from 'react';
import { Eye, Download, Heart, Star, Share2, Check, X, Copy } from 'lucide-react';
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

      {/* SHARE MODAL POPUP WITH REAL BRAND ICONS */}
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

            {/* Share Options Grid with Real Official Brand Icons */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              
              {/* WhatsApp */}
              <button 
                onClick={shareToWhatsApp}
                className="flex flex-col items-center gap-2 p-3 rounded-xl theme-input hover:bg-green-600/20 hover:border-green-500 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </div>
                <span className="text-xs font-bold text-[var(--text-main)]">WhatsApp</span>
              </button>

              {/* Telegram */}
              <button 
                onClick={shareToTelegram}
                className="flex flex-col items-center gap-2 p-3 rounded-xl theme-input hover:bg-sky-600/20 hover:border-sky-500 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[#24A1DE] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.26.26-.534.26l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.195 1.006.131.832 1.941z"/>
                  </svg>
                </div>
                <span className="text-xs font-bold text-[var(--text-main)]">Telegram</span>
              </button>

              {/* Pinterest */}
              <button 
                onClick={shareToPinterest}
                className="flex flex-col items-center gap-2 p-3 rounded-xl theme-input hover:bg-red-600/20 hover:border-red-500 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[#E60023] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.331 1.363-.053.225-.172.273-.396.164-1.477-.688-2.403-2.85-2.403-4.586 0-3.734 2.713-7.162 7.828-7.162 4.111 0 7.308 2.931 7.308 6.852 0 4.089-2.585 7.38-6.172 7.38-1.205 0-2.338-.626-2.729-1.36l-.744 2.835c-.27 1.032-1.002 2.326-1.493 3.116 1.125.347 2.319.535 3.555.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                  </svg>
                </div>
                <span className="text-xs font-bold text-[var(--text-main)]">Pinterest</span>
              </button>

              {/* Instagram */}
              <button 
                onClick={shareToInstagram}
                className="flex flex-col items-center gap-2 p-3 rounded-xl theme-input hover:bg-pink-600/20 hover:border-pink-500 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
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