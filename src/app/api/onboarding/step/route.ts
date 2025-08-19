import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { onboardingService } from '@/lib/database/services/onboarding.service';
import {
    creatorStep1Schema,
    creatorStep2Schema,
    creatorStep3Schema,
    buyerStep1Schema,
    buyerStep2Schema,
    buyerStep3Schema
} from '@/lib/validations/onboarding';
import {
    ApiErrorHandler,
    ApiAuthenticationError,
    ApiValidationError,
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

    // Parse request body
    const body = await parseRequestBody(request);
    const { role, step, data } = body;

    if (!role || !step || !data) {
        throw new ApiValidationError('Missing required fields: role, step, data');
    }

    let validationResult;
    let success = false;

    // Validate and process based on role and step
    if (role === 'creator') {
        switch (step) {
            case 1:
                validationResult = creatorStep1Schema.safeParse(data);
                if (validationResult.success) {
                    success = await onboardingService.processCreatorStep1(user.id, validationResult.data);
                }
                break;
            case 2:
                validationResult = creatorStep2Schema.safeParse(data);
                if (validationResult.success) {
                    success = await onboardingService.processCreatorStep2(user.id, validationResult.data);
                }
                break;
            case 3:
                validationResult = creatorStep3Schema.safeParse(data);
                if (validationResult.success) {
                    success = await onboardingService.processCreatorStep3(user.id, validationResult.data);
                }
                break;
            default:
                throw new ApiValidationError('Invalid step number for creator');
        }
    } else if (role === 'buyer') {
        switch (step) {
            case 1:
                validationResult = buyerStep1Schema.safeParse(data);
                if (validationResult.success) {
                    success = await onboardingService.processBuyerStep1(user.id, validationResult.data);
                }
                break;
            case 2:
                validationResult = buyerStep2Schema.safeParse(data);
                if (validationResult.success) {
                    success = await onboardingService.processBuyerStep2(user.id, validationResult.data);
                }
                break;
            case 3:
                validationResult = buyerStep3Schema.safeParse(data);
                if (validationResult.success) {
                    success = await onboardingService.processBuyerStep3(user.id, validationResult.data);
                }
                break;
            default:
                throw new ApiValidationError('Invalid step number for buyer');
        }
    } else {
        throw new ApiValidationError('Invalid role');
    }

    // Check validation result
    if (!validationResult?.success) {
        throw new ApiValidationError('Invalid data', validationResult?.error?.issues);
    }

    // Check if processing was successful
    if (!success) {
        throw new ApiDatabaseError('Failed to process onboarding step');
    }

    // Get updated onboarding status
    const updatedStatus = await onboardingService.getUserOnboardingStatus(user.id);

    return ApiErrorHandler.success(
        updatedStatus,
        'Onboarding step completed successfully'
    );
});