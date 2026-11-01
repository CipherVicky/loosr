import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Eye, Check } from 'lucide-react';
import { rupee } from '../data/products';

export default function ProductCard({
  product,
  onAddToCart,
  onOpenQuickView,
}) {
  const [selectedColor, setSelectedColor] = useState(product.garment);
  const [selectedInk, setSelectedInk] = useState(product.ink);
  const [isHovered, setIsHovered] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    onAddToCart({
      ...product,
      chosenColor: selectedColor,
      chosenSize: product.sizes?.[0] || 'L',
    });
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onOpenQuickView(product)}
      className="group relative bg-card border border-line flex flex-col justify-between cursor-pointer hover:border-ink transition-colors duration-300 shadow-sm hover:shadow-md"
    >
      {/* Product Visual Area */}
      <div
        className="relative h-[250px] sm:h-[270px] flex items-center justify-center overflow-hidden transition-colors duration-500"
        style={{ backgroundColor: product.bg }}
      >
        {/* Badge Tag */}
        <span className="absolute top-3 left-3 bg-white border border-ink/10 text-ink text-[10px] font-black tracking-wider px-2 py-1 uppercase z-10 shadow-sm">
          {product.tag || 'NEW'}
        </span>

        {/* Quick View Lens Indicator on hover */}
        <motion.div
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          className="absolute top-3 right-3 bg-neutral-950 text-white p-1.5 rounded-full z-10 shadow-sm"
          title="Quick View"
        >
          <Eye className="w-3.5 h-3.5" />
        </motion.div>

        {/* T-Shirt Visual (Real Image Dual-View or Dynamic Silhouette) */}
        <motion.div
          animate={{
            scale: isHovered ? 1.08 : 1,
            rotate: isHovered ? (product.id % 2 === 0 ? 3 : -3) : 0,
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="relative z-0 flex items-center justify-center w-full h-full p-4"
        >
          {product.frontImg ? (
            <div className="relative w-[180px] h-[190px] flex items-center justify-center">
              {/* Front Image */}
              <img
                src={product.frontImg}
                alt={product.name}
                className={`absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_10px_16px_rgba(0,0,0,0.15)] transition-opacity duration-300 ${
                  isHovered && product.backImg ? 'opacity-0' : 'opacity-100'
                }`}
              />
              {/* Back Image on Hover */}
              {product.backImg && (
                <img
                  src={product.backImg}
                  alt={`${product.name} Back`}
                  className={`absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_10px_16px_rgba(0,0,0,0.15)] transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              )}
            </div>
          ) : (
            <div
              className="garment-clip hard-shadow-sm w-[130px] h-[160px] flex items-center justify-center transition-colors duration-300 relative"
              style={{
                backgroundColor: selectedColor,
                color: selectedInk,
              }}
            >
              {/* Subtle highlight gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/10 pointer-events-none" />
              <span className="font-black text-lg tracking-tight select-none -rotate-6">
                {product.label}
              </span>
            </div>
          )}
        </motion.div>

        {/* Quick Add Button in Bottom Right */}
        <button
          onClick={handleQuickAdd}
          className={`absolute bottom-3 right-3 px-3.5 py-2 text-[10px] font-black tracking-wider uppercase border border-ink transition-all duration-200 z-10 shadow-[2px_2px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 ${
            addedAnim
              ? 'bg-ink text-lime border-ink'
              : 'bg-lime text-neutral-950 hover:bg-ink hover:text-lime'
          }`}
        >
          {addedAnim ? (
            <>
              <Check className="w-3 h-3 text-lime" />
              <span>ADDED</span>
            </>
          ) : (
            <>
              <Plus className="w-3 h-3" />
              <span>QUICK ADD</span>
            </>
          )}
        </button>

        {/* Floating Quick Size Selector on Hover */}
        <motion.div
          initial={false}
          animate={{
            y: isHovered ? 0 : 20,
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-3 left-3 flex gap-1 z-10"
        >
          {product.sizes?.map((size) => (
            <span
              key={size}
              className="bg-white/90 backdrop-blur-sm border border-line text-[9px] font-black text-ink px-1.5 py-0.5"
            >
              {size}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Product Information Card */}
      <div className="p-4 flex flex-col justify-between flex-grow border-t border-line">
        <div>
          <div className="text-[11px] font-extrabold tracking-wider text-muted uppercase">
            {product.cat}
          </div>
          <h3 className="font-black text-sm text-ink tracking-tight mt-0.5 group-hover:text-ink/80 transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <strong className="font-black text-base text-ink">
              {rupee(product.price)}
            </strong>
            {product.old && (
              <span className="text-xs text-muted line-through font-semibold">
                {rupee(product.old)}
              </span>
            )}
          </div>

          {/* Interactive Color Swatch Selector */}
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {product.swatches?.map((swatch, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedColor(swatch.hex);
                  if (swatch.ink) setSelectedInk(swatch.ink);
                }}
                className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                  selectedColor === swatch.hex
                    ? 'scale-125 border-ink ring-1 ring-ink'
                    : 'border-black/20 hover:scale-110'
                }`}
                style={{ backgroundColor: swatch.hex }}
                title={swatch.name}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
