/**
 * Categories API Route
 * Handles category-related API requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
    getAllCategories,
    getCategoryById,
    CategoryService,
    AIAgentRouter,
    FormGenerator
} from '@/lib/categories';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const categoryId = searchParams.get('categoryId');
        const userId = searchParams.get('userId');

        switch (action) {
            case 'list':
                return handleListCategories(searchParams);

            case 'details':
                if (!categoryId) {
                    return NextResponse.json(
                        { error: 'Category ID is required' },
                        { status: 400 }
                    );
                }
                return handleCategoryDetails(categoryId);

            case 'stats':
                return handleCategoryStats();

            case 'trending':
                const trendingLimit = parseInt(searchParams.get('limit') || '5');
                return handleTrendingCategories(trendingLimit);

            case 'popular':
                const popularLimit = parseInt(searchParams.get('limit') || '5');
                return handlePopularCategories(popularLimit);

            case 'recommendations':
                if (!userId) {
                    return NextResponse.json(
                        { error: 'User ID is required for recommendations' },
                        { status: 400 }
                    );
                }
                const recLimit = parseInt(searchParams.get('limit') || '3');
                return handleUserRecommendations(userId, recLimit);

            case 'search':
                const query = searchParams.get('query');
                if (!query) {
                    return NextResponse.json(
                        { error: 'Search query is required' },
                        { status: 400 }
                    );
                }
                return handleSearchCategories(query);

            case 'form':
                if (!categoryId) {
                    return NextResponse.json(
                        { error: 'Category ID is required' },
                        { status: 400 }
                    );
                }
                const templateId = searchParams.get('templateId');
                return handleGenerateForm(categoryId, templateId);

            case 'agent-route':
                if (!categoryId) {
                    return NextResponse.json(
                        { error: 'Category ID is required' },
                        { status: 400 }
                    );
                }
                const operation = searchParams.get('operation') || 'create';
                const data = searchParams.get('data');
                return handleAgentRouting(categoryId, operation, data);

            default:
                return handleListCategories(searchParams);
        }
    } catch (error) {
        console.error('Categories API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action } = body;

        switch (action) {
            case 'track-usage':
                return handleTrackUsage(body);

            case 'update-preferences':
                return handleUpdatePreferences(body);

            case 'record-agent-performance':
                return handleRecordAgentPerformance(body);

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Categories API POST error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Handler functions

async function handleListCategories(searchParams: URLSearchParams) {
    const includeStats = searchParams.get('includeStats') === 'true';

    if (includeStats) {
        const categories = await CategoryService.getCategories();
        return NextResponse.json({ categories });
    } else {
        const categories = getAllCategories();
        return NextResponse.json({ categories });
    }
}

async function handleCategoryDetails(categoryId: string) {
    const category = await CategoryService.getCategoryDetails(categoryId);

    if (!category) {
        return NextResponse.json(
            { error: 'Category not found' },
            { status: 404 }
        );
    }

    return NextResponse.json({ category });
}

async function handleCategoryStats() {
    const stats = await CategoryService.getCategories();
    return NextResponse.json({ stats });
}

async function handleTrendingCategories(limit: number) {
    const trending = await CategoryService.getTrendingCategories(limit);
    return NextResponse.json({ trending });
}

async function handlePopularCategories(limit: number) {
    const popular = await CategoryService.getPopularCategories(limit);
    return NextResponse.json({ popular });
}

async function handleUserRecommendations(userId: string, limit: number) {
    const recommendations = await CategoryService.getCategoryRecommendations(userId, limit);
    return NextResponse.json({ recommendations });
}

async function handleSearchCategories(query: string) {
    const results = await CategoryService.searchCategories(query);
    return NextResponse.json({ results });
}

async function handleGenerateForm(categoryId: string, templateId: string | null) {
    try {
        const form = FormGenerator.generateForm(categoryId, templateId || undefined);
        return NextResponse.json({ form });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Form generation failed' },
            { status: 400 }
        );
    }
}

async function handleAgentRouting(categoryId: string, operation: string, dataStr: string | null) {
    try {
        const data = dataStr ? JSON.parse(dataStr) : {};

        const request = {
            categoryId,
            operation: operation as any,
            data
        };

        const agentId = await AIAgentRouter.routeRequest(request);
        const agentConfig = AIAgentRouter.getAgentConfig(categoryId, agentId);
        const prompts = AIAgentRouter.getPrompts(categoryId, operation);
        const parameters = AIAgentRouter.getAgentParameters(categoryId);

        return NextResponse.json({
            agentId,
            config: agentConfig,
            prompts,
            parameters
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Agent routing failed' },
            { status: 400 }
        );
    }
}

async function handleTrackUsage(body: any) {
    const { categoryId, userId, productId, templateId } = body;

    if (!categoryId || !userId || !productId) {
        return NextResponse.json(
            { error: 'Missing required fields: categoryId, userId, productId' },
            { status: 400 }
        );
    }

    try {
        await CategoryService.trackCategoryUsage(categoryId, userId, productId, templateId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error tracking category usage:', error);
        return NextResponse.json(
            { error: 'Failed to track usage' },
            { status: 500 }
        );
    }
}

async function handleUpdatePreferences(body: any) {
    const { userId, preferences } = body;

    if (!userId || !preferences) {
        return NextResponse.json(
            { error: 'Missing required fields: userId, preferences' },
            { status: 400 }
        );
    }

    try {
        const supabase = createClient();

        // Update user category preferences
        for (const [categoryId, score] of Object.entries(preferences)) {
            await supabase
                .from('user_category_preferences')
                .upsert({
                    user_id: userId,
                    category_id: categoryId,
                    preference_score: score,
                    last_interaction: new Date().toISOString()
                });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating preferences:', error);
        return NextResponse.json(
            { error: 'Failed to update preferences' },
            { status: 500 }
        );
    }
}

async function handleRecordAgentPerformance(body: any) {
    const { agentId, categoryId, operation, success, responseTime, qualityScore } = body;

    if (!agentId || !categoryId || !operation || success === undefined) {
        return NextResponse.json(
            { error: 'Missing required fields: agentId, categoryId, operation, success' },
            { status: 400 }
        );
    }

    try {
        const supabase = createClient();

        await supabase.rpc('record_ai_agent_performance', {
            p_agent_id: agentId,
            p_category_id: categoryId,
            p_operation: operation,
            p_success: success,
            p_response_time: responseTime || 0,
            p_quality_score: qualityScore || null
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error recording agent performance:', error);
        return NextResponse.json(
            { error: 'Failed to record performance' },
            { status: 500 }
        );
    }
}

// Additional utility endpoints

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { action } = body;

        switch (action) {
            case 'update-stats':
                return handleUpdateCategoryStats(body);

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Categories API PUT error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function handleUpdateCategoryStats(body: any) {
    const { categoryId } = body;

    if (!categoryId) {
        return NextResponse.json(
            { error: 'Category ID is required' },
            { status: 400 }
        );
    }

    try {
        const supabase = createClient();

        await supabase.rpc('update_category_stats', {
            p_category_id: categoryId
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating category stats:', error);
        return NextResponse.json(
            { error: 'Failed to update stats' },
            { status: 500 }
        );
    }
}