/**
 * Enhanced Authentication Flow
 * Handles post-authentication routing based on user onboarding status
 */

import { User } from '@supabase/supabase-js';

export interface OnboardingStatus {
    role: 'creator' | 'buyer' | null;
    currentStep: number;
    isCompleted: boolean;
    completedSteps: number[];
}

export interface AuthFlowDecision {
    shouldRedirect: boolean;
    redirectPath: string;
    reason: string;
}

/**
 * Determines where to redirect a user after authentication
 * based on their onboarding status and role
 */
export async function determinePostAuthRedirect(
    user: User,
    onboardingStatus: OnboardingStatus | null
): Promise<AuthFlowDecision> {
    // If no onboarding status exists, user needs to start onboarding
    if (!onboardingStatus) {
        return {
            shouldRedirect: true,
            redirectPath: '/onboarding',
            reason: 'No onboarding status found - starting onboarding'
        };
    }

    // If onboarding is not completed, continue where they left off
    if (!onboardingStatus.isCompleted) {
        return {
            shouldRedirect: true,
            redirectPath: '/onboarding',
            reason: `Onboarding incomplete - on step ${onboardingStatus.currentStep}`
        };
    }

    // If onboarding is completed, route based on role
    if (onboardingStatus.isCompleted && onboardingStatus.role) {
        const roleDashboards = {
            creator: '/creator',
            buyer: '/marketplace'
        };

        return {
            shouldRedirect: true,
            redirectPath: roleDashboards[onboardingStatus.role],
            reason: `Onboarding complete - routing to ${onboardingStatus.role} dashboard`
        };
    }

    // Fallback to general dashboard
    return {
        shouldRedirect: true,
        redirectPath: '/dashboard',
        reason: 'Fallback to general dashboard'
    };
}

/**
 * Fetches user onboarding status from the API
 */
export async function fetchOnboardingStatus(): Promise<OnboardingStatus | null> {
    try {
        const response = await fetch('/api/onboarding/status');

        if (!response.ok) {
            console.error('Failed to fetch onboarding status:', response.statusText);
            return null;
        }

        const result = await response.json();

        if (!result.success) {
            console.error('Onboarding status API error:', result.error);
            return null;
        }

        return result.data;
    } catch (error) {
        console.error('Error fetching onboarding status:', error);
        return null;
    }
}

/**
 * Checks if a user should be allowed to access a protected route
 * based on their onboarding status
 */
export function canAccessRoute(
    route: string,
    onboardingStatus: OnboardingStatus | null
): { canAccess: boolean; redirectTo?: string; reason: string } {
    // Public routes that don't require onboarding
    const publicRoutes = ['/', '/about', '/pricing', '/contact', '/terms', '/privacy'];
    const authRoutes = ['/login', '/register', '/forgot-password'];

    if (publicRoutes.includes(route) || authRoutes.includes(route)) {
        return { canAccess: true, reason: 'Public route' };
    }

    // Onboarding route is always accessible to authenticated users
    if (route === '/onboarding') {
        return { canAccess: true, reason: 'Onboarding route' };
    }

    // If no onboarding status, redirect to onboarding
    if (!onboardingStatus) {
        return {
            canAccess: false,
            redirectTo: '/onboarding',
            reason: 'No onboarding status'
        };
    }

    // If onboarding not completed, only allow onboarding route
    if (!onboardingStatus.isCompleted) {
        return {
            canAccess: false,
            redirectTo: '/onboarding',
            reason: 'Onboarding not completed'
        };
    }

    // Role-specific route protection
    const roleRoutes = {
        creator: ['/creator', '/products/create', '/analytics'],
        buyer: ['/marketplace', '/purchases', '/wishlist']
    };

    // Check if route requires specific role
    for (const [role, routes] of Object.entries(roleRoutes)) {
        if (routes.some(r => route.startsWith(r))) {
            if (onboardingStatus.role !== role) {
                const correctDashboard = role === 'creator' ? '/creator' : '/marketplace';
                return {
                    canAccess: false,
                    redirectTo: correctDashboard,
                    reason: `Route requires ${role} role, user is ${onboardingStatus.role}`
                };
            }
        }
    }

    // Allow access to general routes
    return { canAccess: true, reason: 'Access granted' };
}

/**
 * Route definitions for different user types
 */
export const ROUTE_DEFINITIONS = {
    // Public routes (no auth required)
    public: ['/', '/about', '/pricing', '/contact', '/terms', '/privacy', '/how-it-works'],

    // Auth routes (redirect if already authenticated)
    auth: ['/login', '/register', '/forgot-password'],

    // Onboarding routes (require auth, accessible during onboarding)
    onboarding: ['/onboarding'],

    // Creator routes (require completed creator onboarding)
    creator: ['/creator', '/products', '/analytics', '/earnings'],

    // Buyer routes (require completed buyer onboarding)  
    buyer: ['/marketplace', '/purchases', '/wishlist', '/following'],

    // General authenticated routes (require completed onboarding)
    authenticated: ['/dashboard', '/profile', '/settings', '/support']
} as const;

/**
 * Gets the appropriate dashboard URL for a user based on their role
 */
export function getDashboardUrl(role: 'creator' | 'buyer' | null): string {
    switch (role) {
        case 'creator':
            return '/creator';
        case 'buyer':
            return '/marketplace';
        default:
            return '/dashboard';
    }
}

/**
 * Validates if a user can access a specific feature based on their onboarding
 */
export function canAccessFeature(
    feature: string,
    onboardingStatus: OnboardingStatus | null
): boolean {
    if (!onboardingStatus?.isCompleted) {
        return false;
    }

    const featurePermissions = {
        'create-product': ['creator'],
        'purchase-product': ['buyer'],
        'view-analytics': ['creator'],
        'manage-wishlist': ['buyer'],
        'follow-creators': ['buyer'],
        'view-earnings': ['creator']
    };

    const requiredRoles = featurePermissions[feature as keyof typeof featurePermissions];

    if (!requiredRoles) {
        return true; // Feature doesn't have role restrictions
    }

    return requiredRoles.includes(onboardingStatus.role as string);
}