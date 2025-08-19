import { describe, it, expect } from 'vitest';

describe('OnboardingService', () => {
    it('should be able to import the service', async () => {
        const { OnboardingService } = await import('../onboarding.service');
        expect(OnboardingService).toBeDefined();
        expect(typeof OnboardingService).toBe('function');
    });

    it('should have expected methods', async () => {
        const { OnboardingService } = await import('../onboarding.service');
        const service = new OnboardingService();

        expect(typeof service.getUserOnboardingStatus).toBe('function');
        expect(typeof service.updateUserRole).toBe('function');
        expect(typeof service.processCreatorStep1).toBe('function');
        expect(typeof service.processCreatorStep2).toBe('function');
        expect(typeof service.processCreatorStep3).toBe('function');
        expect(typeof service.processBuyerStep1).toBe('function');
        expect(typeof service.processBuyerStep2).toBe('function');
        expect(typeof service.processBuyerStep3).toBe('function');
    });

    it('should export onboardingService instance', async () => {
        const { onboardingService } = await import('../onboarding.service');
        expect(onboardingService).toBeDefined();
        expect(typeof onboardingService.getUserOnboardingStatus).toBe('function');
    });
});