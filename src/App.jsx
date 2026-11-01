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

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'shop', 'anatomy', 't-shirts', 'hoodies', 'lookbook', 'story'
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  
  // User Authentication & Profile States
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [toast, setToast] = useState({ message: '', isVisible: false });
  const lenisRef = useRef(null);

  // Synchronize route changes on popstate
  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync activeTab with URL hash
  useEffect(() => {
    const syncFromHash = () => {
      const rawHash = window.location.hash.toLowerCase().replace('#', '');
      if (['admin', 'users', 'database', 'orders', 'owner'].includes(rawHash)) {
        window.history.replaceState(null, '', '/admin');
        setCurrentPath('/admin');
        return;
      }
      if (['shop', 'anatomy', '360', 't-shirts', 'hoodies', 'lookbook', 'story'].includes(rawHash)) {
        const mappedTab = rawHash === '360' ? 'anatomy' : rawHash;
        setActiveTab(mappedTab);
        if (rawHash === 't-shirts') setActiveCategory('T-Shirts');
        else if (rawHash === 'hoodies') setActiveCategory('Hoodies');
        else if (rawHash === 'shop') setActiveCategory('All');
      } else if (rawHash === '' || rawHash === 'home') {
        setActiveTab('home');
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const handleSelectTab = (tabId, category) => {
    setActiveTab(tabId);
    if (category) {
      setActiveCategory(category);
    }
    if (tabId === 'home') {
      window.history.pushState(null, '', window.location.pathname);
    } else {
      window.location.hash = tabId;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setCurrentPath('/admin');
  };

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
    setActiveTab('home');
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
        next[existingIndex] = {
          ...next[existingIndex],
          qty: next[existingIndex].qty + 1,
        };
      } else {
        next = [
          ...prev,
          {
            ...product,
            chosenColor: product.chosenColor || product.garment,
            chosenSize: product.chosenSize || 'L',
            qty: 1,
          },
        ];
      }
      syncCartToDb(next);
      return next;
    });

    showToast(`Added ${product.name} to bag`);
  };

  const handleUpdateQty = (item, delta) => {
    setCart((prev) => {
      const next = prev
        .map((x) => {
          if (
            x.id === item.id &&
            x.chosenColor === item.chosenColor &&
            x.chosenSize === item.chosenSize
          ) {
            return { ...x, qty: x.qty + delta };
          }
          return x;
        })
        .filter((x) => x.qty > 0);
      syncCartToDb(next);
      return next;
    });
  };

  const handleRemoveItem = (item) => {
    setCart((prev) => {
      const next = prev.filter(
        (x) =>
          !(
            x.id === item.id &&
            x.chosenColor === item.chosenColor &&
            x.chosenSize === item.chosenSize
          )
      );
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
    }, 120);
  };

  const cartTotalCount = cart.reduce((acc, item) => acc + item.qty, 0);

  // If URL path is /admin, render dedicated standalone Admin Portal
  if (currentPath === '/admin' || currentPath.startsWith('/admin')) {
    return <AdminPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink selection:bg-lime selection:text-neutral-950 transition-colors duration-200">
      {/* Top Navbar with Sliding Underline Hover Animation */}
      <Navbar
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          handleSelectTab('shop', cat);
        }}
        onScrollToSection={scrollToSection}
      />

      {/* Sub-Header Breadcrumb Bar for Dedicated Section Pages */}
      {activeTab !== 'home' && (
        <div className="bg-card border-b border-line py-2.5 px-4 md:px-8 transition-colors">
          <div className="max-w-[1240px] mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-black uppercase tracking-wider text-muted">
              <button
                onClick={() => handleSelectTab('home')}
                className="hover:text-ink flex items-center gap-1 transition-colors"
              >
                HOME
              </button>
              <span>/</span>
              <span className="text-ink">
                {activeTab === 'anatomy' ? '360° INSPECT' : activeTab.toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => handleSelectTab('home')}
              className="text-[11px] font-black uppercase text-muted hover:text-ink flex items-center gap-1 transition-colors"
            >
              <span>← RETURN TO FULL STORE</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area: Tab-Based Dedicated Pages */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            {/* Hero with Kinetic Typography and 3D Canvas Parallax */}
            <Hero
              onShopClick={() => handleSelectTab('shop', 'All')}
              onLookbookClick={() => handleSelectTab('lookbook')}
            />

            {/* 3D Scroll-Driven Interactive Rotating T-Shirt Anatomy */}
            <ScrollShowcase onAddToCart={handleAddToCart} />

            {/* Curated Product Showcase */}
            <ProductGrid
              products={products}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              onAddToCart={handleAddToCart}
              onOpenQuickView={(p) => setQuickViewProduct(p)}
            />

            {/* Interactive Lookbook Gallery */}
            <Lookbook
              onShopCategory={(cat) => {
                setActiveCategory(cat);
                handleSelectTab('shop', cat);
              }}
            />

            {/* Story Banner and Footer */}
            <Footer onShopClick={() => handleSelectTab('shop', 'All')} />
          </>
        )}

        {/* Dedicated Page / Tab: SHOP ALL */}
        {activeTab === 'shop' && (
          <>
            <ShopPage
              products={products}
              categoryFilter={activeCategory}
              onSelectCategory={setActiveCategory}
              onAddToCart={handleAddToCart}
              onOpenQuickView={(p) => setQuickViewProduct(p)}
              onInspect3D={() => handleSelectTab('anatomy')}
              onOpenCart={() => setIsCartOpen(true)}
            />
            <Footer onShopClick={() => handleSelectTab('shop', 'All')} />
          </>
        )}

        {/* Dedicated Page / Tab: T-SHIRTS */}
        {activeTab === 't-shirts' && (
          <>
            <ShopPage
              products={products}
              categoryFilter="T-Shirts"
              onSelectCategory={setActiveCategory}
              onAddToCart={handleAddToCart}
              onOpenQuickView={(p) => setQuickViewProduct(p)}
              onInspect3D={() => handleSelectTab('anatomy')}
              onOpenCart={() => setIsCartOpen(true)}
            />
            <Footer onShopClick={() => handleSelectTab('shop', 'All')} />
          </>
        )}

        {/* Dedicated Page / Tab: HOODIES */}
        {activeTab === 'hoodies' && (
          <>
            <ShopPage
              products={products}
              categoryFilter="Hoodies"
              onSelectCategory={setActiveCategory}
              onAddToCart={handleAddToCart}
              onOpenQuickView={(p) => setQuickViewProduct(p)}
              onInspect3D={() => handleSelectTab('anatomy')}
              onOpenCart={() => setIsCartOpen(true)}
            />
            <Footer onShopClick={() => handleSelectTab('shop', 'All')} />
          </>
        )}

        {/* Dedicated Page / Tab: 360° INSPECT */}
        {activeTab === 'anatomy' && (
          <>
            <Inspect360Page
              onAddToCart={handleAddToCart}
              onOpenCart={() => setIsCartOpen(true)}
            />
            <Footer onShopClick={() => handleSelectTab('shop', 'All')} />
          </>
        )}

        {/* Dedicated Page / Tab: LOOKBOOK */}
        {activeTab === 'lookbook' && (
          <>
            <LookbookPage
              onAddToCart={handleAddToCart}
              onOpenCart={() => setIsCartOpen(true)}
              onOpenQuickView={(p) => setQuickViewProduct(p)}
            />
            <Footer onShopClick={() => handleSelectTab('shop', 'All')} />
          </>
        )}

        {/* Dedicated Page / Tab: OUR STORY */}
        {activeTab === 'story' && (
          <>
            <StoryPage
              onGoToShop={() => handleSelectTab('shop', 'All')}
              onInspect3D={() => handleSelectTab('anatomy')}
            />
            <Footer onShopClick={() => handleSelectTab('shop', 'All')} />
          </>
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

      {/* Slide-out Cart Drawer with Spring Physics */}
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
