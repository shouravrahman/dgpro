import { EnhancedBaseAgent, EnhancedAgentConfig } from '../enhanced-base-agent';
import { AgentRequest } from '../types';

export interface ScrapingRequest {
    url: string;
    options?: {
        includeImages?: boolean;
        includeMetadata?: boolean;
        maxDepth?: number;
        timeout?: number;
    };
}

export interface ScrapingResult {
    url: string;
    title: string;
    description: string;
    content: string;
    images: string[];
    metadata: Record<string, unknown>;
    pricing?: {
        amount: number;
        currency: string;
        type: 'one-time' | 'subscription' | 'free';
    };
    features: string[];
    category: string;
    scrapedAt: Date;
}

export class EnhancedScraperAgent extends EnhancedBaseAgent {
    constructor(config?: Partial<EnhancedAgentConfig>) {
        super({
            id: 'enhanced-scraper',
            name: 'Enhanced Scraper Agent',
            description: 'Advanced web scraping agent with AI-powered content extraction and analysis',
            primaryModel: 'gemini-1.5-pro',
            fallbackModels: ['gemini-1.5-flash', 'gemini-1.0-pro'],
            maxRetries: 3,
            timeout: 60000,
            cacheEnabled: true,
            cacheTTL: 7200, // 2 hours
            rateLimitPerMinute: 30,
            enableStreaming: true,
            enableQueue: true,
            ...config
        });
    }

    public async process(
        input: ScrapingRequest,
        context?: Record<string, unknown>
    ): Promise<ScrapingResult> {
        this.validateInput(input);

        const request: AgentRequest = {
            id: this.generateRequestId(),
            agentId: this.config.id,
            input,
            context,
            priority: 'normal',
            streaming: false
        };

        const response = await this.processRequest(request);
        return response.output as ScrapingResult;
    }

    protected async processOutput(
        content: string,
        request: AgentRequest
    ): Promise<ScrapingResult> {
        const input = request.input as ScrapingRequest;

        try {
            // Parse AI response to extract structured data
            const parsed = this.parseAIResponse(content);

            return {
                url: input.url,
                title: parsed.title || 'Unknown Title',
                description: parsed.description || '',
                content: parsed.content || content,
                images: parsed.images || [],
                metadata: {
                    ...parsed.metadata,
                    scrapingAgent: this.config.name,
                    model: 'ai-extracted',
                    confidence: parsed.confidence || 0.8
                },
                pricing: parsed.pricing,
                features: parsed.features || [],
                category: parsed.category || 'unknown',
                scrapedAt: new Date()
            };
        } catch (error) {
            console.error('Error processing scraper output:', error);

            // Fallback to basic extraction
            return this.createBasicResult(input, content);
        }
    }

    protected async getEmergencyFallback(
        request: AgentRequest
    ): Promise<ScrapingResult> {
        const input = request.input as ScrapingRequest;

        return {
            url: input.url,
            title: 'Scraping Failed - Emergency Fallback',
            description: 'Unable to scrape content due to system issues',
            content: '',
            images: [],
            metadata: {
                error: 'Emergency fallback activated',
                scrapingAgent: this.config.name,
                fallback: true
            },
            features: [],
            category: 'unknown',
            scrapedAt: new Date()
        };
    }

    private validateInput(input: ScrapingRequest): void {
        if (!input || typeof input !== 'object') {
            throw new Error('Invalid input: expected ScrapingRequest object');
        }

        if (!input.url || typeof input.url !== 'string') {
            throw new Error('Invalid input: url is required and must be a string');
        }

        try {
            new URL(input.url);
        } catch {
            throw new Error('Invalid input: url must be a valid URL');
        }
    }

    protected buildPrompt(
        input: ScrapingRequest,
        context?: Record<string, unknown>
    ): string {
        const { url, options = {} } = input;

        let prompt = `You are an advanced web scraping and content analysis AI. Your task is to analyze and extract structured information from web content.

URL to analyze: ${url}

Please extract the following information and return it as a JSON object:

{
  "title": "Main title or product name",
  "description": "Brief description or summary",
  "content": "Main content or product details",
  "images": ["array", "of", "image", "urls"],
  "pricing": {
    "amount": number,
    "currency": "USD",
    "type": "one-time|subscription|free"
  },
  "features": ["array", "of", "key", "features"],
  "category": "product category",
  "metadata": {
    "author": "creator or company",
    "publishDate": "publication date if available",
    "tags": ["relevant", "tags"],
    "confidence": 0.9
  }
}

Analysis Requirements:
- Extract the main product or content title
- Identify key features and benefits
- Determine pricing information if available
- Categorize the content/product
- Extract relevant metadata
- Assess content quality and completeness
- Identify target audience indicators`;

        if (options.includeImages) {
            prompt += '\n- Include all relevant image URLs';
        }

        if (options.includeMetadata) {
            prompt += '\n- Extract comprehensive metadata including SEO tags, social media info, etc.';
        }

        if (context) {
            prompt += `\n\nAdditional Context:\n${JSON.stringify(context, null, 2)}`;
        }

        prompt += '\n\nReturn only the JSON object, no additional text or formatting.';

        return prompt;
    }

