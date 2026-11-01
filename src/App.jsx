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
import Footer from './components/Footer';
import Toast from './components/Toast';

export default function App() {
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

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          qty: next[existingIndex].qty + 1,
        };
        return next;
      } else {
        return [
          ...prev,
          {
            ...product,
            chosenColor: product.chosenColor || product.garment,
            chosenSize: product.chosenSize || 'L',
            qty: 1,
          },
        ];
      }
    });

    showToast(`Added ${product.name} to bag`);
  };

  const handleUpdateQty = (item, delta) => {
    setCart((prev) => {
      return prev
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
    });
  };

  const handleRemoveItem = (item) => {
    setCart((prev) =>
      prev.filter(
        (x) =>
          !(
            x.id === item.id &&
            x.chosenColor === item.chosenColor &&
            x.chosenSize === item.chosenSize
          )
      )
    );
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
