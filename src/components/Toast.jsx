import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';

export default function Toast({ message, isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed bottom-6 left-1/2 z-50 bg-neutral-950 text-white px-5 py-3 border border-lime flex items-center gap-3 shadow-[6px_8px_0px_rgba(0,0,0,0.3)] pointer-events-none"
        >
          <Sparkles className="w-4 h-4 text-lime" />
          <span className="text-xs font-black tracking-wider uppercase">
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
