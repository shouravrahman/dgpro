import { EnhancedBaseAgent, EnhancedAgentConfig } from '../enhanced-base-agent';
import { AgentRequest } from '../types';

export interface ProductCreationRequest {
    creationType: 'recreate' | 'custom' | 'template-based' | 'ai-generated';
    category: string;
    requirements: {
        title?: string;
        description?: string;
        targetAudience?: string;
        features?: string[];
        pricing?: {
            type: 'free' | 'freemium' | 'one-time' | 'subscription';
            amount?: number;
            currency?: string;
        };
        style?: string;
        format?: string;
        complexity?: 'simple' | 'medium' | 'complex';
    };
    sourceData?: {
        url?: string;
        content?: string;
        files?: Array<{
            name: string;
            type: string;
            content: string;
            size: number;
        }>;
        referenceProducts?: Array<{
            title: string;
            description: string;
            features: string[];
            pricing?: number;
        }>;
    };
    customization?: {
        branding?: {
            colors?: string[];
            fonts?: string[];
            logo?: string;
        };
        content?: {
            tone?: 'professional' | 'casual' | 'friendly' | 'technical';
            language?: string;
            length?: 'short' | 'medium' | 'long';
        };
        features?: {
            include?: string[];
            exclude?: string[];
            priority?: string[];
        };
    };
    outputFormat?: {
        formats: string[];
        quality: 'draft' | 'standard' | 'premium';
        deliverables: string[];
    };
}

export interface CreatedProduct {
    id: string;
    title: string;
    description: string;
    category: string;
    content: {
        mainContent: string;
        additionalFiles?: Array<{
            name: string;
            type: string;
            content: string;
            description: string;
        }>;
        assets?: Array<{
            type: 'image' | 'video' | 'audio' | 'document';
            url: string;
            description: string;
        }>;
    };
    features: string[];
    specifications: {
        format: string;
        size?: string;
        requirements?: string[];
        compatibility?: string[];
        license?: string;
    };
    pricing: {
        suggested: {
            type: 'free' | 'freemium' | 'one-time' | 'subscription';
            amount?: number;
            currency?: string;
            justification: string;
        };
        alternatives: Array<{
            type: string;
            amount: number;
            description: string;
        }>;
    };
    marketing: {
        tagline: string;
        keyBenefits: string[];
        targetAudience: string[];
        competitiveAdvantages: string[];
        marketingCopy: {
            short: string;
            medium: string;
            long: string;
        };
    };
    metadata: {
        createdAt: Date;
        creationType: string;
        complexity: string;
        estimatedValue: number;
        qualityScore: number;
        uniquenessScore: number;
    };
    recommendations: {
        improvements: string[];
        monetization: string[];
        distribution: string[];
        nextSteps: string[];
    };
}

export interface FileProcessingResult {
    success: boolean;
    processedFiles: Array<{
        originalName: string;
        type: string;
        extractedContent: string;
        metadata: {
            size: number;
            pages?: number;
            wordCount?: number;
            language?: string;
        };
        insights: {
            keyTopics: string[];
            sentiment?: string;
            complexity?: string;
            suggestions: string[];
        };
    }>;
    summary: {
        totalFiles: number;
        successfullyProcessed: number;
        totalContent: string;
        combinedInsights: {
            mainThemes: string[];
            suggestedCategories: string[];
            potentialProducts: string[];
        };
    };
    errors?: Array<{
        file: string;
        error: string;
    }>;
}

export interface TemplateGenerationResult {
    templates: Array<{
        id: string;
        name: string;
        category: string;
        description: string;
        structure: {
            sections: Array<{
                name: string;
                type: string;
                required: boolean;
                placeholder: string;
            }>;
            customFields?: Array<{
                name: string;
                type: string;
                options?: string[];
            }>;
        };
        content: {
            template: string;
            examples: string[];
            guidelines: string[];
        };
        metadata: {
            difficulty: 'beginner' | 'intermediate' | 'advanced';
            estimatedTime: string;
            popularity: number;
            tags: string[];
        };
    }>;
    recommendations: {
        bestMatch: string;
        alternatives: string[];
        customizationSuggestions: string[];
    };
}

