import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreatorOnboarding } from '../creator-onboarding';

// Mock form components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
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
  CardDescription: ({ children, ...props }: any) => (
    <p {...props}>{children}</p>
  ),
}));

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/radio-group', () => ({
  RadioGroup: ({ value, onValueChange, children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  RadioGroupItem: ({ value, ...props }: any) => (
    <input type="radio" value={value} {...props} />
  ),
}));

vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value, ...props }: any) => (
    <div data-testid="progress" data-value={value} {...props} />
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ ...props }: any) => <input {...props} />,
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({ ...props }: any) => <textarea {...props} />,
}));

vi.mock('@/components/ui/loading-states', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

vi.mock('@/components/ui/form-errors', () => ({
  FormError: ({ message }: any) => (
    <div data-testid="form-error">{message}</div>
  ),
}));

vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: vi.fn(),
    handleSubmit: vi.fn((fn) => (e: any) => {
      e.preventDefault();
      fn({});
    }),
    formState: { errors: {} },
    watch: vi.fn(),
    setValue: vi.fn(),
  }),
}));

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn(),
}));

describe('CreatorOnboarding', () => {
  const mockOnStepComplete = vi.fn();
  const mockProps = {
    currentStep: 1,
    completedSteps: [],
    onStepComplete: mockOnStepComplete,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render step 1 initially', () => {
    render(<CreatorOnboarding {...mockProps} />);

    expect(
      screen.getByText('Tell us about your creative journey')
    ).toBeInTheDocument();
    expect(
      screen.getByText('What type of products do you want to create?')
    ).toBeInTheDocument();
  });

  it('should show progress indicator', () => {
    render(<CreatorOnboarding {...mockProps} />);

    const progress = screen.getByTestId('progress');
    expect(progress).toHaveAttribute('data-value', '0'); // No steps completed
  });

  it('should render step 2 when current step is 2', () => {
    const step2Props = { ...mockProps, currentStep: 2, completedSteps: [1] };

    render(<CreatorOnboarding {...step2Props} />);

    expect(screen.getByText('Set your goals')).toBeInTheDocument();
  });

  it('should render step 3 when current step is 3', () => {
    const step3Props = { ...mockProps, currentStep: 3, completedSteps: [1, 2] };

    render(<CreatorOnboarding {...step3Props} />);

    expect(screen.getByText('Almost done!')).toBeInTheDocument();
  });

  it('should handle form submission', async () => {
    mockOnStepComplete.mockResolvedValueOnce(undefined);

    render(<CreatorOnboarding {...mockProps} />);

    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(mockOnStepComplete).toHaveBeenCalled();
    });
  });

  it('should show loading state during submission', async () => {
    let resolvePromise: (value: unknown) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockOnStepComplete.mockReturnValueOnce(promise);

    render(<CreatorOnboarding {...mockProps} />);

    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    resolvePromise!(undefined);
  });

  it('should allow going back to previous step', () => {
    const step2Props = { ...mockProps, currentStep: 2, completedSteps: [1] };

    render(<CreatorOnboarding {...step2Props} />);

    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);

    // Should show step 1 content
    expect(
      screen.getByText('Tell us about your creative journey')
    ).toBeInTheDocument();
  });

  it('should handle form submission errors gracefully', async () => {
    mockOnStepComplete.mockRejectedValueOnce(new Error('Submission failed'));

    render(<CreatorOnboarding {...mockProps} />);

    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    // Should not show loading after error
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });
});
