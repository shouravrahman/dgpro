'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white dark:bg-gray-800 rounded-lg border p-6"
    >
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={action.href}
                className={cn(
                  'block p-4 rounded-lg border-2 border-transparent hover:border-primary/20 transition-all group relative',
                  action.primary
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted/50 hover:bg-muted'
                )}
              >
                {action.badge && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    {action.badge}
                  </span>
                )}
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-5 h-5" />
                  <h4 className="font-medium">{action.title}</h4>
                </div>
                <p
                  className={cn(
                    'text-sm',
                    action.primary
                      ? 'text-primary-foreground/80'
                      : 'text-muted-foreground'
                  )}
                >
                  {action.description}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