export class CreationAgent extends EnhancedBaseAgent {
    constructor(config?: Partial<EnhancedAgentConfig>) {
        const agentConfig: EnhancedAgentConfig = {
            id: 'creation-agent',
            name: 'Product Creation Agent',
            description: 'AI agent specialized in creating digital products from requirements, templates, or existing products',
            primaryModel: 'gemini-1.5-pro',
            fallbackModels: ['gemini-1.5-flash'],
            maxRetries: 3,
            timeout: 120000, // Longer timeout for creation tasks
            cacheEnabled: true,
            cacheTTL: 1800, // 30 minutes cache
            rateLimitPerMinute: 15, // Lower rate limit due to intensive operations
            enableStreaming: true,
            enableQueue: true,
            ...config
        };

        super(agentConfig);
    }

    /**
     * Create a digital product based on requirements
     */
    public async createProduct(request: ProductCreationRequest): Promise<CreatedProduct> {
        const creationPrompt = this.buildCreationPrompt(request);

        const agentRequest: AgentRequest = {
            id: this.generateRequestId(),
            agentId: this.config.id,
            input: creationPrompt,
            context: {
                creationType: request.creationType,
                category: request.category,
                requirements: request.requirements,
                sourceData: request.sourceData,
                customization: request.customization
            },
            priority: 'normal'
        };

        const response = await this.processRequest(agentRequest);

        if (!response.output) {
            throw new Error('Failed to create product');
        }

        return this.parseCreationResult(response.output, request);
    }

    /**
     * Process uploaded files and extract content for product creation
     */
    public async processFiles(files: Array<{
        name: string;
        type: string;
        content: string;
        size: number;
    }>): Promise<FileProcessingResult> {
        const processingPrompt = `
      Process and analyze the following uploaded files for digital product creation:
      
      Files to process:
      ${files.map(file => `
      File: ${file.name}
      Type: ${file.type}
      Size: ${file.size} bytes
      Content Preview: ${file.content.substring(0, 1000)}...
      `).join('\n')}
      
      For each file, provide:
      1. Extracted and cleaned content
      2. Key topics and themes identification
      3. Content complexity assessment
      4. Language and sentiment analysis
      5. Suggestions for product creation
      
      Overall analysis:
      1. Identify main themes across all files
      2. Suggest potential product categories
      3. Recommend product types that could be created
      4. Highlight unique insights or opportunities
      
      Focus on actionable insights for digital product creation.
    `;

        const agentRequest: AgentRequest = {
            id: this.generateRequestId(),
            agentId: this.config.id,
            input: processingPrompt,
            context: { files },
            priority: 'normal'
        };

        const response = await this.processRequest(agentRequest);

        if (!response.output) {
            throw new Error('Failed to process files');
        }

        return this.parseFileProcessingResult(response.output, files);
    }

    /**
     * Generate category-specific templates
     */
    public async generateTemplates(params: {
        category: string;
        subcategory?: string;
        complexity?: 'beginner' | 'intermediate' | 'advanced';
        purpose?: string;
        targetAudience?: string;
        count?: number;
    }): Promise<TemplateGenerationResult> {
        const { category, subcategory, complexity = 'intermediate', purpose, targetAudience, count = 5 } = params;

        const templatePrompt = `
      Generate ${count} professional templates for ${category} digital products.
      
      Requirements:
      - Category: ${category}
      ${subcategory ? `- Subcategory: ${subcategory}` : ''}
      - Complexity Level: ${complexity}
      ${purpose ? `- Purpose: ${purpose}` : ''}
      ${targetAudience ? `- Target Audience: ${targetAudience}` : ''}
      
      For each template, provide:
      
      1. Template Structure:
         - Clear section breakdown
         - Required vs optional components
         - Field types and validation
         - Placeholder content and examples
      
      2. Content Guidelines:
         - Writing style recommendations
         - Content length suggestions
         - Best practices for each section
         - Common mistakes to avoid
      
      3. Customization Options:
         - Variable elements
         - Branding opportunities
         - Personalization points
         - Advanced features
      
      4. Metadata:
         - Difficulty assessment
         - Time estimation
         - Popularity indicators
         - Relevant tags
      
      Focus on templates that are:
      - Professional and market-ready
      - Easy to customize and use
      - Aligned with current market trends
      - Optimized for the target audience
      
      Provide practical, actionable templates that users can immediately implement.
    `;

        const agentRequest: AgentRequest = {
            id: this.generateRequestId(),
            agentId: this.config.id,
            input: templatePrompt,
            context: params,
            priority: 'normal'
        };

        const response = await this.processRequest(agentRequest);

        if (!response.output) {
            throw new Error('Failed to generate templates');
        }

        return this.parseTemplateResult(response.output, params);
    }

