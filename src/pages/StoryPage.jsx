import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Factory, Heart, ArrowRight, ShoppingBag } from 'lucide-react';

export default function StoryPage({ onShopClick }) {
  const sizeChart = [
    { size: 'S', chest: '42"', length: '28"', sleeve: '9.0"', fit: 'Oversized' },
    { size: 'M', chest: '44"', length: '29"', sleeve: '9.5"', fit: 'Boxy Heavy' },
    { size: 'L', chest: '46"', length: '30"', sleeve: '10.0"', fit: 'Streetwear Standard' },
    { size: 'XL', chest: '48"', length: '31"', sleeve: '10.5"', fit: 'Ultra Drop Shoulder' },
    { size: 'XXL', chest: '50"', length: '32"', sleeve: '11.0"', fit: 'Maximum Drape' },
  ];

  return (
    <div className="min-h-screen py-10 md:py-16">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8">
        
        {/* Brand Manifesto Hero */}
        <div className="mb-14 p-8 md:p-14 bg-card border border-line">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-lime/20 border border-lime text-ink text-[10px] font-black tracking-widest uppercase mb-4">
            <Sparkles className="w-3 h-3 text-ink" />
            BRAND MANIFESTO · EST. 2026
          </span>
          <h1 className="text-4xl md:text-8xl font-black tracking-tighter uppercase text-ink leading-[0.9] mb-6">
            WEAR YOUR<br />OWN LANE<span className="text-lime">.</span>
          </h1>
          <p className="text-base md:text-xl text-muted font-bold max-w-3xl leading-relaxed">
            LOOSR was born out of frustration with thin, flimsy fast-fashion tees that shrink after two washes and lose their silhouette. We build clothing with weight, substance, and unapologetic presence.
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          
          <div className="p-8 bg-card border border-line flex flex-col justify-between gap-4">
            <div>
              <div className="w-10 h-10 rounded-full bg-lime text-neutral-950 flex items-center justify-center font-black mb-4">
                01
              </div>
              <h2 className="text-xl font-black tracking-tight uppercase text-ink mb-2">
                240–280 GSM FABRICS
              </h2>
              <p className="text-xs text-muted leading-relaxed font-medium">
                We only use ultra-dense ring-spun combed cotton. The fabric maintains a rigid boxy drape on the body, resisting cling and creases.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-lime-dark uppercase">
              // NO CHEAP BLENDS
            </span>
          </div>

          <div className="p-8 bg-card border border-line flex flex-col justify-between gap-4">
            <div>
              <div className="w-10 h-10 rounded-full bg-lime text-neutral-950 flex items-center justify-center font-black mb-4">
                02
              </div>
              <h2 className="text-xl font-black tracking-tight uppercase text-ink mb-2">
                1.25" HIGH-TENSILE COLLARS
              </h2>
              <p className="text-xs text-muted leading-relaxed font-medium">
                Our crewneck collars are reinforced with 1x1 heavy ribbed knit and twin-needle binding so they never bacon or stretch out over time.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-lime-dark uppercase">
              // ZERO COLLAR SAG
            </span>
          </div>

          <div className="p-8 bg-card border border-line flex flex-col justify-between gap-4">
            <div>
              <div className="w-10 h-10 rounded-full bg-lime text-neutral-950 flex items-center justify-center font-black mb-4">
                03
              </div>
              <h2 className="text-xl font-black tracking-tight uppercase text-ink mb-2">
                CRAFTED IN INDIA
              </h2>
              <p className="text-xs text-muted leading-relaxed font-medium">
                Patterned, cut, dyed, and printed in local craft textile clusters with fair wage standards and small batch artisan runs.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-lime-dark uppercase">
              // INDEPENDENT RUNS
            </span>
          </div>

        </div>

        {/* Size & Fit Engineering Table */}
        <div className="p-8 md:p-12 bg-card border border-line mb-16">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-black text-muted tracking-widest uppercase">
                TAILORING SPECIFICATION
              </span>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase text-ink">
                BOXY STREETWEAR SIZE GUIDE
              </h2>
            </div>
            <span className="text-xs font-bold text-muted bg-paper px-3 py-1.5 border border-line">
              MEASURED FLAT IN INCHES
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-ink text-muted font-mono font-bold uppercase text-[11px]">
                  <th className="py-3 px-4">SIZE</th>
                  <th className="py-3 px-4">CHEST</th>
                  <th className="py-3 px-4">BODY LENGTH</th>
                  <th className="py-3 px-4">SLEEVE DROP</th>
                  <th className="py-3 px-4">SILHOUETTE INTENT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line font-medium">
                {sizeChart.map((row) => (
                  <tr key={row.size} className="hover:bg-paper transition-colors">
                    <td className="py-3.5 px-4 font-black font-mono text-ink text-sm">{row.size}</td>
                    <td className="py-3.5 px-4 font-bold text-ink">{row.chest}</td>
                    <td className="py-3.5 px-4 text-muted">{row.length}</td>
                    <td className="py-3.5 px-4 text-muted">{row.sleeve}</td>
                    <td className="py-3.5 px-4 font-bold text-lime-dark">{row.fit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Call to Action Banner */}
        <div className="p-8 md:p-12 bg-ink text-paper border border-ink flex flex-col md:flex-row items-center justify-between gap-6 shadow-[4px_4px_0px_#d7ff36]">
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase text-paper mb-2">
              READY TO FEEL THE WEIGHT?
            </h2>
            <p className="text-xs text-muted max-w-md font-medium">
              Explore the current drop. Limited production run of 150 pieces per colorway.
            </p>
          </div>

          <button
            onClick={onShopClick}
            className="px-8 py-4 bg-lime text-neutral-950 font-black text-xs tracking-wider uppercase border border-ink hover:bg-white transition-all duration-200 shadow-[3px_3px_0px_#ffffff] flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>SHOP THE COLLECTION ↗</span>
          </button>
        </div>

      </div>
    </div>
  );
}
