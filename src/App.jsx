import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { initialProducts } from './data/products';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ScrollShowcase from './components/ScrollShowcase';
import ProductGrid from './components/ProductGrid';
import Lookbook from './components/Lookbook';
import QuickViewModal from './components/QuickViewModal';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import AdminPage from './pages/AdminPage';
import ShopPage from './pages/ShopPage';
import Inspect360Page from './pages/Inspect360Page';
import LookbookPage from './pages/LookbookPage';
import StoryPage from './pages/StoryPage';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { ArrowLeft, Home, Sparkles } from 'lucide-react';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'shop', 'anatomy', 't-shirts', 'hoodies', 'lookbook', 'story'
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Theme Management (Light <-> Dark)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('loosr_theme');
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('loosr_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // User Authentication & Profile States
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [toast, setToast] = useState({ message: '', isVisible: false });
  const lenisRef = useRef(null);

  // Synchronize route & hash changes
  useEffect(() => {
    const handleRouteSync = () => {
      const path = window.location.pathname;
      const hash = window.location.hash.toLowerCase().replace('#', '');
      setCurrentPath(path);

      if (['admin', 'users', 'database', 'orders', 'owner'].includes(hash)) {
        window.history.replaceState(null, '', '/admin');
        setCurrentPath('/admin');
        return;
      }

      if (['shop', 'anatomy', '360', 't-shirts', 'hoodies', 'lookbook', 'story'].includes(hash)) {
        setActiveTab(hash === '360' ? 'anatomy' : hash);
      }
    };

    handleRouteSync();
    window.addEventListener('popstate', handleRouteSync);
    window.addEventListener('hashchange', handleRouteSync);
    return () => {
      window.removeEventListener('popstate', handleRouteSync);
      window.removeEventListener('hashchange', handleRouteSync);
    };
  }, []);

  const handleSelectTab = (tabId, category = null) => {
    setActiveTab(tabId);
    if (category) {
      setActiveCategory(category);
    }
    window.location.hash = tabId === 'home' ? '' : tabId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to sync cart with database for logged-in user
  const syncCartToDb = (newCart) => {
    const token = localStorage.getItem('loosr_token');
    if (token) {
      fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cart: newCart }),
      }).catch((err) => console.error('Cart sync error:', err));
    }
  };

  const fetchUserCart = (token) => {
    fetch('/api/cart', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject('Failed to fetch cart')))
      .then((data) => {
        if (data && Array.isArray(data.cart) && data.cart.length > 0) {
          setCart(data.cart);
        }
      })
      .catch((err) => console.error('Load cart error:', err));
  };

  // Initialize user session on mount
  useEffect(() => {
    const token = localStorage.getItem('loosr_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject('Invalid token')))
        .then((data) => {
          if (data && data.user) {
            setUser(data.user);
            fetchUserCart(token);
          }
        })
        .catch(() => {
          localStorage.removeItem('loosr_token');
        });
    }
  }, []);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    });
    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const showToast = (message) => {
    setToast({ message, isVisible: true });
    setTimeout(() => {
      setToast({ message: '', isVisible: false });
    }, 2500);
  };

  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (x) =>
          x.id === product.id &&
          x.chosenColor === (product.chosenColor || product.garment) &&
          x.chosenSize === (product.chosenSize || 'L')
      );

      let next;
      if (existingIndex > -1) {
        next = [...prev];
        next[existingIndex].qty += 1;
      } else {
        next = [
          ...prev,
          {
            ...product,
            qty: 1,
            chosenColor: product.chosenColor || product.garment,
            chosenSize: product.chosenSize || 'L',
          },
        ];
      }
      syncCartToDb(next);
      return next;
    });
    setIsCartOpen(true);
    showToast(`Added ${product.name} to bag`);
  };

  const handleUpdateQty = (index, delta) => {
    setCart((prev) => {
      const next = prev
        .map((item, i) => (i === index ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0);
      syncCartToDb(next);
      return next;
    });
  };

  const handleRemoveItem = (index) => {
    setCart((prev) => {
      const next = prev.filter((_, i) => i !== index);
      syncCartToDb(next);
      return next;
    });
    showToast('Item removed');
  };

  const handlePlaceOrder = async (orderDetails) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          customerName: orderDetails.name,
          customerEmail: user?.email || orderDetails.email || '',
          customerPhone: orderDetails.phone,
          deliveryAddress: orderDetails.address,
          total: orderDetails.total,
          paymentMethod: orderDetails.method,
          items: orderDetails.items,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast(`Order #${data.orderNumber} confirmed! Saved in database.`);
      } else {
        showToast('Order confirmed locally.');
      }
    } catch (err) {
      console.error(err);
      showToast('Order confirmed.');
    }

    setCart([]);
    syncCartToDb([]);
    setIsCartOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('loosr_token');
    setUser(null);
    setIsProfileOpen(false);
    showToast('Logged out successfully');
  };

  const scrollToSection = (sectionId) => {
    if (activeTab !== 'home') {
      setActiveTab('home');
      window.location.hash = '';
    }
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        if (lenisRef.current) {
          lenisRef.current.scrollTo(el, { offset: -80 });
        } else {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 150);
  };

  const cartTotalCount = cart.reduce((acc, item) => acc + item.qty, 0);

  // If URL path is /admin, render dedicated standalone Admin Portal
  if (currentPath === '/admin' || currentPath.startsWith('/admin')) {
    return <AdminPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink selection:bg-lime selection:text-neutral-950 transition-colors duration-200">
      
      {/* Top Navbar with Theme Switcher & Animated Underline Links */}
      <Navbar
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Breadcrumb Sub-bar when viewing a specific section tab */}
      {activeTab !== 'home' && (
        <div className="bg-card border-b border-line py-2.5 px-4 md:px-8 text-xs font-mono font-bold uppercase flex items-center justify-between z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSelectTab('home')}
              className="text-muted hover:text-ink flex items-center gap-1 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>LOOSR</span>
            </button>
            <span className="text-muted">/</span>
            <span className="text-ink">
              {activeTab === 'anatomy' ? '360° INSPECT' : activeTab.toUpperCase()}
            </span>
          </div>

          <button
            onClick={() => handleSelectTab('home')}
            className="text-[11px] font-mono text-muted hover:text-ink flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>FULL HOME VIEW</span>
          </button>
        </div>
      )}

      {/* Main Content Area: Dedicated Tab Pages or Full Homepage */}
      <main className="flex-1">
        
        {/* TAB: SHOP ALL */}
        {activeTab === 'shop' && (
          <ShopPage
            products={products}
            categoryFilter="All"
            onSelectCategory={setActiveCategory}
            onAddToCart={handleAddToCart}
            onOpenQuickView={(p) => setQuickViewProduct(p)}
            onInspect3D={() => handleSelectTab('anatomy')}
          />
        )}

        {/* TAB: T-SHIRTS */}
        {activeTab === 't-shirts' && (
          <ShopPage
            products={products}
            categoryFilter="T-Shirts"
            onSelectCategory={setActiveCategory}
            onAddToCart={handleAddToCart}
            onOpenQuickView={(p) => setQuickViewProduct(p)}
            onInspect3D={() => handleSelectTab('anatomy')}
          />
        )}

        {/* TAB: HOODIES */}
        {activeTab === 'hoodies' && (
          <ShopPage
            products={products}
            categoryFilter="Hoodies"
            onSelectCategory={setActiveCategory}
            onAddToCart={handleAddToCart}
            onOpenQuickView={(p) => setQuickViewProduct(p)}
            onInspect3D={() => handleSelectTab('anatomy')}
          />
        )}

        {/* TAB: 360° INSPECT LAB */}
        {activeTab === 'anatomy' && (
          <Inspect360Page
            onAddToCart={handleAddToCart}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}

        {/* TAB: LOOKBOOK */}
        {activeTab === 'lookbook' && (
          <LookbookPage
            onAddToCart={handleAddToCart}
            onOpenQuickView={(p) => setQuickViewProduct(p)}
            onShopCategory={(cat) => handleSelectTab(cat.toLowerCase(), cat)}
          />
        )}

        {/* TAB: OUR STORY */}
        {activeTab === 'story' && (
          <StoryPage onShopClick={() => handleSelectTab('shop')} />
        )}

        {/* TAB: HOME (Unified Flagship Showcase) */}
        {activeTab === 'home' && (
          <>
            <Hero
              onShopClick={() => handleSelectTab('shop')}
              onLookbookClick={() => handleSelectTab('lookbook')}
            />

            <ScrollShowcase onAddToCart={handleAddToCart} />

            <ProductGrid
              products={products}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              onAddToCart={handleAddToCart}
              onOpenQuickView={(p) => setQuickViewProduct(p)}
            />

            <Lookbook
              onShopCategory={(cat) => {
                setActiveCategory(cat);
                handleSelectTab('shop');
              }}
            />

            <Footer onShopClick={() => handleSelectTab('shop')} />
          </>
        )}

        {/* Standard Footer on dedicated tabs as well */}
        {activeTab !== 'home' && (
          <Footer onShopClick={() => handleSelectTab('shop')} />
        )}

      </main>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Slide-out Cart Drawer with Spring Physics & Direct Order Checkout */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        user={user}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onPlaceOrder={handlePlaceOrder}
      />

      {/* Login & Register Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          const token = localStorage.getItem('loosr_token');
          if (token) fetchUserCart(token);
          showToast(`Welcome, ${loggedInUser.name}!`);
        }}
      />

      {/* User Profile & Order History Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUpdateUser={(updated) => {
          setUser(updated);
          showToast('Profile updated!');
        }}
        onLogout={handleLogout}
      />

      {/* Toast Notification */}
      <Toast message={toast.message} isVisible={toast.isVisible} />
    </div>
  );
}
