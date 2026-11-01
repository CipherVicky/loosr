import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Scissors, Feather, Recycle, Box } from 'lucide-react';

export default function StoryPage({ onGoToShop, onInspect3D }) {
  return (
    <div className="min-h-screen bg-paper text-ink pb-24">
      {/* Manifesto Banner */}
      <section className="border-b border-line bg-paper/60 backdrop-blur-sm pt-8 pb-12 px-4 md:px-8">
        <div className="max-w-[1240px] mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-lime/20 border border-lime text-neutral-950 text-[10px] font-black tracking-widest uppercase mb-4">
            <Sparkles className="w-3 h-3 text-lime-dark" />
            BRAND PHILOSOPHY & CRAFT
          </span>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-[0.95]">
            REJECT THE FLIMSY. <br />
            WEAR ARCHITECTURE.
          </h1>
          <p className="text-sm md:text-base font-medium text-muted mt-5 max-w-2xl leading-relaxed">
            LOOSR was founded in 2026 on a singular conviction: modern streetwear had lost its
            tangible weight. Mass-market brands compromised on GSM, cheapened rib collars, and
            cut corners on thread count. We set out to reverse that.
          </p>
        </div>
      </section>

      {/* Core Pillars Grid */}
      <section className="max-w-[1240px] mx-auto px-4 md:px-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-ink p-8 shadow-[6px_6px_0px_#111111]">
            <div className="w-10 h-10 rounded-full bg-lime text-neutral-950 flex items-center justify-center font-black mb-4">
              01
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">
              280 GSM COMBED COTTON
            </h3>
            <p className="text-xs text-muted leading-relaxed font-medium">
              We exclusively source extra-long staple combed cotton. Each yarn is carded and combed
              to strip short fibers, resulting in an ultra-smooth face that resists pilling and retains
              its structure wash after wash.
            </p>
          </div>

          <div className="bg-card border border-ink p-8 shadow-[6px_6px_0px_#111111]">
            <div className="w-10 h-10 rounded-full bg-lime text-neutral-950 flex items-center justify-center font-black mb-4">
              02
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">
              BOXY DROPPED GEOMETRY
            </h3>
            <p className="text-xs text-muted leading-relaxed font-medium">
              Our patterns don't merely scale up sizes — they are mathematically engineered with
              a widened chest, dropped shoulder seam, and a cropped boxy torso length that drapes cleanly
              without bunching.
            </p>
          </div>

          <div className="bg-card border border-ink p-8 shadow-[6px_6px_0px_#111111]">
            <div className="w-10 h-10 rounded-full bg-lime text-neutral-950 flex items-center justify-center font-black mb-4">
              03
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">
              LIMITED RUN ZERO OVERSTOCK
            </h3>
            <p className="text-xs text-muted leading-relaxed font-medium">
              Every drop is produced in numbered, tightly-controlled batches. When a drop sells out,
              it enters our archival vault. No overflowing landfill, no discounts, no compromising our standards.
            </p>
          </div>
        </div>
      </section>

      {/* Technical Blueprint Breakdown */}
      <section className="max-w-[1240px] mx-auto px-4 md:px-8 mt-16">
        <div className="bg-card border border-ink p-8 md:p-12 shadow-[8px_8px_0px_#111111]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="text-[10px] font-black uppercase tracking-widest text-lime-dark bg-lime/10 px-2.5 py-1 border border-lime/30">
                GARMENT ENGINEERING
              </span>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mt-3">
                BUILT LIKE INDUSTRIAL GEAR. SOFT AS AIR.
              </h2>
              <div className="space-y-4 mt-6 text-xs text-muted font-medium leading-relaxed">
                <p>
                  We tested 14 different rib knits before finding the 1.2-inch collar binding capable of
                  maintaining its snug profile through 100 industrial wash cycles.
                </p>
                <p>
                  Our graphics utilize low-emission plastisol and high-density screen inks that stretch
                  with the garment fabric rather than cracking or flaking.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-8">
                <button
                  onClick={onGoToShop}
                  className="px-6 py-3.5 bg-lime text-neutral-950 font-black text-xs tracking-wider uppercase border border-ink hover:bg-ink hover:text-lime transition-all duration-200 shadow-[3px_3px_0px_#111111] flex items-center gap-2 active:translate-x-0.5 active:translate-y-0.5"
                >
                  <span>SHOP THE DROP</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onInspect3D}
                  className="px-5 py-3.5 bg-white text-ink font-black text-xs tracking-wider uppercase border border-line hover:border-ink transition-colors flex items-center gap-2"
                >
                  <Box className="w-4 h-4" />
                  <span>VIEW IN 360° INSPECT</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-paper border border-ink p-6 flex flex-col gap-4">
              <div className="text-xs font-black uppercase tracking-wider border-b border-line pb-2 flex items-center justify-between">
                <span>FABRIC SPEC SHEET</span>
                <span className="text-lime-dark font-mono">SPEC: 2026-LSR</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-line/60">
                <span className="text-muted">Fiber Origin:</span>
                <span className="font-black">Coimbatore, India</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-line/60">
                <span className="text-muted">Fabric Weight:</span>
                <span className="font-black">280 GSM (8.25 oz/yd²)</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-line/60">
                <span className="text-muted">Yarn Count:</span>
                <span className="font-black">16s Combed Compact</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-line/60">
                <span className="text-muted">Pre-Shrunk:</span>
                <span className="font-black">Silicon Biowashed</span>
              </div>
              <div className="flex justify-between text-xs py-1">
                <span className="text-muted">Stitching:</span>
                <span className="font-black">Double-Needle Flatlock</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Callout Banner */}
      <section className="max-w-[1240px] mx-auto px-4 md:px-8 mt-16 text-center">
        <div className="bg-ink text-white p-8 md:p-12 border border-ink flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
            EXPERIENCE THE LOOSR FIT
          </h2>
          <p className="text-xs md:text-sm text-neutral-300 max-w-lg mt-3">
            Available in limited quantities. Free standard shipping across all domestic pin codes.
          </p>
          <button
            onClick={onGoToShop}
            className="mt-6 px-8 py-4 bg-lime text-neutral-950 font-black text-xs tracking-wider uppercase border border-ink hover:bg-white transition-all duration-200 shadow-[3px_3px_0px_#ffffff] flex items-center gap-2 active:translate-x-0.5 active:translate-y-0.5"
          >
            <span>EXPLORE DROP 001 NOW</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
