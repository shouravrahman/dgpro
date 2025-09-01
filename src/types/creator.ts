export interface CreatorProfile {
    id: string;
    userId: string;
    displayName: string;
    bio?: string;
    avatar?: string;
    website?: string;
    socialLinks?: {
        twitter?: string;
        instagram?: string;
        linkedin?: string;
        github?: string;
    };
    specialties: string[];
    verified: boolean;
    rating: number;
    totalSales: number;
    totalRevenue: number;
    joinedAt: Date;
    lastActive: Date;
}

export interface Product {
    id: string;
    creatorId: string;
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    tags: string[];
    pricing: {
        type: 'free' | 'one-time' | 'subscription';
        amount?: number;
        currency: string;
        originalPrice?: number;
    };
    content: {
        files: ProductFile[];
        preview?: string;
        instructions?: string;
        changelog?: string;
    };
    metadata: {
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        estimatedTime?: string;
        requirements?: string[];
        compatibility?: string[];
        version: string;
    };
    status: 'draft' | 'review' | 'published' | 'archived';
    visibility: 'public' | 'private' | 'unlisted';
    stats: {
        views: number;
        downloads: number;
        sales: number;
        rating: number;
        reviewCount: number;
    };
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
}

export interface ProductFile {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    thumbnail?: string;
    description?: string;
    downloadCount: number;
}

export interface ProductTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    preview: string;
    thumbnail: string;
    fields: TemplateField[];
    popularity: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface TemplateField {
    id: string;
    name: string;
    type: 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'boolean' | 'file' | 'color' | 'date';
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        message?: string;
    };
}

export interface CreationProject {
    id: string;
    creatorId: string;
    name: string;
    type: 'custom' | 'template' | 'ai-generated' | 'recreated';
    templateId?: string;
    sourceUrl?: string;
    status: 'planning' | 'creating' | 'reviewing' | 'completed' | 'cancelled';
    progress: number;
    steps: CreationStep[];
    settings: {
        category: string;
        targetAudience: string;
        complexity: 'simple' | 'medium' | 'complex';
        style?: string;
        format?: string;
    };
    aiAssistance: {
        enabled: boolean;
        suggestions: AISuggestion[];
        autoGenerate: string[];
    };
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
}

export interface CreationStep {
    id: string;
    name: string;
    description: string;
    type: 'info' | 'content' | 'design' | 'files' | 'pricing' | 'review';
    status: 'pending' | 'in-progress' | 'completed' | 'skipped';
    data: Record<string, unknown>;
    aiGenerated?: boolean;
    completedAt?: Date;
}

export interface AISuggestion {
    id: string;
    type: 'content' | 'design' | 'pricing' | 'features' | 'marketing';
    title: string;
    description: string;
    confidence: number;
    applied: boolean;
    data: Record<string, unknown>;
}

export interface CreatorStats {
    totalProducts: number;
    publishedProducts: number;
    draftProducts: number;
    totalViews: number;
    totalDownloads: number;
    totalSales: number;
    totalRevenue: number;
    averageRating: number;
    followerCount: number;
    conversionRate: number;
    topCategories: Array<{
        category: string;
        count: number;
        revenue: number;
    }>;
    recentActivity: Array<{
        type: 'product_created' | 'sale' | 'review' | 'follow';
        timestamp: Date;
        data: Record<string, unknown>;
    }>;
}

export interface CreatorEarnings {
    totalEarnings: number;
    pendingPayouts: number;
    paidOut: number;
    currentMonthEarnings: number;
    lastMonthEarnings: number;
    earningsHistory: Array<{
        period: string;
        amount: number;
        sales: number;
    }>;
    topProducts: Array<{
        productId: string;
        title: string;
        earnings: number;
        sales: number;
    }>;
    nextPayoutDate?: Date;
    payoutMethod?: {
        type: 'paypal' | 'stripe' | 'bank';
        details: Record<string, unknown>;
    };
}

export interface MarketOpportunity {
    id: string;
    title: string;
    category: string;
    description: string;
    demand: number;
    competition: number;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedRevenue: {
        min: number;
        max: number;
        currency: string;
    };
    timeToMarket: string;
    requiredSkills: string[];
    marketSize: number;
    trendDirection: 'up' | 'down' | 'stable';
    confidence: number;
    sources: string[];
    lastUpdated: Date;
}

export interface CreatorInsight {
    id: string;
    type: 'opportunity' | 'optimization' | 'trend' | 'performance';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    actionable: boolean;
    estimatedImpact: 'low' | 'medium' | 'high';
    data: Record<string, unknown>;
    createdAt: Date;
    dismissed?: boolean;
}

export interface ProductReview {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

// Simplified Product interface for components
export interface SimpleProduct {
    id: string;
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    category: string;
    tags?: string[];
    status: 'draft' | 'published' | 'archived';
    createdAt: string;
    updatedAt: string;
    creatorId: string;
    creatorName?: string;
    creatorAvatar?: string;
    creatorBio?: string;
    creatorProducts?: number;
    files?: ProductFile[];
    thumbnail?: string;
    featured?: boolean;
    allowComments?: boolean;
    downloadLimit?: number;
    licenseType?: string;
    sales?: number;
    views?: number;
    rating?: number;
    reviewCount?: number;
    reviews?: ProductReview[];
}