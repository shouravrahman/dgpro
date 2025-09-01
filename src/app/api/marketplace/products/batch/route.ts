import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const batchRequestSchema = z.object({
    product_ids: z.array(z.string()).max(50), // Limit to 50 products
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { product_ids } = batchRequestSchema.parse(body)

        if (product_ids.length === 0) {
            return NextResponse.json({
                success: true,
                data: [],
            })
        }

        const supabase = await createClient()

        const { data: products, error } = await supabase
            .from('products')
            .select(`
        *,
        profiles!creator_id (
          display_name,
          avatar_url
        )
      `)
            .in('id', product_ids)
            .eq('status', 'published')

        if (error) {
            console.error('Error fetching products:', error)
            return NextResponse.json(
                { error: 'Failed to fetch products' },
                { status: 500 }
            )
        }

        // Transform data for wishlist
        const transformedProducts = products?.map(product => ({
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price,
            originalPrice: product.original_price,
            category: product.category,
            thumbnail: product.thumbnail,
            creator: {
                name: product.profiles?.display_name || 'Anonymous',
                avatar: product.profiles?.avatar_url,
            },
            stats: {
                rating: product.average_rating || 0,
                reviewCount: product.review_count || 0,
                sales: product.sales_count || 0,
            },
            addedAt: new Date().toISOString(), // Mock data - in real app, get from wishlist table
        })) || []

        return NextResponse.json({
            success: true,
            data: transformedProducts,
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request', details: error.errors },
                { status: 400 }
            )
        }

        console.error('Error in batch products fetch:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}