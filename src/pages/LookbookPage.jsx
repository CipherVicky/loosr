import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Quote, ShoppingBag, Check } from 'lucide-react';
import { lookbookItems, initialProducts } from '../data/products';

export default function LookbookPage({ onAddToCart, onOpenQuickView, onShopCategory }) {
  // Map looks to corresponding catalog items
  const lookProductMap = {
    'look-1': 1,   // Oversized Graphic Tee
    'look-2': 6,   // Utility Zip Jacket
    'look-3': 5,   // Everyday Hoodie
    'look-4': 4,   // Relaxed Fit Denim
  };

  const handleShopLook = (lookId) => {
    const prodId = lookProductMap[lookId] || 101;
    const prod = initialProducts.find((p) => p.id === prodId) || initialProducts[0];
    onAddToCart(prod);
  };

  return (
    <div className="min-h-screen py-10 md:py-16">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8">
        
        {/* Lookbook Editorial Header */}
        <div className="mb-12 p-8 md:p-12 bg-card border border-line">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-lime/20 border border-lime text-ink text-[10px] font-black tracking-widest uppercase mb-4">
            <Sparkles className="w-3 h-3 text-ink" />
            SEASON 01 · EDITORIAL LOOKBOOK
          </span>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase text-ink leading-none mb-4">
            MUMBAI TO BENGALURU<span className="text-lime">.</span>
          </h1>
          <p className="text-xs md:text-sm text-muted font-medium max-w-2xl leading-relaxed">
            Raw, unfiltered streetwear silhouettes crafted for the subcontinental climate and concrete streets. No corporate boards. No fast-fashion polyester. Only pure, heavyweight cotton.
          </p>
        </div>

        {/* Lookbook Grid */}
        <div className="space-y-12">
          {lookbookItems.map((look, index) => {
            const isEven = index % 2 === 0;
            const targetProd = initialProducts.find((p) => p.id === (lookProductMap[look.id] || 101));

            return (
              <div
                key={look.id}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 md:p-10 bg-card border border-line ${
                  isEven ? '' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Visual Garment Presentation */}
                <div className={`lg:col-span-6 flex items-center justify-center p-8 bg-paper border border-line relative overflow-hidden ${
                  isEven ? 'lg:order-1' : 'lg:order-2'
                }`}>
                  {/* Watermark brand element */}
                  <div className="absolute top-4 left-4 text-[10px] font-mono font-black text-muted tracking-widest uppercase">
                    {look.subtitle}
                  </div>

                  <div className="garment-clip hard-shadow w-[220px] h-[270px] sm:w-[260px] sm:h-[310px] flex items-center justify-center relative my-4"
                    style={{ backgroundColor: look.garment }}
                  >
                    <div
                      className="text-4xl sm:text-5xl font-black tracking-tighter select-none"
                      style={{ color: look.ink }}
                    >
                      {look.label}
                    </div>
                  </div>

                  <div className="absolute bottom-4 right-4 text-[10px] font-mono font-bold text-muted uppercase">
                    {look.tag}
                  </div>
                </div>

                {/* Editorial Copy & Direct Checkout Button */}
                <div className={`lg:col-span-6 flex flex-col justify-center gap-5 ${
                  isEven ? 'lg:order-2' : 'lg:order-1'
                }`}>
                  <div>
                    <span className="text-[10px] font-mono font-black tracking-widest text-lime-dark uppercase block mb-1">
                      LOOK 0{index + 1}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-ink">
                      {look.title}
                    </h2>
                  </div>

                  {/* Editorial Quote */}
                  <blockquote className="text-sm md:text-base font-bold italic text-ink border-l-2 border-lime pl-4 my-1">
                    {look.quote}
                  </blockquote>

                  {/* Feature Checklist */}
                  <div className="flex flex-wrap gap-2">
                    {look.features.map((feat, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-paper border border-line text-[11px] font-bold text-muted uppercase"
                      >
                        ✓ {feat}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-3">
                    <button
                      onClick={() => handleShopLook(look.id)}
                      className="px-6 py-3 bg-lime text-neutral-950 font-black text-xs tracking-wider uppercase border border-ink hover:bg-ink hover:text-lime transition-all duration-200 shadow-[3px_3px_0px_#111111] flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>SHOP THIS FIT ({targetProd ? targetProd.name.split(' ')[0] : 'ITEM'})</span>
                    </button>

                    {targetProd && (
                      <button
                        onClick={() => onOpenQuickView(targetProd)}
                        className="px-4 py-3 bg-paper text-ink font-bold text-xs tracking-wider uppercase border border-line hover:border-ink transition-colors"
                      >
                        VIEW SPECS
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