    /**
     * Recreate an existing product with improvements
     */
    public async recreateProduct(params: {
        sourceProduct: {
            title: string;
            description: string;
            features: string[];
            category: string;
            pricing?: number;
            url?: string;
        };
        improvements?: {
            addFeatures?: string[];
            removeFeatures?: string[];
            changeStyle?: string;
            targetNewAudience?: string;
            adjustPricing?: {
                type: string;
                amount: number;
            };
        };
        customization?: {
            branding?: any;
            content?: any;
        };
    }): Promise<CreatedProduct> {
        const recreationRequest: ProductCreationRequest = {
            creationType: 'recreate',
            category: params.sourceProduct.category,
            requirements: {
                title: params.sourceProduct.title,
                description: params.sourceProduct.description,
                features: params.sourceProduct.features,
                pricing: params.sourceProduct.pricing ? {
                    type: 'one-time',
                    amount: params.sourceProduct.pricing,
                    currency: 'USD'
                } : undefined
            },
            sourceData: {
                url: params.sourceProduct.url,
                referenceProducts: [params.sourceProduct]
            },
            customization: params.customization
        };

        // Apply improvements
        if (params.improvements) {
            if (params.improvements.addFeatures) {
                recreationRequest.requirements.features = [
                    ...(recreationRequest.requirements.features || []),
                    ...params.improvements.addFeatures
                ];
            }

            if (params.improvements.removeFeatures) {
                recreationRequest.requirements.features = recreationRequest.requirements.features?.filter(
                    feature => !params.improvements.removeFeatures?.includes(feature)
                );
            }

            if (params.improvements.targetNewAudience) {
                recreationRequest.requirements.targetAudience = params.improvements.targetNewAudience;
            }

            if (params.improvements.adjustPricing) {
                recreationRequest.requirements.pricing = {
                    type: params.improvements.adjustPricing.type as any,
                    amount: params.improvements.adjustPricing.amount,
                    currency: 'USD'
                };
            }
        }

        return await this.createProduct(recreationRequest);
    }

    /**
     * Generate product variations
     */
    public async generateVariations(baseProduct: CreatedProduct, params: {
        variationType: 'pricing' | 'features' | 'audience' | 'format' | 'complexity';
        count?: number;
        constraints?: {
            maxPrice?: number;
            minFeatures?: number;
            targetAudiences?: string[];
            formats?: string[];
        };
    }): Promise<CreatedProduct[]> {
        const variations: CreatedProduct[] = [];
        const { variationType, count = 3, constraints } = params;

        for (let i = 0; i < count; i++) {
            const variationRequest = this.buildVariationRequest(baseProduct, variationType, i, constraints);
            const variation = await this.createProduct(variationRequest);
            variations.push(variation);
        }

        return variations;
    }

    // Implementation of abstract methods from EnhancedBaseAgent
    protected async processOutput(content: string, request: AgentRequest): Promise<unknown> {
        try {
            return JSON.parse(content);
        } catch {
            return {
                content,
                type: 'creation',
                context: request.context,
                timestamp: new Date().toISOString()
            };
        }
    }

    protected async getEmergencyFallback(request: AgentRequest): Promise<unknown> {
        const creationType = request.context?.creationType || 'custom';

        return {
            error: 'Product creation service temporarily unavailable',
            fallback: true,
            creationType,
            message: 'Please try again later or use a simpler creation request',
            timestamp: new Date().toISOString()
        };
    }

    public async process(input: unknown, context?: Record<string, unknown>): Promise<unknown> {
        if (typeof input === 'object' && input !== null) {
            const creationRequest = input as ProductCreationRequest;
            return await this.createProduct(creationRequest);
        }

        throw new Error('Invalid input: expected ProductCreationRequest object');
    }

