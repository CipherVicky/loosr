import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowDownRight, Sparkles, Compass } from 'lucide-react';

export default function Hero({ onShopClick, onLookbookClick }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Motion physics for 3D card tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);
  const translateShirtX = useTransform(smoothX, [-0.5, 0.5], [-18, 18]);
  const translateShirtY = useTransform(smoothY, [-0.5, 0.5], [-18, 18]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Interactive Particle Canvas in Hero Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 1,
      speedX: (Math.random() - 0.5) * 0.6,
      speedY: (Math.random() - 0.5) * 0.6,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle dynamic grid dots
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(17, 17, 17, ${p.opacity})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 border-b border-line">
      {/* Dynamic Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
      />

      <div className="max-w-[1240px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 md:gap-14 items-center">
          
          {/* Left Column: Kinetic Typography & Copy */}
          <div className="z-10">
            {/* Live Eyebrow Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2.5 px-3 py-1 bg-white border border-line rounded-full mb-6 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-ink"></span>
              </span>
              <span className="text-[11px] font-black tracking-widest text-ink uppercase">
                INDEPENDENT STREETWEAR · INDIA
              </span>
            </motion.div>

            {/* Kinetic Title Reveal */}
            <div className="overflow-hidden mb-6">
              <motion.h1
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="font-black text-5xl sm:text-7xl lg:text-[96px] leading-[0.88] tracking-tighter text-ink uppercase"
              >
                WEAR<br />
                YOUR<br />
                <span className="relative inline-block">
                  OWN RULES
                  <motion.span
                    animate={{ scale: [1, 1.25, 1], color: ['#d7ff36', '#b5d72e', '#d7ff36'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="inline-block text-lime"
                  >
                    .
                  </motion.span>
                </span>
              </motion.h1>
            </div>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="max-w-[420px] text-base text-[#4a4943] leading-relaxed mb-8 font-medium"
            >
              Made for the ones who never needed permission. Everyday essentials, oversized energy, and a heavy box drape that speaks for itself.
            </motion.p>

            {/* Action CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="flex flex-wrap items-center gap-4"
            >
              <button
                onClick={onShopClick}
                className="group relative inline-flex items-center gap-3 bg-lime text-neutral-950 px-7 py-4 text-xs font-black tracking-wider uppercase border border-ink hover:bg-ink hover:text-lime transition-all duration-300 shadow-[4px_4px_0px_#111111] active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                <span>SHOP THE DROP</span>
                <ArrowDownRight className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
              </button>

              <button
                onClick={onLookbookClick}
                className="group inline-flex items-center gap-2 bg-transparent text-ink px-6 py-4 text-xs font-black tracking-wider uppercase border border-ink hover:bg-white transition-all duration-200"
              >
                <Compass className="w-4 h-4 text-muted group-hover:text-ink transition-colors" />
                <span>EXPLORE LOOKBOOK</span>
              </button>
            </motion.div>

            {/* Micro proof badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex items-center gap-6 mt-10 text-[11px] font-bold text-muted tracking-wider uppercase"
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-lime border border-ink"></span>
                100% COMBED COTTON
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-ink"></span>
                FREE SHIPPING &gt; ₹1,499
              </span>
            </motion.div>
          </div>

          {/* Right Column: 3D Interactive Hero Canvas & Silhouette */}
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative perspective-1000 py-4 flex justify-center"
          >
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
              }}
              className="relative w-full max-w-[480px] h-[440px] sm:h-[480px] bg-lime border border-ink flex items-center justify-center overflow-hidden shadow-[12px_16px_0px_rgba(17,17,17,0.85)] cursor-grab active:cursor-grabbing transition-shadow duration-300"
            >
              {/* Subtle Concentric Rings Watermark */}
              <div className="absolute w-[360px] h-[360px] rounded-full border border-ink/15 pointer-events-none" />
              <div className="absolute w-[240px] h-[240px] rounded-full border border-ink/10 pointer-events-none" />

              {/* Floating Limited Sticker */}
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  rotate: [-12, -9, -12],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute top-6 left-6 z-20 bg-white border border-ink px-4 py-3 rounded-full shadow-[3px_3px_0px_#111111] pointer-events-none"
              >
                <div className="text-[10px] font-black tracking-wider text-ink text-center leading-tight">
                  DROP 001<br />
                  <span className="text-lime-dark font-extrabold">LIMITED RUN</span>
                </div>
              </motion.div>

              {/* Monogram Brand Mark in Corner */}
              <div className="absolute bottom-5 right-6 text-xs font-black tracking-[4px] text-neutral-950/80 pointer-events-none select-none">
                LOOSR.STD
              </div>

              {/* Central 3D T-Shirt / Silhouette with Motion Parallax */}
              <motion.div
                style={{
                  x: translateShirtX,
                  y: translateShirtY,
                  transformStyle: 'preserve-3d',
                }}
                className="relative z-10 flex flex-col items-center"
              >
                {/* Scaled Garment Silhouette */}
                <div className="garment-clip hard-shadow w-[220px] h-[260px] sm:w-[250px] sm:h-[290px] bg-[#171717] flex items-center justify-center relative transition-transform duration-300 hover:scale-105">
                  {/* Internal Texture Lines */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                  
                  {/* Neon Brand Typography on Garment */}
                  <motion.div
                    animate={{ rotate: [-8, -6, -8] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-lime text-3xl sm:text-4xl font-black tracking-tighter select-none"
                  >
                    LOOSR
                  </motion.div>

                  {/* Micro label tag at bottom */}
                  <div className="absolute bottom-6 text-[9px] font-black tracking-widest text-[#666] uppercase">
                    EST. 2026 · IN
                  </div>
                </div>

                {/* Interactive Drag Hint */}
                <span className="mt-4 text-[10px] font-black tracking-widest uppercase text-neutral-950 bg-white/90 px-2.5 py-1 rounded border border-neutral-950/20 shadow-sm">
                  Hover or Tilt
                </span>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
