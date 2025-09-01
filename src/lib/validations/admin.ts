import { z } from 'zod';

// Admin User Schemas
export const AdminUserSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    role: z.enum(['super_admin', 'admin', 'moderator', 'support']),
    permissions: z.record(z.boolean()).default({}),
    is_active: z.boolean().default(true),
    last_login_at: z.string().optional(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const CreateAdminUserSchema = z.object({
    user_id: z.string().uuid(),
    role: z.enum(['super_admin', 'admin', 'moderator', 'support']),
    permissions: z.record(z.boolean()).optional(),
});

export const UpdateAdminUserSchema = z.object({
    role: z.enum(['super_admin', 'admin', 'moderator', 'support']).optional(),
    permissions: z.record(z.boolean()).optional(),
    is_active: z.boolean().optional(),
});

// System Settings Schemas
export const SystemSettingSchema = z.object({
    id: z.string().uuid(),
    key: z.string().min(1),
    value: z.any(),
    category: z.string().default('general'),
    description: z.string().optional(),
    updated_by: z.string().uuid().optional(),
    updated_at: z.string(),
});

export const CreateSystemSettingSchema = z.object({
    key: z.string().min(1).max(100),
    value: z.any(),
    category: z.string().min(1).max(50).default('general'),
    description: z.string().max(500).optional(),
});

export const UpdateSystemSettingSchema = z.object({
    value: z.any(),
    category: z.string().min(1).max(50).optional(),
    description: z.string().max(500).optional(),
});

// Content Report Schemas
export const ContentReportSchema = z.object({
    id: z.string().uuid(),
    reporter_id: z.string().uuid(),
    content_type: z.enum(['product', 'listing', 'user', 'review', 'forum_post']),
    content_id: z.string().min(1),
    reason: z.string().min(1),
    description: z.string().optional(),
    status: z.enum(['pending', 'investigating', 'resolved', 'dismissed']).default('pending'),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    reviewed_by: z.string().uuid().optional(),
    resolution_notes: z.string().optional(),
    created_at: z.string(),
    resolved_at: z.string().optional(),
});

export const CreateContentReportSchema = z.object({
    content_type: z.enum(['product', 'listing', 'user', 'review', 'forum_post']),
    content_id: z.string().min(1),
    reason: z.string().min(1).max(100),
    description: z.string().max(1000).optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
});

export const UpdateContentReportSchema = z.object({
    status: z.enum(['pending', 'investigating', 'resolved', 'dismissed']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    resolution_notes: z.string().max(1000).optional(),
});

// Audit Log Schemas
export const AuditLogSchema = z.object({
    id: z.string().uuid(),
    admin_id: z.string().uuid(),
    action: z.string().min(1),
    target_type: z.string().optional(),
    target_id: z.string().optional(),
    details: z.record(z.any()).default({}),
    ip_address: z.string().optional(),
    user_agent: z.string().optional(),
    created_at: z.string(),
});

export const CreateAuditLogSchema = z.object({
    action: z.string().min(1).max(100),
    target_type: z.string().max(50).optional(),
    target_id: z.string().max(100).optional(),
    details: z.record(z.any()).default({}),
});

// System Health Metrics Schemas
export const SystemHealthMetricSchema = z.object({
    id: z.string().uuid(),
    metric_name: z.string().min(1),
    metric_value: z.number(),
    metric_unit: z.string().optional(),
    status: z.enum(['normal', 'warning', 'critical']).default('normal'),
    details: z.record(z.any()).default({}),
    recorded_at: z.string(),
});

export const CreateSystemHealthMetricSchema = z.object({
    metric_name: z.string().min(1).max(100),
    metric_value: z.number(),
    metric_unit: z.string().max(20).optional(),
    status: z.enum(['normal', 'warning', 'critical']).default('normal'),
    details: z.record(z.any()).default({}),
});

// Bulk Operations Schemas
export const BulkOperationSchema = z.object({
    id: z.string().uuid(),
    admin_id: z.string().uuid(),
    operation_type: z.enum(['user_action', 'product_action', 'content_moderation']),
    target_ids: z.array(z.string()).min(1),
    action: z.string().min(1),
    parameters: z.record(z.any()).default({}),
    status: z.enum(['pending', 'processing', 'completed', 'failed']).default('pending'),
    progress: z.number().min(0).max(100).default(0),
    total_items: z.number().min(1),
    results: z.record(z.any()).default({}),
    error_message: z.string().optional(),
    created_at: z.string(),
    completed_at: z.string().optional(),
});

export const CreateBulkOperationSchema = z.object({
    operation_type: z.enum(['user_action', 'product_action', 'content_moderation']),
    target_ids: z.array(z.string().uuid()).min(1).max(1000),
    action: z.string().min(1).max(100),
    parameters: z.record(z.any()).default({}),
});

// Admin Notification Schemas
export const AdminNotificationSchema = z.object({
    id: z.string().uuid(),
    admin_id: z.string().uuid(),
    title: z.string().min(1),
    message: z.string().min(1),
    type: z.enum(['info', 'warning', 'error', 'success']).default('info'),
    is_read: z.boolean().default(false),
    action_url: z.string().optional(),
    created_at: z.string(),
});

export const CreateAdminNotificationSchema = z.object({
    admin_id: z.string().uuid(),
    title: z.string().min(1).max(200),
    message: z.string().min(1).max(1000),
    type: z.enum(['info', 'warning', 'error', 'success']).default('info'),
    action_url: z.string().url().optional(),
});

// Filter Schemas
export const UserManagementFiltersSchema = z.object({
    search: z.string().optional(),
    role: z.string().optional(),
    subscription_tier: z.string().optional(),
    status: z.enum(['active', 'inactive', 'suspended']).optional(),
    created_after: z.string().optional(),
    created_before: z.string().optional(),
    last_login_after: z.string().optional(),
    last_login_before: z.string().optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
});

export const ProductManagementFiltersSchema = z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived', 'under_review']).optional(),
    created_after: z.string().optional(),
    created_before: z.string().optional(),
    price_min: z.number().min(0).optional(),
    price_max: z.number().min(0).optional(),
    creator_id: z.string().uuid().optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
});

