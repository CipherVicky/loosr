import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, User, Phone, MapPin, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login'
      ? { email, password }
      : { name, email, password, phone, address };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Save token & user
      localStorage.setItem('loosr_token', data.token);
      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

        {/* Auth Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-paper border border-ink shadow-[12px_16px_0px_#111111] z-10 overflow-hidden my-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 bg-ink text-white hover:bg-lime hover:text-neutral-950 flex items-center justify-center border border-ink transition-colors"
            aria-label="Close auth"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header & Mode Switcher */}
          <div className="p-6 border-b border-line bg-card">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-widest text-muted uppercase mb-1">
              <Sparkles className="w-3 h-3 text-lime" />
              <span>LOOSR ACCOUNT PASS</span>
            </div>
            <h2 className="text-2xl font-black text-ink uppercase tracking-tight">
              {mode === 'login' ? 'WELCOME BACK' : 'JOIN THE MOVEMENT'}
              <span className="text-lime">.</span>
            </h2>

            {/* Toggle Tabs */}
            <div className="grid grid-cols-2 gap-2 mt-4 bg-paper p-1 border border-line">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className={`py-2 text-xs font-black uppercase tracking-wider transition-all ${
                  mode === 'login'
                    ? 'bg-ink text-paper shadow-sm'
                    : 'text-muted hover:text-ink'
                }`}
              >
                LOGIN
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className={`py-2 text-xs font-black uppercase tracking-wider transition-all ${
                  mode === 'register'
                    ? 'bg-ink text-paper shadow-sm'
                    : 'text-muted hover:text-ink'
                }`}
              >
                REGISTER
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-brandRed text-brandRed text-xs font-bold">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="text-[10px] font-black text-ink uppercase tracking-wider block mb-1">
                    FULL NAME
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vicky Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs py-2.5 pl-9 pr-3 border border-line bg-white focus:outline-none focus:border-ink font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-ink uppercase tracking-wider block mb-1">
                    PHONE NUMBER
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs py-2.5 pl-9 pr-3 border border-line bg-white focus:outline-none focus:border-ink font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-ink uppercase tracking-wider block mb-1">
                    DELIVERY ADDRESS
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      required
                      placeholder="House, Street, City, PIN code"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full text-xs py-2.5 pl-9 pr-3 border border-line bg-white focus:outline-none focus:border-ink font-medium"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-[10px] font-black text-ink uppercase tracking-wider block mb-1">
                MAIL-ID (EMAIL)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs py-2.5 pl-9 pr-3 border border-line bg-white focus:outline-none focus:border-ink font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-ink uppercase tracking-wider block mb-1">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs py-2.5 pl-9 pr-3 border border-line bg-white focus:outline-none focus:border-ink font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 bg-lime hover:bg-ink hover:text-lime text-neutral-950 text-xs font-black tracking-widest uppercase border border-ink shadow-[4px_4px_0px_#111111] transition-all duration-200 flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
            >
              <span>{loading ? 'PROCESSING...' : mode === 'login' ? 'LOGIN TO STORE ↗' : 'CREATE ACCOUNT ↗'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Footer note */}
          <div className="p-4 bg-paper border-t border-line text-center text-[10px] text-muted font-bold tracking-wider uppercase">
            {mode === 'login' ? (
              <span>Don't have an account? <button onClick={() => setMode('register')} className="text-ink underline font-black">Register here</button></span>
            ) : (
              <span>Already registered? <button onClick={() => setMode('login')} className="text-ink underline font-black">Login now</button></span>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
