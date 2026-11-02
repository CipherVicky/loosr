import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, SlidersHorizontal, Search, ArrowRight, ShieldCheck, Box, ShoppingBag, Check } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function ShopPage({
  products,
  categoryFilter = 'All',
  onSelectCategory,
  onAddToCart,
  onUpdateQty,
  cart = [],
  onOpenQuickView,
  onInspect3D,
  onOpenCart,
}) {
  const [selectedCat, setSelectedCat] = useState(categoryFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-low', 'price-high'

  // Available categories
  const categories = ['All', 'T-Shirts', 'Hoodies', 'Shirts', 'Jeans', 'Jackets'];

  // Update filter when prop changes
  React.useEffect(() => {
    setSelectedCat(categoryFilter);
  }, [categoryFilter]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCat = selectedCat === 'All' || p.cat.toLowerCase() === selectedCat.toLowerCase();
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        return a.id === 101 ? -1 : 1; // Prioritize flagship Drop 101 on featured
      });
  }, [products, selectedCat, searchQuery, sortBy]);

  const handleBuyNow = (product) => {
    onAddToCart(product);
    if (onOpenCart) {
      setTimeout(() => onOpenCart(), 250);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink pb-24">
      {/* Page Header Banner */}
      <section className="border-b border-line bg-paper/60 backdrop-blur-sm pt-8 pb-10 px-4 md:px-8">
        <div className="max-w-[1240px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-lime/20 border border-lime text-neutral-950 text-[10px] font-black tracking-widest uppercase mb-4">
                <Sparkles className="w-3 h-3 text-lime-dark" />
                DEDICATED CATALOGUE
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                {selectedCat === 'All' ? 'FULL COLLECTION' : `${selectedCat.toUpperCase()} DROP`}
              </h1>
              <p className="text-xs md:text-sm font-medium text-muted mt-3 max-w-xl">
                Heavyweight 280 GSM combed cotton garments engineered with architectural boxy cuts.
                Every piece is manufactured in strictly limited runs.
              </p>
            </div>

            {/* Quick 360 Feature Trigger */}
            <div className="flex items-center gap-3">
              <button
                onClick={onInspect3D}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-ink text-paper text-xs font-black tracking-wider uppercase border border-ink hover:bg-lime hover:text-neutral-950 transition-colors shadow-[3px_3px_0px_#d7ff36] active:translate-x-0.5 active:translate-y-0.5"
              >
                <Box className="w-4 h-4" />
                <span>OPEN 360° INSPECT</span>
              </button>
            </div>
          </div>

          {/* Category Tabs & Filter Toolbar */}
          <div className="mt-8 pt-6 border-t border-line/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCat(cat);
                    if (onSelectCategory) onSelectCategory(cat);
                  }}
                  className={`px-4 py-2 text-xs font-black tracking-wider uppercase border transition-all duration-200 whitespace-nowrap ${
                    selectedCat.toLowerCase() === cat.toLowerCase()
                      ? 'bg-ink text-paper border-ink shadow-[2px_2px_0px_#d7ff36]'
                      : 'bg-card text-ink border-line hover:border-ink'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search and Sort */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-60">
                <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="SEARCH CATALOGUE..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-card border border-line pl-9 pr-3 py-2 text-xs font-black text-ink placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors uppercase tracking-wider"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-card text-ink border border-line px-3 py-2 text-xs font-black uppercase tracking-wider focus:outline-none focus:border-ink transition-colors cursor-pointer"
              >
                <option value="featured">FEATURED</option>
                <option value="price-low">PRICE: LOW TO HIGH</option>
                <option value="price-high">PRICE: HIGH TO LOW</option>
              </select>
            </div>

          </div>
        </div>
      </section>

      {/* Product Results Grid */}
      <section className="max-w-[1240px] mx-auto px-4 md:px-8 mt-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-black tracking-wider uppercase text-muted">
            SHOWING {filteredProducts.length} {filteredProducts.length === 1 ? 'PRODUCT' : 'PRODUCTS'}
          </p>
          <div className="flex items-center gap-4 text-xs font-black tracking-wider uppercase text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-lime"></span>
              READY TO DISPATCH
            </span>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-line p-8">
            <p className="text-sm font-black uppercase tracking-wider text-muted">
              NO PRODUCTS FOUND FOR "{searchQuery}"
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCat('All');
              }}
              className="mt-4 px-4 py-2 bg-ink text-paper text-xs font-black tracking-wider uppercase hover:bg-lime hover:text-neutral-950 transition-colors"
            >
              RESET FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const cartItem = cart.find((item) => item.id === product.id);
              const cartQty = cart
                .filter((item) => item.id === product.id)
                .reduce((sum, item) => sum + item.qty, 0);

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onUpdateQty={onUpdateQty}
                  cart={cart}
                  cartItem={cartItem}
                  cartQty={cartQty}
                  onOpenQuickView={onOpenQuickView}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Floating Direct Checkout Bar if Cart Has Items */}
      <section className="max-w-[1240px] mx-auto px-4 md:px-8 mt-16">
        <div className="bg-card border border-ink p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[6px_6px_0px_#111111]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-lime flex items-center justify-center border border-ink font-black text-neutral-950">
              <ShieldCheck className="w-6 h-6 text-neutral-950" />
            </div>
            <div>
              <h3 className="font-black text-sm md:text-base tracking-tight uppercase">
                GUARANTEED PREMIUM 280 GSM WEIGHT
              </h3>
              <p className="text-xs text-muted font-medium mt-0.5">
                Free domestic courier on orders above ₹1,499. Easy 7-day exchanges.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenCart}
            className="w-full md:w-auto px-6 py-3.5 bg-lime text-neutral-950 font-black text-xs tracking-wider uppercase border border-ink hover:bg-ink hover:text-lime transition-all duration-200 shadow-[3px_3px_0px_#111111] flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>VIEW BAG & CHECKOUT</span>
          </button>
        </div>
      </section>
    </div>
  );
}
