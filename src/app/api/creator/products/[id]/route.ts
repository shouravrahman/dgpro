import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/server'
import { z } from 'zod'

const updateProductSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(2000).optional(),
    category: z.string().min(1).optional(),
    price: z.number().min(0).optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    featured: z.boolean().optional(),
    allowComments: z.boolean().optional(),
    downloadLimit: z.number().optional(),
    licenseType: z.string().optional(),
    thumbnail: z.string().optional(),
    files: z.array(z.any()).optional(),
})

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

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
        )
      `)
            .eq('id', params.id)
            .eq('creator_id', user.id)
            .single()

        if (error) {
            console.error('Error fetching product:', error)
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        // Transform data to match SimpleProduct interface
        const transformedProduct = {
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price,
            originalPrice: product.original_price,
            category: product.category,
            tags: product.tags,
            status: product.status,
            createdAt: product.created_at,
            updatedAt: product.updated_at,
            creatorId: product.creator_id,
            creatorName: product.profiles?.display_name,
            creatorAvatar: product.profiles?.avatar_url,
            creatorBio: product.profiles?.bio,
            files: product.product_files?.map((file: any) => ({
                id: file.id,
                name: file.name,
                type: file.type,
                size: file.size,
                url: file.url,
                thumbnail: file.thumbnail,
            })),
            thumbnail: product.thumbnail,
            featured: product.featured,
            allowComments: product.allow_comments,
            downloadLimit: product.download_limit,
            licenseType: product.license_type,
            sales: product.sales_count || 0,
            views: product.view_count || 0,
            rating: product.average_rating,
            reviewCount: product.review_count || 0,
        }

        return NextResponse.json(transformedProduct)
    } catch (error) {
        console.error('Error in GET /api/creator/products/[id]:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validatedData = updateProductSchema.parse(body)

        const supabase = await createClient()

        // Check if product exists and belongs to user
        const { data: existingProduct, error: checkError } = await supabase
            .from('products')
            .select('id')
            .eq('id', params.id)
            .eq('creator_id', user.id)
            .single()

        if (checkError || !existingProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        // Update product
        const updateData: any = {}
        if (validatedData.title) updateData.title = validatedData.title
        if (validatedData.description) updateData.description = validatedData.description
        if (validatedData.category) updateData.category = validatedData.category
        if (validatedData.price !== undefined) updateData.price = validatedData.price
        if (validatedData.tags) updateData.tags = validatedData.tags
        if (validatedData.status) updateData.status = validatedData.status
        if (validatedData.featured !== undefined) updateData.featured = validatedData.featured
        if (validatedData.allowComments !== undefined) updateData.allow_comments = validatedData.allowComments
        if (validatedData.downloadLimit !== undefined) updateData.download_limit = validatedData.downloadLimit
        if (validatedData.licenseType) updateData.license_type = validatedData.licenseType
        if (validatedData.thumbnail) updateData.thumbnail = validatedData.thumbnail

        updateData.updated_at = new Date().toISOString()

        const { data: product, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', params.id)
            .eq('creator_id', user.id)
            .select()
            .single()

        if (error) {
            console.error('Error updating product:', error)
            return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
        }

        // Update files if provided
        if (validatedData.files) {
            // Delete existing files
            await supabase
                .from('product_files')
                .delete()
                .eq('product_id', params.id)

            // Insert new files
            if (validatedData.files.length > 0) {
                const fileInserts = validatedData.files.map((file: any) => ({
                    product_id: params.id,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: file.url,
                    thumbnail: file.thumbnail,
                }))

                await supabase
                    .from('product_files')
                    .insert(fileInserts)
            }
        }

        // Transform response
        const transformedProduct = {
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price,
            category: product.category,
            tags: product.tags,
            status: product.status,
            createdAt: product.created_at,
            updatedAt: product.updated_at,
            creatorId: product.creator_id,
            featured: product.featured,
            allowComments: product.allow_comments,
            downloadLimit: product.download_limit,
            licenseType: product.license_type,
            thumbnail: product.thumbnail,
            files: validatedData.files || [],
            sales: 0,
            views: 0,
            reviewCount: 0,
        }

        return NextResponse.json(transformedProduct)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
        }

        console.error('Error in PATCH /api/creator/products/[id]:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()

        // Check if product exists and belongs to user
        const { data: existingProduct, error: checkError } = await supabase
            .from('products')
            .select('id')
            .eq('id', params.id)
            .eq('creator_id', user.id)
            .single()

        if (checkError || !existingProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        // Delete associated files first
        await supabase
            .from('product_files')
            .delete()
            .eq('product_id', params.id)

        // Delete the product
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', params.id)
            .eq('creator_id', user.id)

        if (error) {
            console.error('Error deleting product:', error)
            return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
        }

        return NextResponse.json({ message: 'Product deleted successfully' })
    } catch (error) {
        console.error('Error in DELETE /api/creator/products/[id]:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}