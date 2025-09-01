'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { FieldError, FieldErrors } from 'react-hook-form';

interface FormErrorProps {
  error?: FieldError | string;
  className?: string;
}

export function FormError({ error, className = '' }: FormErrorProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message;

  if (!errorMessage) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        transition={{ duration: 0.2 }}
        className={`flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mt-1 ${className}`}
      >
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>{errorMessage}</span>
      </motion.div>
    </AnimatePresence>
  );
}

interface FormSuccessProps {
  message: string;
  className?: string;
}

export function FormSuccess({ message, className = '' }: FormSuccessProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mt-1 ${className}`}
    >
      <CheckCircle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </motion.div>
  );
}

interface FormInfoProps {
  message: string;
  className?: string;
}

export function FormInfo({ message, className = '' }: FormInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 mt-1 ${className}`}
    >
      <Info className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </motion.div>
  );
}

interface FormErrorSummaryProps {
  errors: FieldErrors;
  title?: string;
  className?: string;
  onDismiss?: () => void;
}

export function FormErrorSummary({
  errors,
  title = 'Please fix the following errors:',
  className = '',
  onDismiss,
}: FormErrorSummaryProps) {
  const errorEntries = Object.entries(errors).filter(
    ([_, error]) => error?.message
  );

  if (errorEntries.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">
                {title}
              </h3>
              <ul className="space-y-1">
                {errorEntries.map(([field, error]) => (
                  <motion.li
                    key={field}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm text-red-700 dark:text-red-300"
                  >
                    • {error?.message}
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

interface FieldValidationProps {
  isValid?: boolean;
  isInvalid?: boolean;
  isPending?: boolean;
  validMessage?: string;
  className?: string;
}

export function FieldValidation({
  isValid,
  isInvalid,
  isPending,
  validMessage = 'Looks good!',
  className = '',
}: FieldValidationProps) {
  return (
    <AnimatePresence>
      {isPending && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${className}`}
        >
          <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
        </motion.div>
      )}

      {isValid && !isPending && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${className}`}
        >
          <CheckCircle className="w-4 h-4 text-green-500" />
        </motion.div>
      )}

      {isInvalid && !isPending && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${className}`}
        >
          <AlertCircle className="w-4 h-4 text-red-500" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Real-time validation indicator for inputs
export function ValidationIndicator({
  value,
  rules,
  className = '',
}: {
  value: string;
  rules: Array<{
    test: (value: string) => boolean;
    message: string;
  }>;
  className?: string;
}) {
  const results = rules.map((rule) => ({
    ...rule,
    passed: rule.test(value),
  }));

  const allPassed = results.every((r) => r.passed);
  const hasValue = value.length > 0;

  if (!hasValue) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      transition={{ duration: 0.2 }}
      className={`mt-2 space-y-1 ${className}`}
    >
      {results.map((result, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`flex items-center gap-2 text-xs ${
            result.passed
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <motion.div
            animate={{ scale: result.passed ? 1.2 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {result.passed ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <div className="w-3 h-3 border border-current rounded-full" />
            )}
          </motion.div>
          <span>{result.message}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

// Password strength indicator
export function PasswordStrengthIndicator({
  password,
  className = '',
}: {
  password: string;
  className?: string;
}) {
  const rules = [
    { test: (p: string) => p.length >= 8, message: 'At least 8 characters' },
    { test: (p: string) => /[A-Z]/.test(p), message: 'One uppercase letter' },
    { test: (p: string) => /[a-z]/.test(p), message: 'One lowercase letter' },
    { test: (p: string) => /\d/.test(p), message: 'One number' },
    {
      test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
      message: 'One special character',
    },
  ];

  const passedCount = rules.filter((rule) => rule.test(password)).length;
  const strength = passedCount / rules.length;

  const getStrengthColor = () => {
    if (strength < 0.4) return 'bg-red-500';
    if (strength < 0.7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strength < 0.4) return 'Weak';
    if (strength < 0.7) return 'Medium';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <div className={`mt-2 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-600 dark:text-gray-400">
          Password strength:
        </span>
        <span
          className={`text-xs font-medium ${
            strength < 0.4
              ? 'text-red-600 dark:text-red-400'
              : strength < 0.7
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-green-600 dark:text-green-400'
          }`}
        >
          {getStrengthText()}
        </span>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${strength * 100}%` }}
          transition={{ duration: 0.3 }}
          className={`h-2 rounded-full ${getStrengthColor()}`}
        />
      </div>

      <ValidationIndicator value={password} rules={rules} />
    </div>
  );
}
