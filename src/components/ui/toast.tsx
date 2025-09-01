'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface ToastProps extends Toast {
  onClose: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
  loading: Loader2,
};

const toastStyles = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400',
    title: 'text-green-900 dark:text-green-100',
    description: 'text-green-700 dark:text-green-300',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400',
    title: 'text-red-900 dark:text-red-100',
    description: 'text-red-700 dark:text-red-300',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    icon: 'text-yellow-600 dark:text-yellow-400',
    title: 'text-yellow-900 dark:text-yellow-100',
    description: 'text-yellow-700 dark:text-yellow-300',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    title: 'text-blue-900 dark:text-blue-100',
    description: 'text-blue-700 dark:text-blue-300',
  },
  loading: {
    bg: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800',
    icon: 'text-gray-600 dark:text-gray-400',
    title: 'text-gray-900 dark:text-gray-100',
    description: 'text-gray-700 dark:text-gray-300',
  },
};

export function ToastComponent({
  id,
  type,
  title,
  description,
  action,
  persistent,
  onClose,
}: ToastProps) {
  const Icon = toastIcons[type];
  const styles = toastStyles[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`relative max-w-sm w-full ${styles.bg} border rounded-lg shadow-lg p-4`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Icon
            className={`w-5 h-5 ${styles.icon} ${
              type === 'loading' ? 'animate-spin' : ''
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium ${styles.title}`}>{title}</h4>

          {description && (
            <p className={`mt-1 text-sm ${styles.description}`}>
              {description}
            </p>
          )}

          {action && (
            <div className="mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={action.onClick}
                className="text-xs"
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>

        {!persistent && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onClose(id)}
            className="flex-shrink-0 p-1 h-auto hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Progress bar for timed toasts */}
      {!persistent && type !== 'loading' && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: 5, ease: 'linear' }}
          className="absolute bottom-0 left-0 h-1 bg-current opacity-20 rounded-b-lg"
        />
      )}
    </motion.div>
  );
}

// Toast container component
export function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: Toast[];
  onClose: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastComponent key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Preset toast components
export function SuccessToast({
  title,
  description,
  onClose,
}: {
  title: string;
  description?: string;
  onClose: () => void;
}) {
  return (
    <ToastComponent
      id="success"
      type="success"
      title={title}
      description={description}
      onClose={onClose}
    />
  );
}

export function ErrorToast({
  title,
  description,
  onClose,
  onRetry,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  onRetry?: () => void;
}) {
  return (
    <ToastComponent
      id="error"
      type="error"
      title={title}
      description={description}
      action={onRetry ? { label: 'Retry', onClick: onRetry } : undefined}
      onClose={onClose}
    />
  );
}

export function LoadingToast({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <ToastComponent
      id="loading"
      type="loading"
      title={title}
      description={description}
      persistent={true}
      onClose={() => {}}
    />
  );
}
