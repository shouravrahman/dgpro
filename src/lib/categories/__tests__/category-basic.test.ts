/**
 * Basic Category System Tests
 * Core functionality tests for the product category system
 */

import { describe, it, expect } from 'vitest';
import {
    getAllCategories,
    getCategoryById,
    getCategoryOptions,
    PRODUCT_CATEGORIES
} from '../definitions';
import { FormGenerator } from '../form-generator';
import { AIAgentRouter } from '../ai-agent-router';

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
});

describe('AI Agent Router', () => {
    it('should route requests to appropriate agents', async () => {
        AIAgentRouter.initialize();

        const request = {
            categoryId: 'design-graphics',
            operation: 'create' as const,
            data: { category: 'logos-branding' }
        };

        const agentId = await AIAgentRouter.routeRequest(request);
        expect(agentId).toBeTruthy();
        expect(typeof agentId).toBe('string');
    });

    it('should get available agents', () => {
        AIAgentRouter.initialize();
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
});