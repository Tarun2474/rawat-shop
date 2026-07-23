// frontend/src/pages/PrivacyPolicy.jsx

import React from 'react';
import { ShieldCheck, Lock, Eye, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="w-full flex-1 flex flex-col px-4 md:px-8 py-12 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 mb-2">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black brand-font tracking-tight text-[var(--text-main)]">
          PRIVACY <span className="text-red-500">POLICY</span>
        </h1>
        <p className="text-[var(--text-muted)] font-bold max-w-xl mx-auto">
          Your privacy is important to us. Learn how we handle your interaction with RAWAT SHOP.
        </p>
      </div>

      {/* Main Content Card */}
      <div className="glass-card p-6 md:p-10 rounded-3xl border border-[var(--glass-border)] space-y-8 text-[var(--text-main)]">
        
        {/* Section 1 */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-red-500 font-black brand-font text-xl">
            <CheckCircle2 size={22} />
            <h2>1. No Personal Data Collection</h2>
          </div>
          <p className="text-[var(--text-muted)] font-medium leading-relaxed pl-8">
            At RAWAT SHOP, we respect your privacy completely. Since our website does not feature any login, sign-up, or account registration options, <strong className="text-[var(--text-main)]">we do not collect, store, or ask for any personal information</strong> such as your name, email address, password, or contact details. You can browse and download wallpapers completely anonymously.
          </p>
        </div>

        <hr className="border-[var(--glass-border)]" />

        {/* Section 2 */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-red-500 font-black brand-font text-xl">
            <Eye size={22} />
            <h2>2. What Data We Actually Track</h2>
          </div>
          <p className="text-[var(--text-muted)] font-medium leading-relaxed pl-8">
            To keep the platform running smoothly and to show which wallpapers are trending, we only track anonymous, platform-level interaction metrics. This includes:
          </p>
          <ul className="list-disc pl-14 space-y-2 text-[var(--text-muted)] font-medium">
            <li>Total view counts for wallpapers.</li>
            <li>Download counters to measure asset popularity.</li>
            <li>Like counts and user preference reactions.</li>
          </ul>
          <p className="text-[var(--text-muted)] font-medium leading-relaxed pl-8 pt-2">
            This data is purely statistical and cannot be linked back to you as an individual.
          </p>
        </div>

        <hr className="border-[var(--glass-border)]" />

        {/* Section 3 */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-red-500 font-black brand-font text-xl">
            <Lock size={22} />
            <h2>3. Data Security & Protection</h2>
          </div>
          <p className="text-[var(--text-muted)] font-medium leading-relaxed pl-8">
            We ensure that your browsing experience is fully secure. Because we do not collect sensitive user records, there is zero risk of your personal data being leaked or misused. Your interaction with our website is safe, clean, and protected at all times.
          </p>
        </div>

        <hr className="border-[var(--glass-border)]" />

        {/* Section 4 */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-red-500 font-black brand-font text-xl">
            <ShieldCheck size={22} />
            <h2>4. Changes to This Policy</h2>
          </div>
          <p className="text-[var(--text-muted)] font-medium leading-relaxed pl-8">
            We may update this Privacy Policy from time to time to reflect improvements on our platform. Any updates will be posted directly on this page with an updated revision date.
          </p>
        </div>

      </div>

      <footer className="text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} RAWAT SHOP. All rights reserved.
      </footer>
    </div>
  );
}