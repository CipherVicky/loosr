import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Truck,
  ArrowLeft,
  CheckCircle2,
  Lock,
  CreditCard,
  QrCode,
  Banknote,
  Building,
  Plus,
  Minus,
  Trash2,
  AlertCircle,
  Package,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { rupee } from '../data/products';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Puducherry', 'Jammu & Kashmir', 'Ladakh'
];

export default function CheckoutPage({
  cart = [],
  user = null,
  onUpdateQty,
  onRemoveItem,
  onPlaceOrder,
  onOpenAuth,
  onGoBackToShop,
}) {
  // Customer details form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('');
  
  // Payment method (COD only for now)
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Submission & Confirmation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Auto-populate when user is logged in
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
      if (user.address) {
        // If address is stored as a single string, populate street
        setStreet(user.address);
      }
    }
  }, [user]);

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.qty) || 1), 0);
  const totalItemsCount = cart.reduce((acc, item) => acc + (Number(item.qty) || 1), 0);
  const shippingFee = 0; // Free express delivery
  const codFee = 0; // Free COD
  const grandTotal = subtotal + shippingFee + codFee;

  // Validation
  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Please enter your full name';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number';
    }
    if (!street.trim()) errors.street = 'Please enter your house/flat, street and locality';
    if (!city.trim()) errors.city = 'Please enter your city';
    const cleanPin = pincode.replace(/\D/g, '');
    if (!cleanPin || cleanPin.length !== 6) {
      errors.pincode = 'Please enter a valid 6-digit PIN code';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!validateForm()) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    const fullAddress = `${street.trim()}, ${city.trim()}, ${stateName} - ${pincode.trim()}`;
    const generatedOrderNumber = `LS-${Date.now().toString().slice(-6)}`;

    const orderPayload = {
      userId: user?.id || null,
      orderNumber: generatedOrderNumber,
      customerName: name.trim(),
      customerEmail: email.trim(),
      customerPhone: phone.replace(/\D/g, ''),
      deliveryAddress: fullAddress,
      total: grandTotal,
      paymentMethod: 'cod',
      items: [...cart],
    };

    try {
      if (onPlaceOrder) {
        await onPlaceOrder({
          name: name.trim(),
          email: email.trim(),
          phone: phone.replace(/\D/g, ''),
          address: fullAddress,
          total: grandTotal,
          method: 'cod',
          items: [...cart],
          orderNumber: generatedOrderNumber,
        });
      }

      // Celebratory Confetti!
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#d7ff36', '#111111', '#ffffff', '#22c55e'],
      });

      setConfirmedOrder({
        orderNumber: generatedOrderNumber,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.replace(/\D/g, ''),
        deliveryAddress: fullAddress,
        total: grandTotal,
        paymentMethod: 'Cash on Delivery (COD)',
        items: [...cart],
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Order placement error:', err);
      alert('Failed to place order. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. ORDER CONFIRMED RECEIPT SCREEN
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-paper py-12 px-4 sm:px-6 lg:px-8 border-b border-line">
        <div className="max-w-2xl mx-auto bg-card border-2 border-ink shadow-[8px_8px_0px_#111111] p-6 sm:p-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#d7ff36] border-2 border-ink mx-auto flex items-center justify-center rounded-full mb-4 shadow-[3px_3px_0px_#111111]">
              <CheckCircle2 className="w-9 h-9 text-ink" />
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-ink text-[#d7ff36] uppercase tracking-widest">
              ORDER CONFIRMED
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-ink uppercase tracking-tight mt-2">
              THANK YOU FOR YOUR ORDER<span className="text-lime">.</span>
            </h1>
            <p className="text-xs text-muted font-medium mt-1">
              Your order <strong className="text-ink font-mono">#{confirmedOrder.orderNumber}</strong> has been received and logged directly into the database.
            </p>
          </div>

          <div className="mt-8 border-t border-b border-line py-5 space-y-3 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-muted">Order Number:</span>
              <span className="font-bold text-ink">#{confirmedOrder.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Payment Mode:</span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-300">
                Cash on Delivery (COD)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Total Payable:</span>
              <span className="font-black text-ink text-sm">{rupee(confirmedOrder.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Estimated Delivery:</span>
              <span className="font-bold text-ink">3 - 5 Business Days</span>
            </div>
            <div className="pt-2 border-t border-line/60">
              <span className="text-muted block mb-1">Delivering to:</span>
              <div className="font-sans font-bold text-ink">{confirmedOrder.customerName} ({confirmedOrder.customerPhone})</div>
              <div className="text-neutral-600 font-sans text-xs mt-0.5">{confirmedOrder.deliveryAddress}</div>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="mt-6">
            <div className="text-[11px] font-black uppercase text-muted tracking-wider mb-3">
              PURCHASED GARMENTS ({confirmedOrder.items.length})
            </div>
            <div className="space-y-2">
              {confirmedOrder.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-paper border border-line text-xs font-mono">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-black text-ink">• {it.name}</span>
                    <span className="text-muted">({it.chosenSize || 'L'}, {it.chosenColor || 'Ink'})</span>
                    <span className="text-neutral-500">×{it.qty || 1}</span>
                  </div>
                  <span className="font-black text-ink whitespace-nowrap">
                    {rupee((it.price || 0) * (it.qty || 1))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onGoBackToShop}
              className="flex-1 py-3.5 bg-lime hover:bg-ink hover:text-lime text-neutral-950 font-black text-xs font-mono uppercase tracking-wider border border-ink shadow-[3px_3px_0px_#111111] transition-all"
            >
              CONTINUE SHOPPING ↗
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. EMPTY CART VIEW
  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] bg-paper flex items-center justify-center p-6 border-b border-line">
        <div className="max-w-md w-full bg-card border-2 border-ink p-8 text-center shadow-[6px_6px_0px_#111111]">
          <div className="w-16 h-16 mx-auto bg-paper border border-line flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 text-muted" />
          </div>
          <h2 className="text-2xl font-black text-ink uppercase tracking-tight">Your Bag is Empty</h2>
          <p className="text-xs text-muted mt-2">
            Add garments from the collection before proceeding to checkout.
          </p>
          <button
            onClick={onGoBackToShop}
            className="mt-6 w-full py-3 bg-lime text-neutral-950 font-black text-xs font-mono uppercase tracking-wider border border-ink shadow-[3px_3px_0px_#111111] hover:bg-ink hover:text-lime transition-all"
          >
            EXPLORE THE FIRST DROP ↗
          </button>
        </div>
      </div>
    );
  }

  // 3. MAIN CHECKOUT WORKFLOW
  return (
    <div className="min-h-screen bg-paper py-8 md:py-12 border-b border-line">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={onGoBackToShop}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO COLLECTION</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
            <span className="text-muted">1. BAG</span>
            <span className="text-muted">→</span>
            <span className="font-bold text-ink bg-lime px-2 py-0.5 border border-ink">2. CHECKOUT & COD</span>
            <span className="text-muted">→</span>
            <span className="text-muted">3. DISPATCH</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 7 COLUMNS: CUSTOMER DETAILS & PAYMENT METHOD */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header */}
            <div>
              <div className="text-[11px] font-black tracking-widest text-muted uppercase">
                FINAL STEP · INSTANT CHECKOUT
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-ink uppercase tracking-tight mt-1">
                DELIVERY & PAYMENT<span className="text-lime">.</span>
              </h1>
            </div>

            {/* Account Status Card */}
            <div className="p-4 bg-card border border-line flex items-center justify-between gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#d7ff36] border border-ink flex items-center justify-center font-black text-xs">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-ink">
                      Ordering as <span className="font-black">{user.name}</span>
                    </div>
                    <div className="text-[11px] text-muted font-mono">{user.email}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="text-xs font-bold text-ink">Guest Checkout</div>
                    <div className="text-[11px] text-muted">
                      No account needed to place an order.
                    </div>
                  </div>
                  {onOpenAuth && (
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="text-xs font-black uppercase text-ink underline hover:text-lime-dark"
                    >
                      Log in for saved addresses
                    </button>
                  )}
                </div>
              )}
            </div>

            <form onSubmit={handleConfirmOrder} className="space-y-6">
              
              {/* SECTION 1: CONTACT INFORMATION */}
              <div className="bg-card border border-line p-5 md:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <h2 className="text-xs font-black tracking-wider text-ink uppercase flex items-center gap-2">
                    <span className="w-5 h-5 bg-ink text-white rounded-full flex items-center justify-center text-[10px] font-mono">1</span>
                    <span>CONTACT DETAILS</span>
                  </h2>
                  <span className="text-[10px] font-mono text-muted">For SMS & WhatsApp updates</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-ink mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vicky Raghav"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (formErrors.name) setFormErrors({ ...formErrors, name: null });
                      }}
                      className={`w-full p-2.5 text-xs font-medium border bg-white focus:outline-none focus:border-ink ${
                        formErrors.name ? 'border-rose-500' : 'border-line'
                      }`}
                    />
                    {formErrors.name && (
                      <p className="text-[10px] text-rose-500 mt-1 font-mono">{formErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-ink mb-1">
                      Mobile Number (10 Digits) *
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-xs font-mono font-bold bg-neutral-100 border border-r-0 border-line text-neutral-600">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setPhone(val);
                          if (formErrors.phone) setFormErrors({ ...formErrors, phone: null });
                        }}
                        className={`w-full p-2.5 text-xs font-mono font-bold border bg-white focus:outline-none focus:border-ink ${
                          formErrors.phone ? 'border-rose-500' : 'border-line'
                        }`}
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="text-[10px] text-rose-500 mt-1 font-mono">{formErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-ink mb-1">
                    Email Address (For Order Receipt) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="vicky@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (formErrors.email) setFormErrors({ ...formErrors, email: null });
                    }}
                    className={`w-full p-2.5 text-xs font-medium border bg-white focus:outline-none focus:border-ink ${
                      formErrors.email ? 'border-rose-500' : 'border-line'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-[10px] text-rose-500 mt-1 font-mono">{formErrors.email}</p>
                  )}
                </div>
              </div>

              {/* SECTION 2: SHIPPING ADDRESS */}
              <div className="bg-card border border-line p-5 md:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <h2 className="text-xs font-black tracking-wider text-ink uppercase flex items-center gap-2">
                    <span className="w-5 h-5 bg-ink text-white rounded-full flex items-center justify-center text-[10px] font-mono">2</span>
                    <span>DELIVERY ADDRESS</span>
                  </h2>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">ALL-INDIA FREE SHIPPING</span>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-ink mb-1">
                    House / Flat No., Building, Street & Area *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Door No. 42, 3rd Floor, Lake View Residency, 100ft Road"
                    value={street}
                    onChange={(e) => {
                      setStreet(e.target.value);
                      if (formErrors.street) setFormErrors({ ...formErrors, street: null });
                    }}
                    className={`w-full p-2.5 text-xs font-medium border bg-white focus:outline-none focus:border-ink resize-none ${
                      formErrors.street ? 'border-rose-500' : 'border-line'
                    }`}
                  />
                  {formErrors.street && (
                    <p className="text-[10px] text-rose-500 mt-1 font-mono">{formErrors.street}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-ink mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Chennai"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        if (formErrors.city) setFormErrors({ ...formErrors, city: null });
                      }}
                      className={`w-full p-2.5 text-xs font-medium border bg-white focus:outline-none focus:border-ink ${
                        formErrors.city ? 'border-rose-500' : 'border-line'
                      }`}
                    />
                    {formErrors.city && (
                      <p className="text-[10px] text-rose-500 mt-1 font-mono">{formErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-ink mb-1">
                      State *
                    </label>
                    <select
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full p-2.5 text-xs font-medium border border-line bg-white focus:outline-none focus:border-ink"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-ink mb-1">
                      PIN Code (6 Digits) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="600001"
                      value={pincode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setPincode(val);
                        if (formErrors.pincode) setFormErrors({ ...formErrors, pincode: null });
                      }}
                      className={`w-full p-2.5 text-xs font-mono font-bold border bg-white focus:outline-none focus:border-ink ${
                        formErrors.pincode ? 'border-rose-500' : 'border-line'
                      }`}
                    />
                    {formErrors.pincode && (
                      <p className="text-[10px] text-rose-500 mt-1 font-mono">{formErrors.pincode}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: PAYMENT METHOD (COD ACTIVE, OTHERS DISABLED FOR NOW) */}
              <div className="bg-card border border-line p-5 md:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <h2 className="text-xs font-black tracking-wider text-ink uppercase flex items-center gap-2">
                    <span className="w-5 h-5 bg-ink text-white rounded-full flex items-center justify-center text-[10px] font-mono">3</span>
                    <span>PAYMENT METHOD</span>
                  </h2>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-300">
                    COD READY & ACTIVE
                  </span>
                </div>

                <div className="space-y-3">
                  
                  {/* OPTION 1: CASH ON DELIVERY (ACTIVE & RECOMMENDED) */}
                  <label className="block relative p-4 bg-white border-2 border-ink shadow-[3px_3px_0px_#d7ff36] cursor-pointer">
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mt-1 accent-neutral-950 w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-emerald-600" />
                            <span className="font-black text-xs text-ink uppercase tracking-wider">
                              CASH ON DELIVERY (COD)
                            </span>
                          </div>
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-emerald-500 text-white uppercase tracking-wider">
                            ACTIVE & VERIFIED
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-600 mt-1 leading-relaxed">
                          Pay directly with cash or UPI scan at your door when the courier arrives. 100% risk-free.
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* OPTION 2: UPI / QR (DISABLED FOR NOW) */}
                  <div className="relative p-4 bg-neutral-100/70 border border-neutral-300 opacity-60 cursor-not-allowed select-none">
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        disabled
                        className="mt-1 w-4 h-4 cursor-not-allowed"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-neutral-400" />
                            <span className="font-bold text-xs text-neutral-600 uppercase tracking-wider">
                              UPI / QR (GPAY, PHONEPE, PAYTM)
                            </span>
                          </div>
                          <span className="text-[9px] font-mono px-2 py-0.5 bg-neutral-200 text-neutral-600 border border-neutral-300 uppercase">
                            TEMPORARILY DISABLED
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          Payment gateway integration in progress — Please select Cash on Delivery above.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* OPTION 3: CREDIT / DEBIT CARDS (DISABLED FOR NOW) */}
                  <div className="relative p-4 bg-neutral-100/70 border border-neutral-300 opacity-60 cursor-not-allowed select-none">
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        disabled
                        className="mt-1 w-4 h-4 cursor-not-allowed"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-neutral-400" />
                            <span className="font-bold text-xs text-neutral-600 uppercase tracking-wider">
                              CREDIT / DEBIT CARD (VISA, MASTERCARD)
                            </span>
                          </div>
                          <span className="text-[9px] font-mono px-2 py-0.5 bg-neutral-200 text-neutral-600 border border-neutral-300 uppercase">
                            TEMPORARILY DISABLED
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          Online card processing temporarily disabled until gateway activation.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* OPTION 4: NET BANKING (DISABLED FOR NOW) */}
                  <div className="relative p-4 bg-neutral-100/70 border border-neutral-300 opacity-60 cursor-not-allowed select-none">
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        disabled
                        className="mt-1 w-4 h-4 cursor-not-allowed"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-neutral-400" />
                            <span className="font-bold text-xs text-neutral-600 uppercase tracking-wider">
                              NET BANKING
                            </span>
                          </div>
                          <span className="text-[9px] font-mono px-2 py-0.5 bg-neutral-200 text-neutral-600 border border-neutral-300 uppercase">
                            TEMPORARILY DISABLED
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          Direct bank transfers currently unavailable.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* REAL ORDER SUBMISSION BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full py-4 bg-lime hover:bg-ink hover:text-lime text-neutral-950 font-black text-sm tracking-widest uppercase border-2 border-ink shadow-[4px_4px_0px_#111111] transition-all duration-200 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                      <span>SECURING ORDER...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>CONFIRM ORDER (CASH ON DELIVERY) — {rupee(grandTotal)}</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-muted text-center mt-3 font-mono">
                  By clicking Confirm Order, you agree to receive delivery updates via SMS and WhatsApp.
                </p>
              </div>

            </form>

          </div>

          {/* RIGHT 5 COLUMNS: STICKY ORDER SUMMARY */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            
            <div className="bg-card border-2 border-ink p-5 md:p-6 shadow-[6px_6px_0px_#111111]">
              <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
                <h3 className="font-black text-xs uppercase tracking-wider text-ink flex items-center gap-2">
                  <Package className="w-4 h-4 text-lime-dark" />
                  <span>ORDER SUMMARY ({totalItemsCount} ITEMS)</span>
                </h3>
                <span className="text-xs font-mono font-bold text-ink">{rupee(subtotal)}</span>
              </div>

              {/* Cart Items List */}
              <div className="max-h-[340px] overflow-y-auto space-y-3 pr-1 divide-y divide-line/60">
                {cart.map((item, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 flex items-center gap-3">
                    {/* Thumbnail */}
                    <div
                      className="w-14 h-14 flex-shrink-0 flex items-center justify-center border border-line"
                      style={{ backgroundColor: item.bg || '#eee' }}
                    >
                      <div
                        className="garment-clip w-7 h-9 flex items-center justify-center text-[6px] font-black"
                        style={{
                          backgroundColor: item.chosenColor || item.garment,
                          color: item.ink || '#fff',
                        }}
                      >
                        {item.label || 'LS'}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-xs text-ink truncate uppercase">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-muted font-mono mt-0.5">
                        <span className="font-bold text-ink bg-neutral-100 px-1.5 py-0.2 border border-line">
                          {item.chosenSize || 'L'}
                        </span>
                        <span>•</span>
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full border border-black/20"
                          style={{ backgroundColor: item.chosenColor || item.garment }}
                          title={item.chosenColor}
                        />
                      </div>
                      <div className="font-black text-xs text-ink mt-1">
                        {rupee(item.price)}
                      </div>
                    </div>

                    {/* Quantity Selector & Trash */}
                    <div className="flex flex-col items-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item)}
                        className="text-neutral-400 hover:text-rose-500 p-0.5 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>

                      <div className="flex items-center border border-line bg-white">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item, -1)}
                          className="px-1.5 py-0.5 hover:bg-neutral-100 text-xs font-black"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="px-1.5 text-xs font-mono font-bold">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item, 1)}
                          className="px-1.5 py-0.5 hover:bg-neutral-100 text-xs font-black"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="mt-5 pt-4 border-t border-line space-y-2 text-xs font-mono">
                <div className="flex justify-between text-neutral-600">
                  <span>Bag Subtotal</span>
                  <span>{rupee(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Express Courier Delivery</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Cash on Delivery Handling</span>
                  <span className="text-emerald-600 font-bold">FREE (₹0)</span>
                </div>
                <div className="pt-3 border-t border-line flex justify-between items-baseline font-sans">
                  <span className="font-black text-sm uppercase text-ink">Total Payable</span>
                  <span className="font-black text-2xl text-ink font-mono">{rupee(grandTotal)}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-4 border-t border-line/60 space-y-2 text-[11px] text-neutral-600 font-mono">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>100% Heavyweight 280 GSM Pure Cotton</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Dispatch within 24 hours · Doorstep Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>7-Day Hassle-Free Size Exchange & Returns</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
