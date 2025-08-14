import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Scraping agent logic will be implemented in later tasks
        return NextResponse.json({
            success: true,
            message: 'Scraping agent endpoint ready',
            data: body
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}