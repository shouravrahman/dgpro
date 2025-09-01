import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient()

        const { data: product, error } = await supabase
            .from('products')
            .select(`
        *,
        product_files (*),
        profiles!creator_id (
          display_name,
          avatar_url,
          bio
        ),
        product_reviews (
          id,
          rating,
          comment,
          created_at,
          profiles!user_id (
            display_name,
            avatar_url
          )
        )
      `)
            .eq('id', params.id)
            .eq('status', 'published')
            .single()

        if (error || !product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        // Transform data to match ProductDetail interface
        const transformedProduct = {
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price,
            originalPrice: product.original_price,
            category: product.category,
            tags: product.tags || [],
            thumbnail: product.thumbnail,
            images: product.assets?.images || [],
            files: product.product_files?.map((file: any) => ({
                id: file.id,
                name: file.name,
                type: file.type,
                size: file.size,
                preview: file.thumbnail,
            })) || [],
            creator: {
                id: product.creator_id,
                name: product.profiles?.display_name || 'Anonymous',
                avatar: product.profiles?.avatar_url,
                bio: product.profiles?.bio,
                rating: 4.8, // Mock data
                totalProducts: 12, // Mock data
                totalSales: 156, // Mock data
            },
            stats: {
                views: product.view_count || 0,
                downloads: product.download_count || 0,
                sales: product.sales_count || 0,
                rating: product.average_rating || 0,
                reviewCount: product.review_count || 0,
            },
            reviews: product.product_reviews?.map((review: any) => ({
                id: review.id,
                user: {
                    name: review.profiles?.display_name || 'Anonymous',
                    avatar: review.profiles?.avatar_url,
                },
                rating: review.rating,
                comment: review.comment,
                date: review.created_at,
                helpful: Math.floor(Math.random() * 10), // Mock data
            })) || [],
            features: [
                'High-quality digital files',
                'Commercial license included',
                'Instant download',
                'Lifetime access',
            ], // Mock data
            requirements: [
                'Compatible with modern browsers',
                'No special software required',
            ], // Mock data
            license: product.license_type || 'Standard License',
            lastUpdated: product.updated_at,
            createdAt: product.created_at,
        }

        // Increment view count
        await supabase
            .from('products')
            .update({ view_count: (product.view_count || 0) + 1 })
            .eq('id', params.id)

        return NextResponse.json({
            success: true,
            data: transformedProduct,
        })
    } catch (error) {
        console.error('Error fetching product:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}