    // Private helper methods
    private buildCreationPrompt(request: ProductCreationRequest): string {
        const { creationType, category, requirements, sourceData, customization, outputFormat } = request;

        let prompt = `
      Create a ${category} digital product using ${creationType} approach.
      
      Requirements:
      ${requirements.title ? `- Title: ${requirements.title}` : ''}
      ${requirements.description ? `- Description: ${requirements.description}` : ''}
      ${requirements.targetAudience ? `- Target Audience: ${requirements.targetAudience}` : ''}
      ${requirements.features ? `- Required Features: ${requirements.features.join(', ')}` : ''}
      ${requirements.pricing ? `- Pricing: ${requirements.pricing.amount} ${requirements.pricing.currency} (${requirements.pricing.type})` : ''}
      ${requirements.style ? `- Style: ${requirements.style}` : ''}
      ${requirements.format ? `- Format: ${requirements.format}` : ''}
      ${requirements.complexity ? `- Complexity: ${requirements.complexity}` : ''}
    `;

        if (sourceData) {
            prompt += `
      
      Source Data:
      ${sourceData.url ? `- Reference URL: ${sourceData.url}` : ''}
      ${sourceData.content ? `- Content: ${sourceData.content.substring(0, 500)}...` : ''}
      ${sourceData.files ? `- Files: ${sourceData.files.length} files provided` : ''}
      ${sourceData.referenceProducts ? `- Reference Products: ${sourceData.referenceProducts.length} products` : ''}
      `;
        }

        if (customization) {
            prompt += `
      
      Customization:
      ${customization.branding ? `- Branding: ${JSON.stringify(customization.branding)}` : ''}
      ${customization.content ? `- Content Style: ${JSON.stringify(customization.content)}` : ''}
      ${customization.features ? `- Feature Preferences: ${JSON.stringify(customization.features)}` : ''}
      `;
        }

        prompt += `
    
    Create a comprehensive digital product that includes:
    
    1. Product Content:
       - Main content/deliverable
       - Supporting files and assets
       - Documentation and instructions
       - Quality assurance elements
    
    2. Product Specifications:
       - Technical requirements
       - Format specifications
       - Compatibility information
       - Licensing details
    
    3. Pricing Strategy:
       - Suggested pricing with justification
       - Alternative pricing models
       - Value proposition alignment
       - Market positioning
    
    4. Marketing Materials:
       - Compelling tagline
       - Key benefits and features
       - Target audience definition
       - Competitive advantages
       - Marketing copy (short, medium, long)
    
    5. Quality Assessment:
       - Uniqueness score (0-100)
       - Market viability score (0-100)
       - Quality score (0-100)
       - Estimated market value
    
    6. Recommendations:
       - Product improvements
       - Monetization strategies
       - Distribution channels
       - Next development steps
    
    Ensure the product is:
    - Market-ready and professional
    - Unique and valuable
    - Properly structured and organized
    - Optimized for the target audience
    - Competitively positioned
    
    Return a complete, actionable product specification.
    `;

        return prompt;
    }

    private parseCreationResult(output: unknown, request: ProductCreationRequest): CreatedProduct {
        try {
            if (typeof output === 'object' && output !== null) {
                const structured = output as any;
                if (structured.title && structured.content) {
                    return {
                        ...structured,
                        id: this.generateProductId(structured.title),
                        metadata: {
                            ...structured.metadata,
                            createdAt: new Date(),
                            creationType: request.creationType
                        }
                    };
                }
            }

            const content = typeof output === 'string' ? output : JSON.stringify(output);
            return this.createProductFromText(content, request);

        } catch (error) {
            console.error('Error parsing creation result:', error);
            return this.createFallbackProduct(request);
        }
    }

    private parseFileProcessingResult(output: unknown, files: any[]): FileProcessingResult {
        try {
            if (typeof output === 'object' && output !== null) {
                const structured = output as any;
                if (structured.processedFiles) {
                    return structured;
                }
            }

            // Parse from text if needed
            const content = typeof output === 'string' ? output : JSON.stringify(output);

            return {
                success: true,
                processedFiles: files.map(file => ({
                    originalName: file.name,
                    type: file.type,
                    extractedContent: file.content,
                    metadata: {
                        size: file.size,
                        wordCount: file.content.split(' ').length
                    },
                    insights: {
                        keyTopics: this.extractTopics(file.content),
                        suggestions: ['Content analysis completed']
                    }
                })),
                summary: {
                    totalFiles: files.length,
                    successfullyProcessed: files.length,
                    totalContent: files.map(f => f.content).join('\n'),
                    combinedInsights: {
                        mainThemes: ['General content'],
                        suggestedCategories: ['digital-product'],
                        potentialProducts: ['Custom product based on content']
                    }
                }
            };

        } catch (error) {
            console.error('Error parsing file processing result:', error);
            return this.createFallbackFileResult(files);
        }
    }

