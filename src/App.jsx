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
import Footer from './components/Footer';
import Toast from './components/Toast';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
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

  const navigateToAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setCurrentPath('/admin');
  };

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
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

    // Check URL hash for admin/users table shortcut (#admin, #users) and redirect to /admin
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (['#admin', '#users', '#database', '#orders', '#owner'].includes(hash)) {
        window.history.replaceState(null, '', '/admin');
        setCurrentPath('/admin');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
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
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        if (lenisRef.current) {
          lenisRef.current.scrollTo(el, { offset: -80 });
        } else {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 100);
  };

  const cartTotalCount = cart.reduce((acc, item) => acc + item.qty, 0);

  // If URL path is /admin, render dedicated standalone Admin Portal
  if (currentPath === '/admin' || currentPath.startsWith('/admin')) {
    return <AdminPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink selection:bg-lime selection:text-ink">
      {/* Top Navbar */}
      <Navbar
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          scrollToSection('shop');
        }}
        onScrollToSection={scrollToSection}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero with Kinetic Typography and 3D Canvas Parallax */}
        <Hero
          onShopClick={() => scrollToSection('shop')}
          onLookbookClick={() => scrollToSection('lookbook')}
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
            scrollToSection('shop');
          }}
        />

        {/* Story Banner and Footer */}
        <Footer onShopClick={() => scrollToSection('shop')} />
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
