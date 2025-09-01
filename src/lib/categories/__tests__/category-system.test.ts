/**
 * Category System Tests
 * Comprehensive tests for the product category system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    getAllCategories,
    getCategoryById,
    getCategoryOptions,
    PRODUCT_CATEGORIES
} from '../definitions';
import { FormGenerator } from '../form-generator';
import { AIAgentRouter } from '../ai-agent-router';
import { categoryUtils } from '../index';

describe('Category Definitions', () => {
    it('should have all required categories', () => {
        const categories = getAllCategories();

        expect(categories).toHaveLength(8);
        expect(categories.map(c => c.id)).toEqual([
            'design-graphics',
            'software-tools',
            'educational-content',
            'business-templates',
            'media-content',
            'marketing-materials',
            'productivity-tools',
            'creative-assets'
        ]);
    });

    it('should return valid category by ID', () => {
        const category = getCategoryById('design-graphics');

        expect(category).toBeDefined();
        expect(category?.id).toBe('design-graphics');
        expect(category?.name).toBe('Design & Graphics');
        expect(category?.icon).toBe('🎨');
    });

    it('should return undefined for invalid category ID', () => {
        const category = getCategoryById('invalid-category');
        expect(category).toBeUndefined();
    });

    it('should generate category options for dropdowns', () => {
        const options = getCategoryOptions();

        expect(options).toHaveLength(8);
        expect(options[0]).toHaveProperty('value');
        expect(options[0]).toHaveProperty('label');
        expect(options[0]).toHaveProperty('description');
    });

    it('should have valid category structure', () => {
        const categories = getAllCategories();

        categories.forEach(category => {
            // Basic properties
            expect(category.id).toBeTruthy();
            expect(category.name).toBeTruthy();
            expect(category.description).toBeTruthy();
            expect(category.icon).toBeTruthy();

            // Metadata
            expect(category.metadata).toBeDefined();
            expect(category.metadata.tags).toBeInstanceOf(Array);
            expect(category.metadata.targetAudience).toBeInstanceOf(Array);
            expect(category.metadata.skillLevel).toMatch(/^(beginner|intermediate|advanced|expert)$/);
            expect(category.metadata.popularityScore).toBeGreaterThanOrEqual(0);
            expect(category.metadata.popularityScore).toBeLessThanOrEqual(1);

            // Requirements
            expect(category.requirements).toBeDefined();
            expect(category.requirements.requiredFields).toBeInstanceOf(Array);
            expect(category.requirements.optionalFields).toBeInstanceOf(Array);
            expect(category.requirements.fileTypes).toBeInstanceOf(Array);

            // AI Agent Config
            expect(category.aiAgentConfig).toBeDefined();
            expect(category.aiAgentConfig.primaryAgent).toBeTruthy();
            expect(category.aiAgentConfig.prompts).toBeDefined();
            expect(category.aiAgentConfig.parameters).toBeDefined();
        });
    });
});

describe('Form Generator', () => {
    it('should generate form for valid category', () => {
        const form = FormGenerator.generateForm('design-graphics');

        expect(form).toBeDefined();
        expect(form.schema).toBeDefined();
        expect(form.fields).toBeInstanceOf(Array);
        expect(form.sections).toBeInstanceOf(Array);
        expect(form.validation).toBeDefined();
    });

    it('should throw error for invalid category', () => {
        expect(() => {
            FormGenerator.generateForm('invalid-category');
        }).toThrow('Category not found: invalid-category');
    });

    it('should generate proper field configurations', () => {
        const form = FormGenerator.generateForm('design-graphics');

        form.fields.forEach(field => {
            expect(field.id).toBeTruthy();
            expect(field.name).toBeTruthy();
            expect(field.type).toBeTruthy();
            expect(field.label).toBeTruthy();
            expect(field.component).toBeTruthy();
            expect(field.validation).toBeDefined();
            expect(field.validationSchema).toBeDefined();
        });
    });

    it('should create proper form sections', () => {
        const form = FormGenerator.generateForm('design-graphics');

        expect(form.sections.length).toBeGreaterThan(0);

        form.sections.forEach(section => {
            expect(section.id).toBeTruthy();
            expect(section.title).toBeTruthy();
            expect(section.fields).toBeInstanceOf(Array);
            expect(typeof section.order).toBe('number');
            expect(typeof section.collapsible).toBe('boolean');
            expect(typeof section.required).toBe('boolean');
        });
    });

    it('should handle template modifications', () => {
        const category = getCategoryById('design-graphics');
        const template = category?.templates[0];

        if (template) {
            const form = FormGenerator.generateForm('design-graphics', template.id);
            expect(form).toBeDefined();

            // Should have template-specific modifications
            const modifications = FormGenerator.getTemplateModifications('design-graphics', template.id);
            expect(modifications).toBeDefined();
        }
    });

    it('should evaluate conditional logic correctly', () => {
        const conditional = {
            dependsOn: 'category',
            condition: 'equals' as const,
            value: 'logos-branding'
        };

        const formData = { category: 'logos-branding' };
        const result = FormGenerator.evaluateConditional(conditional, formData);
        expect(result).toBe(true);

        const formData2 = { category: 'web-templates' };
        const result2 = FormGenerator.evaluateConditional(conditional, formData2);
        expect(result2).toBe(false);
    });
});

describe('AI Agent Router', () => {
    beforeEach(() => {
        AIAgentRouter.initialize();
    });

    it('should route requests to appropriate agents', async () => {
        const request = {
            categoryId: 'design-graphics',
            operation: 'create' as const,
            data: { category: 'logos-branding' }
        };

        const agentId = await AIAgentRouter.routeRequest(request);
        expect(agentId).toBeTruthy();
        expect(typeof agentId).toBe('string');
    });

    it('should handle routing conditions', async () => {
        const request = {
            categoryId: 'design-graphics',
            operation: 'create' as const,
            data: { category: 'logos-branding' }
        };

        const agentId = await AIAgentRouter.routeRequest(request);
        // Should route to branding specialist based on category condition
        expect(agentId).toBe('branding-specialist');
    });

    it('should fall back to default agent', async () => {
        const request = {
            categoryId: 'design-graphics',
            operation: 'create' as const,
            data: { category: 'unknown-category' }
        };

        const agentId = await AIAgentRouter.routeRequest(request);
        expect(agentId).toBe('general-design-agent');
    });

    it('should get agent configuration', () => {
        const config = AIAgentRouter.getAgentConfig('design-graphics', 'design-specialist');

        expect(config).toBeDefined();
        expect(config?.prompts).toBeDefined();
        expect(config?.parameters).toBeDefined();
    });

    it('should get prompts for operations', () => {
        const prompt = AIAgentRouter.getPrompts('design-graphics', 'create');

        expect(prompt).toBeTruthy();
        expect(typeof prompt).toBe('string');
    });

    it('should get agent parameters', () => {
        const parameters = AIAgentRouter.getAgentParameters('design-graphics');

        expect(parameters).toBeDefined();
        expect(parameters?.creativity).toBeGreaterThanOrEqual(0);
        expect(parameters?.creativity).toBeLessThanOrEqual(1);
        expect(parameters?.accuracy).toBeGreaterThanOrEqual(0);
        expect(parameters?.accuracy).toBeLessThanOrEqual(1);
    });

    it('should get available agents', () => {
        const agents = AIAgentRouter.getAvailableAgents();

        expect(agents).toBeInstanceOf(Array);
        expect(agents.length).toBeGreaterThan(0);

        agents.forEach(agent => {
            expect(agent.id).toBeTruthy();
            expect(agent.name).toBeTruthy();
            expect(agent.supportedOperations).toBeInstanceOf(Array);
            expect(agent.specializations).toBeInstanceOf(Array);
            expect(agent.performance).toBeDefined();
        });
    });

    it('should get best agent for operation', () => {
        const agentId = AIAgentRouter.getBestAgentForOperation('create', 'design-graphics');

        expect(agentId).toBeTruthy();
        expect(typeof agentId).toBe('string');
    });
});

describe('Category Utils', () => {
    it('should get category path', () => {
        const path = categoryUtils.getCategoryPath('design-graphics');

        expect(path).toBeInstanceOf(Array);
        expect(path).toContain('Design & Graphics');
    });

    it('should check operation support', () => {
        const supports = categoryUtils.supportsOperation('design-graphics', 'create');
        expect(typeof supports).toBe('boolean');
    });

    it('should get difficulty level', () => {
        const difficulty = categoryUtils.getDifficultyLevel('design-graphics');

        expect(difficulty).toMatch(/^(easy|medium|hard)$/);
    });

    it('should get estimated time', () => {
        const time = categoryUtils.getEstimatedTime('design-graphics');

        expect(time).toBeTruthy();
        expect(typeof time).toBe('string');
    });

    it('should reduce time estimate with template', () => {
        const category = getCategoryById('design-graphics');
        const template = category?.templates[0];

        if (template) {
            const timeWithoutTemplate = categoryUtils.getEstimatedTime('design-graphics');
            const timeWithTemplate = categoryUtils.getEstimatedTime('design-graphics', template.id);

            expect(timeWithTemplate).toBeTruthy();
            // Template should reduce time (this is a simplified check)
            expect(timeWithTemplate).not.toBe(timeWithoutTemplate);
        }
    });

    it('should get category tags', () => {
        const tags = categoryUtils.getCategoryTags('design-graphics');

        expect(tags).toBeInstanceOf(Array);
        expect(tags.length).toBeGreaterThan(0);
        expect(tags).toContain('design');
    });

    it('should calculate match score', () => {
        const userPreferences = {
            skillLevel: 'intermediate',
            interests: ['design', 'graphics'],
            budget: { min: 20, max: 100 }
        };

        const score = categoryUtils.calculateMatchScore('design-graphics', userPreferences);

        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
    });

    it('should handle empty user preferences', () => {
        const score = categoryUtils.calculateMatchScore('design-graphics', {});

        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
    });
});

describe('Category Field Validation', () => {
    it('should validate required fields', () => {
        const categories = getAllCategories();

        categories.forEach(category => {
            category.requirements.requiredFields.forEach(field => {
                expect(field.validation.required).toBe(true);
                expect(field.label).toBeTruthy();
                expect(field.type).toBeTruthy();
            });
        });
    });

    it('should have valid field types', () => {
        const validTypes = [
            'text', 'textarea', 'number', 'select', 'multiselect',
            'file', 'url', 'email', 'date', 'boolean'
        ];

        const categories = getAllCategories();

        categories.forEach(category => {
            [...category.requirements.requiredFields, ...category.requirements.optionalFields]
                .forEach(field => {
                    expect(validTypes).toContain(field.type);
                });
        });
    });

    it('should have valid file type requirements', () => {
        const categories = getAllCategories();

        categories.forEach(category => {
            category.requirements.fileTypes.forEach(fileType => {
                expect(fileType.type).toBeTruthy();
                expect(fileType.extensions).toBeInstanceOf(Array);
                expect(fileType.extensions.length).toBeGreaterThan(0);
                expect(fileType.maxSize).toBeGreaterThan(0);
                expect(typeof fileType.required).toBe('boolean');
            });
        });
    });
});

describe('Template System', () => {
    it('should have valid template structure', () => {
        const categories = getAllCategories();

        categories.forEach(category => {
            category.templates.forEach(template => {
                expect(template.id).toBeTruthy();
                expect(template.name).toBeTruthy();
                expect(template.description).toBeTruthy();
                expect(template.structure).toBeDefined();
                expect(template.structure.sections).toBeInstanceOf(Array);
                expect(template.defaultValues).toBeDefined();
                expect(typeof template.isPopular).toBe('boolean');
            });
        });
    });

    it('should have valid template sections', () => {
        const categories = getAllCategories();

        categories.forEach(category => {
            category.templates.forEach(template => {
                template.structure.sections.forEach(section => {
                    expect(section.id).toBeTruthy();
                    expect(section.name).toBeTruthy();
                    expect(section.type).toBeTruthy();
                    expect(typeof section.required).toBe('boolean');
                    expect(typeof section.order).toBe('number');
                });
            });
        });
    });
});