    private parseTemplateResult(output: unknown, params: any): TemplateGenerationResult {
        try {
            if (typeof output === 'object' && output !== null) {
                const structured = output as any;
                if (structured.templates) {
                    return structured;
                }
            }

            // Create basic templates
            return {
                templates: this.generateBasicTemplates(params.category, params.count || 5),
                recommendations: {
                    bestMatch: 'template-1',
                    alternatives: ['template-2', 'template-3'],
                    customizationSuggestions: ['Adjust content length', 'Customize branding']
                }
            };

        } catch (error) {
            console.error('Error parsing template result:', error);
            return this.createFallbackTemplateResult(params);
        }
    }

    private createProductFromText(content: string, request: ProductCreationRequest): CreatedProduct {
        const title = request.requirements.title || this.extractTitle(content) || 'Generated Product';
        const description = request.requirements.description || this.extractDescription(content) || 'AI-generated digital product';

        return {
            id: this.generateProductId(title),
            title,
            description,
            category: request.category,
            content: {
                mainContent: content,
                additionalFiles: [],
                assets: []
            },
            features: request.requirements.features || this.extractFeatures(content),
            specifications: {
                format: request.requirements.format || 'digital',
                license: 'Standard License'
            },
            pricing: {
                suggested: {
                    type: request.requirements.pricing?.type || 'one-time',
                    amount: request.requirements.pricing?.amount || 29,
                    currency: request.requirements.pricing?.currency || 'USD',
                    justification: 'Based on content complexity and market standards'
                },
                alternatives: [
                    { type: 'freemium', amount: 0, description: 'Basic version free' },
                    { type: 'premium', amount: 49, description: 'Enhanced version with extras' }
                ]
            },
            marketing: {
                tagline: `Professional ${request.category} solution`,
                keyBenefits: ['High quality', 'Easy to use', 'Professional results'],
                targetAudience: [request.requirements.targetAudience || 'Professionals'],
                competitiveAdvantages: ['AI-generated', 'Customizable', 'Market-ready'],
                marketingCopy: {
                    short: `${title} - ${description}`,
                    medium: `Transform your ${request.category} needs with ${title}. ${description}`,
                    long: `Discover the power of ${title}, a comprehensive ${request.category} solution designed for modern professionals. ${description} With advanced features and intuitive design, this product delivers exceptional value and results.`
                }
            },
            metadata: {
                createdAt: new Date(),
                creationType: request.creationType,
                complexity: request.requirements.complexity || 'medium',
                estimatedValue: 100,
                qualityScore: 75,
                uniquenessScore: 80
            },
            recommendations: {
                improvements: ['Add more features', 'Enhance visual design'],
                monetization: ['Offer premium version', 'Create bundle packages'],
                distribution: ['Online marketplaces', 'Direct sales'],
                nextSteps: ['Market testing', 'User feedback collection']
            }
        };
    }

    private createFallbackProduct(request: ProductCreationRequest): CreatedProduct {
        const title = request.requirements.title || `${request.category} Product`;

        return {
            id: this.generateProductId(title),
            title,
            description: request.requirements.description || 'A digital product created with AI assistance',
            category: request.category,
            content: {
                mainContent: 'Product content will be generated based on your requirements.',
                additionalFiles: [],
                assets: []
            },
            features: request.requirements.features || ['Basic functionality'],
            specifications: {
                format: 'digital',
                license: 'Standard License'
            },
            pricing: {
                suggested: {
                    type: 'one-time',
                    amount: 25,
                    currency: 'USD',
                    justification: 'Standard pricing for digital products'
                },
                alternatives: []
            },
            marketing: {
                tagline: `Quality ${request.category} solution`,
                keyBenefits: ['Professional quality', 'Easy to use'],
                targetAudience: ['General users'],
                competitiveAdvantages: ['AI-powered'],
                marketingCopy: {
                    short: title,
                    medium: `${title} - Professional ${request.category} solution`,
                    long: `${title} is a comprehensive ${request.category} solution designed to meet your needs.`
                }
            },
            metadata: {
                createdAt: new Date(),
                creationType: request.creationType,
                complexity: 'medium',
                estimatedValue: 50,
                qualityScore: 60,
                uniquenessScore: 70
            },
            recommendations: {
                improvements: ['Enhance content', 'Add more features'],
                monetization: ['Consider subscription model'],
                distribution: ['Online platforms'],
                nextSteps: ['Refine requirements', 'Iterate on design']
            }
        };
    }

