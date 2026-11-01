import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

export default function Footer({ onShopClick, onNavigateAdmin }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 3000);
  };

  return (
    <>
      {/* Editorial Story Banner */}
      <section id="story" className="bg-ink text-white py-16 md:py-24 border-b border-white/10">
        <div className="max-w-[1240px] mx-auto px-4 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="text-[11px] font-black tracking-widest text-lime uppercase mb-2">
              LESS NOISE. MORE YOU.
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white leading-none">
              NOT MADE TO FIT IN<span className="text-lime">.</span>
            </h2>
            <p className="text-sm text-neutral-400 max-w-lg mt-3 font-medium">
              LOOSR is an independent streetwear studio based in India. We build heavyweight silhouettes with zero corporate compromise.
            </p>
          </div>

          <button
            onClick={onShopClick}
            className="self-start md:self-center px-8 py-4 bg-lime text-ink text-xs font-black tracking-wider uppercase border border-ink hover:bg-white transition-all duration-200 shadow-[4px_4px_0px_#ffffff] active:translate-x-0.5 active:translate-y-0.5"
          >
            FIND YOUR FIT ↗
          </button>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="bg-paper text-ink pt-16 pb-12 border-t border-line">
        <div className="max-w-[1240px] mx-auto px-4 md:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16 border-b border-line">
            
            {/* Left Brand Col */}
            <div className="md:col-span-5">
              <span className="font-black text-4xl sm:text-5xl tracking-tighter text-ink block">
                LOOSR<span className="text-lime">.</span>
              </span>
              <p className="text-xs text-muted max-w-xs mt-3 leading-relaxed font-medium">
                Independent streetwear for those creating their own path. Heavy cuts, 240+ GSM garments, crafted in India.
              </p>
            </div>

            {/* Middle Links Col */}
            <div className="md:col-span-3 grid grid-cols-2 gap-4 text-xs font-black tracking-wider uppercase">
              <div className="space-y-3 flex flex-col">
                <span className="text-muted text-[10px]">COLLECTION</span>
                <button onClick={onShopClick} className="text-left hover:text-lime-dark transition-colors">T-Shirts</button>
                <button onClick={onShopClick} className="text-left hover:text-lime-dark transition-colors">Hoodies</button>
                <button onClick={onShopClick} className="text-left hover:text-lime-dark transition-colors">Denim</button>
              </div>

              <div className="space-y-3 flex flex-col">
                <span className="text-muted text-[10px]">COMPANY</span>
                <a href="#story" className="hover:text-lime-dark transition-colors">Manifesto</a>
                <a href="#shop" className="hover:text-lime-dark transition-colors">Stockists</a>
                {onNavigateAdmin && (
                  <button
                    onClick={onNavigateAdmin}
                    className="text-left hover:text-lime-dark transition-colors text-ink flex items-center gap-1 font-bold"
                  >
                    Admin Portal ↗
                  </button>
                )}
                <a href="#shop" className="hover:text-lime-dark transition-colors">Contact</a>
              </div>
            </div>

            {/* Right Newsletter Signup */}
            <div className="md:col-span-4">
              <span className="text-[10px] font-black text-muted tracking-widest uppercase block mb-2">
                JOIN THE DROP LIST
              </span>
              <p className="text-xs text-[#555] mb-4">
                Get first access to limited runs, pop-up events, and member-only pricing.
              </p>

              <form onSubmit={handleSubscribe} className="relative">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white text-xs p-3 pr-10 border border-line focus:outline-none focus:border-ink font-medium"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-ink text-white hover:bg-lime hover:text-ink transition-colors"
                  aria-label="Submit newsletter"
                >
                  {subscribed ? <Check className="w-3.5 h-3.5 text-lime" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </form>
              {subscribed && (
                <span className="text-[10px] font-bold text-emerald-700 mt-2 block">
                  ✓ You are on the drop list. Check your inbox soon.
                </span>
              )}
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-black tracking-widest text-muted uppercase gap-4">
            <span>© 2026 LOOSR STUDIO</span>
            <span>MADE FOR YOUR OWN LANE.</span>
            <div className="flex items-center gap-4">
              {onNavigateAdmin && (
                <button
                  onClick={onNavigateAdmin}
                  className="hover:text-ink transition-colors underline decoration-lime underline-offset-4 cursor-pointer font-mono"
                >
                  ADMIN / PRO CONSOLE ↗
                </button>
              )}
              <span>INDIA · INR ₹</span>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}
