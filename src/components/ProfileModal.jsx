import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, MapPin, Package, LogOut, Edit2, Check, Clock } from 'lucide-react';
import { rupee } from '../data/products';

export default function ProfileModal({ isOpen, onClose, user, onUpdateUser, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'orders'
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    const token = localStorage.getItem('loosr_token');
    if (!token) return;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  if (!isOpen || !user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    const token = localStorage.getItem('loosr_token');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone, address }),
      });

      const data = await res.json();
      if (res.ok) {
        onUpdateUser(data.user);
        setIsEditing(false);
        setSuccessMsg('Profile updated successfully!');
        setTimeout(() => setSuccessMsg(''), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (n) => {
    if (!n) return 'L';
    return n
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Dim Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Profile Card Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-xl bg-paper border border-ink shadow-[12px_16px_0px_#111111] z-10 overflow-hidden my-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 bg-ink text-white hover:bg-lime hover:text-neutral-950 flex items-center justify-center border border-ink transition-colors"
            aria-label="Close profile"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Area with Avatar Monogram */}
          <div className="p-6 sm:p-8 border-b border-line bg-card">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-neutral-950 text-lime border-2 border-lime flex items-center justify-center font-black text-2xl tracking-tighter shadow-md">
                {getInitials(user.name)}
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest text-lime bg-neutral-950 px-2 py-0.5 uppercase inline-block mb-1 border border-lime/40">
                  MEMBER PASS
                </span>
                <h2 className="text-2xl font-black text-ink uppercase tracking-tight">
                  {user.name}
                </h2>
                <div className="text-xs text-muted font-mono">{user.email}</div>
              </div>
            </div>

            {/* Tabs: Details vs Orders */}
            <div className="flex gap-2 mt-6 border-b border-line">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2.5 px-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-[1px] ${
                  activeTab === 'details'
                    ? 'border-ink text-ink'
                    : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                ACCOUNT DETAILS
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-2.5 px-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-[1px] ${
                  activeTab === 'orders'
                    ? 'border-ink text-ink'
                    : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                ORDER HISTORY ({orders.length})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8">
            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {activeTab === 'details' ? (
              isEditing ? (
                // Edit Form
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-ink uppercase tracking-wider block mb-1">
                      FULL NAME
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs p-2.5 border border-line bg-white focus:outline-none focus:border-ink font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-ink uppercase tracking-wider block mb-1">
                      PHONE NUMBER
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs p-2.5 border border-line bg-white focus:outline-none focus:border-ink font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-ink uppercase tracking-wider block mb-1">
                      DELIVERY ADDRESS
                    </label>
                    <textarea
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full text-xs p-2.5 border border-line bg-white focus:outline-none focus:border-ink font-medium"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-lime text-neutral-950 text-xs font-black uppercase border border-ink shadow-[2px_2px_0px_#111111]"
                    >
                      {loading ? 'SAVING...' : 'SAVE CHANGES'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2.5 bg-white text-ink text-xs font-black uppercase border border-line"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              ) : (
                // View Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-card border border-line p-4">
                      <div className="text-[10px] font-black text-muted tracking-widest uppercase flex items-center gap-1.5 mb-1">
                        <User className="w-3.5 h-3.5 text-ink" />
                        <span>FULL NAME</span>
                      </div>
                      <div className="text-sm font-black text-ink">{user.name}</div>
                    </div>

                    <div className="bg-card border border-line p-4">
                      <div className="text-[10px] font-black text-muted tracking-widest uppercase flex items-center gap-1.5 mb-1">
                        <Mail className="w-3.5 h-3.5 text-ink" />
                        <span>MAIL-ID</span>
                      </div>
                      <div className="text-sm font-mono font-bold text-ink truncate">{user.email}</div>
                    </div>

                    <div className="bg-card border border-line p-4">
                      <div className="text-[10px] font-black text-muted tracking-widest uppercase flex items-center gap-1.5 mb-1">
                        <Phone className="w-3.5 h-3.5 text-ink" />
                        <span>PHONE NUMBER</span>
                      </div>
                      <div className="text-sm font-mono font-bold text-ink">
                        {user.phone || <span className="text-muted italic">Not set yet</span>}
                      </div>
                    </div>

                    <div className="bg-card border border-line p-4">
                      <div className="text-[10px] font-black text-muted tracking-widest uppercase flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-ink" />
                        <span>DEFAULT ADDRESS</span>
                      </div>
                      <div className="text-sm font-medium text-ink">
                        {user.address || <span className="text-muted italic">Not set yet</span>}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-paper text-ink text-xs font-black uppercase border border-line transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>EDIT DETAILS</span>
                    </button>

                    <button
                      onClick={onLogout}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-brandRed/10 hover:bg-brandRed text-brandRed hover:text-white text-xs font-black uppercase border border-brandRed/30 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>LOGOUT</span>
                    </button>
                  </div>
                </div>
              )
            ) : (
              // Order History List
              <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                {orders.length === 0 ? (
                  <div className="text-center py-8 bg-card border border-line">
                    <Package className="w-8 h-8 mx-auto text-muted mb-2" />
                    <div className="text-xs font-black text-ink uppercase">NO ORDERS YET</div>
                    <p className="text-[11px] text-muted mt-1">Your orders will be logged and tracked here.</p>
                  </div>
                ) : (
                  orders.map((ord) => (
                    <div key={ord.id} className="p-4 bg-card border border-line flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs font-mono font-bold">
                        <span className="text-ink">#{ord.order_number}</span>
                        <span className="px-2 py-0.5 bg-lime text-neutral-950 text-[10px] font-black border border-ink">
                          {ord.status}
                        </span>
                      </div>
                      <div className="text-xs text-muted">
                        {ord.items?.map((item) => `${item.name} (${item.chosenSize || 'L'}) ×${item.qty}`).join(', ')}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-line/60 text-xs">
                        <span className="text-muted">{new Date(ord.created_at).toLocaleDateString()}</span>
                        <strong className="text-ink font-black">{rupee(ord.total)}</strong>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
