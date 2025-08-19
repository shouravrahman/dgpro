import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OnboardingFlow } from '../onboarding-flow';

// Mock the child components
vi.mock('../role-selection', () => ({
  RoleSelection: ({ onRoleSelect }: any) => (
    <div data-testid="role-selection">
      <button onClick={() => onRoleSelect('creator')}>Select Creator</button>
      <button onClick={() => onRoleSelect('buyer')}>Select Buyer</button>
    </div>
  ),
}));

vi.mock('../creator-onboarding', () => ({
  CreatorOnboarding: ({ onStepComplete }: any) => (
    <div data-testid="creator-onboarding">
      <button onClick={() => onStepComplete(1, { test: 'data' })}>
        Complete Step 1
      </button>
    </div>
  ),
}));

vi.mock('../buyer-onboarding', () => ({
  BuyerOnboarding: ({ onStepComplete }: any) => (
    <div data-testid="buyer-onboarding">
      <button onClick={() => onStepComplete(1, { test: 'data' })}>
        Complete Step 1
      </button>
    </div>
  ),
}));

vi.mock('../onboarding-complete', () => ({
  OnboardingComplete: () => (
    <div data-testid="onboarding-complete">Onboarding Complete</div>
  ),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe('OnboardingFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  it('should render loading state initially', () => {
    (global.fetch as any).mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep loading state
    );

    render(<OnboardingFlow />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should render role selection when no role is set', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          role: null,
          currentStep: 0,
          isCompleted: false,
          completedSteps: [],
        },
      }),
    });

    render(<OnboardingFlow />);

    await waitFor(() => {
      expect(screen.getByTestId('role-selection')).toBeInTheDocument();
    });
  });

  it('should render creator onboarding when creator role is selected', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          role: 'creator',
          currentStep: 1,
          isCompleted: false,
          completedSteps: [],
        },
      }),
    });

    render(<OnboardingFlow />);

    await waitFor(() => {
      expect(screen.getByTestId('creator-onboarding')).toBeInTheDocument();
    });
  });

  it('should render buyer onboarding when buyer role is selected', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          role: 'buyer',
          currentStep: 1,
          isCompleted: false,
          completedSteps: [],
        },
      }),
    });

    render(<OnboardingFlow />);

    await waitFor(() => {
      expect(screen.getByTestId('buyer-onboarding')).toBeInTheDocument();
    });
  });

  it('should render completion screen when onboarding is complete', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          role: 'creator',
          currentStep: 3,
          isCompleted: true,
          completedSteps: [1, 2, 3],
        },
      }),
    });

    render(<OnboardingFlow />);

    await waitFor(() => {
      expect(screen.getByTestId('onboarding-complete')).toBeInTheDocument();
    });
  });

  it('should handle role selection', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            role: null,
            currentStep: 0,
            isCompleted: false,
            completedSteps: [],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { role: 'creator' },
        }),
      });

    render(<OnboardingFlow />);

    await waitFor(() => {
      expect(screen.getByTestId('role-selection')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Select Creator'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/onboarding/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'creator' }),
      });
    });
  });

  it('should handle step completion', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            role: 'creator',
            currentStep: 1,
            isCompleted: false,
            completedSteps: [],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            role: 'creator',
            currentStep: 2,
            isCompleted: false,
            completedSteps: [1],
          },
        }),
      });

    render(<OnboardingFlow />);

    await waitFor(() => {
      expect(screen.getByTestId('creator-onboarding')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Complete Step 1'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/onboarding/step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'creator',
          step: 1,
          data: { test: 'data' },
        }),
      });
    });
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<OnboardingFlow />);

    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });
});
