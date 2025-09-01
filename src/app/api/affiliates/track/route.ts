import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AffiliateService } from '@/lib/services/affiliate';
import { referralTrackingSchema } from '@/lib/validations/affiliate';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const validatedData = referralTrackingSchema.parse(body);
        const { affiliateCode, productId, referrerUrl, landingPage } = validatedData;

        // Get client IP and user agent
        const clientIp = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            '127.0.0.1';
        const userAgent = request.headers.get('user-agent') || '';

        // Find affiliate by code
        const { data: affiliate, error: affiliateError } = await supabase
            .from('affiliates')
            .select('id')
            .eq('affiliate_code', affiliateCode)
            .eq('status', 'active')
            .single();

        if (affiliateError || !affiliate) {
            return NextResponse.json(
                { success: false, error: { message: 'Invalid affiliate code', code: 'INVALID_CODE' } },
                { status: 400 }
            );
        }

        // Track the click
        const { error: clickError } = await supabase
            .from('affiliate_clicks')
            .insert({
                affiliate_id: affiliate.id,
                product_id: productId,
                visitor_ip: clientIp,
                user_agent: userAgent,
                referrer_url: referrerUrl,
                landing_page: landingPage,
                converted: false,
            });

        if (clickError) {
            console.error('Error tracking affiliate click:', clickError);
            // Don't fail the request if click tracking fails
        }

        // Set tracking cookie for conversion attribution
        const response = NextResponse.json({
            success: true,
            data: {
                tracked: true,
                affiliateId: affiliate.id,
            },
        });

        // Set cookie that expires in 30 days
        response.cookies.set('affiliate_ref', affiliateCode, {
            maxAge: 30 * 24 * 60 * 60, // 30 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        if (productId) {
            response.cookies.set('affiliate_product', productId, {
                maxAge: 30 * 24 * 60 * 60, // 30 days
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
            });
        }

        return response;
    } catch (error) {
        console.error('Error tracking affiliate referral:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Internal server error',
                    code: 'TRACKING_ERROR'
                }
            },
            { status: 500 }
        );
    }
}

// Handle conversion tracking
export async function PUT(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { saleAmount, productId } = body;

        // Get affiliate code from cookie
        const affiliateCode = request.cookies.get('affiliate_ref')?.value;
        if (!affiliateCode) {
            return NextResponse.json(
                { success: false, error: { message: 'No affiliate referral found', code: 'NO_REFERRAL' } },
                { status: 400 }
            );
        }

        const affiliateService = new AffiliateService();

        // Track the referral conversion
        const referral = await affiliateService.trackReferral(
            affiliateCode,
            user.id,
            productId,
            saleAmount
        );

        // Update click as converted
        const { data: affiliate } = await supabase
            .from('affiliates')
            .select('id')
            .eq('affiliate_code', affiliateCode)
            .single();

        if (affiliate) {
            await supabase
                .from('affiliate_clicks')
                .update({ converted: true })
                .eq('affiliate_id', affiliate.id)
                .eq('visitor_ip', request.headers.get('x-forwarded-for') || '127.0.0.1')
                .order('created_at', { ascending: false })
                .limit(1);
        }

        // Clear tracking cookies
        const response = NextResponse.json({
            success: true,
            data: referral,
        });

        response.cookies.delete('affiliate_ref');
        response.cookies.delete('affiliate_product');

        return response;
    } catch (error) {
        console.error('Error processing affiliate conversion:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Internal server error',
                    code: 'CONVERSION_ERROR'
                }
            },
            { status: 500 }
        );
    }
}