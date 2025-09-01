'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import type { SimpleProduct as Product, CreatorStats } from '@/types/creator'

export function useCreator() {
    const user = useUser()
    const [products, setProducts] = useState<Product[]>([])
    const [stats, setStats] = useState<CreatorStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch creator products
    const fetchProducts = async () => {
        if (!user) return

        try {
            const response = await fetch('/api/creator/products')
            if (!response.ok) throw new Error('Failed to fetch products')

            const data = await response.json()
            setProducts(data.products || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch products')
        }
    }

    // Fetch creator stats
    const fetchStats = async () => {
        if (!user) return

        try {
            const response = await fetch('/api/creator/stats')
            if (!response.ok) throw new Error('Failed to fetch stats')

            const data = await response.json()
            setStats(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch stats')
        }
    }

    // Create new product
    const createProduct = async (productData: Partial<Product>) => {
        if (!user) throw new Error('User not authenticated')

        const response = await fetch('/api/creator/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to create product')
        }

        const newProduct = await response.json()
        setProducts(prev => [newProduct, ...prev])
        return newProduct
    }

    // Update product
    const updateProduct = async (productId: string, updates: Partial<Product>) => {
        if (!user) throw new Error('User not authenticated')

        const response = await fetch(`/api/creator/products/${productId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to update product')
        }

        const updatedProduct = await response.json()
        setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p))
        return updatedProduct
    }

    // Delete product
    const deleteProduct = async (productId: string) => {
        if (!user) throw new Error('User not authenticated')

        const response = await fetch(`/api/creator/products/${productId}`, {
            method: 'DELETE',
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to delete product')
        }

        setProducts(prev => prev.filter(p => p.id !== productId))
    }

    // Duplicate product
    const duplicateProduct = async (productId: string) => {
        if (!user) throw new Error('User not authenticated')

        const response = await fetch(`/api/creator/products/${productId}/duplicate`, {
            method: 'POST',
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to duplicate product')
        }

        const duplicatedProduct = await response.json()
        setProducts(prev => [duplicatedProduct, ...prev])
        return duplicatedProduct
    }

    // Upload file
    const uploadFile = async (file: File) => {
        if (!user) throw new Error('User not authenticated')

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/creator/upload', {
            method: 'POST',
            body: formData,
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to upload file')
        }

        return await response.json()
    }

    // Publish product
    const publishProduct = async (productId: string) => {
        return updateProduct(productId, { status: 'published' })
    }

    // Archive product
    const archiveProduct = async (productId: string) => {
        return updateProduct(productId, { status: 'archived' })
    }

    // Get product by ID
    const getProduct = (productId: string) => {
        return products.find(p => p.id === productId)
    }

    // Get products by status
    const getProductsByStatus = (status: string) => {
        return products.filter(p => p.status === status)
    }

    // Get featured products
    const getFeaturedProducts = () => {
        return products.filter(p => p.featured && p.status === 'published')
    }

    // Search products
    const searchProducts = (query: string) => {
        const lowercaseQuery = query.toLowerCase()
        return products.filter(p =>
            p.title.toLowerCase().includes(lowercaseQuery) ||
            p.description.toLowerCase().includes(lowercaseQuery) ||
            p.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        )
    }

    // Load initial data
    useEffect(() => {
        if (user) {
            setIsLoading(true)
            Promise.all([fetchProducts(), fetchStats()])
                .finally(() => setIsLoading(false))
        } else {
            setProducts([])
            setStats(null)
            setIsLoading(false)
        }
    }, [user])

    return {
        // Data
        products,
        stats,
        isLoading,
        error,

        // Actions
        createProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        uploadFile,
        publishProduct,
        archiveProduct,

        // Utilities
        getProduct,
        getProductsByStatus,
        getFeaturedProducts,
        searchProducts,

        // Refresh
        refetch: () => {
            if (user) {
                setIsLoading(true)
                Promise.all([fetchProducts(), fetchStats()])
                    .finally(() => setIsLoading(false))
            }
        }
    }
}