import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SubscriptionIntelligenceService } from '@/lib/services/subscription-intelligence';
import { z } from 'zod';

const PersonalizedOffersRequestSchema = z.object({
    offerTypes: z.array(z.enum(['discount', 'trial_extension', 'feature_unlock', 'bonus_credits'])).optional(),
    maxOffers: z.number().min(1).max(10).optional().default(5),
    targetSegment: z.string().optional(),
});

// GET /api/subscription-intelligence/personalized-offers - Get personalized offers
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const url = new URL(request.url);
        const maxOffers = parseInt(url.searchParams.get('maxOffers') || '5');
        const offerTypes = url.searchParams.get('offerTypes')?.split(',') as any[];

        const intelligenceService = new SubscriptionIntelligenceService();
        const intelligence = await intelligenceService.generateIntelligence(user.id);

        let offers = intelligence.personalizedOffers;

        // Filter by offer types if specified
        if (offerTypes && offerTypes.length > 0) {
            offers = offers.filter(offer => offerTypes.includes(offer.type));
        }

        // Limit number of offers
        offers = offers.slice(0, maxOffers);

        // Add dynamic pricing if available
        const dynamicPricing = await intelligenceService.generateDynamicPricing(user.id);

        return NextResponse.json({
            success: true,
            data: {
                offers,
                dynamicPricing,
                userSegment: dynamicPricing.segment,
                currentTier: intelligence.currentTier,
            },
        });
    } catch (error) {
        console.error('Personalized offers error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/subscription-intelligence/personalized-offers - Generate targeted offers
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = PersonalizedOffersRequestSchema.parse(body);

        const intelligenceService = new SubscriptionIntelligenceService();
        const intelligence = await intelligenceService.generateIntelligence(user.id);

        let offers = intelligence.personalizedOffers;

        // Filter by offer types if specified
        if (validatedData.offerTypes && validatedData.offerTypes.length > 0) {
            offers = offers.filter(offer => validatedData.offerTypes!.includes(offer.type));
        }

        // Filter by target segment if specified
        if (validatedData.targetSegment) {
            offers = offers.filter(offer => offer.targetSegment === validatedData.targetSegment);
        }

        // Sort by priority and estimated conversion
        offers = offers
            .sort((a, b) => {
                const priorityWeight = { high: 3, medium: 2, low: 1 };
                const aPriority = priorityWeight[a.priority];
                const bPriority = priorityWeight[b.priority];

                if (aPriority !== bPriority) {
                    return bPriority - aPriority;
                }

                return b.estimatedConversion - a.estimatedConversion;
            })
            .slice(0, validatedData.maxOffers);

        // Generate dynamic pricing
        const dynamicPricing = await intelligenceService.generateDynamicPricing(user.id);

        // Calculate offer performance metrics
        const totalPotentialValue = offers.reduce((sum, offer) => sum + offer.value, 0);
        const averageConversion = offers.reduce((sum, offer) => sum + offer.estimatedConversion, 0) / offers.length;
        const expectedRevenue = offers.reduce((sum, offer) => {
            const offerValue = offer.discountedPrice || offer.value;
            return sum + (offerValue * (offer.estimatedConversion / 100));
        }, 0);

        return NextResponse.json({
            success: true,
            data: {
                offers,
                dynamicPricing,
                userSegment: dynamicPricing.segment,
                metrics: {
                    totalPotentialValue,
                    averageConversion: Math.round(averageConversion),
                    expectedRevenue: Math.round(expectedRevenue * 100) / 100,
                },
                churnRisk: intelligence.churnRisk,
                recommendations: intelligence.recommendations,
            },
        });
    } catch (error) {
        console.error('Personalized offers POST error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/subscription-intelligence/personalized-offers - Accept an offer
export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { offerId, action } = body;

        if (!offerId || !action) {
            return NextResponse.json(
                { error: 'Missing offerId or action' },
                { status: 400 }
            );
        }

        // Log offer interaction for analytics
        const { error: logError } = await supabase
            .from('subscription_events')
            .insert({
                user_id: user.id,
                event_type: 'offer_interaction',
                event_data: {
                    offer_id: offerId,
                    action, // 'accepted', 'declined', 'viewed'
                    timestamp: new Date().toISOString(),
                },
            });

        if (logError) {
            console.error('Failed to log offer interaction:', logError);
        }

        // If offer is accepted, handle the specific offer logic
        if (action === 'accepted') {
            // This would typically integrate with the payment system
            // For now, just log the acceptance
            console.log(`User ${user.id} accepted offer ${offerId}`);
        }

        return NextResponse.json({
            success: true,
            data: {
                message: `Offer ${action} successfully`,
                offerId,
                action,
            },
        });
    } catch (error) {
        console.error('Offer action error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}