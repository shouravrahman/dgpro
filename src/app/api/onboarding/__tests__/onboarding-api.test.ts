import { describe, it, expect, beforeEach, vi } from 'vitest';

// Simple test to verify the API routes exist and can be imported
describe('Onboarding API Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should be able to import status route', async () => {
        const statusRoute = await import('../status/route');
        expect(statusRoute.GET).toBeDefined();
        expect(typeof statusRoute.GET).toBe('function');
    });

    it('should be able to import role route', async () => {
        const roleRoute = await import('../role/route');
        expect(roleRoute.POST).toBeDefined();
        expect(typeof roleRoute.POST).toBe('function');
    });

    it('should be able to import step route', async () => {
        const stepRoute = await import('../step/route');
        expect(stepRoute.POST).toBeDefined();
        expect(typeof stepRoute.POST).toBe('function');
    });
});