// frontend/src/pages/Contact.jsx

import React from 'react';
import { Mail, Instagram, Facebook, MessageSquare, Send } from 'lucide-react';

export default function Contact() {
  
  // 🟢 YAHAN APNI ASLI LINKS DAAL SAKTA HAI 
  // Agar koi link nahi hai, toh use khali "" chhod dena, phir wo apne aap "Coming Soon" dikhayega.
  const socialLinks = {
    email: "tarunrawat7906@gmail.com", 
    instagram: "", // Jaise: "https://instagram.com/your_username"
    facebook: "",  // Jaise: "https://facebook.com/your_username"
    pinterest: "Yahan apni Pinterest ki link daal de", // Jaise: "https://pin.it/1Cwkrt098"
  };

  // Click handler: Agar link dali hogi toh khul jayegi, nahi toh alert aayega
  const handleSocialClick = (platform, url) => {
    if (url && url.startsWith('http')) {
      window.open(url, '_blank');
    } else {
      alert(`Our ${platform} page is coming soon! Please contact us via Email for now.`);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col px-4 md:px-8 py-12 max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 mb-2">
          <MessageSquare size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black brand-font tracking-tight text-[var(--text-main)]">
          CONTACT <span className="text-red-500">US</span>
        </h1>
        <p className="text-[var(--text-muted)] font-bold max-w-lg mx-auto">
          Have any questions, wallpaper requests, or facing any issues? Get in touch with us through our official handles below.
        </p>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Email / Gmail Card */}
        <a 
          href={`mailto:${socialLinks.email}?subject=Support%20/%20Inquiry%20-%20RAWAT%20SHOP`}
          className="glass-card p-6 rounded-2xl border border-[var(--glass-border)] flex items-center gap-5 hover:border-red-500 transition-all group cursor-pointer"
        >
          <div className="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all shadow-md">
            <Mail size={26} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text-main)] group-hover:text-red-500 transition-colors">Email Us (Gmail)</h3>
            <p className="text-sm text-[var(--text-muted)] font-medium">{socialLinks.email}</p>
          </div>
        </a>

        {/* Instagram Card */}
        <div 
          onClick={() => handleSocialClick('Instagram', socialLinks.instagram)}
          className="glass-card p-6 rounded-2xl border border-[var(--glass-border)] flex items-center gap-5 hover:border-pink-500 transition-all group cursor-pointer"
        >
          <div className="w-14 h-14 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:bg-pink-600 group-hover:text-white transition-all shadow-md">
            <Instagram size={26} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text-main)] group-hover:text-pink-500 transition-colors">Instagram</h3>
            <p className="text-sm text-[var(--text-muted)] font-medium">
              {socialLinks.instagram ? "Visit Profile" : "Coming Soon"}
            </p>
          </div>
        </div>

        {/* Facebook Card */}
        <div 
          onClick={() => handleSocialClick('Facebook', socialLinks.facebook)}
          className="glass-card p-6 rounded-2xl border border-[var(--glass-border)] flex items-center gap-5 hover:border-blue-500 transition-all group cursor-pointer"
        >
          <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-md">
            <Facebook size={26} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text-main)] group-hover:text-blue-500 transition-colors">Facebook</h3>
            <p className="text-sm text-[var(--text-muted)] font-medium">
              {socialLinks.facebook ? "Visit Profile" : "Coming Soon"}
            </p>
          </div>
        </div>

        {/* Pinterest Card */}
        <div 
          onClick={() => handleSocialClick('Pinterest', socialLinks.pinterest)}
          className="glass-card p-6 rounded-2xl border border-[var(--glass-border)] flex items-center gap-5 hover:border-red-600 transition-all group cursor-pointer"
        >
          <div className="w-14 h-14 rounded-xl bg-red-600/10 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all shadow-md">
            <Send size {26} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text-main)] group-hover:text-red-500 transition-colors">Pinterest</h3>
            <p className="text-sm text-[var(--text-muted)] font-medium">
              {socialLinks.pinterest && socialLinks.pinterest !== "Yahan apni Pinterest ki link daal de" ? "Visit Profile" : "Coming Soon"}
            </p>
          </div>
        </div>

      </div>

      <footer className="text-center text-gray-500 text-sm pt-6">
        © {new Date().getFullYear()} RAWAT SHOP. All rights reserved.
      </footer>
    </div>
  );
}