import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShoppingBag, ArrowRight, Eye, Camera, Heart } from 'lucide-react';
import { initialProducts, rupee } from '../data/products';

export default function LookbookPage({ onAddToCart, onOpenCart, onOpenQuickView }) {
  const looks = [
    {
      id: 'look-1',
      title: 'DROP 001 // STREET SILHOUETTE',
      season: 'SPRING / SUMMER 2026',
      modelText: 'Shot on 35mm in Berlin. Boxy oversized cut layered with vintage denim.',
      image: '/images/products/Brown Keep God First T-Shirt Mockup.png',
      productId: 101,
      color: 'Mocha Espresso',
      description: 'Heavy 280 GSM luxury combed cotton with dropped shoulders.',
      specs: ['280 GSM Cotton', 'Oversized Cut', 'High Elastic Print'],
    },
    {
      id: 'look-2',
      title: 'MONOCHROME INK HOODIE // DROP 002',
      season: 'AUTUMN CORE 2026',
      modelText: 'Heavy fleece architecture paired with wide cargo bottoms.',
      image: '/images/products/hoodie-black.png',
      productId: 2,
      color: 'Matte Black',
      description: 'Double-layered fleece hood with rib-knit cuffs and hem.',
      specs: ['450 GSM French Terry', 'Structured Hood', 'Double Stitched'],
    },
    {
      id: 'look-3',
      title: 'ACID ACID LIME TEE // CAPSULE 003',
      season: 'SUMMER ELECTRIC 2026',
      modelText: 'Neon vibrancy engineered with raw industrial brutalist cut.',
      image: '/images/products/tee-lime.png',
      productId: 4,
      color: 'Acid Lime',
      description: 'High-visibility pigment dye with screenprinted typography.',
      specs: ['Pre-shrunk Fabric', 'Brutalist Cut', 'Fade Resistant'],
    },
  ];

  const handleShopLook = (look) => {
    const product = initialProducts.find((p) => p.id === look.productId) || initialProducts[0];
    if (onOpenQuickView) {
      onOpenQuickView(product);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink pb-24">
      {/* Editorial Header Banner */}
      <section className="border-b border-line bg-paper/60 backdrop-blur-sm pt-8 pb-10 px-4 md:px-8">
        <div className="max-w-[1240px] mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-lime/20 border border-lime text-neutral-950 text-[10px] font-black tracking-widest uppercase mb-4">
            <Camera className="w-3 h-3 text-lime-dark" />
            VISUAL EDITORIAL ARCHIVE
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
            EDITORIAL LOOKBOOK
          </h1>
          <p className="text-xs md:text-sm font-medium text-muted mt-3 max-w-xl">
            A visual chronicle documenting the architectural drape and lived-in proportions of
            LOOSR Drop 001. Layered, raw, and unapologetically boxy.
          </p>
        </div>
      </section>

      {/* Lookbook Gallery Stream */}
      <section className="max-w-[1240px] mx-auto px-4 md:px-8 mt-12 space-y-16">
        {looks.map((look, index) => {
          const product = initialProducts.find((p) => p.id === look.productId) || initialProducts[0];

          return (
            <div
              key={look.id}
              className={`border border-ink bg-card p-6 md:p-10 shadow-[8px_8px_0px_#111111] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                index % 2 === 1 ? 'lg:grid-flow-dense' : ''
              }`}
            >
              {/* Image Preview Box */}
              <div
                className={`lg:col-span-6 bg-paper border border-ink overflow-hidden relative flex items-center justify-center p-8 group min-h-[380px] ${
                  index % 2 === 1 ? 'lg:col-start-7' : ''
                }`}
              >
                {/* Watermark brand tag */}
                <span className="absolute top-4 left-4 text-[10px] font-black tracking-widest text-muted uppercase">
                  LOOK // 0{index + 1}
                </span>

                <img
                  src={look.image}
                  alt={look.title}
                  className="max-h-[340px] w-auto object-contain transition-transform duration-500 group-hover:scale-105 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
                />

                <span className="absolute bottom-4 right-4 text-[9px] font-mono font-bold bg-white/90 border border-line px-2 py-1 text-ink uppercase">
                  35MM ARCHIVE
                </span>
              </div>

              {/* Look Info & Direct Shop CTA */}
              <div className={`lg:col-span-6 flex flex-col justify-between ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black bg-lime text-neutral-950 px-2 py-0.5 uppercase tracking-wider border border-ink">
                      {look.season}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-muted uppercase">
                      COLOR: {look.color}
                    </span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-2">
                    {look.title}
                  </h2>

                  <p className="text-xs md:text-sm text-muted font-medium mt-3 leading-relaxed">
                    {look.modelText}
                  </p>

                  <div className="mt-4 pt-4 border-t border-line flex flex-wrap gap-2">
                    {look.specs.map((sp) => (
                      <span
                        key={sp}
                        className="text-[10px] font-black bg-card border border-line px-2.5 py-1 text-ink uppercase"
                      >
                        {sp}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex items-baseline gap-3">
                    <span className="text-2xl font-black text-ink">{rupee(product.price)}</span>
                    <span className="text-xs text-muted font-bold">INCLUSIVE OF ALL TAXES</span>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="mt-8 flex flex-wrap items-center gap-3 pt-6 border-t border-line">
                  <button
                    onClick={() => handleShopLook(look)}
                    className="px-6 py-3.5 bg-lime text-neutral-950 font-black text-xs tracking-wider uppercase border border-ink hover:bg-ink hover:text-lime transition-all duration-200 shadow-[3px_3px_0px_#111111] flex items-center gap-2 active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>SELECT SIZE & SHOP LOOK</span>
                  </button>

                  <button
                    onClick={() => onOpenQuickView(product)}
                    className="px-4 py-3.5 bg-card text-ink font-black text-xs tracking-wider uppercase border border-line hover:border-ink transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4 text-muted" />
                    <span>QUICK VIEW</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
