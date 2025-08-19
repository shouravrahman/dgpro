'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  primary?: boolean;
  badge?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  loading?: boolean;
}

export function QuickActions({ actions, loading = false }: QuickActionsProps) {
  if (loading) {
    return (
      <div>
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 bg-card rounded-xl border animate-pulse"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div>
                  <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              whileHover={{ y: -4 }}
              className="relative"
            >
              {action.badge && (
                <div className="absolute -top-2 -right-2 z-10">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {action.badge}
                  </span>
                </div>
              )}

              <Link
                href={action.href}
                className={`block p-6 bg-card rounded-xl border hover:border-${action.color}-200 dark:hover:border-${action.color}-800 transition-all duration-200 group ${
                  action.primary ? 'ring-2 ring-primary/20' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-${action.color}-100 dark:bg-${action.color}-900/20 group-hover:scale-110 transition-transform duration-200`}
                  >
                    <Icon
                      className={`w-6 h-6 text-${action.color}-600 dark:text-${action.color}-400`}
                    />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-200" />
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
