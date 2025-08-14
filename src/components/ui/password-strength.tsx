'use client';

// Password Strength Indicator Component
// Visual feedback for password strength with animated progress bar

import React from 'react';
import { getPasswordStrength } from '@/lib/validations/auth';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export function PasswordStrength({
  password,
  className,
}: PasswordStrengthProps) {
  const { score, feedback, color } = getPasswordStrength(password);

  if (!password) return null;

  const strengthLabels = [
    'Very Weak',
    'Weak',
    'Fair',
    'Good',
    'Strong',
    'Very Strong',
  ];
  const strengthLabel =
    strengthLabels[Math.min(score, strengthLabels.length - 1)];
  const progressPercentage = (score / 5) * 100;

  const colorClasses = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Progress Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-300 ease-out',
              colorClasses[color]
            )}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span
          className={cn(
            'text-xs font-medium transition-colors duration-300',
            color === 'red' && 'text-red-600',
            color === 'orange' && 'text-orange-600',
            color === 'yellow' && 'text-yellow-600',
            color === 'green' && 'text-green-600'
          )}
        >
          {strengthLabel}
        </span>
      </div>

      {/* Feedback */}
      {feedback.length > 0 && (
        <div className="space-y-1">
          {feedback.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <div className="w-1 h-1 bg-muted-foreground rounded-full" />
              {item}
            </div>
          ))}
        </div>
      )}

      {/* Security Tips */}
      {score >= 4 && (
        <div className="flex items-center gap-2 text-xs text-green-600">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Great! Your password is strong and secure.
        </div>
      )}
    </div>
  );
}
