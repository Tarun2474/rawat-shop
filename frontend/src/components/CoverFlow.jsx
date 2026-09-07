import React, { useState, useEffect, useRef } from 'react';
import './CoverFlow.css';
import axios from 'axios';

export default function CoverFlow({ wallpapers = [], onSelectWallpaper }) {
  const [position, setPosition] = useState(0);
  const containerRef = useRef(null);

  // Fallback if no wallpapers passed from parent
  const displayWallpapers = wallpapers.length > 0 ? wallpapers : [
    { _id: '1', wallpaperId: 'WLP001', url: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=90' },
    { _id: '2', wallpaperId: 'WLP002', url: 'https://images.unsplash.com/photo-1534791547706-68c6c8c6f1c7?auto=format&fit=crop&w=900&q=90' },
    { _id: '3', wallpaperId: 'WLP003', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=90' },
  ];

  const totalCards = displayWallpapers.length;

  const nextCard = () => {
    setPosition((prev) => prev + 1);
  };

  const prevCard = () => {
    setPosition((prev) => prev - 1);
  };

  const handleCardClick = (wp, relative, abs) => {
    if (abs < 0.001) {
      // Agar user ne active (center) card par click kiya, toh preview modal khulega aur view count trigger hoga
      if (onSelectWallpaper) {
        onSelectWallpaper(wp);
      }
    } else {
      // Agar side wale card par click kiya, toh usko center mein le aao
      setPosition(position + relative);
    }
  };

  return (
    <div className="coverflow-container">
      <button className="coverflow-btn prev-btn" onClick={prevCard} aria-label="Previous">‹</button>
      
      <div className="coverflow" ref={containerRef}>
        <div className="cards">
          {displayWallpapers.map((wp, index) => {
            let relative = index - position;
            if (relative > totalCards / 2) relative -= totalCards;
            if (relative < -totalCards / 2) relative += totalCards;

            const abs = Math.abs(relative);
            let x = 0, scale = 1, rotate = 0, opacity = 1, zIndex = 50;

            if (abs < 0.001) {
              x = 0; scale = 1; rotate = 0; opacity = 1; zIndex = 100;
            } else if (abs <= 1) {
              const t = abs;
              x = Math.sign(relative) * (window.innerWidth <= 700 ? 70 : 90) * t;
              scale = 1 - (0.10 * t);
              rotate = Math.sign(relative) * (8 * t);
              opacity = 1 - (0.13 * t);
              zIndex = 90;
            } else if (abs <= 2) {
              const t = abs - 1;
              x = Math.sign(relative) * ((window.innerWidth <= 700 ? 70 : 90) + 50 * t);
              scale = 0.90 - (0.10 * t);
              rotate = Math.sign(relative) * (8 + 4 * t);
              opacity = 0.87 - (0.27 * t);
              zIndex = 70;
            } else {
              x = Math.sign(relative) * 180;
              scale = 0.70;
              opacity = 0;
              zIndex = 1;
            }

            const y = abs < 1 ? 0 : Math.min(abs, 3) * 2;

            return (
              <div 
                key={wp._id || wp.wallpaperId} 
                className="card cursor-pointer"
                onClick={() => handleCardClick(wp, relative, abs)}
                style={{
                  zIndex,
                  opacity,
                  filter: `brightness(${1 - Math.min(abs, 3) * 0.16})`,
                  transform: `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0) scale(${scale}) rotateY(${rotate}deg)`
                }}
              >
                <img src={wp.url || wp.img} alt={wp.name || wp.wallpaperId} draggable="false" />
                <div className="card-label">{wp.wallpaperId}</div>
              </div>
            );
          })}
        </div>
      </div>

      <button className="coverflow-btn next-btn" onClick={nextCard} aria-label="Next">›</button>
    </div>
  );
}