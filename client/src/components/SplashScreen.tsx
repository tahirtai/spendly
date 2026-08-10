import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpendlyLogo } from './SpendlyLogo';

interface SplashScreenProps {
  onComplete?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hold splash screen for ~1.4s, then fade out
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 1600);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="spendly-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#f8f9ff] px-6 text-center select-none"
        >
          {/* Soft ambient glow behind logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 0.6, scale: 1.1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute h-48 w-48 rounded-full bg-gradient-to-tr from-[#4648d4]/20 via-[#5e5ce6]/25 to-[#a855f7]/15 blur-3xl pointer-events-none"
          />

          {/* Spendly Logo with scale and fade animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center gap-4"
          >
            <SpendlyLogo variant="full" size="xl" className="h-16 md:h-20 w-auto drop-shadow-md" />
          </motion.div>

          {/* Bottom subtle brand tagline & loading bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="absolute bottom-10 flex flex-col items-center gap-3 z-10"
          >
            {/* Minimal animated loader bar */}
            <div className="h-1 w-24 overflow-hidden rounded-full bg-slate-200/80">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  repeat: Infinity,
                  duration: 1.1,
                  ease: 'easeInOut',
                }}
                className="h-full w-full bg-gradient-to-r from-[#4648d4] to-[#5e5ce6] rounded-full"
              />
            </div>
            <span className="text-[11px] font-semibold tracking-wide text-[#767586] uppercase">
              Hostel &amp; PG Expense Platform
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
