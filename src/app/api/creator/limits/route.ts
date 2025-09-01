import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { checkUsageLimit } from '@/lib/usage-limits';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Check product creation limits
        const productLimits = await checkUsageLimit(user.id, 'products');

        const limits = {
            canCreate: productLimits.canUse,
            remainingProducts: productLimits.limit === -1 ? -1 : Math.max(0, productLimits.limit - productLimits.currentUsage),
            planLimit: productLimits.limit,
            requiresUpgrade: !productLimits.canUse,
            message: !productLimits.canUse
                ? `You've reached your ${productLimits.tier} plan limit of ${productLimits.limit} products. Upgrade to create more!`
                : undefined
        };

        return NextResponse.json({
            success: true,
            data: limits
        });

    } catch (error) {
        console.error('Creator limits error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}