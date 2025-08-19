'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Palette, ShoppingCart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-errors';
import {
  roleSelectionSchema,
  type RoleSelection,
  type UserRole,
} from '@/lib/validations/onboarding';

interface RoleSelectionProps {
  onRoleSelect: (role: UserRole) => void;
  loading?: boolean;
}

const roles = [
  {
    id: 'creator' as const,
    title: 'Creator',
    description: 'I want to create and sell digital products',
    icon: Palette,
    features: [
      'AI-powered product creation',
      'Market trend analysis',
      'Automated product recreation',
      'Revenue tracking & analytics',
    ],
    gradient: 'from-purple-500 to-pink-500',
    bgGradient:
      'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
  },
  {
    id: 'buyer' as const,
    title: 'Buyer',
    description: 'I want to discover and buy digital products',
    icon: ShoppingCart,
    features: [
      'Personalized product recommendations',
      'Curated marketplace access',
      'Trending product discovery',
      'Creator following & updates',
    ],
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient:
      'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
  },
];

export function RoleSelection({
  onRoleSelect,
  loading = false,
}: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RoleSelection>({
    resolver: zodResolver(roleSelectionSchema),
  });

  const onSubmit = (data: RoleSelection) => {
    onRoleSelect(data.role);
  };

  const handleRoleClick = (role: UserRole) => {
    setSelectedRole(role);
    setValue('role', role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full"
      >
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Welcome to AI Product Creator
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Let's personalize your experience. Choose your primary goal to get
            started.
          </motion.p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {roles.map((role, index) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;

              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative cursor-pointer transition-all duration-300 ${
                    isSelected ? 'scale-105' : ''
                  }`}
                  onClick={() => handleRoleClick(role.id)}
                >
                  <div
                    className={`p-8 rounded-2xl border-2 transition-all duration-300 ${
                      isSelected
                        ? `border-transparent bg-gradient-to-br ${role.bgGradient} shadow-xl`
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </motion.div>
                    )}

                    {/* Icon */}
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-6`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {role.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                      {role.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-3">
                      {role.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: 0.6 + featureIndex * 0.1,
                            duration: 0.4,
                          }}
                          className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <div
                            className={`w-2 h-2 rounded-full bg-gradient-to-r ${role.gradient}`}
                          />
                          {feature}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {errors.role && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <FormError
                message={errors.role.message || 'Please select a role'}
              />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center"
          >
            <Button
              type="submit"
              disabled={!selectedRole || loading}
              className="px-8 py-3 text-lg font-semibold flex items-center gap-3 mx-auto"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Setting up your account...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Don't worry, you can always change this later in your settings.
            </p>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
