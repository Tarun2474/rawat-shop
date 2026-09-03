import React, { useState, useEffect, useRef } from 'react';
import './CoverFlow.css'; // Hum iska CSS alag rakh lenge taaki Tailwind/Custom styles conflict na karein

export default function CoverFlow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Tera existing 6 wallpapers ka data (WLP001 to WLP006)
  const wallpapers = [
    { id: 'WLP001', img: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=90' },
    { id: 'WLP002', img: 'https://images.unsplash.com/photo-1534791547706-68c6c8c6f1c7?auto=format&fit=crop&w=900&q=90' },
    { id: 'WLP003', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=90' },
    { id: 'WLP004', img: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=900&q=90' },
    { id: 'WLP005', img: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=90' },
    { id: 'WLP006', img: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&q=90' },
  ];

  const totalCards = wallpapers.length;
  const [position, setPosition] = useState(0);
  const containerRef = useRef(null);

  const nextCard = () => {
    setPosition((prev) => prev + 1);
  };

  const prevCard = () => {
    setPosition((prev) => prev - 1);
  };

  return (
    <div className="coverflow-container">
      <button className="coverflow-btn prev-btn" onClick={prevCard} aria-label="Previous">‹</button>
      
      <div className="coverflow" ref={containerRef}>
        <div className="cards">
          {wallpapers.map((wp, index) => {
            let relative = index - position;
            if (relative > totalCards / 2) relative -= totalCards;
            if (relative < -totalCards / 2) relative += totalCards;

            const abs = Math.abs(relative);
            let x = 0, scale = 1, rotate = 0, opacity = 1, zIndex = 50, blur = 0;

            if (abs < 0.001) {
              x = 0; scale = 1; rotate = 0; opacity = 1; zIndex = 100; blur = 0;
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
                key={wp.id} 
                className="card"
                onClick={() => setPosition(position + relative)}
                style={{
                  zIndex,
                  opacity,
                  filter: `brightness(${1 - Math.min(abs, 3) * 0.16})`,
                  transform: `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0) scale(${scale}) rotateY(${rotate}deg)`
                }}
              >
                <img src={wp.img} alt={wp.id} draggable="false" />
                <div className="card-label">{wp.id}</div>
              </div>
            );
          })}
        </div>
      </div>

      <button className="coverflow-btn next-btn" onClick={nextCard} aria-label="Next">›</button>
    </div>
  );
}