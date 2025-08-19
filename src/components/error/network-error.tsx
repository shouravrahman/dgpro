'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NetworkErrorProps {
  onRetry?: () => void;
  title?: string;
  message?: string;
  showRetryButton?: boolean;
}

export function NetworkError({
  onRetry,
  title = 'Connection Problem',
  message = "We're having trouble connecting to our servers. Please check your internet connection and try again.",
  showRetryButton = true,
}: NetworkErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);

    // Add a small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }

    setIsRetrying(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="max-w-md w-full text-center">
        {/* Animated network icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto w-24 h-24 mb-6"
        >
          <div className="absolute inset-0 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            {isOnline ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
              </motion.div>
            ) : (
              <WifiOff className="w-12 h-12 text-red-600 dark:text-red-400" />
            )}
          </div>

          {/* Connection status indicator */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${
              isOnline ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {isOnline ? (
              <Wifi className="w-3 h-3" />
            ) : (
              <WifiOff className="w-3 h-3" />
            )}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {title}
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {message}
          </p>

          {/* Connection status */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-6 ${
              isOnline
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4" />
                Connected - Server Issue
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                No Internet Connection
              </>
            )}
          </div>
        </motion.div>

        {showRetryButton && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center gap-2 mx-auto"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`}
              />
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </Button>
          </motion.div>
        )}

        {/* Troubleshooting tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-left"
        >
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            Troubleshooting Tips:
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Check your internet connection</li>
            <li>• Try refreshing the page</li>
            <li>• Disable any VPN or proxy</li>
            <li>• Clear your browser cache</li>
            {!isOnline && <li>• Make sure Wi-Fi is enabled</li>}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

// Hook for network status
export function useNetworkStatus() {
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
