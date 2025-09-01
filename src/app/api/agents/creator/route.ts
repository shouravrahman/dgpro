import { NextRequest, NextResponse } from 'next/server';
import { CreationAgent } from '@/lib/ai/agents/creation-agent';
import type {
  ProductCreationRequest,
  CreatedProduct,
  FileProcessingResult,
  TemplateGenerationResult
} from '@/lib/ai/agents/creation-agent';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schemas
const ProductCreationRequestSchema = z.object({
  creationType: z.enum(['recreate', 'custom', 'template-based', 'ai-generated']),
  category: z.string().min(1),
  requirements: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    targetAudience: z.string().optional(),
    features: z.array(z.string()).optional(),
    pricing: z.object({
      type: z.enum(['free', 'freemium', 'one-time', 'subscription']),
      amount: z.number().optional(),
      currency: z.string().optional()
    }).optional(),
    style: z.string().optional(),
    format: z.string().optional(),
    complexity: z.enum(['simple', 'medium', 'complex']).optional()
  }),
  sourceData: z.object({
    url: z.string().url().optional(),
    content: z.string().optional(),
    files: z.array(z.object({
      name: z.string(),
      type: z.string(),
      content: z.string(),
      size: z.number()
    })).optional(),
    referenceProducts: z.array(z.object({
      title: z.string(),
      description: z.string(),
      features: z.array(z.string()),
      pricing: z.number().optional()
    })).optional()
  }).optional(),
  customization: z.object({
    branding: z.object({
      colors: z.array(z.string()).optional(),
      fonts: z.array(z.string()).optional(),
      logo: z.string().optional()
    }).optional(),
    content: z.object({
      tone: z.enum(['professional', 'casual', 'friendly', 'technical']).optional(),
      language: z.string().optional(),
      length: z.enum(['short', 'medium', 'long']).optional()
    }).optional(),
    features: z.object({
      include: z.array(z.string()).optional(),
      exclude: z.array(z.string()).optional(),
      priority: z.array(z.string()).optional()
    }).optional()
  }).optional(),
  outputFormat: z.object({
    formats: z.array(z.string()),
    quality: z.enum(['draft', 'standard', 'premium']),
    deliverables: z.array(z.string())
  }).optional()
});

const FileProcessingSchema = z.object({
  files: z.array(z.object({
    name: z.string(),
    type: z.string(),
    content: z.string(),
    size: z.number()
  })).min(1).max(10) // Limit to 10 files
});

const TemplateGenerationSchema = z.object({
  category: z.string().min(1),
  subcategory: z.string().optional(),
  complexity: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  purpose: z.string().optional(),
  targetAudience: z.string().optional(),
  count: z.number().min(1).max(10).default(5)
});

const RecreateProductSchema = z.object({
  sourceProduct: z.object({
    title: z.string(),
    description: z.string(),
    features: z.array(z.string()),
    category: z.string(),
    pricing: z.number().optional(),
    url: z.string().url().optional()
  }),
  improvements: z.object({
    addFeatures: z.array(z.string()).optional(),
    removeFeatures: z.array(z.string()).optional(),
    changeStyle: z.string().optional(),
    targetNewAudience: z.string().optional(),
    adjustPricing: z.object({
      type: z.string(),
      amount: z.number()
    }).optional()
  }).optional(),
  customization: z.any().optional()
});

const VariationGenerationSchema = z.object({
  baseProductId: z.string(),
  variationType: z.enum(['pricing', 'features', 'audience', 'format', 'complexity']),
  count: z.number().min(1).max(5).default(3),
  constraints: z.object({
    maxPrice: z.number().optional(),
    minFeatures: z.number().optional(),
    targetAudiences: z.array(z.string()).optional(),
    formats: z.array(z.string()).optional()
  }).optional()
});

// Initialize creation agent
let creationAgent: CreationAgent | null = null;

function getCreationAgent(): CreationAgent {
  if (!creationAgent) {
    creationAgent = new CreationAgent({
      timeout: 120000, // 2 minutes for creation tasks
      maxRetries: 3,
      cacheEnabled: true,
      cacheTTL: 1800 // 30 minutes
    });
  }
  return creationAgent;
}

