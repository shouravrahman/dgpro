import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { onboardingService } from '@/lib/database/services/onboarding.service';
import { ApiErrorHandler, ApiAuthenticationError, ApiDatabaseError, withApiErrorHandler } from '@/lib/api-error-handler';

export const GET = withApiErrorHandler(async (request: NextRequest) => {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
        throw new ApiAuthenticationError(`Authentication failed: ${authError.message}`);
    }

    if (!user) {
        throw new ApiAuthenticationError('User not authenticated');
    }

    // Get onboarding status
    const status = await onboardingService.getUserOnboardingStatus(user.id);

    if (!status) {
        throw new ApiDatabaseError('Failed to fetch onboarding status');
    }

    return ApiErrorHandler.success(status, 'Onboarding status retrieved successfully');
});