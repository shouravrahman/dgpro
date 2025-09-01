'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'pulse' | 'wave';
  speed?: 'slow' | 'normal' | 'fast';
}

export function Skeleton({
  className,
  variant = 'default',
  speed = 'normal',
  ...props
}: SkeletonProps) {
  const speedDuration = {
    slow: 2,
    normal: 1.5,
    fast: 1,
  };

  const baseClasses = 'bg-gray-200 dark:bg-gray-800 rounded-md';

  if (variant === 'pulse') {
    return (
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: speedDuration[speed],
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={cn(baseClasses, className)}
        {...props}
      />
    );
  }

  if (variant === 'wave') {
    return (
      <div
        className={cn(baseClasses, 'relative overflow-hidden', className)}
        {...props}
      >
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{
            duration: speedDuration[speed],
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-600/20 to-transparent"
        />
      </div>
    );
  }

  return (
    <div className={cn(baseClasses, 'animate-pulse', className)} {...props} />
  );
}

// Preset skeleton components
export function TextSkeleton({
  lines = 1,
  className = '',
  variant = 'default',
}: {
  lines?: number;
  className?: string;
  variant?: 'default' | 'pulse' | 'wave';
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant={variant}
          className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function AvatarSkeleton({
  size = 'md',
  variant = 'default',
}: {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pulse' | 'wave';
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <Skeleton
      variant={variant}
      className={`${sizeClasses[size]} rounded-full`}
    />
  );
}

export function ButtonSkeleton({
  size = 'md',
  variant = 'default',
}: {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pulse' | 'wave';
}) {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-28',
  };

  return (
    <Skeleton variant={variant} className={`${sizeClasses[size]} rounded-md`} />
  );
}

export function CardSkeleton({
  variant = 'default',
  showImage = true,
  showActions = true,
}: {
  variant?: 'default' | 'pulse' | 'wave';
  showImage?: boolean;
  showActions?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
      {showImage && (
        <Skeleton variant={variant} className="w-full h-48 rounded-lg" />
      )}

      <div className="space-y-3">
        <Skeleton variant={variant} className="h-6 w-3/4" />
        <TextSkeleton lines={2} variant={variant} />
      </div>

      {showActions && (
        <div className="flex justify-between items-center pt-4">
          <Skeleton variant={variant} className="h-6 w-16" />
          <ButtonSkeleton variant={variant} />
        </div>
      )}
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  variant = 'default',
}: {
  rows?: number;
  columns?: number;
  variant?: 'default' | 'pulse' | 'wave';
}) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant={variant} className="h-6 w-full" />
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                variant={variant}
                className="h-4 w-full"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton({
  fields = 3,
  variant = 'default',
}: {
  fields?: number;
  variant?: 'default' | 'pulse' | 'wave';
}) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant={variant} className="h-4 w-24" />
          <Skeleton variant={variant} className="h-10 w-full" />
        </div>
      ))}

      <div className="flex gap-3 pt-4">
        <ButtonSkeleton variant={variant} />
        <ButtonSkeleton variant={variant} />
      </div>
    </div>
  );
}

export function ChartSkeleton({
  variant = 'default',
}: {
  variant?: 'default' | 'pulse' | 'wave';
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton variant={variant} className="h-6 w-32" />
        <Skeleton variant={variant} className="h-8 w-24" />
      </div>

      <Skeleton variant={variant} className="w-full h-64 rounded-lg" />

      <div className="flex justify-center gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton variant={variant} className="w-3 h-3 rounded-full" />
            <Skeleton variant={variant} className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
