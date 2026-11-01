import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rupee } from '../data/products';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  user,
  onUpdateQty,
  onRemoveItem,
  onPlaceOrder,
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.phone) setPhone(user.phone);
      if (user.address) setAddress(user.address);
    }
  }, [user]);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const freeShippingThreshold = 1499;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert('Please fill in your name, 10-digit phone, and delivery address.');
      return;
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      alert('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    // Launch celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#d7ff36', '#111111', '#ffffff', '#a83b2e'],
    });

    onPlaceOrder({
      userId: user?.id || null,
      email: user?.email || '',
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      method: paymentMethod,
      items: [...cart],
      total: subtotal,
    });

    // Reset fields
    setName('');
    setPhone('');
    setAddress('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Dim Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Slide-out Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-md bg-paper border-l border-ink h-full flex flex-col justify-between shadow-2xl z-10 overflow-y-auto no-scrollbar"
          >
            {/* Header */}
            <div className="p-6 border-b border-line bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-black tracking-widest text-muted uppercase">
                    YOUR BAG
                  </div>
                  <h2 className="text-2xl font-black text-ink uppercase tracking-tight">
                    THE GOOD STUFF<span className="text-lime">.</span>
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 bg-paper hover:bg-ink hover:text-white border border-line flex items-center justify-center transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Free Shipping Progress Indicator */}
              <div className="mt-4 pt-3 border-t border-line/60">
                <div className="flex justify-between text-[11px] font-bold text-ink mb-1.5">
                  <span>
                    {amountNeeded === 0 ? (
                      <span className="text-lime-dark font-black flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> FREE SHIPPING UNLOCKED!
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

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto bg-card border border-line flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-muted" />
                  </div>
                  <h3 className="font-black text-base text-ink uppercase">Your bag is empty</h3>
                  <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
                    Go find your fit in the first drop.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-5 px-6 py-3 bg-lime text-ink text-xs font-black uppercase border border-ink shadow-[3px_3px_0px_#111111]"
                  >
                    CONTINUE SHOPPING
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
                    className="p-3.5 bg-card border border-line flex gap-4 items-center justify-between"
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
                        {item.label}
                      </div>
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-xs text-ink truncate uppercase">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-muted font-bold mt-0.5">
                        <span>SIZE: {item.chosenSize || 'L'}</span>
                        <span>•</span>
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full border border-black/20"
                          style={{ backgroundColor: item.chosenColor || item.garment }}
                        />
                      </div>
                      <div className="font-black text-xs text-ink mt-1">
                        {rupee(item.price)}
                      </div>
                    </div>

                    {/* Quantity Controls & Remove */}
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => onRemoveItem(item)}
                        className="text-muted hover:text-brandRed p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center border border-line bg-white">
                        <button
                          onClick={() => onUpdateQty(item, -1)}
                          className="px-2 py-1 hover:bg-paper text-xs font-black"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-black">{item.qty}</span>
                        <button
                          onClick={() => onUpdateQty(item, 1)}
                          className="px-2 py-1 hover:bg-paper text-xs font-black"
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

            {/* Bottom Checkout Section */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-line bg-card">
                {/* Total */}
                <div className="flex justify-between items-baseline mb-4">
                  <span className="text-xs font-black tracking-wider uppercase text-muted">
                    SUBTOTAL
                  </span>
                  <span className="text-2xl font-black text-ink">
                    {rupee(subtotal)}
                  </span>
                </div>

                {/* Quick Checkout Form */}
                <form onSubmit={handleSubmitOrder} className="space-y-2.5">
                  <div className="text-[10px] font-black tracking-widest text-ink uppercase">
                    DELIVERY DETAILS
                  </div>
                  
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-line bg-white focus:outline-none focus:border-ink"
                  />

                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-2.5 border border-line bg-white focus:outline-none focus:border-ink font-mono"
                  />

                  <input
                    type="text"
                    required
                    placeholder="House, Street, City, PIN Code"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs p-2.5 border border-line bg-white focus:outline-none focus:border-ink"
                  />

                  <div className="pt-1">
                    <label className="text-[10px] font-black tracking-widest text-ink uppercase block mb-1">
                      PAYMENT METHOD
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full text-xs p-2.5 border border-line bg-white focus:outline-none focus:border-ink"
                    >
                      <option value="cod">Cash on Delivery (Demo instant order)</option>
                      <option value="payu">Pay online with PayU (Sandbox demo)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-3 py-3.5 bg-lime hover:bg-ink hover:text-lime text-ink text-xs font-black tracking-widest uppercase border border-ink shadow-[4px_4px_0px_#111111] transition-all duration-200 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    PLACE DEMO ORDER ↗
                  </button>
                </form>

                <p className="text-[10px] text-muted text-center mt-3 leading-tight">
                  Demo store: Orders will record into your live Admin Control Room.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
