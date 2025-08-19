'use client';

import { motion } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  Users,
  FileText,
  Inbox,
  Star,
  TrendingUp,
  Plus,
  Sparkles,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  illustration?:
    | 'search'
    | 'products'
    | 'users'
    | 'files'
    | 'inbox'
    | 'favorites'
    | 'trends';
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

const illustrations = {
  search: Search,
  products: ShoppingBag,
  users: Users,
  files: FileText,
  inbox: Inbox,
  favorites: Star,
  trends: TrendingUp,
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  illustration = 'search',
  showSearch = false,
  onSearch,
}: EmptyStateProps) {
  const Icon = icon || illustrations[illustration];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center max-w-md mx-auto">
      {/* Animated illustration */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative mb-6"
      >
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Icon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
        </div>

        {/* Floating particles */}
        <motion.div
          animate={{
            y: [-5, 5, -5],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-2 -right-2 w-3 h-3 bg-blue-400 rounded-full"
        />

        <motion.div
          animate={{
            y: [5, -5, 5],
            opacity: [0.5, 0.9, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute -bottom-2 -left-2 w-2 h-2 bg-purple-400 rounded-full"
        />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          {description}
        </p>
      </motion.div>

      {/* Search input */}
      {showSearch && onSearch && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search..."
              className="pl-10"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || 'default'}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {action.label}
          </Button>
        )}

        {secondaryAction && (
          <Button onClick={secondaryAction.onClick} variant="outline">
            {secondaryAction.label}
          </Button>
        )}
      </motion.div>
    </div>
  );
}

// Specific empty state components
export function NoProductsFound({
  onCreateProduct,
  onBrowseMarketplace,
}: {
  onCreateProduct?: () => void;
  onBrowseMarketplace?: () => void;
}) {
  return (
    <EmptyState
      illustration="products"
      title="No products found"
      description="You haven't created any products yet. Start building your first AI-powered product to get started!"
      action={
        onCreateProduct
          ? {
              label: 'Create Product',
              onClick: onCreateProduct,
            }
          : undefined
      }
      secondaryAction={
        onBrowseMarketplace
          ? {
              label: 'Browse Marketplace',
              onClick: onBrowseMarketplace,
            }
          : undefined
      }
    />
  );
}

export function NoSearchResults({
  query,
  onClearSearch,
}: {
  query: string;
  onClearSearch?: () => void;
}) {
  return (
    <EmptyState
      illustration="search"
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try adjusting your search terms or browse our categories.`}
      action={
        onClearSearch
          ? {
              label: 'Clear Search',
              onClick: onClearSearch,
              variant: 'outline',
            }
          : undefined
      }
    />
  );
}

export function NoFavorites({
  onBrowseProducts,
}: {
  onBrowseProducts?: () => void;
}) {
  return (
    <EmptyState
      illustration="favorites"
      title="No favorites yet"
      description="Start exploring products and save your favorites here for quick access later."
      action={
        onBrowseProducts
          ? {
              label: 'Browse Products',
              onClick: onBrowseProducts,
            }
          : undefined
      }
    />
  );
}

export function NoTrends() {
  return (
    <EmptyState
      illustration="trends"
      title="No trending data"
      description="We're still collecting trend data. Check back soon to see what's popular in the AI product space!"
    />
  );
}

export function EmptyInbox({
  onCreateProduct,
}: {
  onCreateProduct?: () => void;
}) {
  return (
    <EmptyState
      illustration="inbox"
      title="All caught up!"
      description="You have no new notifications or messages. Great job staying on top of things!"
      action={
        onCreateProduct
          ? {
              label: 'Create Something New',
              onClick: onCreateProduct,
            }
          : undefined
      }
    />
  );
}

// Animated empty state with custom illustration
export function CustomEmptyState({
  children,
  title,
  description,
  actions,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center max-w-md mx-auto">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mb-6"
      >
        {children}
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          {description}
        </p>
      </motion.div>

      {actions && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {actions}
        </motion.div>
      )}
    </div>
  );
}

// Creative empty state with animated SVG
export function CreativeEmptyState() {
  return (
    <CustomEmptyState
      title="Ready to create magic?"
      description="Your creative journey starts here. Let's build something amazing together!"
      actions={
        <Button className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Start Creating
        </Button>
      }
    >
      <div className="relative w-32 h-32">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        >
          <div className="w-full h-full border-4 border-dashed border-purple-300 dark:border-purple-700 rounded-full" />
        </motion.div>

        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-4 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center"
        >
          <Package className="w-8 h-8 text-white" />
        </motion.div>

        {/* Floating sparkles */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [-10, -20, -10],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            className={`absolute w-2 h-2 bg-yellow-400 rounded-full ${
              i === 0
                ? 'top-0 left-1/4'
                : i === 1
                  ? 'top-1/4 right-0'
                  : i === 2
                    ? 'bottom-0 right-1/4'
                    : 'bottom-1/4 left-0'
            }`}
          />
        ))}
      </div>
    </CustomEmptyState>
  );
}
