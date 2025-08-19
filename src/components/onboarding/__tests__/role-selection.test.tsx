import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RoleSelection } from '../role-selection';

describe('RoleSelection', () => {
  const mockOnRoleSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render both role options', () => {
    render(<RoleSelection onRoleSelect={mockOnRoleSelect} />);

    expect(screen.getByText("I'm a Creator")).toBeInTheDocument();
    expect(screen.getByText("I'm a Buyer")).toBeInTheDocument();
    expect(screen.getByText('Start Creating')).toBeInTheDocument();
    expect(screen.getByText('Start Shopping')).toBeInTheDocument();
  });

  it('should display creator role features', () => {
    render(<RoleSelection onRoleSelect={mockOnRoleSelect} />);

    expect(
      screen.getByText('Create and upload digital products')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Set your own prices and earn revenue')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Access creator tools and analytics')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Build your brand and following')
    ).toBeInTheDocument();
  });

  it('should display buyer role features', () => {
    render(<RoleSelection onRoleSelect={mockOnRoleSelect} />);

    expect(
      screen.getByText('Browse thousands of digital products')
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

  it('should call onRoleSelect when creator card is clicked', async () => {
    mockOnRoleSelect.mockResolvedValueOnce(undefined);
    render(<RoleSelection onRoleSelect={mockOnRoleSelect} />);

    const creatorCard =
      screen
        .getByText("I'm a Creator")
        .closest(
          'div[role="button"], div[tabindex], div[onclick], [onclick]'
        ) || screen.getByText('Start Creating').closest('div');

    if (creatorCard) {
      fireEvent.click(creatorCard);
    } else {
      // Fallback: click the button directly
      fireEvent.click(screen.getByText('Start Creating'));
    }

    await waitFor(() => {
      expect(mockOnRoleSelect).toHaveBeenCalledWith('creator');
    });
  });

  it('should call onRoleSelect when buyer card is clicked', async () => {
    mockOnRoleSelect.mockResolvedValueOnce(undefined);
    render(<RoleSelection onRoleSelect={mockOnRoleSelect} />);

    const buyerCard =
      screen
        .getByText("I'm a Buyer")
        .closest(
          'div[role="button"], div[tabindex], div[onclick], [onclick]'
        ) || screen.getByText('Start Shopping').closest('div');

    if (buyerCard) {
      fireEvent.click(buyerCard);
    } else {
      // Fallback: click the button directly
      fireEvent.click(screen.getByText('Start Shopping'));
    }

    await waitFor(() => {
      expect(mockOnRoleSelect).toHaveBeenCalledWith('buyer');
    });
  });

  it('should show loading state when role is being selected', async () => {
    let resolvePromise: (value: unknown) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockOnRoleSelect.mockReturnValueOnce(promise);

    render(<RoleSelection onRoleSelect={mockOnRoleSelect} />);

    fireEvent.click(screen.getByText('Start Creating'));

    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    // Resolve the promise to end loading state
    resolvePromise!(undefined);
  });

  it('should handle role selection errors', async () => {
    mockOnRoleSelect.mockRejectedValueOnce(new Error('Selection failed'));

    render(<RoleSelection onRoleSelect={mockOnRoleSelect} />);

    fireEvent.click(screen.getByText('Start Creating'));

    // Should not show loading after error
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  it('should disable interaction during loading', async () => {
    let resolvePromise: (value: unknown) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockOnRoleSelect.mockReturnValueOnce(promise);

    render(<RoleSelection onRoleSelect={mockOnRoleSelect} />);

    fireEvent.click(screen.getByText('Start Creating'));

    // Try to click buyer while creator is loading
    fireEvent.click(screen.getByText('Start Shopping'));

    // Should only have been called once (for creator)
    expect(mockOnRoleSelect).toHaveBeenCalledTimes(1);
    expect(mockOnRoleSelect).toHaveBeenCalledWith('creator');

    resolvePromise!(undefined);
  });
});
