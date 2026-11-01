import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ShieldCheck, Ruler, ArrowRight, Truck } from 'lucide-react';
import { rupee } from '../data/products';

export default function QuickViewModal({ product, onClose, onAddToCart }) {
  if (!product) return null;

  const [selectedColor, setSelectedColor] = useState(
    product.swatches?.[0]?.hex || product.garment
  );
  const [selectedInk, setSelectedInk] = useState(
    product.swatches?.[0]?.ink || product.ink
  );
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'L');
  const [viewSide, setViewSide] = useState('front');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart({
      ...product,
      chosenColor: selectedColor,
      chosenSize: selectedSize,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl bg-paper border border-ink shadow-[12px_16px_0px_#111111] overflow-hidden z-10 my-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 bg-ink text-white hover:bg-lime hover:text-neutral-950 flex items-center justify-center border border-ink transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Left: Interactive Garment Stage */}
            <div
              className="p-8 sm:p-12 flex flex-col items-center justify-center relative min-h-[340px] border-b md:border-b-0 md:border-r border-line"
              style={{ backgroundColor: product.bg }}
            >
              <span className="absolute top-4 left-4 bg-white border border-ink text-[10px] font-black tracking-wider px-2.5 py-1 uppercase shadow-sm">
                {product.tag || 'EXCLUSIVE'}
              </span>

              {/* Garment Visual */}
              {product.frontImg ? (
                <div className="flex flex-col items-center justify-center">
                  <motion.div
                    key={viewSide}
                    initial={{ scale: 0.9, opacity: 0.8, rotateY: viewSide === 'back' ? 90 : -90 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    transition={{ duration: 0.35 }}
                    className="relative w-[230px] h-[260px] sm:w-[260px] sm:h-[290px] flex items-center justify-center"
                  >
                    <img
                      src={viewSide === 'front' ? product.frontImg : (product.backImg || product.frontImg)}
                      alt={`${product.name} ${viewSide}`}
                      className="w-full h-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.2)]"
                    />
                  </motion.div>

                  {/* Front / Back Toggle Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setViewSide('front')}
                      className={`px-3 py-1 text-[10px] font-black uppercase border transition-all ${
                        viewSide === 'front' ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-line'
                      }`}
                    >
                      FRONT VIEW
                    </button>
                    <button
                      onClick={() => setViewSide('back')}
                      className={`px-3 py-1 text-[10px] font-black uppercase border transition-all ${
                        viewSide === 'back' ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-line'
                      }`}
                    >
                      BACK STATEMENT ART
                    </button>
                  </div>
                </div>
              ) : (
                <motion.div
                  key={selectedColor}
                  initial={{ scale: 0.9, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="garment-clip hard-shadow w-[180px] h-[220px] sm:w-[210px] sm:h-[250px] flex items-center justify-center relative transition-colors duration-300"
                  style={{
                    backgroundColor: selectedColor,
                    color: selectedInk,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/15 via-transparent to-white/10 pointer-events-none" />
                  <span className="font-black text-2xl sm:text-3xl tracking-tight select-none -rotate-6">
                    {product.label}
                  </span>
                </motion.div>
              )}

              <div className="mt-6 text-[10px] font-black tracking-widest uppercase text-muted">
                360° BOX SILHOUETTE
              </div>
            </div>

            {/* Right: Specs, Sizing & Add to Bag */}
            <div className="p-6 sm:p-8 flex flex-col justify-between bg-card">
              <div>
                <div className="text-[11px] font-extrabold tracking-widest text-muted uppercase">
                  {product.cat} · STREETWEAR
                </div>
                <h2 className="text-2xl font-black text-ink uppercase tracking-tight mt-1">
                  {product.name}
                </h2>

                <div className="flex items-baseline gap-3 my-3">
                  <span className="text-2xl font-black text-ink">
                    {rupee(product.price)}
                  </span>
                  {product.old && (
                    <span className="text-sm text-muted line-through font-semibold">
                      {rupee(product.old)}
                    </span>
                  )}
                  <span className="text-[10px] font-black bg-lime text-neutral-950 px-2 py-0.5 border border-ink">
                    SAVE {rupee(product.old - product.price)}
                  </span>
                </div>

                <p className="text-xs text-[#555] leading-relaxed mb-5 font-medium">
                  {product.description}
                </p>

                {/* Color Swatch Picker */}
                <div className="mb-5">
                  <div className="text-[10px] font-black tracking-widest text-ink uppercase mb-2">
                    SELECT COLOR
                  </div>
                  <div className="flex items-center gap-2">
                    {product.swatches?.map((swatch, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedColor(swatch.hex);
                          if (swatch.ink) setSelectedInk(swatch.ink);
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 border text-xs font-bold transition-all ${
                          selectedColor === swatch.hex
                            ? 'border-ink bg-paper ring-1 ring-ink'
                            : 'border-line hover:border-ink/50'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20"
                          style={{ backgroundColor: swatch.hex }}
                        />
                        <span className="text-[11px] text-ink">{swatch.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Selector with Size Guide Link */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black tracking-widest text-ink uppercase">
                      SELECT SIZE
                    </span>
                    <button
                      onClick={() => setShowSizeGuide(!showSizeGuide)}
                      className="text-[10px] font-bold text-muted hover:text-ink underline flex items-center gap-1"
                    >
                      <Ruler className="w-3 h-3" />
                      Size Guide
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {product.sizes?.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 text-xs font-black uppercase border transition-all ${
                          selectedSize === size
                            ? 'bg-ink text-white border-ink shadow-[2px_2px_0px_#d7ff36]'
                            : 'bg-white text-ink border-line hover:border-ink'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  {/* Size Guide Drawer Accordion */}
                  {showSizeGuide && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-3 p-3 bg-paper border border-line text-[11px]"
                    >
                      <table className="w-full text-left font-mono">
                        <thead>
                          <tr className="border-b border-line text-[10px] text-muted">
                            <th>SIZE</th>
                            <th>CHEST</th>
                            <th>LENGTH</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td>S</td><td>42 in</td><td>28 in</td></tr>
                          <tr><td>M</td><td>44 in</td><td>29 in</td></tr>
                          <tr><td>L</td><td>46 in</td><td>30 in</td></tr>
                          <tr><td>XL</td><td>48 in</td><td>31 in</td></tr>
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                </div>

                {/* Fabric Specifications list */}
                <div className="space-y-1 mb-6">
                  {product.specs?.slice(0, 3).map((spec, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-[#444] font-medium">
                      <Check className="w-3.5 h-3.5 text-lime-dark" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={handleAdd}
                  className={`w-full py-4 text-xs font-black tracking-widest uppercase border border-ink transition-all duration-200 flex items-center justify-center gap-2 shadow-[4px_4px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                    added
                      ? 'bg-ink text-lime'
                      : 'bg-lime text-neutral-950 hover:bg-ink hover:text-lime'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>ADDED TO YOUR BAG</span>
                    </>
                  ) : (
                    <>
                      <span>ADD TO BAG — {rupee(product.price)}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-[10px] font-bold text-muted mt-3">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> FREE DELIVERY &gt; ₹1,499
                  </span>
                  <span>7-DAY EASY EXCHANGES</span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
