'use client';

// Authentication Context and Hooks
// Provides authentication state management and user session handling

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error?: AuthError }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: AuthError }>;
  updatePassword: (password: string) => Promise<{ error?: AuthError }>;
  updateProfile: (data: { full_name?: string; avatar_url?: string }) => Promise<{ error?: AuthError }>;
  resendConfirmation: (email: string) => Promise<{ error?: AuthError }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          toast.error('Authentication error occurred');
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Unexpected error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            toast.success('Successfully signed in!');
            router.push('/dashboard');
            break;
          case 'SIGNED_OUT':
            toast.success('Successfully signed out!');
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
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  const signIn = async (email: string, password: string, rememberMe = false) => {
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
            toast.error('Please check your email and click the confirmation link.');
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
          data: { remember_me: true }
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

      toast.success('Account created! Please check your email for verification.');
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

  const updateProfile = async (data: { full_name?: string; avatar_url?: string }) => {
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
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    resendConfirmation,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Custom hooks for common auth patterns
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  return { user, loading };
}

export function useRedirectIfAuthenticated() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return { user, loading };
}