import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/server'

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '10')

        // Mock data for recent purchases
        const recentPurchases = [
            {
                id: '1',
                title: 'Modern Website Template Pack',
                thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
                price: 29.99,
                purchaseDate: '2024-12-10T10:30:00Z',
                downloadCount: 3,
                rating: 5,
                category: 'Templates',
                creator: {
                    name: 'Design Studio',
                    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
                },
            },
            {
                id: '2',
                title: 'Social Media Graphics Bundle',
                thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400',
                price: 19.99,
                purchaseDate: '2024-12-08T14:15:00Z',
                downloadCount: 5,
                rating: 4,
                category: 'Graphics',
                creator: {
                    name: 'Creative Co',
                    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
                },
            },
            {
                id: '3',
                title: 'Complete JavaScript Course',
                thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
                price: 49.99,
                purchaseDate: '2024-12-05T09:20:00Z',
                downloadCount: 1,
                rating: 5,
                category: 'Education',
                creator: {
                    name: 'Code Academy',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
                },
            },
        ].slice(0, limit)

        return NextResponse.json({
            success: true,
            data: recentPurchases,
        })
    } catch (error) {
        console.error('Error fetching purchases:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}