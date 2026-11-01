import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ theme, onToggleTheme }) {
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={onToggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      className={`relative inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-none text-xs font-black tracking-wider uppercase border transition-all duration-200 select-none ${
        isDark
          ? 'bg-[#1a1c24] border-[#383d4e] text-[#d7ff36] hover:bg-[#232733] hover:border-[#d7ff36] shadow-[2px_2px_0px_#d7ff36]'
          : 'bg-white border-line text-ink hover:border-ink hover:bg-paper shadow-[2px_2px_0px_#111111]'
      }`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, scale: 0.2, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.2, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="text-[#d7ff36]"
            >
              <Moon className="w-3.5 h-3.5" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, scale: 0.2, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0.2, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="text-amber-500"
            >
              <Sun className="w-3.5 h-3.5" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <span className="hidden sm:inline font-mono font-bold text-[10px] tracking-widest">
        {isDark ? 'DARK' : 'LIGHT'}
      </span>
    </motion.button>
  );
}
