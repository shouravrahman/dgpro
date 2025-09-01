/**
 * Product Category System Types
 * Comprehensive type definitions for digital product categories
 */

export interface ProductCategory {
    id: string;
    name: string;
    description: string;
    icon: string;
    parentId?: string;
    level: number;
    isActive: boolean;
    sortOrder: number;
    metadata: CategoryMetadata;
    requirements: CategoryRequirements;
    templates: CategoryTemplate[];
    aiAgentConfig: AIAgentConfig;
}

export interface CategoryMetadata {
    tags: string[];
    targetAudience: string[];
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    estimatedCreationTime: string;
    averagePrice: {
        min: number;
        max: number;
        currency: string;
    };
    popularityScore: number;
    trendingScore: number;
}

export interface CategoryRequirements {
    requiredFields: FormField[];
    optionalFields: FormField[];
    fileTypes: FileTypeRequirement[];
    validationRules: ValidationRule[];
    minimumContent: ContentRequirement[];
}

export interface FormField {
    id: string;
    name: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'file' | 'url' | 'email' | 'date' | 'boolean';
    label: string;
    placeholder?: string;
    description?: string;
    validation: FieldValidation;
    options?: SelectOption[];
    conditional?: ConditionalLogic;
}

export interface FieldValidation {
    required: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    customValidator?: string;
}

export interface SelectOption {
    value: string;
    label: string;
    description?: string;
}

export interface ConditionalLogic {
    dependsOn: string;
    condition: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
}

export interface FileTypeRequirement {
    type: string;
    extensions: string[];
    maxSize: number;
    required: boolean;
    description: string;
}

export interface ValidationRule {
    field: string;
    rule: string;
    message: string;
    params?: Record<string, any>;
}

export interface ContentRequirement {
    type: 'text' | 'image' | 'video' | 'audio' | 'document';
    minCount: number;
    maxCount?: number;
    description: string;
}

export interface CategoryTemplate {
    id: string;
    name: string;
    description: string;
    preview: string;
    structure: TemplateStructure;
    defaultValues: Record<string, any>;
    isPopular: boolean;
}

export interface TemplateStructure {
    sections: TemplateSection[];
    layout: LayoutConfig;
    styling: StylingConfig;
}

export interface TemplateSection {
    id: string;
    name: string;
    type: 'header' | 'content' | 'media' | 'form' | 'footer' | 'custom';
    required: boolean;
    content: any;
    order: number;
}

export interface LayoutConfig {
    type: 'single-column' | 'two-column' | 'grid' | 'custom';
    responsive: boolean;
    breakpoints?: Record<string, any>;
}

export interface StylingConfig {
    theme: string;
    colors: Record<string, string>;
    fonts: Record<string, string>;
    spacing: Record<string, string>;
}

export interface AIAgentConfig {
    primaryAgent: 'creation' | 'analysis' | 'scraping' | 'prediction';
    supportingAgents: string[];
    prompts: AgentPrompts;
    parameters: AgentParameters;
    routing: RoutingConfig;
}

export interface AgentPrompts {
    creation: string;
    analysis: string;
    enhancement: string;
    validation: string;
}

export interface AgentParameters {
    creativity: number; // 0-1
    accuracy: number; // 0-1
    speed: number; // 0-1
    complexity: number; // 0-1
}

export interface RoutingConfig {
    conditions: RoutingCondition[];
    fallback: string;
}

export interface RoutingCondition {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
    agent: string;
}

// Main category types
export type CategoryType =
    | 'design-graphics'
    | 'software-tools'
    | 'educational-content'
    | 'business-templates'
    | 'media-content'
    | 'marketing-materials'
    | 'productivity-tools'
    | 'creative-assets';

// Subcategory types for each main category
export type DesignGraphicsSubcategory =
    | 'logos-branding'
    | 'web-templates'
    | 'print-designs'
    | 'social-media-graphics'
    | 'illustrations'
    | 'icons-graphics'
    | 'presentations'
    | 'ui-ux-kits';

export type SoftwareToolsSubcategory =
    | 'web-applications'
    | 'mobile-apps'
    | 'desktop-software'
    | 'browser-extensions'
    | 'plugins-addons'
    | 'scripts-automation'
    | 'apis-services'
    | 'development-tools';

export type EducationalContentSubcategory =
    | 'online-courses'
    | 'ebooks-guides'
    | 'tutorials-workshops'
    | 'certification-programs'
    | 'skill-assessments'
    | 'learning-materials'
    | 'educational-games'
    | 'reference-materials';

export type BusinessTemplatesSubcategory =
    | 'business-plans'
    | 'financial-models'
    | 'legal-documents'
    | 'hr-templates'
    | 'project-management'
    | 'sales-materials'
    | 'operational-templates'
    | 'compliance-documents';

export type MediaContentSubcategory =
    | 'stock-photos'
    | 'video-content'
    | 'audio-music'
    | 'animations'
    | 'podcasts'
    | 'sound-effects'
    | 'video-templates'
    | 'streaming-content';

export type MarketingMaterialsSubcategory =
    | 'email-templates'
    | 'landing-pages'
    | 'ad-creatives'
    | 'social-campaigns'
    | 'content-calendars'
    | 'marketing-funnels'
    | 'brand-guidelines'
    | 'promotional-materials';

export type ProductivityToolsSubcategory =
    | 'spreadsheet-templates'
    | 'document-templates'
    | 'workflow-automation'
    | 'time-management'
    | 'organization-tools'
    | 'planning-templates'
    | 'tracking-systems'
    | 'productivity-apps';

export type CreativeAssetsSubcategory =
    | 'fonts-typography'
    | 'textures-patterns'
    | 'brushes-tools'
    | 'color-palettes'
    | 'design-elements'
    | 'mockups-templates'
    | 'creative-resources'
    | 'artistic-content';