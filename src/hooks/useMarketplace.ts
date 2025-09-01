'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface MarketplaceFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    tags: string[];
    featured?: boolean;
    sortBy?: string;
    search?: string;
    page: number;
    limit: number;
}

interface MarketplaceData {
    listings: any[];
    featured: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
    };
    stats: {
        totalListings: number;
        activeListings: number;
        featuredListings: number;
    };
    filters: {
        categories: any[];
        priceRange: { min: number; max: number };
        popularTags: any[];
    };
}

interface UseMarketplaceReturn {
    data: MarketplaceData | null;
    loading: boolean;
    error: string | null;
    filters: MarketplaceFilters;
    updateFilters: (newFilters: Partial<MarketplaceFilters>) => void;
    clearFilters: () => void;
    search: (query: string) => void;
    loadMore: () => void;
    refresh: () => void;
    wishlistedProducts: Set<string>;
    toggleWishlist: (productId: string) => void;
}

const defaultFilters: MarketplaceFilters = {
    tags: [],
    page: 1,
    limit: 12,
    sortBy: 'newest',
};

export function useMarketplace(): UseMarketplaceReturn {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [data, setData] = useState<MarketplaceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [wishlistedProducts, setWishlistedProducts] = useState<Set<string>>(new Set());

    // Initialize filters from URL params
    const [filters, setFilters] = useState<MarketplaceFilters>(() => {
        const urlFilters = { ...defaultFilters };

        if (searchParams.get('category')) {
            urlFilters.category = searchParams.get('category') || undefined;
        }
        if (searchParams.get('minPrice')) {
            urlFilters.minPrice = parseInt(searchParams.get('minPrice') || '0');
        }
        if (searchParams.get('maxPrice')) {
            urlFilters.maxPrice = parseInt(searchParams.get('maxPrice') || '0');
        }
        if (searchParams.get('tags')) {
            urlFilters.tags = searchParams.get('tags')?.split(',') || [];
        }
        if (searchParams.get('featured')) {
            urlFilters.featured = searchParams.get('featured') === 'true';
        }
        if (searchParams.get('sortBy')) {
            urlFilters.sortBy = searchParams.get('sortBy') || 'newest';
        }
        if (searchParams.get('search')) {
            urlFilters.search = searchParams.get('search') || undefined;
        }
        if (searchParams.get('page')) {
            urlFilters.page = parseInt(searchParams.get('page') || '1');
        }

        return urlFilters;
    });

    // Load wishlist from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('marketplace-wishlist');
        if (saved) {
            try {
                const wishlist = JSON.parse(saved);
                setWishlistedProducts(new Set(wishlist));
            } catch (error) {
                console.error('Error loading wishlist:', error);
            }
        }
    }, []);

    // Save wishlist to localStorage
    useEffect(() => {
        localStorage.setItem('marketplace-wishlist', JSON.stringify(Array.from(wishlistedProducts)));
    }, [wishlistedProducts]);

    // Update URL when filters change
    const updateURL = useCallback((newFilters: MarketplaceFilters) => {
        const params = new URLSearchParams();

        if (newFilters.category) params.set('category', newFilters.category);
        if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice.toString());
        if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice.toString());
        if (newFilters.tags.length > 0) params.set('tags', newFilters.tags.join(','));
        if (newFilters.featured) params.set('featured', 'true');
        if (newFilters.sortBy && newFilters.sortBy !== 'newest') params.set('sortBy', newFilters.sortBy);
        if (newFilters.search) params.set('search', newFilters.search);
        if (newFilters.page > 1) params.set('page', newFilters.page.toString());

        const url = params.toString() ? `?${params.toString()}` : '';
        router.push(`/marketplace${url}`, { scroll: false });
    }, [router]);

    // Fetch marketplace data
    const fetchData = useCallback(async (currentFilters: MarketplaceFilters, append = false) => {
        try {
            if (!append) {
                setLoading(true);
            }
            setError(null);

            const params = new URLSearchParams();

            if (currentFilters.category) params.set('category', currentFilters.category);
            if (currentFilters.minPrice) params.set('minPrice', currentFilters.minPrice.toString());
            if (currentFilters.maxPrice) params.set('maxPrice', currentFilters.maxPrice.toString());
            if (currentFilters.tags.length > 0) params.set('tags', currentFilters.tags.join(','));
            if (currentFilters.featured) params.set('featured', 'true');
            if (currentFilters.sortBy) params.set('sortBy', currentFilters.sortBy);
            if (currentFilters.search) params.set('search', currentFilters.search);
            params.set('page', currentFilters.page.toString());
            params.set('limit', currentFilters.limit.toString());

            const response = await fetch(`/api/marketplace?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch marketplace data');
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch marketplace data');
            }

            if (append && data) {
                // Append new listings for pagination
                setData(prev => prev ? {
                    ...result.data,
                    listings: [...prev.listings, ...result.data.listings],
                } : result.data);
            } else {
                setData(result.data);
            }
        } catch (err) {
            console.error('Marketplace fetch error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [data]);

    // Update filters and fetch data
    const updateFilters = useCallback((newFilters: Partial<MarketplaceFilters>) => {
        const updatedFilters = {
            ...filters,
            ...newFilters,
            page: newFilters.page || 1, // Reset to page 1 unless explicitly set
        };

        setFilters(updatedFilters);
        updateURL(updatedFilters);
        fetchData(updatedFilters);
    }, [filters, updateURL, fetchData]);

    // Clear all filters
    const clearFilters = useCallback(() => {
        const clearedFilters = { ...defaultFilters };
        setFilters(clearedFilters);
        updateURL(clearedFilters);
        fetchData(clearedFilters);
    }, [updateURL, fetchData]);

    // Search function
    const search = useCallback((query: string) => {
        updateFilters({ search: query, page: 1 });
    }, [updateFilters]);

    // Load more for pagination
    const loadMore = useCallback(() => {
        if (data?.pagination.hasMore && !loading) {
            const nextPage = filters.page + 1;
            const newFilters = { ...filters, page: nextPage };
            setFilters(newFilters);
            updateURL(newFilters);
            fetchData(newFilters, true);
        }
    }, [data, loading, filters, updateURL, fetchData]);

    // Refresh data
    const refresh = useCallback(() => {
        fetchData(filters);
    }, [fetchData, filters]);

    // Toggle wishlist
    const toggleWishlist = useCallback((productId: string) => {
        setWishlistedProducts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    }, []);

    // Initial data fetch
    useEffect(() => {
        fetchData(filters);
    }, []); // Only run once on mount

    return {
        data,
        loading,
        error,
        filters,
        updateFilters,
        clearFilters,
        search,
        loadMore,
        refresh,
        wishlistedProducts,
        toggleWishlist,
    };
}