import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Box,
  Play,
  Pause,
  RotateCcw,
  ShoppingBag,
  Check,
  ShieldCheck,
  Sliders,
  Maximize2,
} from 'lucide-react';
import TshirtCanvas from '../components/TshirtCanvas';
import { initialProducts, rupee } from '../data/products';

export default function Inspect360Page({ onAddToCart, onOpenCart }) {
  const kgfProduct = initialProducts.find((p) => p.id === 101) || initialProducts[0];

  const [selectedColorway, setSelectedColorway] = useState('original');
  const [colorTint, setColorTint] = useState(null);
  const [activeSize, setActiveSize] = useState('L');
  const [isAutoSpin, setIsAutoSpin] = useState(true);
  const [spinSpeed, setSpinSpeed] = useState(0.015);
  const [added, setAdded] = useState(false);

  const colorways = [
    { id: 'original', name: 'Mocha Espresso', tint: null, preview: '#3a281c', ink: '#f3d084' },
    { id: 'matte-ink', name: 'Matte Ink', tint: '#151515', preview: '#151515', ink: '#d7ff36' },
    { id: 'raw-natural', name: 'Raw Natural', tint: '#e7e4dc', preview: '#e7e4dc', ink: '#171717' },
  ];

  const handleColorwayChange = (cw) => {
    setSelectedColorway(cw.id);
    setColorTint(cw.tint);
  };

  const handleBuy = () => {
    const chosenCw = colorways.find((c) => c.id === selectedColorway);
    onAddToCart({
      ...kgfProduct,
      chosenSize: activeSize,
      chosenColor: chosenCw ? chosenCw.name : 'Mocha Espresso',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen py-10 md:py-16">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8">
        
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-line">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-lime/20 border border-lime text-ink text-[10px] font-black tracking-widest uppercase mb-3">
              <Box className="w-3 h-3 text-ink" />
              INTERACTIVE 3D PRODUCT LAB · GLB PBR
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-ink leading-none">
              360° GARMENT INSPECT<span className="text-lime">.</span>
            </h1>
            <p className="text-xs md:text-sm text-muted font-medium mt-2 max-w-xl">
              Inspect the real textured 3D mesh for the <strong>KEEP GOD FIRST Heavy Box Tee</strong>. Drag to orbit freely or toggle the continuous showcase turntable.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-muted uppercase">STATUS:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-xs font-mono font-bold uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              RENDER 60 FPS
            </span>
          </div>
        </div>

        {/* Main 3D Stage & Control Deck Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left / Center: Interactive 3D Canvas Viewport */}
          <div className="lg:col-span-8 bg-card border border-line p-4 md:p-6 shadow-sm flex flex-col">
            
            {/* Top Viewport Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-line/60 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-lime"></span>
                <span className="font-mono font-bold uppercase text-ink">DROP 001 · KGF-01</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAutoSpin(!isAutoSpin)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono font-bold uppercase border transition-colors ${
                    isAutoSpin
                      ? 'bg-lime text-neutral-950 border-lime'
                      : 'bg-paper text-muted border-line hover:text-ink'
                  }`}
                >
                  {isAutoSpin ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isAutoSpin ? 'Turntable: ON' : 'Turntable: OFF'}</span>
                </button>
              </div>
            </div>

            {/* 3D Model Canvas Container */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-paper border border-line flex items-center justify-center overflow-hidden">
              <TshirtCanvas
                colorTint={colorTint}
                isAutoSpin={isAutoSpin}
                autoSpinSpeed={spinSpeed}
              />

              {/* Orbit Hint Watermark */}
              <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm border border-line px-3 py-1 text-[9px] font-mono font-bold tracking-widest uppercase text-muted pointer-events-none z-20">
                DRAG OR SWIPE TO ROTATE 360°
              </div>

              {/* Specs Badge Overlay */}
              <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm border border-line px-3 py-1.5 text-[10px] font-mono font-bold uppercase text-ink pointer-events-none z-20">
                24,432 POLYS · 10.7 MB PBR
              </div>
            </div>

            {/* Viewport Bottom Toolbar: Rotation Speed */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-2 text-xs text-muted">
              <div className="flex items-center gap-3">
                <Sliders className="w-3.5 h-3.5 text-ink" />
                <span className="font-mono text-[11px] uppercase">SPIN SPEED:</span>
                <div className="flex items-center gap-1.5">
                  {[0.008, 0.015, 0.03].map((spd, i) => (
                    <button
                      key={spd}
                      onClick={() => setSpinSpeed(spd)}
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${
                        spinSpeed === spd
                          ? 'bg-ink text-paper border-ink'
                          : 'bg-paper text-muted border-line hover:text-ink'
                      }`}
                    >
                      {i === 0 ? '0.5x' : i === 1 ? '1.0x' : '2.0x'}
                    </button>
                  ))}
                </div>
              </div>

              <span className="font-mono text-[10px] text-muted uppercase">
                THREE.JS WEBGL RENDERER
              </span>
            </div>

          </div>

          {/* Right Column: Garment Specs, Swatches, Sizing & Instant Checkout */}
          <div className="lg:col-span-4 bg-card border border-line p-6 md:p-8 flex flex-col gap-6 shadow-sm">
            
            {/* Title & Pricing */}
            <div>
              <span className="text-[10px] font-black tracking-widest text-lime-dark uppercase block mb-1">
                INDEPENDENT STREETWEAR DROP
              </span>
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-ink leading-tight">
                {kgfProduct.name}
              </h2>
              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-2xl font-black text-ink">{rupee(kgfProduct.price)}</span>
                <span className="text-sm line-through text-muted">{rupee(kgfProduct.old)}</span>
                <span className="text-[10px] font-black bg-lime text-neutral-950 px-2 py-0.5 uppercase">
                  SAVE 24%
                </span>
              </div>
            </div>

            {/* Colorway Selection */}
            <div className="border-t border-line/60 pt-5">
              <label className="text-[10px] font-black tracking-widest text-muted uppercase block mb-3">
                SELECT COLORWAY
              </label>
              <div className="flex flex-col gap-2">
                {colorways.map((cw) => (
                  <button
                    key={cw.id}
                    onClick={() => handleColorwayChange(cw)}
                    className={`flex items-center justify-between p-3 border text-xs font-black tracking-wider uppercase transition-all duration-200 ${
                      selectedColorway === cw.id
                        ? 'border-ink bg-paper shadow-[2px_2px_0px_#d7ff36] text-ink'
                        : 'border-line bg-card text-muted hover:border-ink hover:text-ink'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-5 h-5 rounded-full border border-line shadow-sm"
                        style={{ backgroundColor: cw.preview }}
                      />
                      <span>{cw.name}</span>
                    </div>
                    {selectedColorway === cw.id && (
                      <Check className="w-4 h-4 text-lime" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="border-t border-line/60 pt-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-black tracking-widest text-muted uppercase">
                  SIZE (BOXY STREETWEAR FIT)
                </label>
                <span className="text-[10px] font-bold text-lime-dark underline cursor-pointer">
                  FIT GUIDE
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {kgfProduct.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setActiveSize(sz)}
                    className={`py-2 text-xs font-black transition-all duration-200 border uppercase ${
                      activeSize === sz
                        ? 'bg-ink text-paper border-ink shadow-[2px_2px_0px_#d7ff36]'
                        : 'bg-paper text-muted border-line hover:border-ink hover:text-ink'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Instant Checkout Button */}
            <div className="border-t border-line/60 pt-5 flex flex-col gap-3">
              <motion.button
                onClick={handleBuy}
                whileTap={{ scale: 0.96 }}
                className="w-full py-4 bg-lime text-neutral-950 font-black text-xs tracking-widest uppercase border border-ink hover:bg-ink hover:text-lime transition-all duration-200 shadow-[4px_4px_0px_#111111] flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-700" />
                    <span>ADDED TO BAG!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>ADD TO BAG &amp; CHECKOUT</span>
                  </>
                )}
              </motion.button>

              <button
                onClick={onOpenCart}
                className="w-full py-2.5 bg-paper text-ink font-bold text-[11px] tracking-wider uppercase border border-line hover:border-ink transition-colors"
              >
                VIEW CART &amp; ORDER SUMMARY →
              </button>
            </div>

            {/* Garment Construction Checklist */}
            <div className="border-t border-line/60 pt-5 space-y-2 text-xs text-muted">
              {kgfProduct.specs.map((sp, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-lime shrink-0" />
                  <span>{sp}</span>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
