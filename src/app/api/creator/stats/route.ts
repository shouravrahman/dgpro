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

        // Get product counts
        const { data: productStats, error: productError } = await supabase
            .from('products')
            .select('status')
            .eq('creator_id', user.id)

        if (productError) {
            console.error('Error fetching product stats:', productError)
            return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
        }

        const totalProducts = productStats?.length || 0
        const activeProducts = productStats?.filter(p => p.status === 'published').length || 0
        const draftProducts = productStats?.filter(p => p.status === 'draft').length || 0

        // Get sales data (mock for now)
        const totalSales = 0
        const salesThisMonth = 0
        const totalRevenue = 0
        const revenueThisMonth = 0
        const averageRating = 0
        const totalReviews = 0

        const stats = {
            totalProducts,
            activeProducts,
            draftProducts,
            totalSales,
            salesThisMonth,
            totalRevenue,
            revenueThisMonth,
            averageRating,
            totalReviews,
        }

        return NextResponse.json(stats)
    } catch (error) {
        console.error('Error in GET /api/creator/stats:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}