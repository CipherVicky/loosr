import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { lookbookItems } from '../data/products';
import { Sparkles, ArrowRight, MoveHorizontal } from 'lucide-react';

export default function Lookbook({ onShopCategory }) {
  const scrollContainerRef = useRef(null);

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 420, behavior: 'smooth' });
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -420, behavior: 'smooth' });
    }
  };

  return (
    <section id="lookbook" className="py-20 md:py-28 bg-[#0e0e0e] text-paper overflow-hidden border-b border-white/10">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black tracking-widest text-lime uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SEASONAL EDITORIAL · DROP 001</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white">
            THE LOOKBOOK<span className="text-lime">.</span>
          </h2>
          <p className="text-sm text-neutral-400 max-w-md mt-2 font-medium">
            Designed for movement and uncompromised attitude. Swipe or drag to explore the silhouettes.
          </p>
        </div>

        {/* Scroll Controls & Drag Hint */}
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-bold text-neutral-400 tracking-wider flex items-center gap-1.5 uppercase">
            <MoveHorizontal className="w-4 h-4 text-lime" />
            DRAG TO EXPLORE
          </span>
          <div className="flex gap-2">
            <button
              onClick={scrollLeft}
              className="w-10 h-10 border border-white/20 bg-white/5 hover:bg-lime hover:text-neutral-950 text-white flex items-center justify-center transition-colors"
              aria-label="Scroll left"
            >
              ←
            </button>
            <button
              onClick={scrollRight}
              className="w-10 h-10 border border-white/20 bg-white/5 hover:bg-lime hover:text-neutral-950 text-white flex items-center justify-center transition-colors"
              aria-label="Scroll right"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto px-4 md:px-8 pb-8 no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing max-w-[1440px] mx-auto"
      >
        {lookbookItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="flex-shrink-0 w-[320px] sm:w-[400px] border border-white/15 bg-[#171717] p-6 sm:p-8 flex flex-col justify-between relative group hover:border-lime/60 transition-colors duration-300"
          >
            {/* Top Tag & Number */}
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <span className="text-[10px] font-black tracking-widest text-lime uppercase bg-lime/10 px-2.5 py-1 border border-lime/30">
                {item.tag}
              </span>
              <span className="text-xs font-mono font-bold text-neutral-400">
                0{index + 1} / 04
              </span>
            </div>

            {/* Silhouette Display Artwork */}
            <div
              className="h-[220px] sm:h-[250px] my-6 flex items-center justify-center relative overflow-hidden border border-white/10"
              style={{ backgroundColor: item.bgColor }}
            >
              {/* Concentric rings watermark */}
              <div className="absolute w-[200px] h-[200px] rounded-full border border-white/10" />

              <div
                className="garment-clip hard-shadow w-[120px] h-[150px] flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                style={{
                  backgroundColor: item.garment,
                  color: item.ink,
                }}
              >
                <span className="font-black text-xl tracking-tighter -rotate-6">
                  {item.label}
                </span>
              </div>
            </div>

            {/* Typography & Editorial Manifesto */}
            <div>
              <div className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
                {item.subtitle}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase mt-1">
                {item.title}
              </h3>

              <p className="text-xs italic text-neutral-300 my-4 border-l-2 border-lime pl-3 leading-relaxed">
                {item.quote}
              </p>

              {/* Spec Badges */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {item.features.map((feat, fIdx) => (
                  <span
                    key={fIdx}
                    className="text-[9px] font-black tracking-wider bg-white/10 text-neutral-200 px-2 py-0.5"
                  >
                    {feat}
                  </span>
                ))}
              </div>

              {/* Jump to shop */}
              <button
                onClick={() => onShopCategory('All')}
                className="w-full py-3 bg-white/10 hover:bg-lime hover:text-neutral-950 text-white text-[11px] font-black tracking-widest uppercase border border-white/20 transition-all duration-200 flex items-center justify-center gap-2 group-hover:border-lime"
              >
                <span>EXPLORE PIECE</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
