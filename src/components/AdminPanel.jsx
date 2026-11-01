import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Plus, ShieldAlert, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { rupee } from '../data/products';

export default function AdminPanel({
  onBackToStore,
  products,
  onAddProduct,
  orders,
}) {
  const [newTitle, setNewTitle] = useState('');
  const [newCat, setNewCat] = useState('T-Shirts');
  const [newPrice, setNewPrice] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const totalRevenue = 48590 + orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrdersCount = 24 + orders.length;

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice) return;

    const priceNum = Number(newPrice);
    onAddProduct({
      id: Date.now(),
      name: newTitle.trim(),
      cat: newCat,
      price: priceNum,
      old: Math.round(priceNum * 1.25),
      tag: 'JUST ADDED',
      bg: '#e2e4db',
      garment: '#202020',
      ink: '#d7ff36',
      label: 'LOOSR',
      description: 'Newly released street silhouette added via merchant dashboard.',
      specs: ['100% Ring-spun cotton', 'Custom washed dye', 'Drop-shoulder cut'],
      swatches: [
        { name: 'Onyx', hex: '#202020', ink: '#d7ff36' },
        { name: 'Raw Paper', hex: '#e7e4dc', ink: '#171717' },
      ],
      sizes: ['S', 'M', 'L', 'XL'],
    });

    setNewTitle('');
    setNewPrice('');
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 2000);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="py-12 md:py-16 bg-paper min-h-[90vh]"
    >
      <div className="max-w-[1240px] mx-auto px-4 md:px-8">
        
        {/* Header & Back to Store */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-line mb-8">
          <div>
            <div className="text-[11px] font-black tracking-widest text-muted uppercase">
              LOOSR CONTROL ROOM · LIVE DEMO
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-ink uppercase tracking-tight mt-1">
              STORE OVERVIEW<span className="text-lime">.</span>
            </h1>
            <p className="text-xs text-muted mt-1">
              Real-time demo dashboard · Session updates will reflect across the store immediately.
            </p>
          </div>

          <button
            onClick={onBackToStore}
            className="inline-flex items-center gap-2 px-5 py-3 bg-ink text-white hover:bg-lime hover:text-ink text-xs font-black tracking-wider uppercase border border-ink transition-colors shadow-[3px_3px_0px_#111111]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO STOREFRONT</span>
          </button>
        </div>

        {/* Metric Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-line p-5">
            <span className="text-[10px] font-black text-muted tracking-widest uppercase block">
              TOTAL SALES
            </span>
            <strong className="text-2xl sm:text-3xl font-black text-ink block mt-2">
              {rupee(totalRevenue)}
            </strong>
            <span className="text-[10px] text-lime-dark font-black tracking-wider uppercase mt-1 block">
              ↑ 18.4% THIS MONTH
            </span>
          </div>

          <div className="bg-card border border-line p-5">
            <span className="text-[10px] font-black text-muted tracking-widest uppercase block">
              TOTAL ORDERS
            </span>
            <strong className="text-2xl sm:text-3xl font-black text-ink block mt-2">
              {totalOrdersCount}
            </strong>
            <span className="text-[10px] text-muted font-bold tracking-wider uppercase mt-1 block">
              {orders.length} IN THIS SESSION
            </span>
          </div>

          <div className="bg-card border border-line p-5">
            <span className="text-[10px] font-black text-muted tracking-widest uppercase block">
              CATALOG PRODUCTS
            </span>
            <strong className="text-2xl sm:text-3xl font-black text-ink block mt-2">
              {products.length}
            </strong>
            <span className="text-[10px] text-muted font-bold tracking-wider uppercase mt-1 block">
              ACTIVE STYLES
            </span>
          </div>

          <div className="bg-card border border-line p-5">
            <span className="text-[10px] font-black text-muted tracking-widest uppercase block">
              LOW STOCK ALERTS
            </span>
            <strong className="text-2xl sm:text-3xl font-black text-brandRed block mt-2">
              3
            </strong>
            <span className="text-[10px] text-muted font-bold tracking-wider uppercase mt-1 block">
              BOX TEE &amp; CARGO JACKET
            </span>
          </div>
        </div>

        {/* Two-Column Grid: Orders Table & Product Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Orders Table */}
          <div className="lg:col-span-2 bg-card border border-line p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-base text-ink uppercase tracking-tight">
                RECENT ORDERS
              </h3>
              <span className="text-[10px] font-black text-muted tracking-wider uppercase">
                REAL-TIME STREAM
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium">
                <thead>
                  <tr className="border-b border-line text-[10px] font-black text-muted tracking-wider uppercase">
                    <th className="py-2.5">ORDER ID</th>
                    <th className="py-2.5">CUSTOMER</th>
                    <th className="py-2.5">ITEMS</th>
                    <th className="py-2.5">AMOUNT</th>
                    <th className="py-2.5">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {/* Session placed orders */}
                  {orders.map((ord, idx) => (
                    <tr key={idx} className="bg-lime/10">
                      <td className="py-3 font-mono font-bold text-ink">
                        #LS-DEMO-{String(idx + 1).padStart(3, '0')}
                      </td>
                      <td className="py-3 font-bold">{ord.name}</td>
                      <td className="py-3 text-muted truncate max-w-[180px]">
                        {ord.items.map((i) => `${i.name} (${i.chosenSize || 'L'}) ×${i.qty}`).join(', ')}
                      </td>
                      <td className="py-3 font-bold">{rupee(ord.total)}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 text-[9px] font-black bg-lime text-ink border border-ink">
                          COD DEMO
                        </span>
                      </td>
                    </tr>
                  ))}

                  {/* Seeded orders */}
                  <tr>
                    <td className="py-3 font-mono text-ink">#LS-1024</td>
                    <td className="py-3">Rahul K.</td>
                    <td className="py-3 text-muted">Oversized Graphic Tee ×1</td>
                    <td className="py-3 font-bold">₹899</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 text-[9px] font-black bg-[#e7f6d3] text-emerald-900">
                        PAID
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-mono text-ink">#LS-1023</td>
                    <td className="py-3">Priya S.</td>
                    <td className="py-3 text-muted">Everyday Hoodie ×1</td>
                    <td className="py-3 font-bold">₹1,799</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 text-[9px] font-black bg-[#fff0c4] text-amber-900">
                        PROCESSING
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-mono text-ink">#LS-1022</td>
                    <td className="py-3">Arjun M.</td>
                    <td className="py-3 text-muted">Relaxed Fit Denim ×1</td>
                    <td className="py-3 font-bold">₹1,999</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 text-[9px] font-black bg-neutral-200 text-neutral-800">
                        SHIPPED
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Product Form & PayU status */}
          <div className="space-y-6">
            
            {/* Add Product */}
            <div className="bg-card border border-line p-6">
              <h3 className="font-black text-base text-ink uppercase tracking-tight mb-2">
                ADD A PRODUCT
              </h3>
              <p className="text-xs text-muted mb-4">
                Instantly injects an item into your active storefront catalog.
              </p>

              <form onSubmit={handleCreateProduct} className="space-y-3">
                <div>
                  <label className="text-[10px] font-black text-ink uppercase tracking-wider block mb-1">
                    PRODUCT NAME
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acid Wash Oversized Hoodie"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-xs p-2.5 border border-line bg-white focus:outline-none focus:border-ink"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-ink uppercase tracking-wider block mb-1">
                    CATEGORY
                  </label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    className="w-full text-xs p-2.5 border border-line bg-white focus:outline-none focus:border-ink"
                  >
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Shirts">Shirts</option>
                    <option value="Jeans">Jeans</option>
                    <option value="Hoodies">Hoodies</option>
                    <option value="Jackets">Jackets</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-ink uppercase tracking-wider block mb-1">
                    PRICE (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="1299"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full text-xs p-2.5 border border-line bg-white focus:outline-none focus:border-ink"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-ink hover:bg-lime hover:text-ink text-white text-xs font-black tracking-widest uppercase border border-ink transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ PUBLISH TO STORE</span>
                </button>

                {formSuccess && (
                  <div className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2 border border-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Added to catalog! Check storefront.
                  </div>
                )}
              </form>
            </div>

            {/* Payment Gateway Specs Card */}
            <div className="bg-card border border-line p-5">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-ink">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>PAYU PAYMENT INTEGRATION</span>
              </div>
              <p className="text-[11px] text-muted mt-2 leading-relaxed">
                For live production checkout, create backend server order hashes with server-side merchant keys before redirecting to PayU sandbox or production gateway.
              </p>
              <span className="inline-block mt-3 px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-black uppercase">
                STATUS: TEST / SANDBOX MODE
              </span>
            </div>

          </div>

        </div>

      </div>
    </motion.section>
  );
}
