'use client';

import { motion } from 'framer-motion';
import { Loader2, Sparkles, Zap, Brain, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Generic loading spinner
export function LoadingSpinner({
  size = 'md',
  text,
}: {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
}

// AI-themed loading with animated particles
export function AILoadingState({
  message = 'AI is thinking...',
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        {/* Central brain icon */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center"
        >
          <Brain className="w-8 h-8 text-white" />
        </motion.div>

        {/* Orbiting particles */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ rotate: 360 }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
          >
            <div
              className={`absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full ${
                i === 0
                  ? '-top-2 left-1/2'
                  : i === 1
                    ? 'top-1/2 -right-2'
                    : '-bottom-2 left-1/2'
              }`}
            />
          </motion.div>
        ))}
      </div>

      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300"
      >
        {message}
      </motion.p>

      <div className="mt-2 flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            className="w-1 h-1 bg-purple-500 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}

// Progress bar with steps
export function ProgressLoader({
  steps,
  currentStep,
  title = 'Processing...',
}: {
  steps: string[];
  currentStep: number;
  title?: string;
}) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
        <motion.div
          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0.5 }}
            animate={{
              opacity: index <= currentStep ? 1 : 0.5,
              x: index === currentStep ? [0, 5, 0] : 0,
            }}
            transition={{ duration: 0.3 }}
            className={`flex items-center gap-3 p-2 rounded ${
              index === currentStep ? 'bg-purple-50 dark:bg-purple-900/20' : ''
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                index < currentStep
                  ? 'bg-green-500'
                  : index === currentStep
                    ? 'bg-purple-500 animate-pulse'
                    : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
            <span
              className={`text-sm ${
                index <= currentStep
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {step}
            </span>
            {index === currentStep && (
              <Loader2 className="w-4 h-4 animate-spin text-purple-500 ml-auto" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Card skeleton for product listings
export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <Skeleton className="w-full h-48 mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}

// Dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Search loading state
export function SearchLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4"
      >
        <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </motion.div>

      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Searching...
      </motion.p>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Finding the best results for you
      </p>
    </div>
  );
}

// File upload loading
export function FileUploadLoading({
  fileName,
  progress,
}: {
  fileName: string;
  progress: number;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
        >
          <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
        </motion.div>

        <div className="flex-1">
          <p className="font-medium text-gray-900 dark:text-white truncate">
            {fileName}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Uploading... {progress}%
          </p>
        </div>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <motion.div
          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