    private parseAIResponse(content: string): Partial<ScrapingResult> {
        try {
            // Try to extract JSON from the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return this.validateParsedData(parsed);
            }

            // If no JSON found, try to extract key information using regex
            return this.extractWithRegex(content);
        } catch (error) {
            console.warn('Failed to parse AI response as JSON:', error);
            return this.extractWithRegex(content);
        }
    }

    private validateParsedData(data: any): Partial<ScrapingResult> {
        const validated: Partial<ScrapingResult> = {};

        if (data.title && typeof data.title === 'string') {
            validated.title = data.title.trim();
        }

        if (data.description && typeof data.description === 'string') {
            validated.description = data.description.trim();
        }

        if (data.content && typeof data.content === 'string') {
            validated.content = data.content.trim();
        }

        if (Array.isArray(data.images)) {
            validated.images = data.images.filter(img => typeof img === 'string');
        }

        if (Array.isArray(data.features)) {
            validated.features = data.features.filter(feature => typeof feature === 'string');
        }

        if (data.category && typeof data.category === 'string') {
            validated.category = data.category.trim();
        }

        if (data.pricing && typeof data.pricing === 'object') {
            validated.pricing = {
                amount: Number(data.pricing.amount) || 0,
                currency: data.pricing.currency || 'USD',
                type: data.pricing.type || 'unknown'
            } as any;
        }

        if (data.metadata && typeof data.metadata === 'object') {
            validated.metadata = data.metadata;
        }

        return validated;
    }

    private extractWithRegex(content: string): Partial<ScrapingResult> {
        const result: Partial<ScrapingResult> = {};

        // Extract title (look for common patterns)
        const titleMatch = content.match(/(?:title|name|product):\s*["']?([^"'\n]+)["']?/i);
        if (titleMatch) {
            result.title = titleMatch[1].trim();
        }

        // Extract description
        const descMatch = content.match(/(?:description|summary):\s*["']?([^"'\n]+)["']?/i);
        if (descMatch) {
            result.description = descMatch[1].trim();
        }

        // Extract price information
        const priceMatch = content.match(/(?:price|cost|amount):\s*\$?(\d+(?:\.\d{2})?)/i);
        if (priceMatch) {
            result.pricing = {
                amount: parseFloat(priceMatch[1]),
                currency: 'USD',
                type: 'one-time'
            } as any;
        }

        // Extract features (look for bullet points or lists)
        const featuresMatch = content.match(/(?:features?|benefits?):\s*([^\n]+(?:\n[^\n]+)*)/i);
        if (featuresMatch) {
            result.features = featuresMatch[1]
                .split(/[,\n•\-\*]/)
                .map(f => f.trim())
                .filter(f => f.length > 0);
        }

        return result;
    }

    private createBasicResult(input: ScrapingRequest, content: string): ScrapingResult {
        return {
            url: input.url,
            title: 'Basic Extraction',
            description: content.substring(0, 200) + '...',
            content: content,
            images: [],
            metadata: {
                extractionMethod: 'basic',
                scrapingAgent: this.config.name,
                confidence: 0.5
            },
            features: [],
            category: 'unknown',
            scrapedAt: new Date()
        };
    }

    private generateRequestId(): string {
        return `scraper_req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Public utility methods
    public async scrapeMultipleUrls(
        urls: string[],
        options?: ScrapingRequest['options']
    ): Promise<ScrapingResult[]> {
        const requests = urls.map(url => ({ url, options }));
        const results: ScrapingResult[] = [];

        for (const request of requests) {
            try {
                const result = await this.process(request);
                results.push(result);
            } catch (error) {
                console.error(`Failed to scrape ${request.url}:`, error);
                results.push(await this.getEmergencyFallback({
                    id: this.generateRequestId(),
                    agentId: this.config.id,
                    input: request,
                    priority: 'normal',
                    streaming: false
                }));
            }
        }

        return results;
    }

    public async streamScraping(
        input: ScrapingRequest,
        onProgress?: (progress: { stage: string; data?: any }) => void
    ): Promise<ScrapingResult> {
        if (onProgress) {
            onProgress({ stage: 'starting', data: { url: input.url } });
        }

        try {
            if (onProgress) {
                onProgress({ stage: 'analyzing' });
            }

            const result = await this.process(input);

            if (onProgress) {
                onProgress({ stage: 'completed', data: result });
            }

            return result;
        } catch (error) {
            if (onProgress) {
                onProgress({ stage: 'error', data: { error: (error as Error).message } });
            }
            throw error;
        }
    }
}