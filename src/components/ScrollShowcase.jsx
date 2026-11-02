import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Check,
  ArrowRight,
  Eye,
  Box,
  Maximize2,
  Minimize2,
  Video,
  Play,
  Pause,
  EyeOff,
  Plus,
  Minus,
} from 'lucide-react';
import TshirtCanvas from './TshirtCanvas';
import { rupee } from '../data/products';

export default function ScrollShowcase({ onAddToCart, onUpdateQty, cart = [] }) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);

  const [selectedColorway, setSelectedColorway] = useState('original');
  const [colorTint, setColorTint] = useState(null);
  const [activeSize, setActiveSize] = useState('L');
  const [viewMode, setViewMode] = useState('3d'); // '3d' (GLB) or 'studio'
  const [is169Cinema, setIs169Cinema] = useState(false);
  const [isCleanCam, setIsCleanCam] = useState(false);
  const [isAutoSpin, setIsAutoSpin] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [added, setAdded] = useState(false);

  // Scroll Progress
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Annotations Staggered Reveal along Scroll Progress
  const feat1Opacity = useTransform(scrollYProgress, [0.01, 0.08, 0.20, 0.26], [0, 1, 1, 0]);
  const feat1Y = useTransform(scrollYProgress, [0.01, 0.08, 0.20, 0.26], [35, 0, 0, -35]);

  const feat2Opacity = useTransform(scrollYProgress, [0.26, 0.34, 0.44, 0.50], [0, 1, 1, 0]);
  const feat2Y = useTransform(scrollYProgress, [0.26, 0.34, 0.44, 0.50], [35, 0, 0, -35]);

  const feat3Opacity = useTransform(scrollYProgress, [0.50, 0.58, 0.68, 0.74], [0, 1, 1, 0]);
  const feat3Y = useTransform(scrollYProgress, [0.50, 0.58, 0.68, 0.74], [35, 0, 0, -35]);

  const feat4Opacity = useTransform(scrollYProgress, [0.74, 0.82, 0.92, 0.98], [0, 1, 1, 0]);
  const feat4Y = useTransform(scrollYProgress, [0.74, 0.82, 0.92, 0.98], [35, 0, 0, -35]);

  const progressPercentage = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  // CSS 3D fallback transforms for 'studio' mode
  const baseRotateY = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [0, 70, 130, 180, 360]);
  const rotateX = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [0, 12, -6, 8, 0]);
  const garmentScale = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [1, 1.14, 1.06, 1.18, 1]);

  const colorways = [
    { id: 'original', name: 'Original Drop', tint: null, preview: '#ffffff' },
    { id: 'mocha', name: 'Mocha Espresso', tint: '#42291b', preview: '#42291b' },
    { id: 'ink', name: 'Matte Ink', tint: '#171717', preview: '#171717' },
    { id: 'lime', name: 'Acid Lime', tint: '#d7ff36', preview: '#d7ff36' },
  ];

  const handleSelectColorway = (cw) => {
    setSelectedColorway(cw.id);
    setColorTint(cw.tint);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      stageRef.current?.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
      setIs169Cinema(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleQuickAdd = () => {
    onAddToCart({
      id: 101,
      name: 'KEEP GOD FIRST Heavy Box Tee',
      cat: 'T-Shirts',
      price: 1299,
      chosenColor: colorTint || '#3a281c',
      chosenSize: activeSize,
      label: 'KGF-01',
      bg: '#e8ded3',
      frontImg: '/tshirt-front-aligned.png',
      backImg: '/tshirt-back-aligned.png',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <section
      id="anatomy"
      ref={containerRef}
      className="relative h-[420vh] bg-[#f5f3ef] border-b border-line"
    >
      {/* Pinned Sticky 3D Showcase Stage */}
      <div
        ref={stageRef}
        className={`sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden px-4 md:px-8 py-5 select-none transition-all duration-300 ${
          isFullscreen ? 'bg-[#f5f3ef] p-0' : ''
        }`}
      >
        {/* Top Header & Telemetry Controls */}
        <div
          className={`max-w-[1440px] w-full mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-30 transition-opacity duration-300 ${
            isCleanCam ? 'opacity-0 hover:opacity-100' : 'opacity-100'
          }`}
        >
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-black tracking-widest text-muted uppercase">
              <span className="w-2 h-2 rounded-full bg-lime border border-ink animate-ping" />
              <span>REAL 3D GLB ENGINE · SCROLL ROTATION</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-ink uppercase tracking-tight">
              3D T-SHIRT ARCHITECTURE<span className="text-lime">.</span>
            </h2>
          </div>

          {/* Recording & Cinema Toolset */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* 16:9 Cinema Frame Toggle */}
            <button
              onClick={() => setIs169Cinema(!is169Cinema)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase border transition-all ${
                is169Cinema
                  ? 'bg-ink text-lime border-ink shadow-[2px_2px_0px_#d7ff36]'
                  : 'bg-white text-ink border-line hover:border-ink'
              }`}
              title="Lock center viewport into widescreen 16:9 proportion"
            >
              <Video className="w-3.5 h-3.5" />
              <span>{is169Cinema ? '16:9 CINEMA: ON' : '16:9 CINEMA'}</span>
            </button>

            {/* Auto Spin Toggle for effortless screen recording */}
            <button
              onClick={() => setIsAutoSpin(!isAutoSpin)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase border transition-all ${
                isAutoSpin
                  ? 'bg-lime text-neutral-950 border-ink shadow-[2px_2px_0px_#111111]'
                  : 'bg-white text-ink border-line hover:border-ink'
              }`}
              title="Auto-rotate 360° continuously for video recording"
            >
              {isAutoSpin ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isAutoSpin ? 'PAUSE SPIN' : 'AUTO SPIN 360°'}</span>
            </button>

            {/* Clean Cam: Hide Overlays for clean capture */}
            <button
              onClick={() => setIsCleanCam(!isCleanCam)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-black uppercase border transition-all ${
                isCleanCam
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-card text-ink border-line hover:border-ink'
              }`}
              title="Hide UI overlays for clean screen recordings"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isCleanCam ? 'SHOW UI' : 'CLEAN CAM'}</span>
            </button>

            {/* Fullscreen 16:9 */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 bg-card hover:bg-ink hover:text-paper border border-line hover:border-ink transition-colors"
              title="Toggle Fullscreen (True 16:9 monitor view)"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Mode: 3D GLB vs 2D Print */}
            <div className="flex border border-line bg-card p-0.5 shadow-sm">
              <button
                onClick={() => setViewMode('3d')}
                className={`flex items-center gap-1 px-2.5 py-1 text-[9px] font-black uppercase transition-all ${
                  viewMode === '3d' ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
                }`}
              >
                <Box className="w-3 h-3 text-lime" />
                <span>3D GLB</span>
              </button>
              <button
                onClick={() => setViewMode('studio')}
                className={`flex items-center gap-1 px-2.5 py-1 text-[9px] font-black uppercase transition-all ${
                  viewMode === 'studio' ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
                }`}
              >
                <Eye className="w-3 h-3 text-lime" />
                <span>PUFF ART</span>
              </button>
            </div>

          </div>
        </div>

        {/* Center Stage: 16:9 Widescreen Container */}
        <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden my-auto">
          
          {/* Subtle Ambient Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-[620px] h-[620px] rounded-full border border-ink border-dashed animate-[spin_90s_linear_infinite]" />
            <div className="w-[840px] h-[840px] rounded-full border border-ink/30 absolute" />
          </div>

          {/* Staggered Annotations (Hidden if Clean Cam is active) */}
          {!isCleanCam && (
            <>
              {/* ANNOTATION 1: TEXTILE ARCHITECTURE */}
              <motion.div
                style={{ opacity: feat1Opacity, y: feat1Y }}
                className="absolute left-2 sm:left-6 md:left-10 lg:left-16 top-1/4 max-w-[260px] sm:max-w-[290px] z-20 pointer-events-none"
              >
                <div className="bg-card border border-ink p-4 sm:p-5 shadow-[4px_4px_0px_#111111]">
                  <span className="text-[9px] font-black tracking-widest text-lime bg-ink px-2 py-0.5 uppercase inline-block mb-2">
                    01 / TEXTILE SPEC
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-ink uppercase tracking-tight">
                    280 GSM MOCHA FRENCH COTTON
                  </h3>
                  <p className="text-xs text-[#555] mt-1.5 leading-relaxed font-medium">
                    Pure ring-spun combed dense weave. Finished in mineral espresso dye that builds a vintage patina while keeping its structural box drape.
                  </p>
                  <div className="flex gap-1.5 mt-3">
                    <span className="text-[9px] font-black bg-paper border border-line px-1.5 py-0.5 uppercase">PRE-SHRUNK</span>
                    <span className="text-[9px] font-black bg-paper border border-line px-1.5 py-0.5 uppercase">280 GSM</span>
                  </div>
                </div>
              </motion.div>

              {/* ANNOTATION 2: FRONT CHEST PUFF */}
              <motion.div
                style={{ opacity: feat2Opacity, y: feat2Y }}
                className="absolute right-2 sm:right-6 md:right-10 lg:right-16 top-1/4 max-w-[260px] sm:max-w-[290px] z-20 pointer-events-none"
              >
                <div className="bg-card border border-ink p-4 sm:p-5 shadow-[4px_4px_0px_#111111]">
                  <span className="text-[9px] font-black tracking-widest text-lime bg-ink px-2 py-0.5 uppercase inline-block mb-2">
                    02 / CHEST IDENTITY
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-ink uppercase tracking-tight">
                    MINI BUBBLE CHEST PUFF
                  </h3>
                  <p className="text-xs text-[#555] mt-1.5 leading-relaxed font-medium">
                    Tactile "KEEP GOD FIRST" insignia on the left chest printed with warm vanilla custard foam ink, heat-cured for lasting 3D elevation.
                  </p>
                  <div className="flex gap-1.5 mt-3">
                    <span className="text-[9px] font-black bg-paper border border-line px-1.5 py-0.5 uppercase">PUFF FOAM</span>
                    <span className="text-[9px] font-black bg-paper border border-line px-1.5 py-0.5 uppercase">CRACK-PROOF</span>
                  </div>
                </div>
              </motion.div>

              {/* ANNOTATION 3: DROPPED SHOULDER FIT */}
              <motion.div
                style={{ opacity: feat3Opacity, y: feat3Y }}
                className="absolute left-2 sm:left-6 md:left-10 lg:left-16 bottom-1/4 max-w-[260px] sm:max-w-[290px] z-20 pointer-events-none"
              >
                <div className="bg-card border border-ink p-4 sm:p-5 shadow-[4px_4px_0px_#111111]">
                  <span className="text-[9px] font-black tracking-widest text-lime bg-ink px-2 py-0.5 uppercase inline-block mb-2">
                    03 / STREETWEAR CUT
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-ink uppercase tracking-tight">
                    OVERSIZED DROP SHOULDER
                  </h3>
                  <p className="text-xs text-[#555] mt-1.5 leading-relaxed font-medium">
                    Extended armholes and wide sleeves that rest just above the elbows. Engineered for an effortless boxy silhouette with unconstrained posture.
                  </p>
                  <div className="flex gap-1.5 mt-3">
                    <span className="text-[9px] font-black bg-paper border border-line px-1.5 py-0.5 uppercase">RELAXED ARMHOLE</span>
                    <span className="text-[9px] font-black bg-paper border border-line px-1.5 py-0.5 uppercase">HEAVY DRAPE</span>
                  </div>
                </div>
              </motion.div>

              {/* ANNOTATION 4: STATEMENT BACK PUFF PRINT */}
              <motion.div
                style={{ opacity: feat4Opacity, y: feat4Y }}
                className="absolute right-2 sm:right-6 md:right-10 lg:right-16 bottom-1/4 max-w-[260px] sm:max-w-[290px] z-20 pointer-events-none"
              >
                <div className="bg-card border border-ink p-4 sm:p-5 shadow-[4px_4px_0px_#111111]">
                  <span className="text-[9px] font-black tracking-widest text-lime bg-ink px-2 py-0.5 uppercase inline-block mb-2">
                    04 / SIGNATURE ART
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-ink uppercase tracking-tight">
                    TACTILE FULL-BACK BUBBLE ART
                  </h3>
                  <p className="text-xs text-[#555] mt-1.5 leading-relaxed font-medium">
                    High-relief statement: "IT'S A GOOD DAY TO KEEP GOD FIRST" sprawling across the shoulders. Bold retro-bubble typography with deep tactile texture.
                  </p>
                  <div className="flex gap-1.5 mt-3">
                    <span className="text-[9px] font-black bg-paper border border-line px-1.5 py-0.5 uppercase">HIGH RELIEF</span>
                    <span className="text-[9px] font-black bg-paper border border-line px-1.5 py-0.5 uppercase">GOLD CUSTARD</span>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {/* 16:9 Aspect Ratio Controlled Stage */}
          <div
            className={`transition-all duration-500 relative flex items-center justify-center ${
              is169Cinema
                ? 'w-full max-w-[1400px] aspect-[16/9] border-2 border-ink shadow-[8px_10px_0px_#111111] bg-paper overflow-hidden'
                : 'w-full h-full max-h-[75vh] flex items-center justify-center'
            }`}
          >
            {/* 16:9 Indicator watermark when cinema mode is ON */}
            {is169Cinema && (
              <div className="absolute top-3 left-4 text-[9px] font-mono font-bold tracking-widest text-ink/40 pointer-events-none z-30 uppercase">
                [16:9 CINEMA WIDESCREEN CAPTURE — 1080P]
              </div>
            )}

            {viewMode === '3d' ? (
              // REAL THREE.JS GLB CANVAS
              <div className="w-full h-full flex items-center justify-center relative">
                <TshirtCanvas
                  scrollProgress={scrollYProgress}
                  colorTint={colorTint}
                  isAutoSpin={isAutoSpin}
                  autoSpinSpeed={0.012}
                />
                
                {/* Drag / Orbit Hint Overlay (hidden during clean cam) */}
                {!isCleanCam && !isAutoSpin && (
                  <div className="absolute bottom-3 bg-white/80 backdrop-blur-sm border border-line px-3 py-1 text-[9px] font-black tracking-widest uppercase text-ink pointer-events-none z-20">
                    Scroll or Drag to Orbit 3D Model
                  </div>
                )}
              </div>
            ) : (
              // HIGH RESOLUTION PRINT STUDIO MODE
              <motion.div
                style={{
                  rotateY: baseRotateY,
                  rotateX: rotateX,
                  scale: garmentScale,
                  transformStyle: 'preserve-3d',
                }}
                className="relative w-[300px] h-[340px] sm:w-[420px] sm:h-[460px] md:w-[480px] md:h-[520px] flex items-center justify-center cursor-grab active:cursor-grabbing perspective-[1200px]"
              >
                {/* Front Face */}
                <div
                  className="absolute inset-0 flex items-center justify-center select-none"
                  style={{ transform: 'translateZ(10px)', backfaceVisibility: 'hidden' }}
                >
                  <img
                    src="/tshirt-front-aligned.png"
                    alt="Keep God First T-Shirt Front"
                    className="w-full h-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.18)]"
                    draggable={false}
                  />
                </div>

                {/* Back Face */}
                <div
                  className="absolute inset-0 flex items-center justify-center select-none"
                  style={{ transform: 'rotateY(180deg) translateZ(10px)', backfaceVisibility: 'hidden' }}
                >
                  <img
                    src="/tshirt-back-aligned.png"
                    alt="Keep God First T-Shirt Back"
                    className="w-full h-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.18)]"
                    draggable={false}
                  />
                </div>
              </motion.div>
            )}
          </div>

        </div>

        {/* Bottom Interactive Bar (Hidden when Clean Cam is active) */}
        <div
          className={`max-w-[1440px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 z-30 pb-2 bg-card/95 backdrop-blur-md border border-line p-4 sm:p-5 shadow-xl transition-opacity duration-300 ${
            isCleanCam ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {/* Material Colorway Switcher (Live 3D Tinting) */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black tracking-widest text-ink uppercase">
              3D FINISH:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {colorways.map((cw) => (
                <button
                  key={cw.id}
                  onClick={() => handleSelectColorway(cw)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 border text-xs font-bold transition-all ${
                    selectedColorway === cw.id
                      ? 'border-ink bg-paper ring-1 ring-ink shadow-sm'
                      : 'border-line hover:border-ink/50 bg-white'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20"
                    style={{ backgroundColor: cw.preview }}
                  />
                  <span className="text-[11px] text-ink font-black">{cw.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size Pills */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black tracking-widest text-ink uppercase">
              SIZE:
            </span>
            <div className="flex gap-1.5">
              {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setActiveSize(sz)}
                  className={`w-8 h-8 text-xs font-black uppercase border transition-all ${
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

          {/* Direct Buy CTA or Quantity Controller */}
          {(() => {
            const cartItem = cart.find((i) => i.id === 101);
            const cartQty = cartItem ? cartItem.qty : 0;

            if (cartQty > 0) {
              return (
                <div className="w-full sm:w-auto px-5 py-2.5 bg-ink text-white border border-ink flex items-center justify-between sm:justify-center gap-3 shadow-[4px_4px_0px_#d7ff36]">
                  <button
                    type="button"
                    onClick={() => onUpdateQty && onUpdateQty(cartItem, -1)}
                    className="w-8 h-8 flex items-center justify-center bg-neutral-900 hover:bg-lime hover:text-ink text-white transition-all font-black text-sm border border-white/20 active:scale-95 cursor-pointer"
                    title="Decrease quantity"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2 font-mono text-xs font-black select-none">
                    <span className="text-lime text-sm">{cartQty}</span>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-sans">IN BAG</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onUpdateQty && onUpdateQty(cartItem, 1)}
                    className="w-8 h-8 flex items-center justify-center bg-lime text-ink hover:bg-white transition-all font-black text-sm border border-ink active:scale-95 cursor-pointer"
                    title="Increase quantity"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }

            return (
              <button
                onClick={handleQuickAdd}
                className={`w-full sm:w-auto px-7 py-3.5 text-xs font-black tracking-wider uppercase border border-ink transition-all duration-200 flex items-center justify-center gap-2 shadow-[4px_4px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                  added
                    ? 'bg-ink text-lime'
                    : 'bg-lime text-neutral-950 hover:bg-ink hover:text-lime'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>ADDED TO BAG</span>
                  </>
                ) : (
                  <>
                    <span>ADD TO BAG — {rupee(1299)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            );
          })()}
        </div>

        {/* Clean Cam Exit Floating Button (visible when Clean Cam is on) */}
        {isCleanCam && (
          <button
            onClick={() => setIsCleanCam(false)}
            className="fixed top-5 right-5 z-50 px-4 py-2 bg-ink text-lime text-xs font-black uppercase border border-lime shadow-lg"
          >
            RESTORE UI (EXIT CLEAN CAM)
          </button>
        )}

      </div>
    </section>
  );
}