// POST /api/agents/creator - Create product
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
    const creationRequest = ProductCreationRequestSchema.parse(body);

    // Get creation agent
    const agent = getCreationAgent();

    // Create product
    const result = await agent.createProduct(creationRequest);

    // Store created product in database
    try {
      const { error: dbError } = await supabase
        .from('created_products')
        .insert({
          user_id: user.id,
          product_id: result.id,
          title: result.title,
          description: result.description,
          category: result.category,
          creation_type: result.metadata.creationType,
          content: result.content,
          features: result.features,
          specifications: result.specifications,
          pricing: result.pricing,
          marketing: result.marketing,
          metadata: result.metadata,
          recommendations: result.recommendations,
          full_result: result,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Failed to store created product:', dbError);
        // Don't fail the request, just log the error
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Product creation error:', error);

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

// PUT /api/agents/creator/files - Process files
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
    const fileData = FileProcessingSchema.parse(body);

    // Get creation agent
    const agent = getCreationAgent();

    // Process files
    const result = await agent.processFiles(fileData.files);

    // Store file processing result
    try {
      const { error: dbError } = await supabase
        .from('file_processing_results')
        .insert({
          user_id: user.id,
          files_count: fileData.files.length,
          processed_files: result.processedFiles,
          summary: result.summary,
          success: result.success,
          errors: result.errors || [],
          full_result: result,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Failed to store file processing result:', dbError);
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('File processing error:', error);

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
          message: 'Failed to process files'
        }
      },
      { status: 500 }
    );
  }
}

// PATCH /api/agents/creator/templates - Generate templates
export async function PATCH(request: NextRequest) {
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
    const templateParams = TemplateGenerationSchema.parse(body);

    // Get creation agent
    const agent = getCreationAgent();

    // Generate templates
    const result = await agent.generateTemplates(templateParams);

    // Store template generation result
    try {
      const { error: dbError } = await supabase
        .from('generated_templates')
        .insert({
          user_id: user.id,
          category: templateParams.category,
          subcategory: templateParams.subcategory,
          complexity: templateParams.complexity,
          templates: result.templates,
          recommendations: result.recommendations,
          full_result: result,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Failed to store template generation result:', dbError);
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Template generation error:', error);

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
          message: 'Failed to generate templates'
        }
      },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/creator/recreate - Recreate product
export async function DELETE(request: NextRequest) {
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
    const recreateParams = RecreateProductSchema.parse(body);

    // Get creation agent
    const agent = getCreationAgent();

    // Recreate product
    const result = await agent.recreateProduct(recreateParams);

    // Store recreated product
    try {
      const { error: dbError } = await supabase
        .from('created_products')
        .insert({
          user_id: user.id,
          product_id: result.id,
          title: result.title,
          description: result.description,
          category: result.category,
          creation_type: 'recreate',
          content: result.content,
          features: result.features,
          specifications: result.specifications,
          pricing: result.pricing,
          marketing: result.marketing,
          metadata: result.metadata,
          recommendations: result.recommendations,
          source_product: recreateParams.sourceProduct,
          improvements: recreateParams.improvements,
          full_result: result,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Failed to store recreated product:', dbError);
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Product recreation error:', error);

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
          message: 'Failed to recreate product'
        }
      },
      { status: 500 }
    );
  }
}

// GET /api/agents/creator/variations - Generate product variations
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const baseProductId = searchParams.get('baseProductId');
    const variationType = searchParams.get('variationType') as any;
    const count = parseInt(searchParams.get('count') || '3');

    if (!baseProductId || !variationType) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'baseProductId and variationType are required'
          }
        },
        { status: 400 }
      );
    }

    // Get base product from database
    const { data: baseProductData, error: fetchError } = await supabase
      .from('created_products')
      .select('*')
      .eq('product_id', baseProductId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !baseProductData) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Base product not found'
          }
        },
        { status: 404 }
      );
    }

    // Get creation agent
    const agent = getCreationAgent();

    // Generate variations
    const result = await agent.generateVariations(baseProductData.full_result, {
      variationType,
      count,
      constraints: {}
    });

    // Store variations
    try {
      const variationInserts = result.map(variation => ({
        user_id: user.id,
        product_id: variation.id,
        title: variation.title,
        description: variation.description,
        category: variation.category,
        creation_type: 'variation',
        content: variation.content,
        features: variation.features,
        specifications: variation.specifications,
        pricing: variation.pricing,
        marketing: variation.marketing,
        metadata: variation.metadata,
        recommendations: variation.recommendations,
        base_product_id: baseProductId,
        variation_type: variationType,
        full_result: variation,
        created_at: new Date().toISOString()
      }));

      const { error: dbError } = await supabase
        .from('created_products')
        .insert(variationInserts);

      if (dbError) {
        console.error('Failed to store product variations:', dbError);
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    return NextResponse.json({
      success: true,
      data: {
        variations: result,
        baseProduct: baseProductData.full_result,
        variationType,
        count: result.length
      }
    });

  } catch (error) {
    console.error('Variation generation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to generate variations'
        }
      },
      { status: 500 }
    );
  }
}