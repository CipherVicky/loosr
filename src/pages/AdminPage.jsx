import React, { useState, useEffect } from 'react';
import {
  Users,
  ShoppingBag,
  IndianRupee,
  Lock,
  ArrowRight,
  RefreshCw,
  Search,
  Download,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Clock,
  Truck,
  Check,
  AlertTriangle,
  Eye,
  KeyRound,
  Database,
  ArrowLeft,
  Filter,
  ShoppingCart,
  ChevronRight,
  Code,
  Copy,
} from 'lucide-react';
import { rupee } from '../data/products';

export default function AdminPage({ onNavigateHome }) {
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'orders' | 'carts' | 'schema'

  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [carts, setCarts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [copiedHash, setCopiedHash] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Auto-login if previously authenticated in this browser session
  useEffect(() => {
    const savedKey = sessionStorage.getItem('loosr_admin_key');
    if (savedKey) {
      setPasscode(savedKey);
      fetchAllData(savedKey);
    }
  }, []);

  const fetchAllData = async (keyToUse) => {
    setLoading(true);
    setError('');

    try {
      const headers = { 'x-admin-key': keyToUse };
      const [uRes, oRes, cRes] = await Promise.all([
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/orders', { headers }),
        fetch('/api/admin/carts', { headers }),
      ]);

      if (uRes.status === 403 || oRes.status === 403) {
        throw new Error('Incorrect master passcode. Access denied.');
      }

      const uData = await uRes.json();
      const oData = await oRes.json();
      const cData = await cRes.json();

      setUsers(uData.users || []);
      setOrders(oData.orders || []);
      setCarts(cData.carts || []);
      setIsUnlocked(true);
      sessionStorage.setItem('loosr_admin_key', keyToUse);
    } catch (err) {
      setError(err.message || 'Failed to authenticate');
      setIsUnlocked(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    fetchAllData(passcode.trim());
  };

  const handleLogout = () => {
    sessionStorage.removeItem('loosr_admin_key');
    setIsUnlocked(false);
    setPasscode('');
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': passcode,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to delete order #${orderId}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': passcode },
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        if (selectedOrder?.id === orderId) setSelectedOrder(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(`Are you sure you want to delete user #${userId} and all their orders?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': passcode },
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setOrders((prev) => prev.filter((o) => o.user_id !== userId));
        setCarts((prev) => prev.filter((c) => c.user_id !== userId));
        if (selectedUser?.id === userId) setSelectedUser(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CSV Exporters
  const exportUsersCSV = () => {
    if (users.length === 0) return;
    const headers = ['ID', 'Name', 'Email', 'Password_Hash', 'Phone', 'Address', 'Orders_Count', 'Total_Spent_INR', 'Created_At'];
    const rows = users.map((u) => [
      u.id,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.password || ''}"`,
      `"${u.phone || ''}"`,
      `"${(u.address || '').replace(/"/g, '""')}"`,
      u.order_count || 0,
      u.total_spent || 0,
      `"${u.created_at || ''}"`,
    ]);
    downloadCSV(headers, rows, 'loosr_users_table');
  };

  const exportOrdersCSV = () => {
    if (orders.length === 0) return;
    const headers = ['ID', 'User_ID', 'Order_Number', 'Customer_Name', 'Email', 'Phone', 'Address', 'Total_INR', 'Payment_Method', 'Status', 'Items_JSON', 'Created_At'];
    const rows = orders.map((o) => [
      o.id,
      o.user_id || 'GUEST',
      `"${o.order_number}"`,
      `"${(o.customer_name || '').replace(/"/g, '""')}"`,
      `"${o.customer_email || ''}"`,
      `"${o.customer_phone || ''}"`,
      `"${(o.delivery_address || '').replace(/"/g, '""')}"`,
      o.total || 0,
      `"${o.payment_method || 'cod'}"`,
      `"${o.status || 'CONFIRMED'}"`,
      `"${(o.raw_items_json || '').replace(/"/g, '""')}"`,
      `"${o.created_at || ''}"`,
    ]);
    downloadCSV(headers, rows, 'loosr_orders_table');
  };

  const exportCartsCSV = () => {
    if (carts.length === 0) return;
    const headers = ['User_ID', 'Customer_Name', 'Email', 'Phone', 'Items_Count', 'Raw_Items_JSON', 'Updated_At'];
    const rows = carts.map((c) => [
      c.user_id,
      `"${(c.customer_name || '').replace(/"/g, '""')}"`,
      `"${c.customer_email || ''}"`,
      `"${c.customer_phone || ''}"`,
      (c.items || []).length,
      `"${(c.raw_items_json || '').replace(/"/g, '""')}"`,
      `"${c.updated_at || ''}"`,
    ]);
    downloadCSV(headers, rows, 'loosr_active_carts');
  };

  const downloadCSV = (headers, rows, filename) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  // Filtered queries
  const q = searchQuery.toLowerCase();

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.address?.toLowerCase().includes(q) ||
      String(u.id).includes(q)
  );

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number?.toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_email?.toLowerCase().includes(q) ||
      o.customer_phone?.toLowerCase().includes(q) ||
      o.delivery_address?.toLowerCase().includes(q) ||
      String(o.id).includes(q);

    const matchesStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCarts = carts.filter(
    (c) =>
      c.customer_name?.toLowerCase().includes(q) ||
      c.customer_email?.toLowerCase().includes(q) ||
      c.customer_phone?.toLowerCase().includes(q) ||
      String(c.user_id).includes(q)
  );

  // Status color pill helper
  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'SHIPPED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'PROCESSING':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'CANCELLED':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      default:
        return 'bg-[#d7ff36]/20 text-[#d7ff36] border-[#d7ff36]/40';
    }
  };

  // PASSCODE LOCK SCREEN
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-[#ededed] flex flex-col items-center justify-center p-4 font-sans select-none">
        <div className="w-full max-w-md bg-[#121214] border border-[#27272a] shadow-2xl p-8 sm:p-10 rounded-none relative">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#27272a]">
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl tracking-tighter text-white">LOOSR</span>
              <span className="text-[#d7ff36] font-mono text-xs font-bold px-2 py-0.5 bg-[#d7ff36]/10 border border-[#d7ff36]/30">
                ADMIN CONSOLE
              </span>
            </div>
            <button
              onClick={onNavigateHome}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </button>
          </div>

          <div className="w-12 h-12 rounded-none bg-[#18181b] border border-[#3f3f46] flex items-center justify-center mx-auto mb-4 text-[#d7ff36]">
            <Lock className="w-5 h-5" />
          </div>

          <h1 className="text-xl font-black text-center uppercase tracking-tight text-white">
            PRO ACCESS TERMINAL
          </h1>
          <p className="text-xs text-neutral-400 text-center mt-1.5 mb-6">
            Enter master administrative key to monitor live users, orders & SQLite database records.
          </p>

          {error && (
            <div className="mb-5 p-3 bg-rose-950/40 border border-rose-700/60 text-rose-300 text-xs font-mono text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                MASTER ADMIN PASSCODE
              </label>
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter passcode (loosr2026)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-[#18181b] border border-[#3f3f46] text-white p-3 text-sm font-mono tracking-widest text-center focus:outline-none focus:border-[#d7ff36] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#d7ff36] hover:bg-white text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-[#d7ff36] shadow-[4px_4px_0px_#ffffff]"
            >
              <span>{loading ? 'AUTHENTICATING...' : 'ENTER ADMIN CONSOLE ↗'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-[#27272a] text-center">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              ENDPOINT: /admin · PRODUCTION INSTANCE
            </span>
          </div>
        </div>
      </div>
    );
  }

  // MAIN AUTHENTICATED PRO ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col font-sans">
      {/* Top Console Navigation Bar */}
      <header className="bg-[#111113] border-b border-[#27272a] sticky top-0 z-30 px-4 sm:px-6 py-3">
        <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Environment Badge */}
          <div className="flex items-center gap-3">
            <span className="font-black text-2xl tracking-tighter text-white">LOOSR</span>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-[#d7ff36] text-black">
              ADMIN PRO
            </span>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>SQLITE WAL ACTIVE</span>
            </div>
          </div>

          {/* Search Across All Tables */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search across users, orders, emails, phones, IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#18181b] border border-[#27272a] text-xs py-2 pl-9 pr-4 text-white focus:outline-none focus:border-[#d7ff36] font-mono placeholder:text-neutral-500"
            />
          </div>

          {/* Quick Actions & Exit */}
          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={() => fetchAllData(passcode)}
              disabled={loading}
              className="p-2 bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] text-neutral-300 hover:text-white transition-colors"
              title="Refresh live database data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#d7ff36]' : ''}`} />
            </button>

            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-xs font-mono text-neutral-300 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>STOREFRONT ↗</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 text-xs font-mono text-rose-300 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>LOCK</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body with Tab Navigation */}
      <div className="max-w-[1700px] w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-[#27272a] mb-6 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#d7ff36] text-[#d7ff36] bg-[#d7ff36]/5'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>OVERVIEW</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-[#d7ff36] text-[#d7ff36] bg-[#d7ff36]/5'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>USERS TABLE ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-[#d7ff36] text-[#d7ff36] bg-[#d7ff36]/5'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>ORDERS TABLE ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('carts')}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'carts'
                ? 'border-[#d7ff36] text-[#d7ff36] bg-[#d7ff36]/5'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>ACTIVE CARTS ({carts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'schema'
                ? 'border-[#d7ff36] text-[#d7ff36] bg-[#d7ff36]/5'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>DB SCHEMA & RAW SQL</span>
          </button>
        </div>

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#121214] border border-[#27272a] p-5">
                <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
                  <span>GROSS REVENUE</span>
                  <IndianRupee className="w-4 h-4 text-[#d7ff36]" />
                </div>
                <div className="text-3xl font-black text-white">{rupee(totalRevenue)}</div>
                <div className="text-[11px] font-mono text-neutral-500 mt-2">
                  Calculated from {orders.length} lifetime orders
                </div>
              </div>

              <div className="bg-[#121214] border border-[#27272a] p-5">
                <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
                  <span>TOTAL REGISTERED USERS</span>
                  <Users className="w-4 h-4 text-neutral-300" />
                </div>
                <div className="text-3xl font-black text-white">{users.length}</div>
                <div className="text-[11px] font-mono text-neutral-500 mt-2">
                  Stored in SQLite `users` table
                </div>
              </div>

              <div className="bg-[#121214] border border-[#27272a] p-5">
                <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
                  <span>TOTAL ORDERS PLACED</span>
                  <ShoppingBag className="w-4 h-4 text-neutral-300" />
                </div>
                <div className="text-3xl font-black text-white">{orders.length}</div>
                <div className="text-[11px] font-mono text-neutral-500 mt-2">
                  Avg. value: {rupee(avgOrderValue)}
                </div>
              </div>

              <div className="bg-[#121214] border border-[#27272a] p-5">
                <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
                  <span>ACTIVE PERSISTENT CARTS</span>
                  <ShoppingCart className="w-4 h-4 text-neutral-300" />
                </div>
                <div className="text-3xl font-black text-white">{carts.length}</div>
                <div className="text-[11px] font-mono text-neutral-500 mt-2">
                  Live user carts in `carts` table
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Snapshot */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders Snapshot */}
              <div className="bg-[#121214] border border-[#27272a] p-5">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#27272a]">
                  <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#d7ff36]" />
                    <span>LATEST ORDERS</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-[#d7ff36] hover:underline font-mono"
                  >
                    View All ({orders.length}) →
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="py-8 text-center text-xs font-mono text-neutral-500">
                    No orders logged in database yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((ord) => (
                      <div
                        key={ord.id}
                        onClick={() => {
                          setSelectedOrder(ord);
                          setActiveTab('orders');
                        }}
                        className="p-3 bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="font-mono text-xs font-bold text-white flex items-center gap-2">
                            <span>#{ord.order_number}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 border ${getStatusBadge(ord.status)}`}>
                              {ord.status}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-400 mt-0.5">
                            {ord.customer_name} ({ord.customer_email || 'No email'})
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-xs font-bold text-[#d7ff36]">{rupee(ord.total)}</div>
                          <div className="text-[10px] font-mono text-neutral-500">
                            {new Date(ord.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Users Snapshot */}
              <div className="bg-[#121214] border border-[#27272a] p-5">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#27272a]">
                  <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#d7ff36]" />
                    <span>RECENT REGISTERED USERS</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="text-xs text-[#d7ff36] hover:underline font-mono"
                  >
                    View All ({users.length}) →
                  </button>
                </div>

                {users.length === 0 ? (
                  <div className="py-8 text-center text-xs font-mono text-neutral-500">
                    No registered users in database yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {users.slice(0, 5).map((usr) => (
                      <div
                        key={usr.id}
                        onClick={() => {
                          setSelectedUser(usr);
                          setActiveTab('users');
                        }}
                        className="p-3 bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-black text-[#d7ff36] border border-[#d7ff36]/30 flex items-center justify-center font-black text-xs">
                            {usr.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-white">{usr.name}</div>
                            <div className="font-mono text-xs text-neutral-400">{usr.email}</div>
                          </div>
                        </div>
                        <div className="text-right font-mono text-xs">
                          <span className="text-neutral-400">{usr.order_count} orders</span>
                          <div className="text-[10px] text-neutral-500">
                            {new Date(usr.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. USERS TABLE TAB (EVERY COLUMN IN DB) */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Header Toolbar */}
            <div className="bg-[#121214] border border-[#27272a] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                  <span>USERS DATABASE TABLE</span>
                  <span className="text-xs font-mono px-2 py-0.5 bg-[#18181b] text-neutral-300 border border-[#27272a]">
                    TABLE: users
                  </span>
                </h2>
                <p className="text-xs font-mono text-neutral-400 mt-0.5">
                  Showing {filteredUsers.length} of {users.length} registered customers · All columns included
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportUsersCSV}
                  className="px-3.5 py-2 bg-[#d7ff36] hover:bg-white text-black font-black text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>EXPORT USERS CSV</span>
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="bg-[#121214] border border-[#27272a] overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-[#18181b] border-b border-[#27272a] text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    <th className="py-3 px-3">id (INT)</th>
                    <th className="py-3 px-3">name (TEXT)</th>
                    <th className="py-3 px-3">email (UNIQUE)</th>
                    <th className="py-3 px-3">password (HASH)</th>
                    <th className="py-3 px-3">phone (TEXT)</th>
                    <th className="py-3 px-3">address (TEXT)</th>
                    <th className="py-3 px-3 text-center">orders (COUNT)</th>
                    <th className="py-3 px-3">total_spent (REAL)</th>
                    <th className="py-3 px-3">created_at (DATETIME)</th>
                    <th className="py-3 px-3 text-right">actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-neutral-500">
                        No matching user records found in database.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((usr) => (
                      <tr key={usr.id} className="hover:bg-[#18181b]/70 transition-colors">
                        <td className="py-3 px-3 text-[#d7ff36] font-bold">#{usr.id}</td>
                        <td className="py-3 px-3 font-sans font-bold text-white flex items-center gap-2">
                          <div className="w-6 h-6 bg-black text-[#d7ff36] border border-[#d7ff36]/40 flex items-center justify-center font-black text-[10px]">
                            {usr.name?.charAt(0).toUpperCase()}
                          </div>
                          <span>{usr.name}</span>
                        </td>
                        <td className="py-3 px-3 text-neutral-300">{usr.email}</td>
                        <td className="py-3 px-3 max-w-[160px]">
                          <div className="flex items-center gap-1.5 bg-[#09090b] px-2 py-1 border border-[#27272a]">
                            <KeyRound className="w-3 h-3 text-neutral-500 flex-shrink-0" />
                            <span className="truncate text-[10px] text-neutral-400 font-mono" title={usr.password}>
                              {usr.password ? `${usr.password.slice(0, 16)}...` : 'None'}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(usr.password || '');
                                setCopiedHash(usr.id);
                                setTimeout(() => setCopiedHash(''), 1500);
                              }}
                              className="text-neutral-500 hover:text-white ml-auto"
                              title="Copy full hash"
                            >
                              {copiedHash === usr.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-neutral-300">{usr.phone || <span className="text-neutral-600">—</span>}</td>
                        <td className="py-3 px-3 text-neutral-400 max-w-[180px] truncate" title={usr.address}>
                          {usr.address || <span className="text-neutral-600">—</span>}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 bg-[#18181b] border border-[#27272a] text-[#d7ff36] font-bold">
                            {usr.order_count || 0}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-white font-bold">{rupee(usr.total_spent || 0)}</td>
                        <td className="py-3 px-3 text-neutral-400 text-[11px] whitespace-nowrap">
                          {usr.created_at ? new Date(usr.created_at).toLocaleString() : 'Recent'}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteUser(usr.id)}
                            className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. ORDERS TABLE TAB (EVERY COLUMN IN DB) */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Header Toolbar & Filters */}
            <div className="bg-[#121214] border border-[#27272a] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                  <span>ORDERS DATABASE TABLE</span>
                  <span className="text-xs font-mono px-2 py-0.5 bg-[#18181b] text-neutral-300 border border-[#27272a]">
                    TABLE: orders
                  </span>
                </h2>
                <p className="text-xs font-mono text-neutral-400 mt-0.5">
                  Showing {filteredOrders.length} of {orders.length} orders · Update statuses directly in real time
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Status Filter Dropdown */}
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-[#18181b] border border-[#27272a] text-xs font-mono text-white px-3 py-2 focus:outline-none focus:border-[#d7ff36]"
                >
                  <option value="ALL">ALL STATUSES ({orders.length})</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>

                <button
                  onClick={exportOrdersCSV}
                  className="px-3.5 py-2 bg-[#d7ff36] hover:bg-white text-black font-black text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>EXPORT ORDERS CSV</span>
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="bg-[#121214] border border-[#27272a] overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-[#18181b] border-b border-[#27272a] text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    <th className="py-3 px-3">id</th>
                    <th className="py-3 px-3">order_number</th>
                    <th className="py-3 px-3">user_id</th>
                    <th className="py-3 px-3">customer_name</th>
                    <th className="py-3 px-3">customer_email</th>
                    <th className="py-3 px-3">customer_phone</th>
                    <th className="py-3 px-3">delivery_address</th>
                    <th className="py-3 px-3">items_json (PARSED)</th>
                    <th className="py-3 px-3">total (INR)</th>
                    <th className="py-3 px-3">payment_method</th>
                    <th className="py-3 px-3">status</th>
                    <th className="py-3 px-3">created_at</th>
                    <th className="py-3 px-3 text-right">actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="py-12 text-center text-neutral-500">
                        No matching order records found in database.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#18181b]/70 transition-colors">
                        <td className="py-3 px-3 text-neutral-500">#{ord.id}</td>
                        <td className="py-3 px-3 font-bold text-[#d7ff36]">#{ord.order_number}</td>
                        <td className="py-3 px-3 text-neutral-400">
                          {ord.user_id ? (
                            <span className="px-1.5 py-0.5 bg-[#18181b] border border-[#27272a] text-white">
                              User #{ord.user_id}
                            </span>
                          ) : (
                            <span className="text-neutral-600">Guest</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-sans font-bold text-white">{ord.customer_name}</td>
                        <td className="py-3 px-3 text-neutral-400">{ord.customer_email || '—'}</td>
                        <td className="py-3 px-3 text-neutral-300">{ord.customer_phone || '—'}</td>
                        <td className="py-3 px-3 text-neutral-400 max-w-[200px] truncate" title={ord.delivery_address}>
                          {ord.delivery_address || '—'}
                        </td>
                        <td className="py-3 px-3 max-w-[250px]">
                          <div className="space-y-1">
                            {ord.items?.map((it, idx) => (
                              <div key={idx} className="text-[11px] text-neutral-300 truncate">
                                • {it.name} <span className="text-neutral-500">({it.chosenSize || 'L'}, {it.chosenColor || 'Ink'})</span> ×{it.qty}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-bold text-[#d7ff36] whitespace-nowrap">{rupee(ord.total)}</td>
                        <td className="py-3 px-3 uppercase text-[11px] text-neutral-400">{ord.payment_method || 'cod'}</td>
                        <td className="py-3 px-3">
                          <select
                            value={ord.status || 'CONFIRMED'}
                            disabled={updatingOrderId === ord.id}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className={`text-[10px] font-mono font-bold px-2 py-1 border bg-black focus:outline-none ${getStatusBadge(
                              ord.status
                            )}`}
                          >
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                        <td className="py-3 px-3 text-neutral-400 text-[11px] whitespace-nowrap">
                          {new Date(ord.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteOrder(ord.id)}
                            className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                            title="Delete order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. ACTIVE CARTS TAB (EVERY COLUMN IN DB) */}
        {activeTab === 'carts' && (
          <div className="space-y-4">
            <div className="bg-[#121214] border border-[#27272a] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                  <span>ACTIVE CARTS TABLE</span>
                  <span className="text-xs font-mono px-2 py-0.5 bg-[#18181b] text-neutral-300 border border-[#27272a]">
                    TABLE: carts
                  </span>
                </h2>
                <p className="text-xs font-mono text-neutral-400 mt-0.5">
                  Live persistent shopping carts synced across customer logins · {carts.length} active sessions
                </p>
              </div>

              <button
                onClick={exportCartsCSV}
                className="px-3.5 py-2 bg-[#d7ff36] hover:bg-white text-black font-black text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>EXPORT CARTS CSV</span>
              </button>
            </div>

            <div className="bg-[#121214] border border-[#27272a] overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-[#18181b] border-b border-[#27272a] text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    <th className="py-3 px-3">user_id</th>
                    <th className="py-3 px-3">customer_name</th>
                    <th className="py-3 px-3">customer_email</th>
                    <th className="py-3 px-3">customer_phone</th>
                    <th className="py-3 px-3">items_count</th>
                    <th className="py-3 px-3">items_json (BAG CONTENT)</th>
                    <th className="py-3 px-3">updated_at</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]">
                  {filteredCarts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-500">
                        No active carts recorded in database.
                      </td>
                    </tr>
                  ) : (
                    filteredCarts.map((c) => (
                      <tr key={c.user_id} className="hover:bg-[#18181b]/70 transition-colors">
                        <td className="py-3 px-3 text-[#d7ff36] font-bold">User #{c.user_id}</td>
                        <td className="py-3 px-3 font-sans font-bold text-white">{c.customer_name || 'Anonymous'}</td>
                        <td className="py-3 px-3 text-neutral-300">{c.customer_email || '—'}</td>
                        <td className="py-3 px-3 text-neutral-400">{c.customer_phone || '—'}</td>
                        <td className="py-3 px-3 font-bold text-white">{(c.items || []).length} items</td>
                        <td className="py-3 px-3 max-w-[300px]">
                          <div className="space-y-1">
                            {(c.items || []).map((it, idx) => (
                              <div key={idx} className="text-[11px] text-neutral-300 truncate">
                                • {it.name} ({it.chosenSize || 'L'}) ×{it.qty}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-neutral-400 text-[11px] whitespace-nowrap">
                          {c.updated_at ? new Date(c.updated_at).toLocaleString() : 'Recent'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. DB SCHEMA & RAW SQL TAB */}
        {activeTab === 'schema' && (
          <div className="space-y-6">
            <div className="bg-[#121214] border border-[#27272a] p-5">
              <h2 className="text-lg font-black tracking-tight text-white uppercase flex items-center gap-2 mb-1">
                <Code className="w-5 h-5 text-[#d7ff36]" />
                <span>DATABASE SCHEMA SPECIFICATION (SQLite 3.4 WAL)</span>
              </h2>
              <p className="text-xs font-mono text-neutral-400">
                Official relational schema defining the 3 production tables: `users`, `orders`, and `carts`.
              </p>

              <div className="mt-5 space-y-4">
                <div className="p-4 bg-[#09090b] border border-[#27272a] font-mono text-xs text-neutral-300">
                  <div className="text-[#d7ff36] font-bold mb-2">-- TABLE 1: users (Customer Accounts)</div>
                  <pre className="text-neutral-400 text-[11px] leading-relaxed">
{`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,           -- bcrypt hashed (60 chars)
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`}
                  </pre>
                </div>

                <div className="p-4 bg-[#09090b] border border-[#27272a] font-mono text-xs text-neutral-300">
                  <div className="text-[#d7ff36] font-bold mb-2">-- TABLE 2: orders (Customer Purchases)</div>
                  <pre className="text-neutral-400 text-[11px] leading-relaxed">
{`CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,                   -- references users(id)
  order_number TEXT NOT NULL,        -- LS-XXXXXX
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  delivery_address TEXT,
  total REAL NOT NULL,
  payment_method TEXT DEFAULT 'cod',
  items_json TEXT NOT NULL,          -- JSON array of purchased garments
  status TEXT DEFAULT 'CONFIRMED',   -- CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);`}
                  </pre>
                </div>

                <div className="p-4 bg-[#09090b] border border-[#27272a] font-mono text-xs text-neutral-300">
                  <div className="text-[#d7ff36] font-bold mb-2">-- TABLE 3: carts (Persistent User Bags)</div>
                  <pre className="text-neutral-400 text-[11px] leading-relaxed">
{`CREATE TABLE IF NOT EXISTS carts (
  user_id INTEGER PRIMARY KEY,       -- references users(id)
  items_json TEXT NOT NULL DEFAULT '[]',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Footer */}
      <footer className="bg-[#111113] border-t border-[#27272a] px-6 py-3 text-[11px] font-mono text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>LOOSR APPAREL STUDIO · ADMINISTRATIVE ENGINE</div>
        <div className="flex items-center gap-4">
          <span>ENDPOINT: loosr.in/admin</span>
          <span>PASSPATH: SHA256-ENCRYPTED</span>
          <span className="text-emerald-400">● RUNNING</span>
        </div>
      </footer>
    </div>
  );
}
