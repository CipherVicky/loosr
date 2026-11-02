import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Eye, Check, AlertCircle } from 'lucide-react';
import { rupee } from '../data/products';

export default function ProductCard({
  product,
  onAddToCart,
  onUpdateQty,
  cart = [],
  cartItem,
  cartQty = 0,
  onOpenQuickView,
}) {
  const [selectedColor, setSelectedColor] = useState(product.garment);
  const [selectedInk, setSelectedInk] = useState(product.ink);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizePrompt, setSizePrompt] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [justAddedAnim, setJustAddedAnim] = useState(false);

  // Available sizes
  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL'];

  // Check matching item in cart for the chosen size and color
  const matchedCartItem = selectedSize
    ? cart.find(
        (x) =>
          x.id === product.id &&
          x.chosenSize === selectedSize &&
          (!x.chosenColor || x.chosenColor === selectedColor)
      )
    : null;

  // Active quantity for the currently chosen size
  const activeSizeQty = matchedCartItem ? matchedCartItem.qty : 0;

  // Any size of this product in cart (for indicator)
  const totalInCartForProduct = cart
    .filter((x) => x.id === product.id)
    .reduce((sum, it) => sum + (it.qty || 1), 0);

  const handleSelectSize = (e, size) => {
    e.stopPropagation();
    setSelectedSize(size);
    setSizePrompt(false);
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();

    if (!selectedSize) {
      setSizePrompt(true);
      setTimeout(() => setSizePrompt(false), 2500);
      return;
    }

    if (onAddToCart) {
      onAddToCart({
        ...product,
        chosenColor: selectedColor,
        chosenSize: selectedSize,
      });
      setJustAddedAnim(true);
      setTimeout(() => setJustAddedAnim(false), 1200);
    }
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (matchedCartItem && onUpdateQty) {
      onUpdateQty(matchedCartItem, 1);
    } else {
      handleAddToCartClick(e);
    }
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (matchedCartItem && onUpdateQty) {
      onUpdateQty(matchedCartItem, -1);
    }
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
      {/* 1. Product Visual Area */}
      <div
        className="relative h-[250px] sm:h-[270px] flex items-center justify-center overflow-hidden transition-colors duration-500"
        style={{ backgroundColor: product.bg }}
      >
        {/* Badge Tag */}
        <span className="absolute top-3 left-3 bg-white border border-ink/10 text-ink text-[10px] font-black tracking-wider px-2 py-1 uppercase z-10 shadow-sm">
          {product.tag || 'NEW'}
        </span>

        {/* Total In Cart Badge (if items exist in bag) */}
        {totalInCartForProduct > 0 && (
          <span className="absolute top-3 left-16 bg-[#d7ff36] border border-ink text-neutral-950 text-[10px] font-mono font-bold px-2 py-0.5 uppercase z-10 shadow-sm">
            {totalInCartForProduct} IN BAG
          </span>
        )}

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
              <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/10 pointer-events-none" />
              <span className="font-black text-lg tracking-tight select-none -rotate-6">
                {product.label}
              </span>
            </div>
          )}
        </motion.div>
      </div>

      {/* 2. Product Meta & Size Selection Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[10px] font-black tracking-widest text-muted uppercase">
            {product.cat}
          </div>
          <h3 className="font-black text-sm text-ink tracking-tight mt-0.5 group-hover:text-ink/80 transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Price & Color Swatches */}
        <div className="mt-3 pt-2.5 border-t border-line/60 flex items-center justify-between">
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
                type="button"
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

        {/* 3. SIZE SELECTION (Always asks size of user before adding) */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3 pt-2.5 border-t border-line/60"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase text-muted tracking-wider">
              SELECT SIZE:
            </span>
            {selectedSize ? (
              <span className="text-[10px] font-mono font-bold text-ink">
                CHOSEN: <strong className="text-black bg-lime px-1.5 py-0.2 border border-ink">{selectedSize}</strong>
              </span>
            ) : (
              <span className={`text-[10px] font-mono transition-colors ${sizePrompt ? 'text-rose-600 font-bold animate-pulse' : 'text-neutral-400'}`}>
                {sizePrompt ? '⚠️ PLEASE PICK A SIZE' : 'REQUIRED'}
              </span>
            )}
          </div>

          {/* Size Pill Buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            {sizes.map((size) => {
              const isSelected = selectedSize === size;
              const hasInCart = cart.some(
                (x) => x.id === product.id && x.chosenSize === size
              );
              return (
                <button
                  key={size}
                  type="button"
                  onClick={(e) => handleSelectSize(e, size)}
                  className={`py-1.5 text-xs font-black font-mono uppercase border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-ink text-white border-ink shadow-[2px_2px_0px_#d7ff36] scale-102'
                      : sizePrompt
                      ? 'border-rose-400 bg-rose-50 text-ink animate-bounce'
                      : 'bg-card text-ink border-line hover:border-ink hover:bg-paper'
                  }`}
                >
                  <span>{size}</span>
                  {hasInCart && (
                    <span className="absolute top-0.5 right-1 w-1.5 h-1.5 bg-[#d7ff36] rounded-full" title="In Bag" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. UNDER PRODUCT ACTION: Add to Bag or '- 1 +' Quantity Stepper */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3"
        >
          {selectedSize && activeSizeQty > 0 ? (
            /* Quantity Stepper when item in this chosen size is in bag */
            <div className="w-full bg-ink text-white border border-ink flex items-center justify-between px-2.5 py-1.5 shadow-[2px_2px_0px_#d7ff36]">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-7 h-7 flex items-center justify-center bg-neutral-900 hover:bg-lime hover:text-ink text-white transition-all font-black border border-white/20 active:scale-90 cursor-pointer"
                title="Decrease quantity"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1.5 font-mono text-xs font-black select-none">
                <span className="text-lime text-sm font-bold">{activeSizeQty}</span>
                <span className="text-[10px] text-neutral-300 uppercase tracking-wider font-sans">
                  IN BAG ({selectedSize})
                </span>
              </div>

              <button
                type="button"
                onClick={handleIncrement}
                className="w-7 h-7 flex items-center justify-center bg-lime text-ink hover:bg-white transition-all font-black border border-ink active:scale-90 cursor-pointer"
                title="Increase quantity"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Add to Bag Button (Prompts size if not chosen) */
            <button
              type="button"
              onClick={handleAddToCartClick}
              className={`w-full py-2.5 text-[11px] font-black uppercase tracking-wider border border-ink transition-all flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer ${
                justAddedAnim
                  ? 'bg-ink text-[#d7ff36]'
                  : selectedSize
                  ? 'bg-lime hover:bg-ink hover:text-lime text-neutral-950'
                  : 'bg-paper hover:bg-neutral-100 text-ink'
              }`}
            >
              {justAddedAnim ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#d7ff36]" />
                  <span>ADDED {selectedSize} TO BAG</span>
                </>
              ) : selectedSize ? (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD SIZE {selectedSize} TO BAG</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 text-muted" />
                  <span>CHOOSE SIZE TO ADD</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
