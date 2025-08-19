'use client';

// Enhanced Authentication Context with Onboarding Integration
// Provides authentication state management and intelligent post-auth routing

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface OnboardingStatus {
  role: 'creator' | 'buyer' | null;
  currentStep: number;
  isCompleted: boolean;
  completedSteps: number[];
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  onboardingStatus: OnboardingStatus | null;
  onboardingLoading: boolean;
  signIn: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<{ error?: AuthError }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: AuthError }>;
  updatePassword: (password: string) => Promise<{ error?: AuthError }>;
  updateProfile: (data: {
    full_name?: string;
    avatar_url?: string;
  }) => Promise<{ error?: AuthError }>;
  resendConfirmation: (email: string) => Promise<{ error?: AuthError }>;
  refreshSession: () => Promise<void>;
  refreshOnboardingStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingStatus, setOnboardingStatus] =
    useState<OnboardingStatus | null>(null);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Fetch onboarding status for authenticated users
  const fetchOnboardingStatus = async (
    userId: string
  ): Promise<OnboardingStatus | null> => {
    try {
      setOnboardingLoading(true);
      const response = await fetch('/api/onboarding/status');

      if (!response.ok) {
        console.error(
          'Failed to fetch onboarding status:',
          response.statusText
        );
        return null;
      }

      const result = await response.json();

      if (!result.success) {
        console.error('Onboarding status API error:', result.error);
        return null;
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      return null;
    } finally {
      setOnboardingLoading(false);
    }
  };

  // Determine where to redirect user based on onboarding status
  const determineRedirectPath = (
    onboardingStatus: OnboardingStatus | null
  ): string => {
    // If no onboarding status, start onboarding
    if (!onboardingStatus) {
      return '/onboarding';
    }

    // If onboarding not completed, continue onboarding
    if (!onboardingStatus.isCompleted) {
      return '/onboarding';
    }

    // If onboarding completed, route based on role
    if (onboardingStatus.role === 'creator') {
      return '/creator';
    } else if (onboardingStatus.role === 'buyer') {
      return '/marketplace';
    }

    // Fallback to general dashboard
    return '/dashboard';
  };

  // Refresh onboarding status (useful after completing onboarding steps)
  const refreshOnboardingStatus = async () => {
    if (user) {
      const status = await fetchOnboardingStatus(user.id);
      setOnboardingStatus(status);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          toast.error('Authentication error occurred');
        } else {
          setSession(session);
          setUser(session?.user ?? null);

          // Fetch onboarding status if user is authenticated
          if (session?.user) {
            const status = await fetchOnboardingStatus(session.user.id);
            setOnboardingStatus(status);
          }
        }
      } catch (error) {
        console.error('Unexpected error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle different auth events
      switch (event) {
        case 'SIGNED_IN':
          toast.success('Successfully signed in!');

          // Fetch onboarding status and redirect accordingly
          if (session?.user) {
            const status = await fetchOnboardingStatus(session.user.id);
            setOnboardingStatus(status);
            const redirectPath = determineRedirectPath(status);

            console.log(
              'Redirecting to:',
              redirectPath,
              'based on onboarding status:',
              status
            );
            router.push(redirectPath);
          }
          break;

        case 'SIGNED_OUT':
          toast.success('Successfully signed out!');
          setOnboardingStatus(null);
          router.push('/');
          break;

        case 'PASSWORD_RECOVERY':
          toast.success('Password recovery email sent!');
          break;

        case 'USER_UPDATED':
          toast.success('Profile updated successfully!');
          break;

        case 'TOKEN_REFRESHED':
          console.log('Token refreshed');
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  const signIn = async (
    email: string,
    password: string,
    rememberMe = false
  ) => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        // Handle specific error types
        switch (error.message) {
          case 'Invalid login credentials':
            toast.error('Invalid email or password. Please try again.');
            break;
          case 'Email not confirmed':
            toast.error(
              'Please check your email and click the confirmation link.'
            );
            break;
          case 'Too many requests':
            toast.error('Too many login attempts. Please try again later.');
            break;
          default:
            toast.error(error.message || 'An error occurred during sign in.');
        }
        return { error };
      }

      // Set session persistence based on rememberMe
      if (rememberMe) {
        await supabase.auth.updateUser({
          data: { remember_me: true },
        });
      }

      return {};
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('An unexpected error occurred. Please try again.');
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        // Handle specific error types
        switch (error.message) {
          case 'User already registered':
            toast.error('An account with this email already exists.');
            break;
          case 'Password should be at least 6 characters':
            toast.error('Password must be at least 6 characters long.');
            break;
          default:
            toast.error(error.message || 'An error occurred during sign up.');
        }
        return { error };
      }

      toast.success(
        'Account created! Please check your email for verification.'
      );
      return {};
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('An unexpected error occurred. Please try again.');
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign out error:', error);
        toast.error('Error signing out. Please try again.');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (error) {
        toast.error(error.message || 'Error sending reset email.');
        return { error };
      }

      toast.success('Password reset email sent! Check your inbox.');
      return {};
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('An unexpected error occurred.');
      return { error: error as AuthError };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        toast.error(error.message || 'Error updating password.');
        return { error };
      }

      toast.success('Password updated successfully!');
      return {};
    } catch (error) {
      console.error('Update password error:', error);
      toast.error('An unexpected error occurred.');
      return { error: error as AuthError };
    }
  };

  const updateProfile = async (data: {
    full_name?: string;
    avatar_url?: string;
  }) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data,
      });

      if (error) {
        toast.error(error.message || 'Error updating profile.');
        return { error };
      }

      return {};
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('An unexpected error occurred.');
      return { error: error as AuthError };
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.toLowerCase().trim(),
      });

      if (error) {
        toast.error(error.message || 'Error resending confirmation.');
        return { error };
      }

      toast.success('Confirmation email sent! Check your inbox.');
      return {};
    } catch (error) {
      console.error('Resend confirmation error:', error);
      toast.error('An unexpected error occurred.');
      return { error: error as AuthError };
    }
  };

  const refreshSession = async () => {
    try {
      const { error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('Refresh session error:', error);
      }
    } catch (error) {
      console.error('Refresh session error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    onboardingStatus,
    onboardingLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    resendConfirmation,
    refreshSession,
    refreshOnboardingStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Enhanced hooks with onboarding awareness
export function useRequireAuth() {
  const { user, loading, onboardingStatus, onboardingLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  return { user, loading, onboardingStatus, onboardingLoading };
}

export function useRedirectIfAuthenticated() {
  const { user, loading, onboardingStatus } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && onboardingStatus) {
      // Determine redirect path based on onboarding status
      let redirectPath = '/dashboard';

      if (!onboardingStatus.isCompleted) {
        redirectPath = '/onboarding';
      } else if (onboardingStatus.role === 'creator') {
        redirectPath = '/creator';
      } else if (onboardingStatus.role === 'buyer') {
        redirectPath = '/marketplace';
      }

      router.push(redirectPath);
    }
  }, [user, loading, onboardingStatus, router]);

  return { user, loading, onboardingStatus };
}

// New hook to check if user can access a specific route
export function useRouteAccess(route: string) {
  const { user, loading, onboardingStatus } = useAuth();

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/about',
    '/pricing',
    '/contact',
    '/terms',
    '/privacy',
    '/how-it-works',
  ];
  const authRoutes = ['/login', '/register', '/forgot-password'];

  if (publicRoutes.includes(route) || authRoutes.includes(route)) {
    return { canAccess: true, loading: false };
  }

  // If still loading, don't make access decisions yet
  if (loading) {
    return { canAccess: false, loading: true };
  }

  // If not authenticated, can't access protected routes
  if (!user) {
    return { canAccess: false, loading: false, redirectTo: '/login' };
  }

  // Onboarding route is always accessible to authenticated users
  if (route === '/onboarding') {
    return { canAccess: true, loading: false };
  }

  // If no onboarding status or onboarding not completed, redirect to onboarding
  if (!onboardingStatus || !onboardingStatus.isCompleted) {
    return { canAccess: false, loading: false, redirectTo: '/onboarding' };
  }

  // Role-specific route protection
  const creatorRoutes = ['/creator', '/products', '/analytics', '/earnings'];
  const buyerRoutes = ['/marketplace', '/purchases', '/wishlist', '/following'];

  if (creatorRoutes.some((r) => route.startsWith(r))) {
    if (onboardingStatus.role !== 'creator') {
      return { canAccess: false, loading: false, redirectTo: '/marketplace' };
    }
  }

  if (buyerRoutes.some((r) => route.startsWith(r))) {
    if (onboardingStatus.role !== 'buyer') {
      return { canAccess: false, loading: false, redirectTo: '/creator' };
    }
  }

  return { canAccess: true, loading: false };
}

// Hook to check if user can access a specific feature
export function useFeatureAccess(feature: string) {
  const { onboardingStatus } = useAuth();

  if (!onboardingStatus?.isCompleted) {
    return false;
  }

  const featurePermissions = {
    'create-product': ['creator'],
    'purchase-product': ['buyer'],
    'view-analytics': ['creator'],
    'manage-wishlist': ['buyer'],
    'follow-creators': ['buyer'],
    'view-earnings': ['creator'],
  };

  const requiredRoles =
    featurePermissions[feature as keyof typeof featurePermissions];

  if (!requiredRoles) {
    return true; // Feature doesn't have role restrictions
  }

  return requiredRoles.includes(onboardingStatus.role as string);
}
