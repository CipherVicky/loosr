import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Menu, X, Sparkles } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({
  cartCount,
  onOpenCart,
  user,
  onOpenAuth,
  onOpenProfile,
  activeTab = 'home',
  onSelectTab,
  theme,
  onToggleTheme,
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'SHOP ALL', id: 'shop', cat: 'All' },
    { name: '360° INSPECT', id: 'anatomy' },
    { name: 'T-SHIRTS', id: 't-shirts', cat: 'T-Shirts' },
    { name: 'HOODIES', id: 'hoodies', cat: 'Hoodies' },
    { name: 'LOOKBOOK', id: 'lookbook' },
    { name: 'OUR STORY', id: 'story' },
  ];

  const handleLinkClick = (link) => {
    if (onSelectTab) {
      onSelectTab(link.id, link.cat);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-ink text-paper text-center py-2 px-4 text-[11px] font-black tracking-widest uppercase border-b border-line/20 flex items-center justify-center gap-3 transition-colors duration-200">
        <span className="w-1.5 h-1.5 rounded-full bg-lime animate-ping"></span>
        <span>NEW DROP LIVE — FREE SHIPPING ON ORDERS ABOVE ₹1,499</span>
      </div>

      {/* Main Navigation Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-paper/90 backdrop-blur-md border-b border-line py-3.5 shadow-sm'
            : 'bg-paper border-b border-line py-4'
        }`}
      >
        <div className="max-w-[1240px] mx-auto px-4 md:px-8 flex items-center justify-between">
          
          {/* Brand Logo - Returns to Home */}
          <button
            onClick={() => {
              if (onSelectTab) onSelectTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-center text-left"
            title="LOOSR Homepage"
          >
            <span className="font-black text-2xl sm:text-3xl tracking-tighter text-ink transition-transform duration-200 group-hover:scale-105">
              LOOSR
            </span>
            <span className="font-black text-2xl sm:text-3xl text-lime transition-transform duration-200 group-hover:rotate-12 inline-block">
              .
            </span>
          </button>

          {/* Desktop Nav Links with Sliding Underline Hover Animation */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link)}
                  className={`nav-underline-anim text-xs font-black tracking-wider transition-colors duration-200 uppercase relative ${
                    isActive
                      ? 'text-ink font-black'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  {link.name}

                  {/* Active Tab Spring Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTabIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-[2px] bg-lime"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Nav Right CTAs: Theme Switcher, User Auth/Profile & Bag */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Theme Toggle (Light <-> Dark) */}
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />

            {/* User Profile / Login Button */}
            {user ? (
              <button
                onClick={onOpenProfile}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-black tracking-wider uppercase border border-ink bg-white text-ink hover:bg-ink hover:text-white transition-all duration-200 shadow-[2px_2px_0px_#111111]"
                title="View your profile and past orders"
              >
                <div className="w-4 h-4 rounded-full bg-lime text-neutral-950 flex items-center justify-center text-[9px] font-black">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline truncate max-w-[90px]">
                  {user.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-black tracking-wider uppercase border border-line bg-white text-ink hover:border-ink hover:bg-paper transition-all duration-200 shadow-sm"
                title="Login or register an account"
              >
                <User className="w-3.5 h-3.5 text-muted" />
                <span className="hidden sm:inline">LOGIN</span>
              </button>
            )}

            {/* Shopping Bag Button */}
            <motion.button
              onClick={onOpenCart}
              whileTap={{ scale: 0.94 }}
              className="relative inline-flex items-center gap-2 bg-lime text-neutral-950 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-black tracking-wider uppercase border border-ink hover:bg-ink hover:text-lime transition-colors duration-200 shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>BAG</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="bg-neutral-950 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black group-hover:bg-lime group-hover:text-neutral-950"
                >
                  {cartCount}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-ink border border-line bg-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-line bg-paper px-6 py-4 flex flex-col gap-3 overflow-hidden shadow-xl"
            >
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link)}
                  className={`text-left text-xs font-black tracking-wider py-2.5 border-b border-line/60 flex items-center justify-between ${
                    activeTab === link.id ? 'text-lime-dark font-black' : 'text-ink'
                  }`}
                >
                  <span>{link.name}</span>
                  {activeTab === link.id && (
                    <span className="w-2 h-2 rounded-full bg-lime"></span>
                  )}
                </button>
              ))}

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-bold text-muted uppercase">COLOR THEME</span>
                <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
              </div>

              {user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="text-left text-xs font-black tracking-wider text-lime-dark py-2 flex items-center gap-2 border-t border-line/60 pt-3"
                >
                  <User className="w-4 h-4" />
                  <span>PROFILE ({user.name})</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="text-left text-xs font-black tracking-wider text-ink py-2 flex items-center gap-2 border-t border-line/60 pt-3"
                >
                  <User className="w-4 h-4" />
                  <span>LOGIN / REGISTER</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
