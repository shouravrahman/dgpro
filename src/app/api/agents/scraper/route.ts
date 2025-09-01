import { NextRequest, NextResponse } from 'next/server';
import { ScrapingAgent } from '@/lib/scraping/scraping-agent';
import { ScrapingRequest } from '@/lib/scraping/types';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for scraping requests
const ScrapingRequestSchema = z.object({
  url: z.string().url('Invalid URL format'),
  source: z.string().optional(),
  options: z.object({
    includeImages: z.boolean().default(true),
    includeMetadata: z.boolean().default(true),
    extractContent: z.boolean().default(false),
    followRedirects: z.boolean().default(true),
    timeout: z.number().min(5000).max(60000).default(30000),
    retries: z.number().min(0).max(5).default(3),
    respectRateLimit: z.boolean().default(true),
    formats: z.array(z.enum(['markdown', 'html', 'text'])).default(['markdown', 'html'])
  }).optional(),
  priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal')
});

const BatchScrapingRequestSchema = z.object({
  urls: z.array(z.string().url()).min(1).max(10), // Limit to 10 URLs per batch
  options: ScrapingRequestSchema.shape.options.optional(),
  priority: ScrapingRequestSchema.shape.priority.optional()
});

// Initialize scraping agent
let scrapingAgent: ScrapingAgent | null = null;

function getScrapingAgent(): ScrapingAgent {
  if (!scrapingAgent) {
    scrapingAgent = new ScrapingAgent({
      firecrawlApiKey: process.env.FIRECRAWL_API_KEY,
      defaultTimeout: 30000,
      maxRetries: 3,
      respectRateLimit: true
    });
  }
  return scrapingAgent;
}

// POST /api/agents/scraper - Scrape a single product
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = ScrapingRequestSchema.parse(body);

    // Create scraping request
    const scrapingRequest: ScrapingRequest = {
      url: validatedData.url,
      source: validatedData.source,
      options: validatedData.options,
      priority: validatedData.priority,
      userId: user.id
    };

    // Get scraping agent and perform scraping
    const agent = getScrapingAgent();
    const result = await agent.scrapeProduct(scrapingRequest);

    // Store result in database if successful
    if (result.success && result.data) {
      try {
        const { error: dbError } = await supabase
          .from('scraped_products')
          .insert({
            url: result.data.url,
            title: result.data.title,
            content: {
              description: result.data.description,
              pricing: result.data.pricing,
              features: result.data.features,
              images: result.data.images,
              content: result.data.content,
              metadata: result.data.metadata,
              seller: result.data.seller,
              reviews: result.data.reviews
            },
            analysis: null, // Will be populated by analysis agent
            scrape_date: new Date().toISOString(),
            status: 'active'
          });

        if (dbError) {
          console.error('Failed to store scraped product:', dbError);
          // Don't fail the request, just log the error
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Scraping API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors
          }
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        }
      },
      { status: 500 }
    );
  }
}

// POST /api/agents/scraper/batch - Scrape multiple products
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = BatchScrapingRequestSchema.parse(body);

    // Create scraping requests
    const scrapingRequests: ScrapingRequest[] = validatedData.urls.map(url => ({
      url,
      options: validatedData.options,
      priority: validatedData.priority || 'normal',
      userId: user.id
    }));

    // Get scraping agent and perform batch scraping
    const agent = getScrapingAgent();
    const results = await agent.scrapeMultipleProducts(scrapingRequests);

    // Store successful results in database
    const successfulResults = results.filter(result => result.success && result.data);

    if (successfulResults.length > 0) {
      try {
        const insertData = successfulResults.map(result => ({
          url: result.data!.url,
          title: result.data!.title,
          content: {
            description: result.data!.description,
            pricing: result.data!.pricing,
            features: result.data!.features,
            images: result.data!.images,
            content: result.data!.content,
            metadata: result.data!.metadata,
            seller: result.data!.seller,
            reviews: result.data!.reviews
          },
          analysis: null,
          scrape_date: new Date().toISOString(),
          status: 'active'
        }));

        const { error: dbError } = await supabase
          .from('scraped_products')
          .insert(insertData);

        if (dbError) {
          console.error('Failed to store batch scraped products:', dbError);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        results,
        summary: {
          total: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      }
    });

  } catch (error) {
    console.error('Batch scraping API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors
          }
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        }
      },
      { status: 500 }
    );
  }
}

// GET /api/agents/scraper/stats - Get scraping statistics
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const agent = getScrapingAgent();
    const stats = agent.getStats();
    const supportedSources = agent.getSupportedSources();

    return NextResponse.json({
      success: true,
      data: {
        stats,
        supportedSources: Object.keys(supportedSources),
        sourceDetails: supportedSources
      }
    });

  } catch (error) {
    console.error('Stats API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve statistics'
        }
      },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/scraper/stats - Reset scraping statistics
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication and admin privileges
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Check if user is admin (you might want to implement proper role checking)
    const { data: profile } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    if (profile?.subscription_tier !== 'enterprise') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin privileges required' } },
        { status: 403 }
      );
    }

    const agent = getScrapingAgent();
    agent.resetStats();

    return NextResponse.json({
      success: true,
      message: 'Statistics reset successfully'
    });

  } catch (error) {
    console.error('Reset stats API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to reset statistics'
        }
      },
      { status: 500 }
    );
  }
}