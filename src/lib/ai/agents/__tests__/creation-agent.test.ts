import { describe, it, expect, beforeEach } from 'vitest';
import { CreationAgent } from '../creation-agent';
import type { ProductCreationRequest } from '../creation-agent';

// Set environment variables for tests
process.env.GOOGLE_AI_API_KEY = 'test-google-key';

describe('CreationAgent', () => {
    let creationAgent: CreationAgent;

    beforeEach(() => {
        creationAgent = new CreationAgent();
    });

    describe('createProduct', () => {
        it('should create a product from requirements', async () => {
            const request: ProductCreationRequest = {
                creationType: 'custom',
                category: 'course',
                requirements: {
                    title: 'JavaScript Fundamentals',
                    description: 'Learn JavaScript from basics to advanced concepts',
                    targetAudience: 'Beginner developers',
                    features: ['Video lessons', 'Code examples', 'Exercises', 'Certificate'],
                    pricing: {
                        type: 'one-time',
                        amount: 49,
                        currency: 'USD'
                    },
                    complexity: 'medium'
                }
            };

            const result = await creationAgent.createProduct(request);

            expect(result).toBeDefined();
            expect(result.title).toBe('JavaScript Fundamentals');
            expect(result.category).toBe('course');
            expect(result.features).toContain('Video lessons');
            expect(result.pricing.suggested.amount).toBe(49);
            expect(result.metadata.creationType).toBe('custom');
        });

        it('should create a product with minimal requirements', async () => {
            const request: ProductCreationRequest = {
                creationType: 'ai-generated',
                category: 'template',
                requirements: {
                    title: 'Business Plan Template'
                }
            };

            const result = await creationAgent.createProduct(request);

            expect(result).toBeDefined();
            expect(result.title).toBe('Business Plan Template');
            expect(result.category).toBe('template');
            expect(result.content.mainContent).toBeDefined();
            expect(result.pricing.suggested).toBeDefined();
        });
    });

    describe('processFiles', () => {
        it('should process uploaded files', async () => {
            const files = [
                {
                    name: 'document.txt',
                    type: 'text/plain',
                    content: 'This is a sample document with important content about business strategies.',
                    size: 1024
                }
            ];

            const result = await creationAgent.processFiles(files);

            expect(result.success).toBe(true);
            expect(result.processedFiles).toHaveLength(1);
            expect(result.processedFiles[0].originalName).toBe('document.txt');
            expect(result.summary.totalFiles).toBe(1);
        });
    });

    describe('generateTemplates', () => {
        it('should generate templates for a category', async () => {
            const params = {
                category: 'ebook',
                complexity: 'intermediate' as const,
                count: 3
            };

            const result = await creationAgent.generateTemplates(params);

            expect(result.templates).toHaveLength(3);
            expect(result.templates[0].category).toBe('ebook');
            expect(result.templates[0].structure.sections).toBeDefined();
            expect(result.recommendations.bestMatch).toBeDefined();
        });
    });

    describe('helper methods', () => {
        it('should generate product ID from title', () => {
            const title = 'My Awesome Product!';
            const id = (creationAgent as any).generateProductId(title);
            expect(id).toMatch(/^prod_my-awesome-product_\d+$/);
        });
    });
});