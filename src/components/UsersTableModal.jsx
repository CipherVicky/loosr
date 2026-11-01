import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Download,
  Users,
  ShoppingBag,
  IndianRupee,
  Lock,
  ArrowRight,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { rupee } from '../data/products';

export default function UsersTableModal({ isOpen, onClose }) {
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'orders'
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if previously unlocked in this browser session
  useEffect(() => {
    const savedKey = sessionStorage.getItem('loosr_owner_key');
    if (savedKey) {
      setPasscode(savedKey);
      fetchData(savedKey);
    }
  }, [isOpen]);

  const fetchData = async (keyToUse) => {
    setLoading(true);
    setError('');

    try {
      const [uRes, oRes] = await Promise.all([
        fetch('/api/admin/users', { headers: { 'x-admin-key': keyToUse } }),
        fetch('/api/admin/orders', { headers: { 'x-admin-key': keyToUse } }),
      ]);

      if (uRes.status === 403 || oRes.status === 403) {
        throw new Error('Incorrect passcode. Access denied.');
      }

      const uData = await uRes.json();
      const oData = await oRes.json();

      setUsers(uData.users || []);
      setOrders(oData.orders || []);
      setIsUnlocked(true);
      sessionStorage.setItem('loosr_owner_key', keyToUse);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      setIsUnlocked(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    fetchData(passcode.trim());
  };

  // Filter users by search
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.address?.toLowerCase().includes(q)
    );
  });

  // Filter orders by search
  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      o.order_number?.toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_email?.toLowerCase().includes(q) ||
      o.customer_phone?.toLowerCase().includes(q) ||
      o.delivery_address?.toLowerCase().includes(q)
    );
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  // CSV Export utility
  const exportUsersCSV = () => {
    if (users.length === 0) return;
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Address', 'Orders Count', 'Total Spent', 'Registered Date'];
    const rows = users.map((u) => [
      u.id,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.phone || ''}"`,
      `"${(u.address || '').replace(/"/g, '""')}"`,
      u.order_count || 0,
      u.total_spent || 0,
      `"${u.created_at || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `loosr_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportOrdersCSV = () => {
    if (orders.length === 0) return;
    const headers = ['Order Number', 'Customer Name', 'Email', 'Phone', 'Address', 'Total (INR)', 'Payment Method', 'Status', 'Date'];
    const rows = orders.map((o) => [
      `"${o.order_number || ''}"`,
      `"${(o.customer_name || '').replace(/"/g, '""')}"`,
      `"${o.customer_email || ''}"`,
      `"${o.customer_phone || ''}"`,
      `"${(o.delivery_address || '').replace(/"/g, '""')}"`,
      o.total || 0,
      `"${o.payment_method || ''}"`,
      `"${o.status || 'CONFIRMED'}"`,
      `"${o.created_at || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `loosr_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Dim Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl bg-paper border border-ink shadow-[12px_16px_0px_#111111] z-10 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 bg-ink text-white hover:bg-lime hover:text-ink flex items-center justify-center border border-ink transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Passcode Lock View */}
          {!isUnlocked ? (
            <div className="p-8 sm:p-12 max-w-md mx-auto text-center my-auto">
              <div className="w-14 h-14 bg-card border border-ink rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Lock className="w-6 h-6 text-ink" />
              </div>

              <div className="text-[10px] font-black tracking-widest text-muted uppercase">
                AUTHENTICATED ACCESS ONLY
              </div>
              <h2 className="text-2xl font-black text-ink uppercase tracking-tight mt-1">
                OWNER USER DATABASE<span className="text-lime">.</span>
              </h2>
              <p className="text-xs text-muted mt-2 mb-6">
                Enter your master passcode to view all registered customers and delivery records.
              </p>

              {error && (
                <div className="mb-4 p-2.5 bg-red-50 border border-brandRed text-brandRed text-xs font-bold">
                  {error}
                </div>
              )}

              <form onSubmit={handleUnlock} className="space-y-3">
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Enter passcode (default: loosr2026)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full text-xs p-3 border border-line bg-white focus:outline-none focus:border-ink font-mono text-center tracking-widest"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-lime hover:bg-ink hover:text-lime text-ink text-xs font-black tracking-widest uppercase border border-ink shadow-[3px_3px_0px_#111111] transition-all flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'CHECKING...' : 'UNLOCK DATABASE TABLE ↗'}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </div>
          ) : (
            // Database Explorer Main View
            <div className="flex flex-col h-full overflow-hidden">
              {/* Header Bar */}
              <div className="p-6 border-b border-line bg-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-[10px] font-black tracking-widest text-lime-dark bg-ink px-2 py-0.5 uppercase mb-1">
                    <ShieldCheck className="w-3 h-3 text-lime" />
                    <span>OWNER CONTROL · LIVE DATABASE</span>
                  </div>
                  <h2 className="text-2xl font-black text-ink uppercase tracking-tight">
                    CUSTOMER DIRECTORY<span className="text-lime">.</span>
                  </h2>
                </div>

                {/* Metric Summary Badges */}
                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-2 bg-paper border border-line flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted" />
                    <div>
                      <div className="text-[9px] font-black text-muted tracking-widest uppercase">USERS</div>
                      <div className="text-sm font-black text-ink">{users.length}</div>
                    </div>
                  </div>

                  <div className="px-3.5 py-2 bg-paper border border-line flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-muted" />
                    <div>
                      <div className="text-[9px] font-black text-muted tracking-widest uppercase">ORDERS</div>
                      <div className="text-sm font-black text-ink">{orders.length}</div>
                    </div>
                  </div>

                  <div className="px-3.5 py-2 bg-paper border border-line flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-lime-dark" />
                    <div>
                      <div className="text-[9px] font-black text-muted tracking-widest uppercase">REVENUE</div>
                      <div className="text-sm font-black text-ink">{rupee(totalRevenue)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-bar: Search, Tabs & Export */}
              <div className="p-4 bg-paper border-b border-line flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Tabs */}
                <div className="flex gap-1.5 self-start sm:self-center">
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider border transition-all ${
                      activeTab === 'users'
                        ? 'bg-ink text-white border-ink'
                        : 'bg-white text-ink border-line hover:border-ink'
                    }`}
                  >
                    USERS TABLE ({users.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider border transition-all ${
                      activeTab === 'orders'
                        ? 'bg-ink text-white border-ink'
                        : 'bg-white text-ink border-line hover:border-ink'
                    }`}
                  >
                    ORDERS TABLE ({orders.length})
                  </button>
                </div>

                {/* Search & Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                    <input
                      type="text"
                      placeholder="Search name, email, phone, city..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs py-1.5 pl-8 pr-3 border border-line bg-white focus:outline-none focus:border-ink"
                    />
                  </div>

                  <button
                    onClick={() => fetchData(passcode)}
                    disabled={loading}
                    className="p-2 bg-white border border-line hover:border-ink text-ink transition-colors"
                    title="Refresh Data"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    onClick={activeTab === 'users' ? exportUsersCSV : exportOrdersCSV}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-lime text-ink text-xs font-black uppercase border border-ink shadow-[2px_2px_0px_#111111] hover:bg-ink hover:text-lime transition-all"
                    title="Download as CSV spreadsheet"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">EXPORT {activeTab === 'users' ? 'USERS' : 'ORDERS'} CSV</span>
                  </button>
                </div>
              </div>

              {/* Table Data View */}
              <div className="flex-1 overflow-auto p-4 sm:p-6 bg-card">
                {activeTab === 'users' ? (
                  // USERS TABLE
                  filteredUsers.length === 0 ? (
                    <div className="text-center py-12 text-muted text-xs font-bold uppercase">
                      No matching user records found.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-medium border-collapse min-w-[700px]">
                        <thead>
                          <tr className="border-b-2 border-ink text-[10px] font-black text-muted tracking-widest uppercase bg-paper">
                            <th className="py-2.5 px-3"># ID</th>
                            <th className="py-2.5 px-3">CUSTOMER NAME</th>
                            <th className="py-2.5 px-3">MAIL-ID</th>
                            <th className="py-2.5 px-3">PHONE NUMBER</th>
                            <th className="py-2.5 px-3">DELIVERY ADDRESS</th>
                            <th className="py-2.5 px-3 text-center">ORDERS</th>
                            <th className="py-2.5 px-3">JOINED</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                          {filteredUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-paper/60 transition-colors">
                              <td className="py-3 px-3 font-mono font-bold text-ink">#{u.id}</td>
                              <td className="py-3 px-3 font-bold text-ink flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-ink text-lime text-[9px] font-black flex items-center justify-center">
                                  {u.name?.charAt(0).toUpperCase()}
                                </div>
                                <span>{u.name}</span>
                              </td>
                              <td className="py-3 px-3 font-mono text-muted">{u.email}</td>
                              <td className="py-3 px-3 font-mono font-bold text-ink">
                                {u.phone ? (
                                  <span className="inline-flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-muted" />
                                    {u.phone}
                                  </span>
                                ) : (
                                  <span className="text-muted italic">—</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-muted max-w-[220px] truncate" title={u.address}>
                                {u.address ? (
                                  <span className="inline-flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-muted flex-shrink-0" />
                                    <span className="truncate">{u.address}</span>
                                  </span>
                                ) : (
                                  <span className="text-muted italic">—</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-ink">
                                <span className="px-2 py-0.5 bg-paper border border-line text-[10px] font-black">
                                  {u.order_count || 0}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-mono text-[11px] text-muted whitespace-nowrap">
                                {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Recent'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : (
                  // ORDERS TABLE
                  filteredOrders.length === 0 ? (
                    <div className="text-center py-12 text-muted text-xs font-bold uppercase">
                      No order records found.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-medium border-collapse min-w-[700px]">
                        <thead>
                          <tr className="border-b-2 border-ink text-[10px] font-black text-muted tracking-widest uppercase bg-paper">
                            <th className="py-2.5 px-3">ORDER #</th>
                            <th className="py-2.5 px-3">CUSTOMER</th>
                            <th className="py-2.5 px-3">PHONE</th>
                            <th className="py-2.5 px-3">DELIVERY ADDRESS</th>
                            <th className="py-2.5 px-3">ITEMS</th>
                            <th className="py-2.5 px-3">TOTAL</th>
                            <th className="py-2.5 px-3">STATUS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                          {filteredOrders.map((o) => (
                            <tr key={o.id} className="hover:bg-paper/60 transition-colors">
                              <td className="py-3 px-3 font-mono font-bold text-ink">#{o.order_number}</td>
                              <td className="py-3 px-3 font-bold text-ink">{o.customer_name}</td>
                              <td className="py-3 px-3 font-mono text-muted">{o.customer_phone || '—'}</td>
                              <td className="py-3 px-3 text-muted max-w-[200px] truncate" title={o.delivery_address}>
                                {o.delivery_address || '—'}
                              </td>
                              <td className="py-3 px-3 text-muted text-[11px] max-w-[200px] truncate">
                                {o.items?.map((it) => `${it.name} (${it.chosenSize || 'L'}) ×${it.qty}`).join(', ')}
                              </td>
                              <td className="py-3 px-3 font-black text-ink whitespace-nowrap">{rupee(o.total)}</td>
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 bg-lime text-ink text-[9px] font-black border border-ink">
                                  {o.status || 'CONFIRMED'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
