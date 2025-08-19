import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, useErrorHandler } from '../error-boundary';

// Mock the Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant }: any) => (
    <button onClick={onClick} className={className} data-variant={variant}>
      {children}
    </button>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  AlertTriangle: () => <div data-testid="alert-triangle" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  Home: () => <div data-testid="home-icon" />,
  ArrowLeft: () => <div data-testid="arrow-left-icon" />,
}));

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

// Component that can be controlled to throw or not
let shouldThrowError = false;
const ControllableThrowError = () => {
  if (shouldThrowError) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock window methods
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });

    Object.defineProperty(window, 'history', {
      value: { back: vi.fn() },
      writable: true,
    });
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(/We encountered an unexpected error/)
    ).toBeInTheDocument();
    expect(screen.getByTestId('alert-triangle')).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error fallback</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
    expect(
      screen.queryByText('Oops! Something went wrong')
    ).not.toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    const onErrorMock = vi.fn();

    render(
      <ErrorBoundary onError={onErrorMock}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onErrorMock).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('should show error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should hide error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(
      screen.queryByText('Error Details (Development)')
    ).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  describe('error boundary actions', () => {
    beforeEach(() => {
      shouldThrowError = true;
      render(
        <ErrorBoundary>
          <ControllableThrowError />
        </ErrorBoundary>
      );
    });

    it('should handle retry button click', () => {
      // Initially should show error
      expect(
        screen.getByText('Oops! Something went wrong')
      ).toBeInTheDocument();

      const retryButton = screen.getByRole('button', { name: /try again/i });

      // Stop throwing error before retry
      shouldThrowError = false;
      fireEvent.click(retryButton);

      // After retry, should show success content
      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(
        screen.queryByText('Oops! Something went wrong')
      ).not.toBeInTheDocument();
    });

    it('should handle go back button click', () => {
      const goBackButton = screen.getByRole('button', { name: /go back/i });
      fireEvent.click(goBackButton);

      expect(window.history.back).toHaveBeenCalled();
    });

    it('should handle go home button click', () => {
      const goHomeButton = screen.getByRole('button', { name: /home/i });
      fireEvent.click(goHomeButton);

      expect(window.location.href).toBe('/');
    });
  });

  it('should render all action buttons', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(
      screen.getByRole('button', { name: /try again/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /go back/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument();
  });

  it('should have proper CSS classes for styling', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const container = screen
      .getByText('Oops! Something went wrong')
      .closest('div');
    expect(container?.parentElement).toHaveClass(
      'min-h-screen',
      'flex',
      'items-center',
      'justify-center'
    );
  });
});

describe('useErrorHandler', () => {
  it('should return error handler function', () => {
    let errorHandler: ReturnType<typeof useErrorHandler>;

    function TestComponent() {
      errorHandler = useErrorHandler();
      return <div>Test</div>;
    }

    render(<TestComponent />);

    expect(typeof errorHandler!).toBe('function');
  });

  it('should log errors when called', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    let errorHandler: ReturnType<typeof useErrorHandler>;

    function TestComponent() {
      errorHandler = useErrorHandler();
      return <div>Test</div>;
    }

    render(<TestComponent />);

    const testError = new Error('Test error');
    const testErrorInfo = { componentStack: 'test stack' };

    errorHandler!(testError, testErrorInfo);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error caught:',
      testError,
      testErrorInfo
    );
  });
});
