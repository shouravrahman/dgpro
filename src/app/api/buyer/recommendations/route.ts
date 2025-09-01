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
        const limit = parseInt(searchParams.get('limit') || '8')

        // Mock data for recommendations
        const recommendations = [
            {
                id: '1',
                title: 'Premium UI Kit Collection',
                thumbnail: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400',
                price: 39.99,
                originalPrice: 59.99,
                rating: 4.8,
                reviewCount: 124,
                category: 'UI Kits',
                creator: {
                    name: 'UI Masters',
                    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
                },
                reason: 'Similar to your purchases',
            },
            {
                id: '2',
                title: 'Advanced React Components',
                thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
                price: 24.99,
                rating: 4.9,
                reviewCount: 89,
                category: 'Code',
                creator: {
                    name: 'React Pro',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
                },
                reason: 'Trending in your category',
            },
            {
                id: '3',
                title: 'Brand Identity Toolkit',
                thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400',
                price: 34.99,
                originalPrice: 49.99,
                rating: 4.7,
                reviewCount: 156,
                category: 'Branding',
                creator: {
                    name: 'Brand Studio',
                    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
                },
                reason: 'Popular this week',
            },
            {
                id: '4',
                title: 'Photography Lightroom Presets',
                thumbnail: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400',
                price: 19.99,
                rating: 4.6,
                reviewCount: 203,
                category: 'Photography',
                creator: {
                    name: 'Photo Pro',
                    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
                },
                reason: 'Highly rated',
            },
        ].slice(0, limit)

        return NextResponse.json({
            success: true,
            data: recommendations,
        })
    } catch (error) {
        console.error('Error fetching recommendations:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}