/**
 * Product Category Definitions
 * Comprehensive digital product category structure with templates and requirements
 */

import { ProductCategory, CategoryType } from './types';

export const PRODUCT_CATEGORIES: Record<CategoryType, ProductCategory> = {
    'design-graphics': {
        id: 'design-graphics',
        name: 'Design & Graphics',
        description: 'Visual design assets, templates, and creative graphics for digital and print media',
        icon: '🎨',
        level: 0,
        isActive: true,
        sortOrder: 1,
        metadata: {
            tags: ['design', 'graphics', 'visual', 'creative', 'branding'],
            targetAudience: ['designers', 'marketers', 'entrepreneurs', 'content creators'],
            skillLevel: 'intermediate',
            estimatedCreationTime: '2-8 hours',
            averagePrice: { min: 5, max: 200, currency: 'USD' },
            popularityScore: 0.9,
            trendingScore: 0.85
        },
        requirements: {
            requiredFields: [
                {
                    id: 'title',
                    name: 'title',
                    type: 'text',
                    label: 'Design Title',
                    placeholder: 'Enter a compelling title for your design',
                    validation: { required: true, minLength: 5, maxLength: 100 }
                },
                {
                    id: 'description',
                    name: 'description',
                    type: 'textarea',
                    label: 'Design Description',
                    placeholder: 'Describe your design, its purpose, and key features',
                    validation: { required: true, minLength: 50, maxLength: 1000 }
                },
                {
                    id: 'category',
                    name: 'category',
                    type: 'select',
                    label: 'Design Category',
                    options: [
                        { value: 'logos-branding', label: 'Logos & Branding' },
                        { value: 'web-templates', label: 'Web Templates' },
                        { value: 'print-designs', label: 'Print Designs' },
                        { value: 'social-media-graphics', label: 'Social Media Graphics' },
                        { value: 'illustrations', label: 'Illustrations' },
                        { value: 'icons-graphics', label: 'Icons & Graphics' },
                        { value: 'presentations', label: 'Presentations' },
                        { value: 'ui-ux-kits', label: 'UI/UX Kits' }
                    ],
                    validation: { required: true }
                },
                {
                    id: 'design_files',
                    name: 'design_files',
                    type: 'file',
                    label: 'Design Files',
                    description: 'Upload your design files (AI, PSD, Sketch, Figma, etc.)',
                    validation: { required: true }
                }
            ],
            optionalFields: [
                {
                    id: 'color_palette',
                    name: 'color_palette',
                    type: 'text',
                    label: 'Color Palette',
                    placeholder: 'List main colors used (hex codes)',
                    validation: { required: false, maxLength: 200 }
                },
                {
                    id: 'fonts_used',
                    name: 'fonts_used',
                    type: 'text',
                    label: 'Fonts Used',
                    placeholder: 'List fonts used in the design',
                    validation: { required: false, maxLength: 200 }
                },
                {
                    id: 'design_software',
                    name: 'design_software',
                    type: 'multiselect',
                    label: 'Compatible Software',
                    options: [
                        { value: 'photoshop', label: 'Adobe Photoshop' },
                        { value: 'illustrator', label: 'Adobe Illustrator' },
                        { value: 'figma', label: 'Figma' },
                        { value: 'sketch', label: 'Sketch' },
                        { value: 'canva', label: 'Canva' },
                        { value: 'indesign', label: 'Adobe InDesign' }
                    ],
                    validation: { required: false }
                }
            ],
            fileTypes: [
                { type: 'design', extensions: ['.ai', '.psd', '.sketch', '.fig', '.svg', '.eps'], maxSize: 100, required: true, description: 'Source design files' },
                { type: 'preview', extensions: ['.jpg', '.png', '.gif'], maxSize: 10, required: true, description: 'Preview images' },
                { type: 'export', extensions: ['.pdf', '.png', '.jpg', '.svg'], maxSize: 50, required: false, description: 'Exported formats' }
            ],
            validationRules: [
                { field: 'design_files', rule: 'file_count_min', message: 'At least one design file is required', params: { min: 1 } },
                { field: 'title', rule: 'unique_check', message: 'Title must be unique', params: {} }
            ],
            minimumContent: [
                { type: 'image', minCount: 3, maxCount: 10, description: 'Preview images showing the design' },
                { type: 'document', minCount: 1, description: 'Source design file' }
            ]
        },
        templates: [
            {
                id: 'logo-brand-kit',
                name: 'Logo & Brand Kit',
                description: 'Complete branding package with logo variations, color palette, and brand guidelines',
                preview: '/templates/logo-brand-kit.jpg',
                structure: {
                    sections: [
                        { id: 'header', name: 'Brand Overview', type: 'header', required: true, content: {}, order: 1 },
                        { id: 'logo-variations', name: 'Logo Variations', type: 'media', required: true, content: {}, order: 2 },
                        { id: 'color-palette', name: 'Color Palette', type: 'content', required: true, content: {}, order: 3 },
                        { id: 'typography', name: 'Typography', type: 'content', required: true, content: {}, order: 4 },
                        { id: 'usage-guidelines', name: 'Usage Guidelines', type: 'content', required: true, content: {}, order: 5 }
                    ],
                    layout: { type: 'single-column', responsive: true },
                    styling: { theme: 'professional', colors: {}, fonts: {}, spacing: {} }
                },
                defaultValues: {
                    category: 'logos-branding',
                    design_software: ['illustrator', 'photoshop']
                },
                isPopular: true
            }
        ],
        aiAgentConfig: {
            primaryAgent: 'creation',
            supportingAgents: ['analysis'],
            prompts: {
                creation: 'Create a professional design based on the provided requirements, focusing on visual appeal, brand consistency, and target audience alignment.',
                analysis: 'Analyze the design for visual hierarchy, color theory, typography choices, and overall aesthetic appeal.',
                enhancement: 'Suggest improvements for better visual impact, accessibility, and market appeal.',
                validation: 'Validate design files for technical quality, format compatibility, and commercial viability.'
            },
            parameters: {
                creativity: 0.8,
                accuracy: 0.7,
                speed: 0.6,
                complexity: 0.7
            },
            routing: {
                conditions: [
                    { field: 'category', operator: 'equals', value: 'logos-branding', agent: 'branding-specialist' },
                    { field: 'category', operator: 'equals', value: 'ui-ux-kits', agent: 'ux-specialist' }
                ],
                fallback: 'general-design-agent'
            }
        }
    },

    'software-tools': {
        id: 'software-tools',
        name: 'Software & Tools',
        description: 'Applications, plugins, scripts, and digital tools for productivity and automation',
        icon: '⚙️',
        level: 0,
        isActive: true,
        sortOrder: 2,
        metadata: {
            tags: ['software', 'tools', 'applications', 'automation', 'productivity'],
            targetAudience: ['developers', 'businesses', 'professionals', 'entrepreneurs'],
            skillLevel: 'advanced',
            estimatedCreationTime: '1-4 weeks',
            averagePrice: { min: 20, max: 500, currency: 'USD' },
            popularityScore: 0.85,
            trendingScore: 0.9
        },
        requirements: {
            requiredFields: [
                {
                    id: 'software_name',
                    name: 'software_name',
                    type: 'text',
                    label: 'Software Name',
                    placeholder: 'Enter the name of your software/tool',
                    validation: { required: true, minLength: 3, maxLength: 50 }
                },
                {
                    id: 'description',
                    name: 'description',
                    type: 'textarea',
                    label: 'Software Description',
                    placeholder: 'Describe what your software does and its key features',
                    validation: { required: true, minLength: 100, maxLength: 2000 }
                },
                {
                    id: 'platform',
                    name: 'platform',
                    type: 'multiselect',
                    label: 'Supported Platforms',
                    options: [
                        { value: 'web', label: 'Web Browser' },
                        { value: 'windows', label: 'Windows' },
                        { value: 'macos', label: 'macOS' },
                        { value: 'linux', label: 'Linux' },
                        { value: 'ios', label: 'iOS' },
                        { value: 'android', label: 'Android' }
                    ],
                    validation: { required: true }
                },
                {
                    id: 'software_type',
                    name: 'software_type',
                    type: 'select',
                    label: 'Software Type',
                    options: [
                        { value: 'web-applications', label: 'Web Applications' },
                        { value: 'mobile-apps', label: 'Mobile Apps' },
                        { value: 'desktop-software', label: 'Desktop Software' },
                        { value: 'browser-extensions', label: 'Browser Extensions' },
                        { value: 'plugins-addons', label: 'Plugins & Add-ons' },
                        { value: 'scripts-automation', label: 'Scripts & Automation' },
                        { value: 'apis-services', label: 'APIs & Services' },
                        { value: 'development-tools', label: 'Development Tools' }
                    ],
                    validation: { required: true }
                }
            ],
            optionalFields: [
                {
                    id: 'tech_stack',
                    name: 'tech_stack',
                    type: 'multiselect',
                    label: 'Technology Stack',
                    options: [
                        { value: 'javascript', label: 'JavaScript' },
                        { value: 'python', label: 'Python' },
                        { value: 'react', label: 'React' },
                        { value: 'nodejs', label: 'Node.js' },
                        { value: 'php', label: 'PHP' },
                        { value: 'java', label: 'Java' },
                        { value: 'csharp', label: 'C#' },
                        { value: 'swift', label: 'Swift' },
                        { value: 'kotlin', label: 'Kotlin' }
                    ],
                    validation: { required: false }
                },
                {
                    id: 'api_documentation',
                    name: 'api_documentation',
                    type: 'url',
                    label: 'API Documentation URL',
                    placeholder: 'https://docs.example.com',
                    validation: { required: false }
                },
                {
                    id: 'demo_url',
                    name: 'demo_url',
                    type: 'url',
                    label: 'Live Demo URL',
                    placeholder: 'https://demo.example.com',
                    validation: { required: false }
                }
            ],
            fileTypes: [
                { type: 'source', extensions: ['.zip', '.tar.gz', '.rar'], maxSize: 500, required: true, description: 'Source code or executable files' },
                { type: 'documentation', extensions: ['.pdf', '.md', '.txt'], maxSize: 20, required: true, description: 'Documentation and setup guides' },
                { type: 'screenshots', extensions: ['.jpg', '.png', '.gif'], maxSize: 10, required: true, description: 'Software screenshots' }
            ],
            validationRules: [
                { field: 'software_name', rule: 'unique_check', message: 'Software name must be unique', params: {} },
                { field: 'demo_url', rule: 'url_accessible', message: 'Demo URL must be accessible', params: {} }
            ],
            minimumContent: [
                { type: 'document', minCount: 1, description: 'Installation/setup guide' },
                { type: 'image', minCount: 3, maxCount: 8, description: 'Software screenshots or interface previews' }
            ]
        },
        templates: [
            {
                id: 'saas-web-app',
                name: 'SaaS Web Application',
                description: 'Complete SaaS application template with user management, billing, and core features',
                preview: '/templates/saas-web-app.jpg',
                structure: {
                    sections: [
                        { id: 'overview', name: 'Application Overview', type: 'header', required: true, content: {}, order: 1 },
                        { id: 'features', name: 'Key Features', type: 'content', required: true, content: {}, order: 2 },
                        { id: 'screenshots', name: 'Screenshots', type: 'media', required: true, content: {}, order: 3 },
                        { id: 'tech-specs', name: 'Technical Specifications', type: 'content', required: true, content: {}, order: 4 },
                        { id: 'setup-guide', name: 'Setup Guide', type: 'content', required: true, content: {}, order: 5 }
                    ],
                    layout: { type: 'two-column', responsive: true },
                    styling: { theme: 'technical', colors: {}, fonts: {}, spacing: {} }
                },
                defaultValues: {
                    software_type: 'web-applications',
                    platform: ['web'],
                    tech_stack: ['javascript', 'react', 'nodejs']
                },
                isPopular: true
            }
        ],
        aiAgentConfig: {
            primaryAgent: 'creation',
            supportingAgents: ['analysis', 'prediction'],
            prompts: {
                creation: 'Develop software based on specifications, ensuring clean code, proper documentation, and user-friendly interfaces.',
                analysis: 'Analyze software architecture, code quality, security vulnerabilities, and performance optimization opportunities.',
                enhancement: 'Suggest feature improvements, performance optimizations, and user experience enhancements.',
                validation: 'Validate software functionality, security compliance, and market readiness.'
            },
            parameters: {
                creativity: 0.6,
                accuracy: 0.9,
                speed: 0.5,
                complexity: 0.9
            },
            routing: {
                conditions: [
                    { field: 'software_type', operator: 'equals', value: 'web-applications', agent: 'web-dev-specialist' },
                    { field: 'software_type', operator: 'equals', value: 'mobile-apps', agent: 'mobile-dev-specialist' },
                    { field: 'platform', operator: 'contains', value: 'api', agent: 'api-specialist' }
                ],
                fallback: 'general-software-agent'
            }
        }
    },

    'educational-content': {
        id: 'educational-content',
        name: 'Educational Content',
        description: 'Courses, tutorials, guides, and learning materials for skill development and knowledge sharing',
        icon: '📚',
        level: 0,
        isActive: true,
        sortOrder: 3,
        metadata: {
            tags: ['education', 'learning', 'courses', 'tutorials', 'knowledge'],
            targetAudience: ['educators', 'trainers', 'experts', 'content creators'],
            skillLevel: 'intermediate',
            estimatedCreationTime: '1-6 weeks',
            averagePrice: { min: 15, max: 300, currency: 'USD' },
            popularityScore: 0.8,
            trendingScore: 0.75
        },
        requirements: {
            requiredFields: [
                {
                    id: 'course_title',
                    name: 'course_title',
                    type: 'text',
                    label: 'Course/Content Title',
                    placeholder: 'Enter a compelling title for your educational content',
                    validation: { required: true, minLength: 10, maxLength: 100 }
                },
                {
                    id: 'description',
                    name: 'description',
                    type: 'textarea',
                    label: 'Course Description',
                    placeholder: 'Describe what students will learn and achieve',
                    validation: { required: true, minLength: 100, maxLength: 2000 }
                },
                {
                    id: 'content_type',
                    name: 'content_type',
                    type: 'select',
                    label: 'Content Type',
                    options: [
                        { value: 'online-courses', label: 'Online Courses' },
                        { value: 'ebooks-guides', label: 'eBooks & Guides' },
                        { value: 'tutorials-workshops', label: 'Tutorials & Workshops' },
                        { value: 'certification-programs', label: 'Certification Programs' },
                        { value: 'skill-assessments', label: 'Skill Assessments' },
                        { value: 'learning-materials', label: 'Learning Materials' },
                        { value: 'educational-games', label: 'Educational Games' },
                        { value: 'reference-materials', label: 'Reference Materials' }
                    ],
                    validation: { required: true }
                },
                {
                    id: 'skill_level',
                    name: 'skill_level',
                    type: 'select',
                    label: 'Target Skill Level',
                    options: [
                        { value: 'beginner', label: 'Beginner' },
                        { value: 'intermediate', label: 'Intermediate' },
                        { value: 'advanced', label: 'Advanced' },
                        { value: 'expert', label: 'Expert' }
                    ],
                    validation: { required: true }
                }
            ],
            optionalFields: [
                {
                    id: 'duration',
                    name: 'duration',
                    type: 'text',
                    label: 'Course Duration',
                    placeholder: 'e.g., 4 weeks, 20 hours, self-paced',
                    validation: { required: false, maxLength: 50 }
                },
                {
                    id: 'prerequisites',
                    name: 'prerequisites',
                    type: 'textarea',
                    label: 'Prerequisites',
                    placeholder: 'List any required knowledge or skills',
                    validation: { required: false, maxLength: 500 }
                },
                {
                    id: 'learning_outcomes',
                    name: 'learning_outcomes',
                    type: 'textarea',
                    label: 'Learning Outcomes',
                    placeholder: 'What will students be able to do after completing this?',
                    validation: { required: false, maxLength: 1000 }
                }
            ],
            fileTypes: [
                { type: 'content', extensions: ['.pdf', '.docx', '.pptx', '.mp4', '.mp3'], maxSize: 1000, required: true, description: 'Course content files' },
                { type: 'resources', extensions: ['.zip', '.pdf', '.xlsx'], maxSize: 100, required: false, description: 'Additional resources and materials' },
                { type: 'preview', extensions: ['.jpg', '.png', '.mp4'], maxSize: 50, required: true, description: 'Course preview materials' }
            ],
            validationRules: [
                { field: 'course_title', rule: 'unique_check', message: 'Course title must be unique', params: {} },
                { field: 'content_files', rule: 'file_count_min', message: 'At least 3 content files required', params: { min: 3 } }
            ],
            minimumContent: [
                { type: 'document', minCount: 1, description: 'Course outline or curriculum' },
                { type: 'video', minCount: 1, description: 'Introduction or preview video' }
            ]
        },
        templates: [
            {
                id: 'online-course',
                name: 'Complete Online Course',
                description: 'Structured online course with modules, lessons, and assessments',
                preview: '/templates/online-course.jpg',
                structure: {
                    sections: [
                        { id: 'course-intro', name: 'Course Introduction', type: 'header', required: true, content: {}, order: 1 },
                        { id: 'curriculum', name: 'Course Curriculum', type: 'content', required: true, content: {}, order: 2 },
                        { id: 'preview-lessons', name: 'Preview Lessons', type: 'media', required: true, content: {}, order: 3 },
                        { id: 'instructor-bio', name: 'Instructor Biography', type: 'content', required: true, content: {}, order: 4 },
                        { id: 'testimonials', name: 'Student Testimonials', type: 'content', required: false, content: {}, order: 5 }
                    ],
                    layout: { type: 'single-column', responsive: true },
                    styling: { theme: 'educational', colors: {}, fonts: {}, spacing: {} }
                },
                defaultValues: {
                    content_type: 'online-courses',
                    skill_level: 'intermediate'
                },
                isPopular: true
            }
        ],
        aiAgentConfig: {
            primaryAgent: 'creation',
            supportingAgents: ['analysis'],
            prompts: {
                creation: 'Create comprehensive educational content that is engaging, well-structured, and pedagogically sound.',
                analysis: 'Analyze content for educational effectiveness, engagement level, and learning outcome alignment.',
                enhancement: 'Suggest improvements for better learning experience, content organization, and student engagement.',
                validation: 'Validate educational content for accuracy, completeness, and instructional design best practices.'
            },
            parameters: {
                creativity: 0.7,
                accuracy: 0.9,
                speed: 0.6,
                complexity: 0.7
            },
            routing: {
                conditions: [
                    { field: 'content_type', operator: 'equals', value: 'online-courses', agent: 'course-creation-specialist' },
                    { field: 'content_type', operator: 'equals', value: 'ebooks-guides', agent: 'content-writing-specialist' }
                ],
                fallback: 'general-education-agent'
            }
        }
    },

    'business-templates': {
        id: 'business-templates',
        name: 'Business Templates',
        description: 'Professional templates and documents for business operations, planning, and management',
        icon: '💼',
        level: 0,
        isActive: true,
        sortOrder: 4,
        metadata: {
            tags: ['business', 'templates', 'professional', 'documents', 'planning'],
            targetAudience: ['entrepreneurs', 'business owners', 'consultants', 'professionals'],
            skillLevel: 'intermediate',
            estimatedCreationTime: '1-3 days',
            averagePrice: { min: 10, max: 150, currency: 'USD' },
            popularityScore: 0.75,
            trendingScore: 0.7
        },
        requirements: {
            requiredFields: [
                {
                    id: 'template_name',
                    name: 'template_name',
                    type: 'text',
                    label: 'Template Name',
                    placeholder: 'Enter the name of your business template',
                    validation: { required: true, minLength: 5, maxLength: 80 }
                },
                {
                    id: 'description',
                    name: 'description',
                    type: 'textarea',
                    label: 'Template Description',
                    placeholder: 'Describe the purpose and use cases of this template',
                    validation: { required: true, minLength: 50, maxLength: 1000 }
                },
                {
                    id: 'template_category',
                    name: 'template_category',
                    type: 'select',
                    label: 'Template Category',
                    options: [
                        { value: 'business-plans', label: 'Business Plans' },
                        { value: 'financial-models', label: 'Financial Models' },
                        { value: 'legal-documents', label: 'Legal Documents' },
                        { value: 'hr-templates', label: 'HR Templates' },
                        { value: 'project-management', label: 'Project Management' },
                        { value: 'sales-materials', label: 'Sales Materials' },
                        { value: 'operational-templates', label: 'Operational Templates' },
                        { value: 'compliance-documents', label: 'Compliance Documents' }
                    ],
                    validation: { required: true }
                },
                {
                    id: 'industry',
                    name: 'industry',
                    type: 'multiselect',
                    label: 'Target Industries',
                    options: [
                        { value: 'technology', label: 'Technology' },
                        { value: 'healthcare', label: 'Healthcare' },
                        { value: 'finance', label: 'Finance' },
                        { value: 'retail', label: 'Retail' },
                        { value: 'manufacturing', label: 'Manufacturing' },
                        { value: 'consulting', label: 'Consulting' },
                        { value: 'education', label: 'Education' },
                        { value: 'general', label: 'General/All Industries' }
                    ],
                    validation: { required: true }
                }
            ],
            optionalFields: [
                {
                    id: 'customization_level',
                    name: 'customization_level',
                    type: 'select',
                    label: 'Customization Level',
                    options: [
                        { value: 'basic', label: 'Basic - Fill in the blanks' },
                        { value: 'moderate', label: 'Moderate - Some customization needed' },
                        { value: 'advanced', label: 'Advanced - Extensive customization possible' }
                    ],
                    validation: { required: false }
                },
                {
                    id: 'software_compatibility',
                    name: 'software_compatibility',
                    type: 'multiselect',
                    label: 'Software Compatibility',
                    options: [
                        { value: 'word', label: 'Microsoft Word' },
                        { value: 'excel', label: 'Microsoft Excel' },
                        { value: 'powerpoint', label: 'Microsoft PowerPoint' },
                        { value: 'google-docs', label: 'Google Docs' },
                        { value: 'google-sheets', label: 'Google Sheets' },
                        { value: 'pdf', label: 'PDF Format' }
                    ],
                    validation: { required: false }
                }
            ],
            fileTypes: [
                { type: 'template', extensions: ['.docx', '.xlsx', '.pptx', '.pdf'], maxSize: 50, required: true, description: 'Template files' },
                { type: 'instructions', extensions: ['.pdf', '.docx', '.txt'], maxSize: 10, required: true, description: 'Usage instructions' },
                { type: 'examples', extensions: ['.pdf', '.docx', '.xlsx'], maxSize: 20, required: false, description: 'Completed examples' }
            ],
            validationRules: [
                { field: 'template_name', rule: 'unique_check', message: 'Template name must be unique', params: {} },
                { field: 'template_files', rule: 'file_count_min', message: 'At least one template file required', params: { min: 1 } }
            ],
            minimumContent: [
                { type: 'document', minCount: 1, description: 'Main template file' },
                { type: 'document', minCount: 1, description: 'Instructions or guide' }
            ]
        },
        templates: [
            {
                id: 'business-plan-template',
                name: 'Comprehensive Business Plan',
                description: 'Complete business plan template with financial projections and market analysis',
                preview: '/templates/business-plan.jpg',
                structure: {
                    sections: [
                        { id: 'executive-summary', name: 'Executive Summary', type: 'content', required: true, content: {}, order: 1 },
                        { id: 'market-analysis', name: 'Market Analysis', type: 'content', required: true, content: {}, order: 2 },
                        { id: 'financial-projections', name: 'Financial Projections', type: 'content', required: true, content: {}, order: 3 },
                        { id: 'appendices', name: 'Appendices', type: 'content', required: false, content: {}, order: 4 }
                    ],
                    layout: { type: 'single-column', responsive: true },
                    styling: { theme: 'professional', colors: {}, fonts: {}, spacing: {} }
                },
                defaultValues: {
                    template_category: 'business-plans',
                    customization_level: 'moderate',
                    software_compatibility: ['word', 'google-docs', 'pdf']
                },
                isPopular: true
            }
        ],
        aiAgentConfig: {
            primaryAgent: 'creation',
            supportingAgents: ['analysis'],
            prompts: {
                creation: 'Create professional business templates that are comprehensive, easy to use, and industry-appropriate.',
                analysis: 'Analyze templates for completeness, professional quality, and business relevance.',
                enhancement: 'Suggest improvements for better usability, professional appearance, and business value.',
                validation: 'Validate templates for accuracy, legal compliance, and business best practices.'
            },
            parameters: {
                creativity: 0.5,
                accuracy: 0.9,
                speed: 0.7,
                complexity: 0.6
            },
            routing: {
                conditions: [
                    { field: 'template_category', operator: 'equals', value: 'financial-models', agent: 'financial-specialist' },
                    { field: 'template_category', operator: 'equals', value: 'legal-documents', agent: 'legal-specialist' }
                ],
                fallback: 'general-business-agent'
            }
        }
    },

    'media-content': {
        id: 'media-content',
        name: 'Media Content',
        description: 'Digital media assets including photos, videos, audio, and multimedia content',
        icon: '🎬',
        level: 0,
        isActive: true,
        sortOrder: 5,
        metadata: {
            tags: ['media', 'content', 'video', 'audio', 'photography'],
            targetAudience: ['content creators', 'marketers', 'media producers', 'designers'],
            skillLevel: 'intermediate',
            estimatedCreationTime: '1-2 weeks',
            averagePrice: { min: 8, max: 250, currency: 'USD' },
            popularityScore: 0.8,
            trendingScore: 0.85
        },
        requirements: {
            requiredFields: [
                {
                    id: 'media_title',
                    name: 'media_title',
                    type: 'text',
                    label: 'Media Title',
                    placeholder: 'Enter a descriptive title for your media content',
                    validation: { required: true, minLength: 5, maxLength: 100 }
                },
                {
                    id: 'description',
                    name: 'description',
                    type: 'textarea',
                    label: 'Media Description',
                    placeholder: 'Describe the content, style, and intended use',
                    validation: { required: true, minLength: 50, maxLength: 1000 }
                },
                {
                    id: 'media_type',
                    name: 'media_type',
                    type: 'select',
                    label: 'Media Type',
                    options: [
                        { value: 'stock-photos', label: 'Stock Photos' },
                        { value: 'video-content', label: 'Video Content' },
                        { value: 'audio-music', label: 'Audio & Music' },
                        { value: 'animations', label: 'Animations' },
                        { value: 'podcasts', label: 'Podcasts' },
                        { value: 'sound-effects', label: 'Sound Effects' },
                        { value: 'video-templates', label: 'Video Templates' },
                        { value: 'streaming-content', label: 'Streaming Content' }
                    ],
                    validation: { required: true }
                }
            ],
            optionalFields: [
                {
                    id: 'resolution_quality',
                    name: 'resolution_quality',
                    type: 'select',
                    label: 'Resolution/Quality',
                    options: [
                        { value: 'hd', label: 'HD (1280x720)' },
                        { value: 'full-hd', label: 'Full HD (1920x1080)' },
                        { value: '4k', label: '4K (3840x2160)' },
                        { value: '8k', label: '8K (7680x4320)' },
                        { value: 'variable', label: 'Variable/Multiple' }
                    ],
                    validation: { required: false }
                },
                {
                    id: 'usage_rights',
                    name: 'usage_rights',
                    type: 'select',
                    label: 'Usage Rights',
                    options: [
                        { value: 'royalty-free', label: 'Royalty Free' },
                        { value: 'commercial', label: 'Commercial Use' },
                        { value: 'editorial', label: 'Editorial Use Only' },
                        { value: 'extended', label: 'Extended License' }
                    ],
                    validation: { required: false }
                }
            ],
            fileTypes: [
                { type: 'media', extensions: ['.jpg', '.png', '.mp4', '.mov', '.mp3', '.wav', '.gif'], maxSize: 2000, required: true, description: 'Main media files' },
                { type: 'preview', extensions: ['.jpg', '.png', '.mp4'], maxSize: 50, required: true, description: 'Preview/thumbnail files' },
                { type: 'metadata', extensions: ['.txt', '.json', '.xml'], maxSize: 5, required: false, description: 'Metadata and tags' }
            ],
            validationRules: [
                { field: 'media_files', rule: 'file_count_min', message: 'At least one media file required', params: { min: 1 } },
                { field: 'media_title', rule: 'unique_check', message: 'Media title must be unique', params: {} }
            ],
            minimumContent: [
                { type: 'image', minCount: 1, description: 'Main media content or preview' }
            ]
        },
        templates: [],
        aiAgentConfig: {
            primaryAgent: 'creation',
            supportingAgents: ['analysis'],
            prompts: {
                creation: 'Create high-quality media content that is visually appealing, technically sound, and commercially viable.',
                analysis: 'Analyze media for technical quality, aesthetic appeal, and market potential.',
                enhancement: 'Suggest improvements for better visual/audio quality, composition, and commercial appeal.',
                validation: 'Validate media files for technical specifications, quality standards, and usage rights.'
            },
            parameters: {
                creativity: 0.9,
                accuracy: 0.8,
                speed: 0.7,
                complexity: 0.6
            },
            routing: {
                conditions: [
                    { field: 'media_type', operator: 'equals', value: 'video-content', agent: 'video-specialist' },
                    { field: 'media_type', operator: 'equals', value: 'audio-music', agent: 'audio-specialist' }
                ],
                fallback: 'general-media-agent'
            }
        }
    },

    'marketing-materials': {
        id: 'marketing-materials',
        name: 'Marketing Materials',
        description: 'Marketing assets, campaigns, and promotional materials for business growth',
        icon: '📈',
        level: 0,
        isActive: true,
        sortOrder: 6,
        metadata: {
            tags: ['marketing', 'promotion', 'campaigns', 'advertising', 'growth'],
            targetAudience: ['marketers', 'business owners', 'agencies', 'entrepreneurs'],
            skillLevel: 'intermediate',
            estimatedCreationTime: '3-7 days',
            averagePrice: { min: 12, max: 180, currency: 'USD' },
            popularityScore: 0.85,
            trendingScore: 0.8
        },
        requirements: {
            requiredFields: [
                {
                    id: 'campaign_name',
                    name: 'campaign_name',
                    type: 'text',
                    label: 'Campaign/Material Name',
                    placeholder: 'Enter the name of your marketing material',
                    validation: { required: true, minLength: 5, maxLength: 80 }
                },
                {
                    id: 'description',
                    name: 'description',
                    type: 'textarea',
                    label: 'Marketing Description',
                    placeholder: 'Describe the marketing material and its objectives',
                    validation: { required: true, minLength: 50, maxLength: 1000 }
                },
                {
                    id: 'material_type',
                    name: 'material_type',
                    type: 'select',
                    label: 'Material Type',
                    options: [
                        { value: 'email-templates', label: 'Email Templates' },
                        { value: 'landing-pages', label: 'Landing Pages' },
                        { value: 'ad-creatives', label: 'Ad Creatives' },
                        { value: 'social-campaigns', label: 'Social Campaigns' },
                        { value: 'content-calendars', label: 'Content Calendars' },
                        { value: 'marketing-funnels', label: 'Marketing Funnels' },
                        { value: 'brand-guidelines', label: 'Brand Guidelines' },
                        { value: 'promotional-materials', label: 'Promotional Materials' }
                    ],
                    validation: { required: true }
                }
            ],
            optionalFields: [
                {
                    id: 'target_audience',
                    name: 'target_audience',
                    type: 'text',
                    label: 'Target Audience',
                    placeholder: 'Describe the target audience for this material',
                    validation: { required: false, maxLength: 200 }
                },
                {
                    id: 'marketing_channels',
                    name: 'marketing_channels',
                    type: 'multiselect',
                    label: 'Marketing Channels',
                    options: [
                        { value: 'email', label: 'Email Marketing' },
                        { value: 'social-media', label: 'Social Media' },
                        { value: 'paid-ads', label: 'Paid Advertising' },
                        { value: 'content-marketing', label: 'Content Marketing' },
                        { value: 'seo', label: 'SEO' },
                        { value: 'influencer', label: 'Influencer Marketing' }
                    ],
                    validation: { required: false }
                }
            ],
            fileTypes: [
                { type: 'materials', extensions: ['.html', '.psd', '.ai', '.pdf', '.docx'], maxSize: 100, required: true, description: 'Marketing material files' },
                { type: 'assets', extensions: ['.jpg', '.png', '.svg', '.gif'], maxSize: 50, required: false, description: 'Supporting assets and graphics' },
                { type: 'guidelines', extensions: ['.pdf', '.docx'], maxSize: 20, required: false, description: 'Usage guidelines and instructions' }
            ],
            validationRules: [
                { field: 'campaign_name', rule: 'unique_check', message: 'Campaign name must be unique', params: {} }
            ],
            minimumContent: [
                { type: 'document', minCount: 1, description: 'Main marketing material' }
            ]
        },
        templates: [],
        aiAgentConfig: {
            primaryAgent: 'creation',
            supportingAgents: ['analysis', 'prediction'],
            prompts: {
                creation: 'Create compelling marketing materials that drive engagement, conversions, and brand awareness.',
                analysis: 'Analyze marketing materials for effectiveness, target audience alignment, and conversion potential.',
                enhancement: 'Suggest improvements for better engagement, conversion rates, and marketing performance.',
                validation: 'Validate marketing materials for brand consistency, legal compliance, and marketing best practices.'
            },
            parameters: {
                creativity: 0.8,
                accuracy: 0.7,
                speed: 0.8,
                complexity: 0.6
            },
            routing: {
                conditions: [
                    { field: 'material_type', operator: 'equals', value: 'email-templates', agent: 'email-marketing-specialist' },
                    { field: 'material_type', operator: 'equals', value: 'landing-pages', agent: 'conversion-specialist' }
                ],
                fallback: 'general-marketing-agent'
            }
        }
    },

    'productivity-tools': {
        id: 'productivity-tools',
        name: 'Productivity Tools',
        description: 'Templates, systems, and tools for improving productivity and organization',
        icon: '⚡',
        level: 0,
        isActive: true,
        sortOrder: 7,
        metadata: {
            tags: ['productivity', 'organization', 'efficiency', 'templates', 'systems'],
            targetAudience: ['professionals', 'entrepreneurs', 'teams', 'individuals'],
            skillLevel: 'beginner',
            estimatedCreationTime: '1-3 days',
            averagePrice: { min: 5, max: 80, currency: 'USD' },
            popularityScore: 0.7,
            trendingScore: 0.75
        },
        requirements: {
            requiredFields: [
                {
                    id: 'tool_name',
                    name: 'tool_name',
                    type: 'text',
                    label: 'Tool Name',
                    placeholder: 'Enter the name of your productivity tool',
                    validation: { required: true, minLength: 3, maxLength: 60 }
                },
                {
                    id: 'description',
                    name: 'description',
                    type: 'textarea',
                    label: 'Tool Description',
                    placeholder: 'Describe how this tool improves productivity',
                    validation: { required: true, minLength: 50, maxLength: 800 }
                },
                {
                    id: 'tool_category',
                    name: 'tool_category',
                    type: 'select',
                    label: 'Tool Category',
                    options: [
                        { value: 'spreadsheet-templates', label: 'Spreadsheet Templates' },
                        { value: 'document-templates', label: 'Document Templates' },
                        { value: 'workflow-automation', label: 'Workflow Automation' },
                        { value: 'time-management', label: 'Time Management' },
                        { value: 'organization-tools', label: 'Organization Tools' },
                        { value: 'planning-templates', label: 'Planning Templates' },
                        { value: 'tracking-systems', label: 'Tracking Systems' },
                        { value: 'productivity-apps', label: 'Productivity Apps' }
                    ],
                    validation: { required: true }
                }
            ],
            optionalFields: [
                {
                    id: 'use_cases',
                    name: 'use_cases',
                    type: 'textarea',
                    label: 'Use Cases',
                    placeholder: 'List specific use cases and scenarios',
                    validation: { required: false, maxLength: 500 }
                },
                {
                    id: 'integration',
                    name: 'integration',
                    type: 'multiselect',
                    label: 'Integrations',
                    options: [
                        { value: 'google-workspace', label: 'Google Workspace' },
                        { value: 'microsoft-365', label: 'Microsoft 365' },
                        { value: 'notion', label: 'Notion' },
                        { value: 'airtable', label: 'Airtable' },
                        { value: 'trello', label: 'Trello' },
                        { value: 'asana', label: 'Asana' }
                    ],
                    validation: { required: false }
                }
            ],
            fileTypes: [
                { type: 'templates', extensions: ['.xlsx', '.docx', '.pdf', '.csv'], maxSize: 25, required: true, description: 'Template files' },
                { type: 'instructions', extensions: ['.pdf', '.docx', '.txt'], maxSize: 10, required: true, description: 'Setup and usage instructions' },
                { type: 'examples', extensions: ['.xlsx', '.pdf'], maxSize: 15, required: false, description: 'Example implementations' }
            ],
            validationRules: [
                { field: 'tool_name', rule: 'unique_check', message: 'Tool name must be unique', params: {} }
            ],
            minimumContent: [
                { type: 'document', minCount: 1, description: 'Main template or tool file' }
            ]
        },
        templates: [],
        aiAgentConfig: {
            primaryAgent: 'creation',
            supportingAgents: ['analysis'],
            prompts: {
                creation: 'Create practical productivity tools that are easy to use, effective, and adaptable to different workflows.',
                analysis: 'Analyze productivity tools for usability, effectiveness, and practical value.',
                enhancement: 'Suggest improvements for better user experience, functionality, and productivity impact.',
                validation: 'Validate tools for practical utility, ease of use, and productivity enhancement potential.'
            },
            parameters: {
                creativity: 0.6,
                accuracy: 0.8,
                speed: 0.8,
                complexity: 0.5
            },
            routing: {
                conditions: [
                    { field: 'tool_category', operator: 'equals', value: 'spreadsheet-templates', agent: 'spreadsheet-specialist' },
                    { field: 'tool_category', operator: 'equals', value: 'workflow-automation', agent: 'automation-specialist' }
                ],
                fallback: 'general-productivity-agent'
            }
        }
    },

    'creative-assets': {
        id: 'creative-assets',
        name: 'Creative Assets',
        description: 'Digital creative resources, tools, and assets for designers and creators',
        icon: '🎭',
        level: 0,
        isActive: true,
        sortOrder: 8,
        metadata: {
            tags: ['creative', 'assets', 'resources', 'design', 'artistic'],
            targetAudience: ['designers', 'artists', 'creators', 'agencies'],
            skillLevel: 'intermediate',
            estimatedCreationTime: '2-5 days',
            averagePrice: { min: 8, max: 120, currency: 'USD' },
            popularityScore: 0.75,
            trendingScore: 0.8
        },
        requirements: {
            requiredFields: [
                {
                    id: 'asset_name',
                    name: 'asset_name',
                    type: 'text',
                    label: 'Asset Name',
                    placeholder: 'Enter the name of your creative asset',
                    validation: { required: true, minLength: 3, maxLength: 70 }
                },
                {
                    id: 'description',
                    name: 'description',
                    type: 'textarea',
                    label: 'Asset Description',
                    placeholder: 'Describe the creative asset and its applications',
                    validation: { required: true, minLength: 50, maxLength: 800 }
                },
                {
                    id: 'asset_type',
                    name: 'asset_type',
                    type: 'select',
                    label: 'Asset Type',
                    options: [
                        { value: 'fonts-typography', label: 'Fonts & Typography' },
                        { value: 'textures-patterns', label: 'Textures & Patterns' },
                        { value: 'brushes-tools', label: 'Brushes & Tools' },
                        { value: 'color-palettes', label: 'Color Palettes' },
                        { value: 'design-elements', label: 'Design Elements' },
                        { value: 'mockups-templates', label: 'Mockups & Templates' },
                        { value: 'creative-resources', label: 'Creative Resources' },
                        { value: 'artistic-content', label: 'Artistic Content' }
                    ],
                    validation: { required: true }
                }
            ],
            optionalFields: [
                {
                    id: 'style',
                    name: 'style',
                    type: 'multiselect',
                    label: 'Style/Theme',
                    options: [
                        { value: 'modern', label: 'Modern' },
                        { value: 'vintage', label: 'Vintage' },
                        { value: 'minimalist', label: 'Minimalist' },
                        { value: 'artistic', label: 'Artistic' },
                        { value: 'professional', label: 'Professional' },
                        { value: 'playful', label: 'Playful' },
                        { value: 'elegant', label: 'Elegant' },
                        { value: 'bold', label: 'Bold' }
                    ],
                    validation: { required: false }
                },
                {
                    id: 'compatible_software',
                    name: 'compatible_software',
                    type: 'multiselect',
                    label: 'Compatible Software',
                    options: [
                        { value: 'photoshop', label: 'Adobe Photoshop' },
                        { value: 'illustrator', label: 'Adobe Illustrator' },
                        { value: 'indesign', label: 'Adobe InDesign' },
                        { value: 'figma', label: 'Figma' },
                        { value: 'sketch', label: 'Sketch' },
                        { value: 'canva', label: 'Canva' }
                    ],
                    validation: { required: false }
                }
            ],
            fileTypes: [
                { type: 'assets', extensions: ['.ai', '.psd', '.svg', '.eps', '.png', '.jpg'], maxSize: 200, required: true, description: 'Creative asset files' },
                { type: 'preview', extensions: ['.jpg', '.png', '.gif'], maxSize: 20, required: true, description: 'Preview images' },
                { type: 'license', extensions: ['.pdf', '.txt'], maxSize: 5, required: false, description: 'License and usage information' }
            ],
            validationRules: [
                { field: 'asset_name', rule: 'unique_check', message: 'Asset name must be unique', params: {} }
            ],
            minimumContent: [
                { type: 'image', minCount: 2, description: 'Asset previews and examples' }
            ]
        },
        templates: [],
        aiAgentConfig: {
            primaryAgent: 'creation',
            supportingAgents: ['analysis'],
            prompts: {
                creation: 'Create high-quality creative assets that are versatile, professionally crafted, and commercially valuable.',
                analysis: 'Analyze creative assets for artistic quality, commercial viability, and market appeal.',
                enhancement: 'Suggest improvements for better artistic quality, versatility, and market positioning.',
                validation: 'Validate creative assets for technical quality, originality, and commercial potential.'
            },
            parameters: {
                creativity: 0.9,
                accuracy: 0.7,
                speed: 0.6,
                complexity: 0.7
            },
            routing: {
                conditions: [
                    { field: 'asset_type', operator: 'equals', value: 'fonts-typography', agent: 'typography-specialist' },
                    { field: 'asset_type', operator: 'equals', value: 'mockups-templates', agent: 'mockup-specialist' }
                ],
                fallback: 'general-creative-agent'
            }
        }
    }
};

// Helper function to get category by ID
export function getCategoryById(id: string): ProductCategory | undefined {
    return Object.values(PRODUCT_CATEGORIES).find(category => category.id === id);
}

// Helper function to get categories by type
export function getCategoriesByType(type: CategoryType): ProductCategory {
    return PRODUCT_CATEGORIES[type];
}

// Helper function to get all categories
export function getAllCategories(): ProductCategory[] {
    return Object.values(PRODUCT_CATEGORIES);
}

// Helper function to get categories for dropdown
export function getCategoryOptions(): SelectOption[] {
    return getAllCategories().map(category => ({
        value: category.id,
        label: category.name,
        description: category.description
    }));
}