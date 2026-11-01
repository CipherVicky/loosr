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
    setTimeout(() => {
      setAdded(false);
      if (onOpenCart) onOpenCart();
    }, 450);
  };

  return (
    <div className="min-h-screen bg-paper text-ink pb-20">
      {/* Top Header */}
      <section className="border-b border-line bg-paper/60 backdrop-blur-sm pt-8 pb-6 px-4 md:px-8">
        <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-lime/20 border border-lime text-neutral-950 text-[10px] font-black tracking-widest uppercase mb-3">
              <Box className="w-3.5 h-3.5 text-lime-dark" />
              INTERACTIVE 3D CAD VIEWER
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
              360° GARMENT INSPECT
            </h1>
            <p className="text-xs md:text-sm text-muted font-medium mt-2 max-w-xl">
              Rotate, tilt, inspect fabric folds and inspect every seam in full real-time WebGL.
              Engineered with 280 GSM heavyweight combed cotton.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-black tracking-wider uppercase text-muted">
            <span className="w-2.5 h-2.5 rounded-full bg-lime"></span>
            <span>HARDWARE ACCELERATED WEBGL</span>
          </div>
        </div>
      </section>

      {/* Main 3D Canvas Showcase Grid */}
      <section className="max-w-[1240px] mx-auto px-4 md:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive 3D Viewer (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-card border border-ink overflow-hidden shadow-[8px_8px_0px_#111111] flex items-center justify-center">
              
              {/* WebGL Canvas Component */}
              <TshirtCanvas
                scrollProgress={0}
                colorTint={colorTint}
                isAutoSpin={isAutoSpin}
                autoSpinSpeed={spinSpeed}
              />

              {/* Viewport UI Controls Overlay */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-paper/90 backdrop-blur-sm border border-ink px-3 py-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-lime animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-ink">
                  DRAG MOUSE OR SWIPE TO ROTATE
                </span>
              </div>

              {/* Viewport Control Bar at Bottom */}
              <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between gap-3 bg-paper/90 backdrop-blur-md border border-ink px-4 py-2.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAutoSpin(!isAutoSpin)}
                    className="p-1.5 bg-neutral-950 text-white hover:bg-lime hover:text-neutral-950 transition-colors flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5"
                    title={isAutoSpin ? 'Pause auto rotation' : 'Start auto rotation'}
                  >
                    {isAutoSpin ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isAutoSpin ? 'PAUSE ROTATION' : 'AUTO ROTATE'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setColorTint(null);
                      setSelectedColorway('original');
                    }}
                    className="p-1.5 bg-card text-ink border border-line hover:border-ink transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2"
                    title="Reset view"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>RESET</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase">
                  <span>SPEED:</span>
                  <input
                    type="range"
                    min="0.005"
                    max="0.04"
                    step="0.005"
                    value={spinSpeed}
                    onChange={(e) => setSpinSpeed(parseFloat(e.target.value))}
                    className="w-16 accent-lime cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Micro specs under canvas */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card border border-line p-3 text-center">
                <div className="text-[10px] font-black text-muted uppercase tracking-wider">FABRIC DENSITY</div>
                <div className="text-base font-black uppercase text-ink mt-0.5">280 GSM</div>
              </div>
              <div className="bg-card border border-line p-3 text-center">
                <div className="text-[10px] font-black text-muted uppercase tracking-wider">SILHOUETTE</div>
                <div className="text-base font-black uppercase text-ink mt-0.5">BOXY OVERSIZED</div>
              </div>
              <div className="bg-card border border-line p-3 text-center">
                <div className="text-[10px] font-black text-muted uppercase tracking-wider">COMPOSITION</div>
                <div className="text-base font-black uppercase text-ink mt-0.5">100% COMBED</div>
              </div>
            </div>
          </div>

          {/* Right Column: Garment Specs, Customization & Instant Checkout (5 Cols) */}
          <div className="lg:col-span-5 bg-card border border-ink p-6 md:p-8 shadow-[8px_8px_0px_#111111] flex flex-col justify-between">
            <div>
              {/* Product Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black bg-lime text-neutral-950 px-2.5 py-1 uppercase tracking-widest border border-ink">
                  FLAGSHIP DROP 001
                </span>
                <span className="text-xs font-mono font-bold text-muted">
                  CODE: LOOSR-KG-01
                </span>
              </div>

              {/* Title & Price */}
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight">
                {kgfProduct.name}
              </h2>
              <div className="flex items-baseline gap-3 mt-2 pb-4 border-b border-line">
                <span className="text-2xl font-black text-ink">{rupee(kgfProduct.price)}</span>
                <span className="text-xs text-muted font-bold line-through">₹2,499</span>
                <span className="text-[10px] font-black text-brandRed bg-brandRed/10 px-2 py-0.5 uppercase tracking-wider">
                  SAVE 32%
                </span>
              </div>

              {/* Colorway Switcher */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider mb-2.5">
                  <span>FINISH / COLORWAY</span>
                  <span className="text-muted">
                    {colorways.find((c) => c.id === selectedColorway)?.name}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {colorways.map((cw) => (
                    <button
                      key={cw.id}
                      onClick={() => handleColorwayChange(cw)}
                      className={`p-2.5 text-left border text-xs font-black uppercase transition-all duration-200 flex items-center gap-2 ${
                        selectedColorway === cw.id
                          ? 'bg-ink text-paper border-ink shadow-[2px_2px_0px_#d7ff36]'
                          : 'bg-card text-ink border-line hover:border-ink'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-ink/40 flex-shrink-0"
                        style={{ backgroundColor: cw.preview }}
                      />
                      <span className="truncate text-[10px]">{cw.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider mb-2.5">
                  <span>SELECT SIZE</span>
                  <span className="text-lime-dark font-extrabold text-[10px]">BOXY DROPPED FIT</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setActiveSize(sz)}
                      className={`py-2.5 text-xs font-black uppercase border transition-all duration-200 ${
                        activeSize === sz
                          ? 'bg-ink text-paper border-ink shadow-[2px_2px_0px_#d7ff36]'
                          : 'bg-card text-ink border-line hover:border-ink'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Anatomy Bullet Points */}
              <div className="mt-6 space-y-2 border-t border-line pt-4 text-xs font-medium text-muted">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime"></span>
                  <span>Double-needle collar binding resists stretching over time</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime"></span>
                  <span>Screen-printed graphics with high-elasticity eco-plastisol</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime"></span>
                  <span>Drop-shoulder cut balances relaxed posture and clean draping</span>
                </div>
              </div>
            </div>

            {/* Instant Add & Direct Checkout Action Button */}
            <div className="mt-8 pt-4 border-t border-line">
              <button
                onClick={handleBuy}
                className="w-full py-4 bg-lime text-neutral-950 font-black text-xs tracking-widest uppercase border border-ink hover:bg-ink hover:text-lime transition-all duration-200 shadow-[4px_4px_0px_#111111] flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-neutral-950" />
                    <span>ADDED TO BAG! OPENING CHECKOUT...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>ADD TO BAG & CHECKOUT NOW</span>
                  </>
                )}
              </button>

              <div className="mt-3 flex items-center justify-between text-[10px] font-black uppercase text-muted tracking-wider">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-dark" />
                  GENUINE COTTON GUARANTEE
                </span>
                <span>DISPATCH IN 24 HOURS</span>
              </div>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
}