    private createFallbackFileResult(files: any[]): FileProcessingResult {
        return {
            success: false,
            processedFiles: [],
            summary: {
                totalFiles: files.length,
                successfullyProcessed: 0,
                totalContent: '',
                combinedInsights: {
                    mainThemes: [],
                    suggestedCategories: [],
                    potentialProducts: []
                }
            },
            errors: files.map(file => ({
                file: file.name,
                error: 'Processing failed'
            }))
        };
    }

    private createFallbackTemplateResult(params: any): TemplateGenerationResult {
        return {
            templates: [],
            recommendations: {
                bestMatch: '',
                alternatives: [],
                customizationSuggestions: []
            }
        };
    }

    private generateBasicTemplates(category: string, count: number): any[] {
        const templates = [];

        for (let i = 1; i <= count; i++) {
            templates.push({
                id: `template-${i}`,
                name: `${category} Template ${i}`,
                category,
                description: `Professional ${category} template`,
                structure: {
                    sections: [
                        { name: 'Introduction', type: 'text', required: true, placeholder: 'Enter introduction' },
                        { name: 'Main Content', type: 'rich-text', required: true, placeholder: 'Main content here' },
                        { name: 'Conclusion', type: 'text', required: false, placeholder: 'Optional conclusion' }
                    ]
                },
                content: {
                    template: `# ${category} Template ${i}\n\nIntroduction section...\n\nMain content section...\n\nConclusion section...`,
                    examples: [`Example ${category} content`],
                    guidelines: ['Keep content clear and concise', 'Use professional tone']
                },
                metadata: {
                    difficulty: 'intermediate' as const,
                    estimatedTime: '2-4 hours',
                    popularity: 75,
                    tags: [category, 'template', 'professional']
                }
            });
        }

        return templates;
    }

    private buildVariationRequest(baseProduct: CreatedProduct, variationType: string, index: number, constraints?: any): ProductCreationRequest {
        const request: ProductCreationRequest = {
            creationType: 'custom',
            category: baseProduct.category,
            requirements: {
                title: `${baseProduct.title} - Variation ${index + 1}`,
                description: baseProduct.description,
                features: [...baseProduct.features],
                complexity: baseProduct.metadata.complexity as any
            }
        };

        // Apply variation based on type
        switch (variationType) {
            case 'pricing':
                const pricingMultipliers = [0.7, 1.3, 1.8];
                const multiplier = pricingMultipliers[index] || 1;
                request.requirements.pricing = {
                    type: baseProduct.pricing.suggested.type,
                    amount: Math.round((baseProduct.pricing.suggested.amount || 25) * multiplier),
                    currency: baseProduct.pricing.suggested.currency
                };
                break;

            case 'features':
                if (index === 0) {
                    // Minimal version
                    request.requirements.features = baseProduct.features.slice(0, Math.ceil(baseProduct.features.length / 2));
                } else if (index === 1) {
                    // Enhanced version
                    request.requirements.features = [...baseProduct.features, 'Premium feature', 'Advanced analytics'];
                }
                break;

            case 'audience':
                const audiences = ['beginners', 'professionals', 'enterprises'];
                request.requirements.targetAudience = audiences[index] || 'general';
                break;
        }

        return request;
    }

