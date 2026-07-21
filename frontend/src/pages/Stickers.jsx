// frontend/src/pages/Stickers.jsx

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Stickers() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 py-20">
      <div className="text-center max-w-lg glass-card p-12 rounded-3xl border-2 border-red-500/30 relative overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.15)] animate-in zoom-in duration-500">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-800 via-red-500 to-red-800"></div>
        <Sparkles size={64} className="text-red-500 mx-auto mb-6 animate-pulse drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
        <h2 className="text-4xl font-black brand-font mb-4 text-[var(--text-main)]">DIGITAL <span className="text-red-500">STICKERS</span></h2>
        <p className="text-lg text-[var(--text-muted)] font-bold mb-8">
          The ultimate premium sticker store is currently under development. The complete architecture is ready for future deployment.
        </p>
        <span className="bg-red-600 text-white font-black px-8 py-3 rounded-full tracking-widest uppercase text-sm shadow-[0_0_20px_rgba(220,38,38,0.5)]">
          Coming Soon
        </span>
      </div>
    </div>
  );
}
