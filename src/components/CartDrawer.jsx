import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { rupee } from '../data/products';

export default function CartDrawer({
  isOpen,
  onClose,
  cart = [],
  onUpdateQty,
  onRemoveItem,
  onProceedToCheckout,
}) {
  // Prevent background page scrolling and interaction when bag is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const subtotal = cart.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.qty) || 1), 0);
  const totalCount = cart.reduce((acc, item) => acc + (Number(item.qty) || 1), 0);
  const freeShippingThreshold = 1499;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          
          {/* Dim Backdrop: blocks all clicks and scrolls to background page */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto"
          />

          {/* Slide-out Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-md bg-paper border-l-2 border-ink h-full flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10"
          >
            {/* 1. Bag Header */}
            <div className="p-5 md:p-6 border-b border-line bg-card flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-black tracking-widest text-muted uppercase">
                    YOUR BAG ({totalCount} {totalCount === 1 ? 'ITEM' : 'ITEMS'})
                  </div>
                  <h2 className="text-2xl font-black text-ink uppercase tracking-tight">
                    THE GOOD STUFF<span className="text-lime">.</span>
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 bg-paper hover:bg-ink hover:text-white border border-line flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Progress Indicator */}
              <div className="mt-4 pt-3 border-t border-line/60">
                <div className="flex justify-between text-[11px] font-bold text-ink mb-1.5 font-mono">
                  <span>
                    {amountNeeded === 0 ? (
                      <span className="text-emerald-600 font-black flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#d7ff36]" /> FREE ALL-INDIA SHIPPING UNLOCKED!
                      </span>
                    ) : (
                      `Add ${rupee(amountNeeded)} more for FREE SHIPPING`
                    )}
                  </span>
                  <span>{Math.round(progressToFreeShipping)}%</span>
                </div>
                <div className="w-full h-1.5 bg-line overflow-hidden rounded-full">
                  <div
                    className="h-full bg-lime transition-all duration-500 ease-out"
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 2. Scrollable Bag Items List (All info clearly visible & smooth scroll) */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-5 md:p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto bg-card border border-line flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-muted" />
                  </div>
                  <h3 className="font-black text-base text-ink uppercase">Your bag is empty</h3>
                  <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
                    Select your size and add garments from the first drop.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-5 px-6 py-3 bg-lime text-neutral-950 text-xs font-black uppercase border border-ink shadow-[3px_3px_0px_#111111] hover:bg-ink hover:text-lime transition-all cursor-pointer"
                  >
                    CONTINUE SHOPPING ↗
                  </button>
                </div>
              ) : (
                cart.map((item, index) => (
                  <motion.div
                    key={`${item.id}-${item.chosenColor}-${item.chosenSize}-${index}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-card border border-line flex gap-3.5 items-center justify-between shadow-sm hover:border-ink transition-colors"
                  >
                    {/* Item Thumbnail */}
                    <div
                      className="w-16 h-16 flex-shrink-0 flex items-center justify-center border border-line"
                      style={{ backgroundColor: item.bg || '#eee' }}
                    >
                      <div
                        className="garment-clip w-8 h-10 flex items-center justify-center text-[7px] font-black"
                        style={{
                          backgroundColor: item.chosenColor || item.garment,
                          color: item.ink || '#fff',
                        }}
                      >
                        {item.label || 'LS'}
                      </div>
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-xs text-ink truncate uppercase">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-muted font-mono font-bold mt-0.5">
                        <span className="bg-neutral-100 text-ink px-1.5 py-0.2 border border-line font-black">
                          SIZE: {item.chosenSize || 'L'}
                        </span>
                        <span>•</span>
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full border border-black/20"
                          style={{ backgroundColor: item.chosenColor || item.garment }}
                          title={item.chosenColor}
                        />
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-black text-xs text-ink">
                          {rupee(item.price)}
                        </span>
                        {item.qty > 1 && (
                          <span className="text-[10px] text-muted font-mono">
                            (Total: {rupee(item.price * item.qty)})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls & Remove */}
                    <div className="flex flex-col items-end gap-2">
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item)}
                        className="text-neutral-400 hover:text-rose-500 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center border border-line bg-white shadow-sm">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item, -1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-paper text-xs font-black transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono font-black select-none">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item, 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-paper text-xs font-black transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* 3. Bottom Checkout Section (Clean total & Proceed to Checkout button) */}
            {cart.length > 0 && (
              <div className="p-5 md:p-6 border-t-2 border-line bg-card flex-shrink-0 space-y-3">
                {/* Price Breakdown */}
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span>{rupee(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Express Delivery</span>
                    <span className="text-emerald-600 font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-line/60">
                    <span className="font-sans font-black text-sm uppercase text-ink">
                      ESTIMATED TOTAL
                    </span>
                    <span className="text-2xl font-black text-ink font-mono">
                      {rupee(subtotal)}
                    </span>
                  </div>
                </div>

                {/* Big Proceed to Checkout Button */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onProceedToCheckout) onProceedToCheckout();
                  }}
                  className="w-full py-4 bg-lime hover:bg-ink hover:text-lime text-neutral-950 text-xs font-black tracking-widest uppercase border-2 border-ink shadow-[4px_4px_0px_#111111] transition-all duration-200 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-3 text-[10px] text-muted font-mono pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Cash on Delivery Available
                  </span>
                  <span>•</span>
                  <span>Free 7-Day Exchange</span>
                </div>
              </div>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
