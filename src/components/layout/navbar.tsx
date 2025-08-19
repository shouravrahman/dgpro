'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  BarChart3,
  Sparkles,
  TrendingUp,
  ShoppingBag,
} from 'lucide-react';

const navigation = [
  { name: 'Features', href: '/#features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'How it Works', href: '/how-it-works' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

// Dynamic navigation based on user role
const getNavigationForRole = (role: string | null) => {
  const baseNav = [{ name: 'Dashboard', href: '/dashboard', icon: BarChart3 }];

  if (role === 'creator') {
    return [
      ...baseNav,
      { name: 'Creator Studio', href: '/creator', icon: Sparkles },
      { name: 'Trends', href: '/trends', icon: TrendingUp },
    ];
  } else if (role === 'buyer') {
    return [
      ...baseNav,
      { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
      { name: 'Trends', href: '/trends', icon: TrendingUp },
    ];
  }

  return baseNav;
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut, loading, onboardingStatus } = useAuth();
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isAuthPage = pathname?.startsWith('/auth');
  const isDashboard =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/creator') ||
    pathname?.startsWith('/trends');

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled || isOpen
          ? 'bg-background/95 backdrop-blur-md border-b shadow-sm'
          : 'bg-transparent',
        isAuthPage && 'bg-background/95 backdrop-blur-md border-b'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                AI Product Creator
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!isDashboard && !isAuthPage && (
              <>
                {navigation.map((item) => (
                  <motion.div
                    key={item.name}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium"
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </>
            )}

            {/* User Navigation for Dashboard */}
            {isDashboard && user && (
              <>
                {getNavigationForRole(onboardingStatus?.role || null).map(
                  (item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <motion.div
                        key={item.name}
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 0 }}
                      >
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-200',
                            isActive
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      </motion.div>
                    );
                  }
                )}
              </>
            )}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {loading ? (
              <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                {!isDashboard && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button asChild size="sm">
                      <Link href="/dashboard">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                  </motion.div>
                )}

                {/* User Avatar & Dropdown */}
                <div className="relative group">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium max-w-24 truncate">
                      {user.user_metadata?.full_name?.split(' ')[0] || 'User'}
                    </span>
                  </motion.button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-background border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-2">
                      <div className="px-3 py-2 text-sm text-muted-foreground border-b">
                        {user.email}
                      </div>
                      <Link
                        href="/settings"
                        className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={signOut}
                        className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="ghost" asChild>
                    <Link href="/login">Sign in</Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button asChild>
                    <Link href="/register">Get Started</Link>
                  </Button>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md hover:bg-muted/50 transition-colors"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden border-t bg-background/95 backdrop-blur-md"
            >
              <div className="px-4 py-6 space-y-4">
                {/* Navigation Links */}
                {!isDashboard && !isAuthPage && (
                  <div className="space-y-2">
                    {navigation.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                        >
                          {item.name}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* User Navigation for Dashboard */}
                {isDashboard && user && (
                  <div className="space-y-2">
                    {getNavigationForRole(onboardingStatus?.role || null).map(
                      (item, index) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                          <motion.div
                            key={item.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Link
                              href={item.href}
                              className={cn(
                                'flex items-center space-x-3 px-3 py-2 rounded-md transition-colors',
                                isActive
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                              )}
                            >
                              <Icon className="w-5 h-5" />
                              <span className="font-medium">{item.name}</span>
                            </Link>
                          </motion.div>
                        );
                      }
                    )}
                  </div>
                )}

                {/* Auth Section */}
                <div className="pt-4 border-t">
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 px-3 py-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {user.user_metadata?.full_name || 'User'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>

                      {!isDashboard && (
                        <Button asChild className="w-full">
                          <Link href="/dashboard">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Dashboard
                          </Link>
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        onClick={signOut}
                        className="w-full"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/login">Sign in</Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link href="/register">Get Started</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
