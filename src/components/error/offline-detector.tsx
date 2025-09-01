'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OfflineDetectorProps {
  showBanner?: boolean;
  onRetry?: () => void;
}

export function OfflineDetector({
  showBanner = true,
  onRetry,
}: OfflineDetectorProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflinePage, setShowOfflinePage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflinePage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      // Show offline page after a short delay to avoid flashing
      setTimeout(() => {
        if (!navigator.onLine) {
          setShowOfflinePage(true);
        }
      }, 2000);
    };

    // Set initial state
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  // Offline banner (appears at top of page)
  const OfflineBanner = () => (
    <AnimatePresence>
      {!isOnline && showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-3 shadow-lg"
        >
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <WifiOff className="w-5 h-5" />
              <div>
                <p className="font-medium">You're offline</p>
                <p className="text-sm text-red-100">
                  Check your internet connection to continue
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Full offline page (replaces content when offline for extended period)
  const OfflinePage = () => (
    <AnimatePresence>
      {showOfflinePage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-white dark:bg-gray-900 flex items-center justify-center p-4"
        >
          <div className="max-w-md w-full text-center">
            {/* Animated offline icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative mb-8"
            >
              <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <WifiOff className="w-12 h-12 text-red-600 dark:text-red-400" />
              </div>

              {/* Pulsing rings */}
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 border-2 border-red-300 dark:border-red-700 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="absolute inset-0 border-2 border-red-300 dark:border-red-700 rounded-full"
              />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                You're Offline
              </h1>

              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                It looks like you've lost your internet connection. Don't worry,
                we'll automatically reconnect when your connection is restored.
              </p>
            </motion.div>

            {/* Connection status */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-red-800 dark:text-red-300">
                  No Internet Connection
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="space-y-4"
            >
              <Button
                onClick={handleRetry}
                className="w-full flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>

              <div className="text-left bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Troubleshooting Tips:
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Check your Wi-Fi connection</li>
                  <li>• Try switching to mobile data</li>
                  <li>• Restart your router</li>
                  <li>• Contact your internet provider</li>
                </ul>
              </div>
            </motion.div>

            {/* Auto-retry indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-6 text-xs text-gray-500 dark:text-gray-400"
            >
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-3 h-3"
                >
                  <RefreshCw className="w-3 h-3" />
                </motion.div>
                Automatically checking connection...
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <OfflineBanner />
      <OfflinePage />
    </>
  );
}

// Hook for offline status
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Offline indicator component (small status indicator)
export function OfflineIndicator() {
  const isOnline = useOfflineStatus();

  if (isOnline) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed bottom-4 left-4 z-50"
    >
      <div className="bg-red-600 text-white px-3 py-2 rounded-full shadow-lg flex items-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">Offline</span>
      </div>
    </motion.div>
  );
}
