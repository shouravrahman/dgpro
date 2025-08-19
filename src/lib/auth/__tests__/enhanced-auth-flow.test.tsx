/**
 * Enhanced Auth Flow Integration Tests
 *
 * Tests the complete authentication and onboarding flow including:
 * - Auth context with onboarding integration
 * - Auth hooks behavior
 * - Route access logic
 * - Smart post-auth routing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import {
  AuthProvider,
  useAuth,
  useRequireAuth,
  useRedirectIfAuthenticated,
  useRouteAccess,
  useFeatureAccess,
} from '../context';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => '/test'),
}));

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    resend: vi.fn(),
    refreshSession: vi.fn(),
  },
};

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock fetch for API calls
global.fetch = vi.fn();

// Test component to access auth context
const TestComponent = ({ children }: { children?: React.ReactNode }) => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="user-status">
        {auth.loading
          ? 'loading'
          : auth.user
            ? 'authenticated'
            : 'unauthenticated'}
      </div>
      <div data-testid="onboarding-status">
        {auth.onboardingLoading
          ? 'onboarding-loading'
          : auth.onboardingStatus
            ? `${auth.onboardingStatus.role}-${auth.onboardingStatus.isCompleted ? 'completed' : 'incomplete'}`
            : 'no-onboarding'}
      </div>
      <div data-testid="user-email">{auth.user?.email || 'no-email'}</div>
      {children}
    </div>
  );
};

// Test component for auth hooks
const TestAuthHooks = ({ pathname = '/dashboard' }: { pathname?: string }) => {
  const { user, loading } = useRequireAuth();
  const {
    canAccess,
    loading: accessLoading,
    redirectTo,
  } = useRouteAccess(pathname);
  const canCreateProducts = useFeatureAccess('create-product');
  const canPurchaseProducts = useFeatureAccess('purchase-product');

  return (
    <div>
      <div data-testid="require-auth-loading">
        {loading ? 'loading' : 'not-loading'}
      </div>
      <div data-testid="require-auth-user">{user ? 'has-user' : 'no-user'}</div>
      <div data-testid="route-access">
        {canAccess ? 'can-access' : 'cannot-access'}
      </div>
      <div data-testid="route-access-loading">
        {accessLoading ? 'loading' : 'not-loading'}
      </div>
      <div data-testid="redirect-to">{redirectTo || 'none'}</div>
      <div data-testid="can-create-products">
        {canCreateProducts ? 'yes' : 'no'}
      </div>
      <div data-testid="can-purchase-products">
        {canPurchaseProducts ? 'yes' : 'no'}
      </div>
    </div>
  );
};

const TestRedirectIfAuthenticated = () => {
  const { loading } = useRedirectIfAuthenticated();
  return (
    <div data-testid="redirect-loading">
      {loading ? 'loading' : 'not-loading'}
    </div>
  );
};

const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

describe('Enhanced Auth Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
    (global.fetch as any).mockClear();
  });

  describe('AuthProvider with Onboarding Integration', () => {
    it('should load user and onboarding status on mount', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' },
      };

      const mockOnboardingStatus = {
        role: 'creator' as const,
        currentStep: 3,
        isCompleted: true,
        completedSteps: [1, 2, 3],
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockOnboardingStatus,
          }),
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for auth and onboarding to load
      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent(
          'authenticated'
        );
        expect(screen.getByTestId('onboarding-status')).toHaveTextContent(
          'creator-completed'
        );
        expect(screen.getByTestId('user-email')).toHaveTextContent(
          'test@example.com'
        );
      });

      // Verify API call was made
      expect(global.fetch).toHaveBeenCalledWith('/api/onboarding/status');
    });

    it('should handle missing onboarding status', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' },
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: false,
            error: 'No onboarding status found',
          }),
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent(
          'authenticated'
        );
        expect(screen.getByTestId('onboarding-status')).toHaveTextContent(
          'no-onboarding'
        );
      });
    });

    it('should handle unauthenticated users', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent(
          'unauthenticated'
        );
        expect(screen.getByTestId('onboarding-status')).toHaveTextContent(
          'no-onboarding'
        );
        expect(screen.getByTestId('user-email')).toHaveTextContent('no-email');
      });

      // Should not call onboarding API for unauthenticated users
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('useRequireAuth Hook', () => {
    it('should redirect unauthenticated users to login', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      render(
        <AuthProvider>
          <TestAuthHooks />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login');
      });
    });

    it('should not redirect authenticated users', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { role: 'creator', isCompleted: true },
          }),
      });

      render(
        <AuthProvider>
          <TestAuthHooks />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('require-auth-user')).toHaveTextContent(
          'has-user'
        );
      });

      expect(mockPush).not.toHaveBeenCalledWith('/auth/login');
    });
  });

  describe('useRedirectIfAuthenticated Hook', () => {
    it('should redirect authenticated users with completed onboarding', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { role: 'creator', isCompleted: true },
          }),
      });

      render(
        <AuthProvider>
          <TestRedirectIfAuthenticated />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/creator');
      });
    });

    it('should redirect to onboarding for incomplete onboarding', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { role: 'creator', isCompleted: false, currentStep: 1 },
          }),
      });

      render(
        <AuthProvider>
          <TestRedirectIfAuthenticated />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/onboarding');
      });
    });
  });

  describe('useRouteAccess Hook', () => {
    it('should allow access to public routes', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      render(
        <AuthProvider>
          <TestAuthHooks pathname="/" />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('route-access')).toHaveTextContent(
          'can-access'
        );
        expect(screen.getByTestId('redirect-to')).toHaveTextContent('none');
      });
    });

    it('should deny access to protected routes for unauthenticated users', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      render(
        <AuthProvider>
          <TestAuthHooks pathname="/dashboard" />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('route-access')).toHaveTextContent(
          'cannot-access'
        );
        expect(screen.getByTestId('redirect-to')).toHaveTextContent('/login');
      });
    });

    it('should redirect to onboarding for incomplete onboarding', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { role: 'creator', isCompleted: false, currentStep: 1 },
          }),
      });

      render(
        <AuthProvider>
          <TestAuthHooks pathname="/dashboard" />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('route-access')).toHaveTextContent(
          'cannot-access'
        );
        expect(screen.getByTestId('redirect-to')).toHaveTextContent(
          '/onboarding'
        );
      });
    });

    it('should enforce role-based access for creator routes', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { role: 'buyer', isCompleted: true },
          }),
      });

      render(
        <AuthProvider>
          <TestAuthHooks pathname="/creator" />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('route-access')).toHaveTextContent(
          'cannot-access'
        );
        expect(screen.getByTestId('redirect-to')).toHaveTextContent(
          '/marketplace'
        );
      });
    });
  });

  describe('useFeatureAccess Hook', () => {
    it('should grant creator features to creators', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { role: 'creator', isCompleted: true },
          }),
      });

      render(
        <AuthProvider>
          <TestAuthHooks />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('can-create-products')).toHaveTextContent(
          'yes'
        );
        expect(screen.getByTestId('can-purchase-products')).toHaveTextContent(
          'no'
        );
      });
    });

    it('should grant buyer features to buyers', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { role: 'buyer', isCompleted: true },
          }),
      });

      render(
        <AuthProvider>
          <TestAuthHooks />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('can-create-products')).toHaveTextContent(
          'no'
        );
        expect(screen.getByTestId('can-purchase-products')).toHaveTextContent(
          'yes'
        );
      });
    });

    it('should deny features for incomplete onboarding', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { role: 'creator', isCompleted: false, currentStep: 1 },
          }),
      });

      render(
        <AuthProvider>
          <TestAuthHooks />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('can-create-products')).toHaveTextContent(
          'no'
        );
        expect(screen.getByTestId('can-purchase-products')).toHaveTextContent(
          'no'
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle onboarding API errors gracefully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      (global.fetch as any).mockRejectedValue(new Error('API Error'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent(
          'authenticated'
        );
        expect(screen.getByTestId('onboarding-status')).toHaveTextContent(
          'no-onboarding'
        );
      });
    });

    it('should handle auth session errors', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: new Error('Session error'),
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent(
          'unauthenticated'
        );
      });
    });
  });

  describe('Smart Post-Auth Routing Logic', () => {
    it('should determine correct redirect path for creators', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { role: 'creator', isCompleted: true },
          }),
      });

      // Simulate auth state change (sign in)
      let authCallback: ((event: string, session: any) => void) | null = null;
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation(
        (callback) => {
          authCallback = callback;
          return { data: { subscription: { unsubscribe: vi.fn() } } };
        }
      );

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Simulate sign in event
      if (authCallback) {
        authCallback('SIGNED_IN', { user: mockUser });
      }

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/creator');
      });
    });

    it('should determine correct redirect path for buyers', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { role: 'buyer', isCompleted: true },
          }),
      });

      // Simulate auth state change (sign in)
      let authCallback: ((event: string, session: unknown) => void) | null =
        null;
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation(
        (callback) => {
          authCallback = callback;
          return { data: { subscription: { unsubscribe: vi.fn() } } };
        }
      );

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Simulate sign in event
      if (authCallback) {
        authCallback('SIGNED_IN', { user: mockUser });
      }

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/marketplace');
      });
    });
  });
});
