import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { onboardingService } from '@/lib/database/services/onboarding.service';
import { roleSelectionSchema } from '@/lib/validations/onboarding';
import {
    ApiErrorHandler,
    ApiAuthenticationError,
    ApiDatabaseError,
    withApiErrorHandler,
    parseRequestBody
} from '@/lib/api-error-handler';

export const POST = withApiErrorHandler(async (request: NextRequest) => {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
        throw new ApiAuthenticationError(`Authentication failed: ${authError.message}`);
    }

    if (!user) {
        throw new ApiAuthenticationError('User not authenticated');
    }

    // Parse and validate request body
    const body = await parseRequestBody(request);

    // Validate using Zod schema (this will throw ZodError if invalid)
    const { role } = roleSelectionSchema.parse(body);

    // Update user role
    try {
        await onboardingService.updateUserRole(user.id, role);
    } catch (serviceError) {
        throw new ApiDatabaseError(`Role update failed: ${serviceError instanceof Error ? serviceError.message : 'Unknown error'}`);
    }

    return ApiErrorHandler.success(
        { role },
        'User role updated successfully'
    );
});