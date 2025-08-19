import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OnboardingComplete } from '../onboarding-complete';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
}));

describe('OnboardingComplete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render completion message for creator', () => {
    render(<OnboardingComplete role="creator" />);

    expect(
      screen.getByText('Welcome to AI Product Creator! 🎉')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Your creator account is all set up and ready to go!')
    ).toBeInTheDocument();
    expect(screen.getByText('Start Creating')).toBeInTheDocument();
  });

  it('should render completion message for buyer', () => {
    render(<OnboardingComplete role="buyer" />);

    expect(
      screen.getByText('Welcome to AI Product Creator! 🎉')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Your buyer account is all set up and ready to go!')
    ).toBeInTheDocument();
    expect(screen.getByText('Start Shopping')).toBeInTheDocument();
  });

  it('should display creator-specific features', () => {
    render(<OnboardingComplete role="creator" />);

    expect(
      screen.getByText('Upload and sell your digital products')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Access powerful creator tools')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Track your sales and analytics')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Build your brand and audience')
    ).toBeInTheDocument();
  });

  it('should display buyer-specific features', () => {
    render(<OnboardingComplete role="buyer" />);

    expect(
      screen.getByText('Discover amazing digital products')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Get personalized recommendations')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Follow your favorite creators')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Access exclusive deals and content')
    ).toBeInTheDocument();
  });

  it('should navigate to creator dashboard when creator clicks start', async () => {
    render(<OnboardingComplete role="creator" />);

    const startButton = screen.getByText('Start Creating');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/creator');
    });
  });

  it('should navigate to marketplace when buyer clicks start', async () => {
    render(<OnboardingComplete role="buyer" />);

    const startButton = screen.getByText('Start Shopping');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/marketplace');
    });
  });

  it('should navigate to dashboard when explore dashboard is clicked', async () => {
    render(<OnboardingComplete role="creator" />);

    const dashboardButton = screen.getByText('Explore Dashboard');
    fireEvent.click(dashboardButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should show confetti animation', () => {
    render(<OnboardingComplete role="creator" />);

    // Check for confetti container or animation elements
    const confettiElements = screen.getAllByText('🎉');
    expect(confettiElements.length).toBeGreaterThan(0);
  });

  it('should display success checkmark', () => {
    render(<OnboardingComplete role="creator" />);

    // Look for success indicator
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('should handle role prop correctly', () => {
    const { rerender } = render(<OnboardingComplete role="creator" />);

    expect(screen.getByText('Start Creating')).toBeInTheDocument();

    rerender(<OnboardingComplete role="buyer" />);

    expect(screen.getByText('Start Shopping')).toBeInTheDocument();
  });
});
