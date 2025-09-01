import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { addressAutocompleteSchema } from '@/lib/validations/cart';

// Mock address data - in production, integrate with Google Places API or similar
const MOCK_ADDRESSES = [
    {
        formatted_address: '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',
        components: {
            street_number: '1600',
            route: 'Amphitheatre Parkway',
            locality: 'Mountain View',
            administrative_area_level_1: 'CA',
            postal_code: '94043',
            country: 'US'
        }
    },
    {
        formatted_address: '1 Apple Park Way, Cupertino, CA 95014, USA',
        components: {
            street_number: '1',
            route: 'Apple Park Way',
            locality: 'Cupertino',
            administrative_area_level_1: 'CA',
            postal_code: '95014',
            country: 'US'
        }
    },
    {
        formatted_address: '410 Terry Ave N, Seattle, WA 98109, USA',
        components: {
            street_number: '410',
            route: 'Terry Ave N',
            locality: 'Seattle',
            administrative_area_level_1: 'WA',
            postal_code: '98109',
            country: 'US'
        }
    }
];

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const params = Object.fromEntries(searchParams.entries());

        // Validate query parameters
        const validatedParams = addressAutocompleteSchema.parse(params);

        // In production, you would integrate with a real address service like:
        // - Google Places API
        // - Mapbox Geocoding API
        // - HERE Geocoding API
        // - SmartyStreets API

        // For now, return mock filtered results
        const filteredAddresses = MOCK_ADDRESSES.filter(address =>
            address.formatted_address.toLowerCase().includes(validatedParams.query.toLowerCase())
        ).slice(0, validatedParams.limit);

        const suggestions = filteredAddresses.map(address => ({
            id: Math.random().toString(36).substr(2, 9),
            formatted_address: address.formatted_address,
            components: address.components,
            confidence: Math.random() * 0.3 + 0.7, // Mock confidence score
        }));

        return NextResponse.json({
            success: true,
            data: {
                suggestions,
                query: validatedParams.query,
            },
        });

    } catch (error) {
        console.error('Address autocomplete error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: { message: 'Invalid query parameters', code: 'VALIDATION_ERROR', details: error.errors }
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: { message: 'Failed to fetch address suggestions', code: 'AUTOCOMPLETE_ERROR' }
        }, { status: 500 });
    }
}