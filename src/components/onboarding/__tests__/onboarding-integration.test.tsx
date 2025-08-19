import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

describe('Onboarding Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  it('should handle API calls for onboarding status', async () => {
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

    const response = await fetch('/api/onboarding/status');
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.role).toBe('creator');
  });

  it('should handle API calls for role selection', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { role: 'creator' },
      }),
    });

    const response = await fetch('/api/onboarding/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'creator' }),
    });
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.role).toBe('creator');
  });

  it('should handle API calls for step completion', async () => {
    (global.fetch as any).mockResolvedValueOnce({
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

    const response = await fetch('/api/onboarding/step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'creator',
        step: 1,
        data: { productTypes: ['digital-art'], experienceLevel: 'beginner' },
      }),
    });
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.currentStep).toBe(2);
    expect(data.data.completedSteps).toContain(1);
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    try {
      await fetch('/api/onboarding/status');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Network error');
    }
  });

  it('should handle invalid API responses', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        error: 'Invalid request',
      }),
    });

    const response = await fetch('/api/onboarding/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'invalid' }),
    });
    const data = await response.json();

    expect(response.ok).toBe(false);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid request');
  });
});
