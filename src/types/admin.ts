// Admin Panel Types

export interface AdminUser {
    id: string;
    user_id: string;
    role: 'super_admin' | 'admin' | 'moderator' | 'support';
    permissions: Record<string, boolean>;
    is_active: boolean;
    last_login_at?: string;
    created_at: string;
    updated_at: string;
    user?: {
        email: string;
        user_metadata?: {
            full_name?: string;
            avatar_url?: string;
        };
    };
}

export interface AuditLog {
    id: string;
    admin_id: string;
    action: string;
    target_type?: string;
    target_id?: string;
    details: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
    admin?: {
        user?: {
            email: string;
            user_metadata?: {
                full_name?: string;
            };
        };
    };
}

export interface SystemSetting {
    id: string;
    key: string;
    value: any;
    category: string;
    description?: string;
    updated_by?: string;
    updated_at: string;
}

export interface ContentReport {
    id: string;
    reporter_id: string;
    content_type: 'product' | 'listing' | 'user' | 'review' | 'forum_post';
    content_id: string;
    reason: string;
    description?: string;
    status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    reviewed_by?: string;
    resolution_notes?: string;
    created_at: string;
    resolved_at?: string;
    reporter?: {
        email: string;
        user_metadata?: {
            full_name?: string;
        };
    };
    reviewer?: {
        user?: {
            email: string;
            user_metadata?: {
                full_name?: string;
            };
        };
    };
}

export interface SystemHealthMetric {
    id: string;
    metric_name: string;
    metric_value: number;
    metric_unit?: string;
    status: 'normal' | 'warning' | 'critical';
    details: Record<string, any>;
    recorded_at: string;
}

export interface AdminNotification {
    id: string;
    admin_id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    is_read: boolean;
    action_url?: string;
    created_at: string;
}

export interface PlatformAnalytics {
    id: string;
    date: string;
    metric_type: 'users' | 'products' | 'sales' | 'revenue' | 'ai_usage';
    metric_data: Record<string, any>;
    created_at: string;
}

export interface BulkOperation {
    id: string;
    admin_id: string;
    operation_type: 'user_action' | 'product_action' | 'content_moderation';
    target_ids: string[];
    action: string;
    parameters: Record<string, any>;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    total_items: number;
    results: Record<string, any>;
    error_message?: string;
    created_at: string;
    completed_at?: string;
}

export interface PlatformStats {
    total_users: number;
    active_users: number;
    total_products: number;
    published_products: number;
    total_sales: number;
    total_revenue: number;
    pending_reports: number;
    system_health: SystemHealthMetric[];
}

export interface DashboardMetrics {
    users: {
        total: number;
        active: number;
        new_today: number;
        growth_rate: number;
    };
    products: {
        total: number;
        published: number;
        pending_review: number;
        growth_rate: number;
    };
    sales: {
        total: number;
        today: number;
        revenue: number;
        growth_rate: number;
    };
    ai_usage: {
        total_operations: number;
        today: number;
        success_rate: number;
        avg_response_time: number;
    };
    system: {
        uptime: number;
        cpu_usage: number;
        memory_usage: number;
        disk_usage: number;
    };
}

export interface UserManagementFilters {
    search?: string;
    role?: string;
    subscription_tier?: string;
    status?: 'active' | 'inactive' | 'suspended';
    created_after?: string;
    created_before?: string;
    last_login_after?: string;
    last_login_before?: string;
}

export interface ProductManagementFilters {
    search?: string;
    category?: string;
    status?: 'draft' | 'published' | 'archived' | 'under_review';
    created_after?: string;
    created_before?: string;
    price_min?: number;
    price_max?: number;
    creator_id?: string;
}

export interface AdminAction {
    type: 'user' | 'product' | 'system' | 'content';
    action: string;
    target_ids: string[];
    parameters?: Record<string, any>;
}

export interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string;
        borderColor?: string;
        fill?: boolean;
    }[];
}

export interface DashboardWidget {
    id: string;
    title: string;
    type: 'metric' | 'chart' | 'table' | 'list';
    size: 'small' | 'medium' | 'large';
    position: { x: number; y: number };
    data: any;
    config: Record<string, any>;
}

export interface AdminPermissions {
    users: {
        view: boolean;
        create: boolean;
        edit: boolean;
        delete: boolean;
        suspend: boolean;
    };
    products: {
        view: boolean;
        edit: boolean;
        delete: boolean;
        moderate: boolean;
        feature: boolean;
    };
    marketplace: {
        view: boolean;
        manage_listings: boolean;
        manage_categories: boolean;
        manage_promotions: boolean;
    };
    analytics: {
        view: boolean;
        export: boolean;
    };
    system: {
        view_settings: boolean;
        edit_settings: boolean;
        view_logs: boolean;
        manage_admins: boolean;
    };
    content: {
        moderate: boolean;
        handle_reports: boolean;
        manage_reviews: boolean;
    };
}

export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'support';

export interface AdminRoleConfig {
    name: string;
    description: string;
    permissions: AdminPermissions;
    color: string;
}