export const AuditLogFiltersSchema = z.object({
    admin_id: z.string().uuid().optional(),
    action: z.string().optional(),
    target_type: z.string().optional(),
    date_from: z.string().optional(),
    date_to: z.string().optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
});

// Admin Action Schemas
export const AdminActionSchema = z.object({
    type: z.enum(['user', 'product', 'system', 'content']),
    action: z.string().min(1),
    target_ids: z.array(z.string().uuid()).min(1),
    parameters: z.record(z.any()).optional(),
});

// Dashboard Widget Schemas
export const DashboardWidgetSchema = z.object({
    id: z.string(),
    title: z.string().min(1).max(100),
    type: z.enum(['metric', 'chart', 'table', 'list']),
    size: z.enum(['small', 'medium', 'large']),
    position: z.object({
        x: z.number().min(0),
        y: z.number().min(0),
    }),
    data: z.any(),
    config: z.record(z.any()).default({}),
});

export const UpdateDashboardLayoutSchema = z.object({
    widgets: z.array(DashboardWidgetSchema),
});

// Export types
export type AdminUserInput = z.infer<typeof CreateAdminUserSchema>;
export type AdminUserUpdate = z.infer<typeof UpdateAdminUserSchema>;
export type SystemSettingInput = z.infer<typeof CreateSystemSettingSchema>;
export type SystemSettingUpdate = z.infer<typeof UpdateSystemSettingSchema>;
export type ContentReportInput = z.infer<typeof CreateContentReportSchema>;
export type ContentReportUpdate = z.infer<typeof UpdateContentReportSchema>;
export type AuditLogInput = z.infer<typeof CreateAuditLogSchema>;
export type SystemHealthMetricInput = z.infer<typeof CreateSystemHealthMetricSchema>;
export type BulkOperationInput = z.infer<typeof CreateBulkOperationSchema>;
export type AdminNotificationInput = z.infer<typeof CreateAdminNotificationSchema>;
export type UserManagementFilters = z.infer<typeof UserManagementFiltersSchema>;
export type ProductManagementFilters = z.infer<typeof ProductManagementFiltersSchema>;
export type AuditLogFilters = z.infer<typeof AuditLogFiltersSchema>;
export type AdminActionInput = z.infer<typeof AdminActionSchema>;
export type DashboardWidgetInput = z.infer<typeof DashboardWidgetSchema>;
export type DashboardLayoutUpdate = z.infer<typeof UpdateDashboardLayoutSchema>;