import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/server'

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()

        // Get the original product
        const { data: originalProduct, error: fetchError } = await supabase
            .from('products')
            .select(`
        *,
        product_files (*)
      `)
            .eq('id', params.id)
            .eq('creator_id', user.id)
            .single()

        if (fetchError || !originalProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        // Create duplicate product data
        const duplicateData = {
            creator_id: user.id,
            title: `${originalProduct.title} (Copy)`,
            description: originalProduct.description,
            category: originalProduct.category,
            price: originalProduct.price,
            original_price: originalProduct.original_price,
            tags: originalProduct.tags,
            status: 'draft', // Always create duplicates as drafts
            featured: false, // Don't duplicate featured status
            allow_comments: originalProduct.allow_comments,
            download_limit: originalProduct.download_limit,
            license_type: originalProduct.license_type,
            thumbnail: originalProduct.thumbnail,
            // Don't copy stats
            sales_count: 0,
            view_count: 0,
            average_rating: null,
            review_count: 0,
        }

        // Create the duplicate product
        const { data: duplicateProduct, error: createError } = await supabase
            .from('products')
            .insert(duplicateData)
            .select()
            .single()

        if (createError) {
            console.error('Error creating duplicate product:', createError)
            return NextResponse.json({ error: 'Failed to duplicate product' }, { status: 500 })
        }

        // Duplicate files if they exist
        if (originalProduct.product_files && originalProduct.product_files.length > 0) {
            const fileInserts = originalProduct.product_files.map((file: any) => ({
                product_id: duplicateProduct.id,
                name: file.name,
                type: file.type,
                size: file.size,
                url: file.url,
                thumbnail: file.thumbnail,
            }))

            const { error: filesError } = await supabase
                .from('product_files')
                .insert(fileInserts)

            if (filesError) {
                console.error('Error duplicating files:', filesError)
                // Don't fail the whole operation, just log the error
            }
        }

        // Fetch the complete duplicate product with files
        const { data: completeProduct, error: completeError } = await supabase
            .from('products')
            .select(`
        *,
        product_files (*),
        profiles!creator_id (
          display_name,
          avatar_url,
          bio
        )
      `)
            .eq('id', duplicateProduct.id)
            .single()

        if (completeError) {
            console.error('Error fetching complete product:', completeError)
            return NextResponse.json({ error: 'Failed to fetch duplicated product' }, { status: 500 })
        }

        // Transform response
        const transformedProduct = {
            id: completeProduct.id,
            title: completeProduct.title,
            description: completeProduct.description,
            price: completeProduct.price,
            originalPrice: completeProduct.original_price,
            category: completeProduct.category,
            tags: completeProduct.tags,
            status: completeProduct.status,
            createdAt: completeProduct.created_at,
            updatedAt: completeProduct.updated_at,
            creatorId: completeProduct.creator_id,
            creatorName: completeProduct.profiles?.display_name,
            creatorAvatar: completeProduct.profiles?.avatar_url,
            creatorBio: completeProduct.profiles?.bio,
            files: completeProduct.product_files?.map((file: any) => ({
                id: file.id,
                name: file.name,
                type: file.type,
                size: file.size,
                url: file.url,
                thumbnail: file.thumbnail,
            })) || [],
            thumbnail: completeProduct.thumbnail,
            featured: completeProduct.featured,
            allowComments: completeProduct.allow_comments,
            downloadLimit: completeProduct.download_limit,
            licenseType: completeProduct.license_type,
            sales: 0,
            views: 0,
            rating: null,
            reviewCount: 0,
        }

        return NextResponse.json(transformedProduct, { status: 201 })
    } catch (error) {
        console.error('Error in POST /api/creator/products/[id]/duplicate:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}