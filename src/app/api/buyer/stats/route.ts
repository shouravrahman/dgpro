import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/server'

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()

        // Get purchase stats (mock data for now)
        const stats = {
            totalPurchases: 12,
            totalSpent: 247.50,
            wishlistItems: 8,
            downloadedItems: 34,
            averageRating: 4.6,
            favoriteCategories: [
                { name: 'Templates', count: 5, percentage: 42 },
                { name: 'Graphics', count: 3, percentage: 25 },
                { name: 'E-books', count: 2, percentage: 17 },
                { name: 'Software', count: 2, percentage: 16 },
            ],
        }

        return NextResponse.json({
            success: true,
            data: stats,
        })
    } catch (error) {
        console.error('Error fetching buyer stats:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}