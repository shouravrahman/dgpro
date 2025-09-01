import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SupportProvider } from '../support-provider';
import { SupportButton } from '../support-button';

// Mock fetch
global.fetch = vi.fn();

// Mock the support agent hook
vi.mock('@/hooks/use-support-agent', () => ({
  useSupportAgent: () => ({
    messages: [],
    isLoading: false,
    error: null,
    sendMessage: vi.fn().mockResolvedValue(undefined),
    clearConversation: vi.fn(),
    retryLastMessage: vi.fn().mockResolvedValue(undefined),
    sessionId: 'test-session-123',
  }),
}));

describe('Support System Integration', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          message: 'Test response from support agent',
          category: 'general_inquiry',
          confidence: 0.8,
          sessionId: 'test-session-123',
          escalationRequired: false,
          suggestedActions: ['Check FAQ'],
          followUpQuestions: ['Need more help?'],
          relatedArticles: [],
          estimatedResolutionTime: 'Within 24 hours',
        }),
    });
  });

  it('should render support button and open chat when clicked', async () => {
    render(
      <SupportProvider userId="test-user">
        <SupportButton />
      </SupportProvider>
    );

    // Should show support button
    const supportButton = screen.getByRole('button', { name: /get help/i });
    expect(supportButton).toBeInTheDocument();

    // Click to open chat
    await user.click(supportButton);

    // Should show chat interface
    expect(screen.getByText('Support Chat')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Type your message...')
    ).toBeInTheDocument();
  });

  it('should display welcome message and quick actions', async () => {
    render(
      <SupportProvider userId="test-user">
        <SupportButton />
      </SupportProvider>
    );

    // Open chat
    await user.click(screen.getByRole('button', { name: /get help/i }));

    // Should show welcome message
    expect(screen.getByText(/Hi! I'm here to help you/)).toBeInTheDocument();

    // Should show quick action buttons
    expect(screen.getByText('Account Help')).toBeInTheDocument();
    expect(screen.getByText('Technical Support')).toBeInTheDocument();
    expect(screen.getByText('Billing Question')).toBeInTheDocument();
  });

  it('should send message and display response', async () => {
    const mockSendMessage = vi.fn().mockResolvedValue(undefined);

    // Mock the hook to return our mock function
    vi.doMock('@/hooks/use-support-agent', () => ({
      useSupportAgent: () => ({
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'I need help',
            timestamp: new Date(),
          },
          {
            id: 'msg-2',
            role: 'assistant',
            content: "I'm here to help! What can I assist you with?",
            timestamp: new Date(),
            metadata: { confidence: 0.9 },
          },
        ],
        isLoading: false,
        error: null,
        sendMessage: mockSendMessage,
        clearConversation: vi.fn(),
        retryLastMessage: vi.fn(),
        sessionId: 'test-session-123',
      }),
    }));

    render(
      <SupportProvider userId="test-user">
        <SupportButton />
      </SupportProvider>
    );

    // Open chat
    await user.click(screen.getByRole('button', { name: /get help/i }));

    // Should show messages
    expect(screen.getByText('I need help')).toBeInTheDocument();
    expect(
      screen.getByText("I'm here to help! What can I assist you with?")
    ).toBeInTheDocument();
  });

  it('should handle urgency and category selection', async () => {
    render(
      <SupportProvider userId="test-user">
        <SupportButton />
      </SupportProvider>
    );

    // Open chat
    await user.click(screen.getByRole('button', { name: /get help/i }));

    // Should have urgency selector
    const urgencySelect = screen.getByDisplayValue('Medium');
    expect(urgencySelect).toBeInTheDocument();

    // Should have category selector
    const categorySelect = screen.getByText('Category (optional)');
    expect(categorySelect).toBeInTheDocument();
  });

  it('should minimize and maximize chat', async () => {
    render(
      <SupportProvider userId="test-user">
        <SupportButton />
      </SupportProvider>
    );

    // Open chat
    await user.click(screen.getByRole('button', { name: /get help/i }));

    // Find and click minimize button
    const minimizeButton = screen.getByRole('button', { name: '' }); // Minimize button
    await user.click(minimizeButton);

    // Chat should be minimized (title still visible but content hidden)
    expect(screen.getByText('Support Chat')).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText('Type your message...')
    ).not.toBeInTheDocument();
  });

  it('should close chat when close button is clicked', async () => {
    render(
      <SupportProvider userId="test-user">
        <SupportButton />
      </SupportProvider>
    );

    // Open chat
    await user.click(screen.getByRole('button', { name: /get help/i }));

    // Should show chat
    expect(screen.getByText('Support Chat')).toBeInTheDocument();

    // Find and click close button (X icon)
    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find(
      (button) =>
        button.querySelector('svg') &&
        button.getAttribute('class')?.includes('h-8 w-8')
    );

    if (closeButton) {
      await user.click(closeButton);
    }

    // Chat should be closed
    expect(screen.queryByText('Support Chat')).not.toBeInTheDocument();
  });

  it('should handle quick action clicks', async () => {
    const mockSendMessage = vi.fn().mockResolvedValue(undefined);

    vi.doMock('@/hooks/use-support-agent', () => ({
      useSupportAgent: () => ({
        messages: [],
        isLoading: false,
        error: null,
        sendMessage: mockSendMessage,
        clearConversation: vi.fn(),
        retryLastMessage: vi.fn(),
        sessionId: 'test-session-123',
      }),
    }));

    render(
      <SupportProvider userId="test-user">
        <SupportButton />
      </SupportProvider>
    );

    // Open chat
    await user.click(screen.getByRole('button', { name: /get help/i }));

    // Click on Account Help quick action
    const accountHelpButton = screen.getByText('Account Help');
    await user.click(accountHelpButton);

    // Should call sendMessage with the appropriate message
    expect(mockSendMessage).toHaveBeenCalledWith('I need help with my account');
  });

  it('should display error messages', async () => {
    vi.doMock('@/hooks/use-support-agent', () => ({
      useSupportAgent: () => ({
        messages: [],
        isLoading: false,
        error: 'Network connection failed',
        sendMessage: vi.fn().mockRejectedValue(new Error('Network error')),
        clearConversation: vi.fn(),
        retryLastMessage: vi.fn(),
        sessionId: 'test-session-123',
      }),
    }));

    render(
      <SupportProvider userId="test-user">
        <SupportButton />
      </SupportProvider>
    );

    // Open chat
    await user.click(screen.getByRole('button', { name: /get help/i }));

    // Should show error message
    expect(screen.getByText(/Network connection failed/)).toBeInTheDocument();
  });

  it('should show loading state', async () => {
    vi.doMock('@/hooks/use-support-agent', () => ({
      useSupportAgent: () => ({
        messages: [],
        isLoading: true,
        error: null,
        sendMessage: vi.fn(),
        clearConversation: vi.fn(),
        retryLastMessage: vi.fn(),
        sessionId: 'test-session-123',
      }),
    }));

    render(
      <SupportProvider userId="test-user">
        <SupportButton />
      </SupportProvider>
    );

    // Open chat
    await user.click(screen.getByRole('button', { name: /get help/i }));

    // Should show loading animation (bouncing dots)
    const loadingDots = screen.container.querySelectorAll('.animate-bounce');
    expect(loadingDots.length).toBeGreaterThan(0);
  });

  it('should handle form submission', async () => {
    const mockSendMessage = vi.fn().mockResolvedValue(undefined);

    vi.doMock('@/hooks/use-support-agent', () => ({
      useSupportAgent: () => ({
        messages: [],
        isLoading: false,
        error: null,
        sendMessage: mockSendMessage,
        clearConversation: vi.fn(),
        retryLastMessage: vi.fn(),
        sessionId: 'test-session-123',
      }),
    }));

    render(
      <SupportProvider userId="test-user">
        <SupportButton />
      </SupportProvider>
    );

    // Open chat
    await user.click(screen.getByRole('button', { name: /get help/i }));

    // Type message
    const messageInput = screen.getByPlaceholderText('Type your message...');
    await user.type(messageInput, 'Test message');

    // Submit form
    const sendButton = screen.getByRole('button', { name: '' }); // Send button with Send icon
    await user.click(sendButton);

    // Should call sendMessage
    expect(mockSendMessage).toHaveBeenCalledWith('Test message', {
      urgency: undefined,
      category: undefined,
    });
  });
});
