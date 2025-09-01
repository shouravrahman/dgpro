/**
 * Product Category System - Main Export
 * Comprehensive digital product category system with templates and AI routing
 */

import { getCategoryById } from './definitions';

import { getCategoryById } from './definitions';

import { getCategoryById } from './definitions';

import { getCategoryById } from './definitions';

import { getCategoryById } from './definitions';

import { getCategoryById } from './definitions';

import { getCategoryById } from './definitions';

// Types
export type {
    ProductCategory,
    CategoryType,
    CategoryMetadata,
    CategoryRequirements,
    FormField,
    FieldValidation,
    SelectOption,
    ConditionalLogic,
    FileTypeRequirement,
    ValidationRule,
    ContentRequirement,
    CategoryTemplate,
    TemplateStructure,
    TemplateSection,
    LayoutConfig,
    StylingConfig,
    AIAgentConfig,
    AgentPrompts,
    AgentParameters,
    RoutingConfig,
    RoutingCondition,
    DesignGraphicsSubcategory,
    SoftwareToolsSubcategory,
    EducationalContentSubcategory,
    BusinessTemplatesSubcategory,
    MediaContentSubcategory,
    MarketingMaterialsSubcategory,
    ProductivityToolsSubcategory,
    CreativeAssetsSubcategory
} from './types';

// Category Definitions
export {
    PRODUCT_CATEGORIES,
    getCategoryById,
    getCategoriesByType,
    getAllCategories,
    getCategoryOptions
} from './definitions';

// Form Generation
export {
    FormGenerator,
    formGenerator,
    type GeneratedForm,
    type FormFieldConfig,
    type FormSection,
    type ValidationConfig
} from './form-generator';

// AI Agent Routing
export {
    AIAgentRouter,
    aiAgentRouter,
    type AgentRequest,
    type AgentContext,
    type AgentResponse,
    type AgentMetadata,
    type AgentCapability,
    type AgentPerformance
} from './ai-agent-router';

// Category Service
export {
    CategoryService,
    categoryService,
    type CategoryStats,
    type CategoryUsage
} from './category.service';

// React Components (exported separately to avoid import issues in tests)
// export { CategorySelector } from '../components/categories/category-selector';
// export { DynamicForm } from '../components/categories/dynamic-form';
// export { TemplateSelector } from '../components/categories/template-selector';

// Utility Functions
export const categoryUtils = {
    /**
     * Get category hierarchy path
     */
    getCategoryPath: (categoryId: string): string[] => {
        const category = getCategoryById(categoryId);
        if (!category) return [];

        const path = [category.name];
        if (category.parentId) {
            const parent = getCategoryById(category.parentId);
            if (parent) {
                path.unshift(parent.name);
            }
        }
        return path;
    },

    /**
     * Check if category supports operation
     */
    supportsOperation: (categoryId: string, operation: string): boolean => {
        const category = getCategoryById(categoryId);
        if (!category) return false;

        const config = category.aiAgentConfig;
        return config.primaryAgent === operation ||
            config.supportingAgents.includes(`${operation}-agent`);
    },

    /**
     * Get category difficulty level
     */
    getDifficultyLevel: (categoryId: string): 'easy' | 'medium' | 'hard' => {
        const category = getCategoryById(categoryId);
        if (!category) return 'medium';

        const requiredFields = category.requirements.requiredFields.length;
        const fileTypes = category.requirements.fileTypes.length;
        const complexity = category.aiAgentConfig.parameters.complexity;

        const score = (requiredFields * 0.3) + (fileTypes * 0.3) + (complexity * 0.4);

        if (score < 0.4) return 'easy';
        if (score < 0.7) return 'medium';
        return 'hard';
    },

    /**
     * Get estimated completion time
     */
    getEstimatedTime: (categoryId: string, templateId?: string): string => {
        const category = getCategoryById(categoryId);
        if (!category) return 'Unknown';

        let baseTime = category.metadata.estimatedCreationTime;

        // Reduce time if using template
        if (templateId) {
            const template = category.templates.find(t => t.id === templateId);
            if (template) {
                // Templates typically reduce creation time by 30-50%
                const reduction = 0.4;
                const timeMatch = baseTime.match(/(\d+)-(\d+)\s*(\w+)/);
                if (timeMatch) {
                    const [, min, max, unit] = timeMatch;
                    const newMin = Math.ceil(parseInt(min) * (1 - reduction));
                    const newMax = Math.ceil(parseInt(max) * (1 - reduction));
                    baseTime = `${newMin}-${newMax} ${unit}`;
                }
            }
        }

        return baseTime;
    },

    /**
     * Get category tags for search/filtering
     */
    getCategoryTags: (categoryId: string): string[] => {
        const category = getCategoryById(categoryId);
        if (!category) return [];

        return [
            ...category.metadata.tags,
            category.name.toLowerCase(),
            category.metadata.skillLevel,
            ...category.metadata.targetAudience
        ];
    },

    /**
     * Calculate category match score for user preferences
     */
    calculateMatchScore: (
        categoryId: string,
        userPreferences: {
            skillLevel?: string;
            interests?: string[];
            budget?: { min: number; max: number };
            timeAvailable?: string;
        }
    ): number => {
        const category = getCategoryById(categoryId);
        if (!category) return 0;

        let score = 0;
        let factors = 0;

        // Skill level match
        if (userPreferences.skillLevel) {
            const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
            const userLevel = skillLevels.indexOf(userPreferences.skillLevel);
            const categoryLevel = skillLevels.indexOf(category.metadata.skillLevel);

            if (userLevel >= 0 && categoryLevel >= 0) {
                const diff = Math.abs(userLevel - categoryLevel);
                score += Math.max(0, 1 - (diff * 0.3));
                factors++;
            }
        }

        // Interest match
        if (userPreferences.interests?.length) {
            const categoryTags = categoryUtils.getCategoryTags(categoryId);
            const matches = userPreferences.interests.filter(interest =>
                categoryTags.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))
            );
            score += matches.length / userPreferences.interests.length;
            factors++;
        }

        // Budget match
        if (userPreferences.budget) {
            const { min: userMin, max: userMax } = userPreferences.budget;
            const { min: catMin, max: catMax } = category.metadata.averagePrice;

            const overlap = Math.max(0, Math.min(userMax, catMax) - Math.max(userMin, catMin));
            const userRange = userMax - userMin;
            const categoryRange = catMax - catMin;

            if (userRange > 0 && categoryRange > 0) {
                score += overlap / Math.max(userRange, categoryRange);
                factors++;
            }
        }

        return factors > 0 ? score / factors : 0;
    }
};

// Constants
export const CATEGORY_CONSTANTS = {
    MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB
    SUPPORTED_IMAGE_TYPES: ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'],
    SUPPORTED_DOCUMENT_TYPES: ['.pdf', '.docx', '.xlsx', '.pptx', '.txt', '.md'],
    SUPPORTED_ARCHIVE_TYPES: ['.zip', '.tar.gz', '.rar', '.7z'],
    SUPPORTED_MEDIA_TYPES: ['.mp4', '.mov', '.avi', '.mp3', '.wav', '.m4a'],

    SKILL_LEVELS: ['beginner', 'intermediate', 'advanced', 'expert'] as const,
    DIFFICULTY_LEVELS: ['easy', 'medium', 'hard'] as const,

    DEFAULT_FORM_SECTIONS: [
        'basic-info',
        'category-specific',
        'files-media',
        'additional-info'
    ] as const
} as const;