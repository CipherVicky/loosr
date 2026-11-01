import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, SlidersHorizontal, Search, ArrowRight, ShieldCheck, Box } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function ShopPage({
  products,
  categoryFilter = 'All',
  onSelectCategory,
  onAddToCart,
  onOpenQuickView,
  onInspect3D,
}) {
  const [selectedCat, setSelectedCat] = useState(categoryFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-low', 'price-high'

  // Categories
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

  // Dynamic Page Header Info
  const headerInfo = useMemo(() => {
    if (selectedCat === 'T-Shirts') {
      return {
        badge: 'HEAVYWEIGHT STREETWEAR TEES',
        title: 'BOX TEES & GRAPHICS',
        desc: 'Engineered from 240-280 GSM French combed cotton. Dropped shoulders, reinforced high-tensile 1.25" rib collars, and durable puff print typography.',
      };
    }
    if (selectedCat === 'Hoodies') {
      return {
        badge: 'HEAVYWEIGHT WINTER FLEECE',
        title: '400 GSM HOODIES & PULLOVERS',
        desc: 'Pre-shrunk brushed terry cotton with seamless double-layered crossover hoods. Built with brutalist streetwear drape and zero drawstrings.',
      };
    }
    return {
      badge: 'OFFICIAL STORE CATALOG',
      title: 'ALL COLLECTIONS',
      desc: 'Explore the full independent LOOSR apparel lineup. Every piece is crafted in India with ultra-dense fabrics, custom garment dyes, and bar-tack reinforcements.',
    };
  }, [selectedCat]);

  return (
    <div className="min-h-screen py-10 md:py-16">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8">
        
        {/* Collection Hero Banner */}
        <div className="relative mb-12 p-8 md:p-12 bg-card border border-line overflow-hidden shadow-sm">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-lime/20 border border-lime text-ink text-[10px] font-black tracking-widest uppercase mb-4">
              <Sparkles className="w-3 h-3 text-ink" />
              {headerInfo.badge}
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-ink leading-none mb-4">
              {headerInfo.title}
              <span className="text-lime">.</span>
            </h1>
            <p className="text-xs md:text-sm text-muted font-medium leading-relaxed">
              {headerInfo.desc}
            </p>
          </div>

          {/* Quick 3D Inspect Spotlight Badge for Flagship Drop */}
          {selectedCat === 'T-Shirts' && (
            <div className="mt-6 pt-6 border-t border-line/60 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-ink">
                <span className="w-2 h-2 rounded-full bg-lime animate-pulse"></span>
                <span>FEATURED: KEEP GOD FIRST Heavy Box Tee (Drop 001)</span>
              </div>
              <button
                onClick={() => onInspect3D && onInspect3D()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-paper text-xs font-black tracking-wider uppercase border border-ink hover:bg-lime hover:text-ink transition-colors shadow-[2px_2px_0px_#d7ff36]"
              >
                <Box className="w-4 h-4 text-lime" />
                <span>OPEN 3D 360° LAB</span>
              </button>
            </div>
          )}
        </div>

        {/* Toolbar: Category Filter Pills, Search Bar, and Sort */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 pb-6 border-b border-line">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCat(cat);
                  if (onSelectCategory) onSelectCategory(cat);
                }}
                className={`px-4 py-2 text-xs font-black tracking-wider uppercase transition-all duration-200 border whitespace-nowrap ${
                  selectedCat.toLowerCase() === cat.toLowerCase()
                    ? 'bg-ink text-paper border-ink shadow-[2px_2px_0px_#d7ff36]'
                    : 'bg-paper text-muted border-line hover:border-ink hover:text-ink'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search garments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card text-xs text-ink pl-8 pr-3 py-2 border border-line focus:outline-none focus:border-ink font-medium"
              />
            </div>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-card text-xs text-ink px-3 py-2 border border-line focus:outline-none focus:border-ink font-black tracking-wider uppercase cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

        </div>

        {/* Product Cards Grid with Direct Checkout & Size Select */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onOpenQuickView={onOpenQuickView}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-line">
            <p className="text-sm font-black tracking-widest text-muted uppercase">
              No garments found matching "{searchQuery}"
            </p>
            <button
              onClick={() => {
                setSelectedCat('All');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-ink text-paper text-xs font-black tracking-wider uppercase hover:bg-lime hover:text-ink transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Proof of Quality Banner */}
        <div className="mt-16 p-6 bg-card border border-line flex flex-wrap items-center justify-around gap-6 text-xs font-bold text-muted uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-lime" />
            <span>240-280 GSM BIO-WASH COTTON</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lime"></span>
            <span>FREE DELIVERY OVER ₹1,499</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-ink"></span>
            <span>7-DAY EASY SIZE EXCHANGES</span>
          </div>
        </div>

      </div>
    </div>
  );
}
