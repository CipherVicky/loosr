import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';
import { SlidersHorizontal } from 'lucide-react';

const categories = ['All', 'T-Shirts', 'Shirts', 'Jeans', 'Hoodies', 'Jackets'];

export default function ProductGrid({
  products,
  activeCategory,
  onSelectCategory,
  onAddToCart,
  onOpenQuickView,
}) {
  const filtered = products.filter(
    (p) => activeCategory === 'All' || p.cat === activeCategory
  );

  return (
    <section id="shop" className="py-16 md:py-24 border-b border-line bg-paper">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8">
        
        {/* Section Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-[11px] font-black tracking-widest text-muted uppercase">
              THE FIRST DROP · COLLECTION 01
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-ink uppercase mt-2">
              BUILT FOR EVERYDAY<span className="text-lime">.</span>
            </h2>
          </div>

          {/* Filter Pills with Motion indicator */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`relative px-4 py-2 text-xs font-black tracking-wider uppercase rounded-full transition-all duration-200 border whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-ink text-paper border-ink shadow-sm'
                    : 'bg-card text-ink border-line hover:border-ink hover:bg-paper'
                }`}
              >
                {cat}
                {activeCategory === cat && (
                  <motion.div
                    layoutId="activeFilterPill"
                    className="absolute inset-0 rounded-full border-2 border-lime pointer-events-none"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onOpenQuickView={onOpenQuickView}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-16 bg-card border border-line">
            <SlidersHorizontal className="w-8 h-8 mx-auto text-muted mb-3" />
            <h3 className="text-base font-black text-ink uppercase">No items found</h3>
            <p className="text-xs text-muted mt-1">
              Try switching back to ALL to see the complete drop.
            </p>
            <button
              onClick={() => onSelectCategory('All')}
              className="mt-4 px-4 py-2 bg-lime text-neutral-950 text-xs font-black uppercase border border-ink shadow-[2px_2px_0px_#111111]"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