    // Utility methods
    private generateRequestId(): string {
        return `creation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateProductId(title: string): string {
        const hash = title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
        return `prod_${hash}_${Date.now()}`;
    }

    private extractTitle(content: string): string | null {
        const lines = content.split('\n');
        for (const line of lines) {
            if (line.trim().length > 5 && line.trim().length < 100) {
                return line.trim();
            }
        }
        return null;
    }

    private extractDescription(content: string): string | null {
        const sentences = content.split(/[.!?]+/);
        for (const sentence of sentences) {
            if (sentence.trim().length > 20 && sentence.trim().length < 200) {
                return sentence.trim();
            }
        }
        return null;
    }

    private extractFeatures(content: string): string[] {
        const features = [];
        const lines = content.split('\n');

        for (const line of lines) {
            if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                const feature = line.trim().substring(1).trim();
                if (feature.length > 5 && feature.length < 100) {
                    features.push(feature);
                }
            }
        }

        return features.slice(0, 10); // Limit to 10 features
    }

    private extractTopics(content: string): string[] {
        // Simple keyword extraction
        const words = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
        const wordFreq = new Map<string, number>();

        words.forEach(word => {
            if (!this.isStopWord(word)) {
                wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
            }
        });

        return Array.from(wordFreq.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word]) => word);
    }

    private isStopWord(word: string): boolean {
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
            'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'
        ]);
        return stopWords.has(word);
    }
}
generateBasicTemplates(category: string, count: number): any[] {
    const templates = [];

    for (let i = 1; i <= count; i++) {
        templates.push({
            id: `template-${i}`,
            name: `${category} Template ${i}`,
            category,
            description: `Professional ${category} template for quick product creation`,
            structure: {
                sections: [
                    {
                        name: 'Introduction',
                        type: 'text',
                        required: true,
                        placeholder: 'Introduce your product and its main benefits'
                    },
                    {
                        name: 'Features',
                        type: 'list',
                        required: true,
                        placeholder: 'List key features and capabilities'
                    },
                    {
                        name: 'Instructions',
                        type: 'text',
                        required: false,
                        placeholder: 'Provide usage instructions or guidelines'
                    }
                ]
            },
            content: {
                template: `# ${category} Template ${i}\n\n## Introduction\n[Your introduction here]\n\n## Features\n- Feature 1\n- Feature 2\n- Feature 3\n\n## Instructions\n[Usage instructions here]`,
                examples: [`Example ${category.toLowerCase()} content`],
                guidelines: ['Keep content clear and concise', 'Focus on user benefits']
            },
            metadata: {
                difficulty: 'intermediate' as const,
                estimatedTime: '2-4 hours',
                popularity: Math.floor(Math.random() * 100),
                tags: [category.toLowerCase(), 'template', 'professional']
            }
        });
    }

    return templates;
}

    private buildVariationRequest(
    baseProduct: CreatedProduct,
    variationType: string,
    index: number,
    constraints ?: any
): ProductCreationRequest {
    const variation: ProductCreationRequest = {
        creationType: 'custom',
        category: baseProduct.category,
        requirements: {
            title: baseProduct.title,
            description: baseProduct.description,
            features: [...baseProduct.features],
            pricing: baseProduct.pricing.suggested
        }
    };

    // Apply variation based on type
    switch (variationType) {
        case 'pricing':
            if (variation.requirements.pricing) {
                variation.requirements.pricing.amount = (variation.requirements.pricing.amount || 25) * (1 + (index * 0.5));
            }
            break;
        case 'features':
            variation.requirements.features = baseProduct.features.slice(0, Math.max(1, baseProduct.features.length - index));
            break;
        case 'audience':
            const audiences = ['beginners', 'professionals', 'enterprises', 'students', 'freelancers'];
            variation.requirements.targetAudience = audiences[index % audiences.length];
            break;
        case 'format':
            const formats = ['PDF', 'Video', 'Interactive', 'Template', 'Course'];
            variation.requirements.format = formats[index % formats.length];
            break;
        case 'complexity':
            const complexities = ['simple', 'medium', 'complex'] as const;
            variation.requirements.complexity = complexities[index % complexities.length];
            break;
    }

    return variation;
}

    private extractTitle(content: string): string {
    const lines = content.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length > 5 && trimmed.length < 100) {
            return trimmed.replace(/^#+\s*/, ''); // Remove markdown headers
        }
    }
    return 'Generated Product';
}

    private extractDescription(content: string): string {
    const lines = content.split('\n').filter(line => line.trim().length > 20);
    return lines.slice(0, 3).join(' ').substring(0, 200) + '...';
}

    private extractFeatures(content: string): string[] {
    const features = [];
    const lines = content.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            features.push(trimmed.substring(2));
        }
    }

    return features.length > 0 ? features : ['Feature extraction from content', 'AI-powered analysis', 'Professional quality'];
}

    private extractTopics(content: string): string[] {
    const words = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const wordCount = new Map<string, number>();

    words.forEach(word => {
        if (!this.isStopWord(word)) {
            wordCount.set(word, (wordCount.get(word) || 0) + 1);
        }
    });

    return Array.from(wordCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);
}

    private isStopWord(word: string): boolean {
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
        'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
        'this', 'that', 'these', 'those', 'you', 'your', 'our', 'we', 'they'
    ]);
    return stopWords.has(word);
}

    private generateRequestId(): string {
    return `create_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

    private generateProductId(title: string): string {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `prod_${slug}_${Date.now()}`;
}
}