import { createClient } from '@/lib/supabase/client';
import type {
    AdminUser,
    AuditLog,
    SystemSetting,
    ContentReport,
    SystemHealthMetric,
    AdminNotification,
    PlatformAnalytics,
    BulkOperation,
    PlatformStats,
    DashboardMetrics,
    UserManagementFilters,
    ProductManagementFilters,
    AuditLogFilters,
    AdminActionInput,
} from '@/types/admin';

export class AdminService {
    private supabase = createClient();

    // Platform Statistics
    async getPlatformStats(): Promise<PlatformStats> {
        const { data, error } = await this.supabase.rpc('get_platform_stats');

        if (error) {
            throw new Error(`Failed to fetch platform stats: ${error.message}`);
        }

        return data;
    }

    async getDashboardMetrics(): Promise<DashboardMetrics> {
        const [
            usersData,
            productsData,
            salesData,
            aiUsageData,
            systemData
        ] = await Promise.all([
            this.getUserMetrics(),
            this.getProductMetrics(),
            this.getSalesMetrics(),
            this.getAIUsageMetrics(),
            this.getSystemMetrics(),
        ]);

        return {
            users: usersData,
            products: productsData,
            sales: salesData,
            ai_usage: aiUsageData,
            system: systemData,
        };
    }

    private async getUserMetrics() {
        const { data: totalUsers } = await this.supabase
            .from('users')
            .select('id', { count: 'exact', head: true });

        const { data: activeUsers } = await this.supabase
            .from('users')
            .select('id', { count: 'exact', head: true })
            .gte('last_sign_in_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        const { data: newToday } = await this.supabase
            .from('users')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', new Date().toISOString().split('T')[0]);

        return {
            total: totalUsers?.length || 0,
            active: activeUsers?.length || 0,
            new_today: newToday?.length || 0,
            growth_rate: 5.2, // Calculate based on historical data
        };
    }

    private async getProductMetrics() {
        const { data: totalProducts } = await this.supabase
            .from('products')
            .select('id', { count: 'exact', head: true });

        const { data: publishedProducts } = await this.supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'published');

        const { data: pendingReview } = await this.supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'under_review');

        return {
            total: totalProducts?.length || 0,
            published: publishedProducts?.length || 0,
            pending_review: pendingReview?.length || 0,
            growth_rate: 8.7,
        };
    }

    private async getSalesMetrics() {
        const { data: totalSales } = await this.supabase
            .from('sales_transactions')
            .select('id', { count: 'exact', head: true })
            .eq('payment_status', 'completed');

        const { data: todaySales } = await this.supabase
            .from('sales_transactions')
            .select('id', { count: 'exact', head: true })
            .eq('payment_status', 'completed')
            .gte('created_at', new Date().toISOString().split('T')[0]);

        const { data: revenueData } = await this.supabase
            .from('sales_transactions')
            .select('amount')
            .eq('payment_status', 'completed');

        const totalRevenue = revenueData?.reduce((sum, sale) => sum + (sale.amount || 0), 0) || 0;

        return {
            total: totalSales?.length || 0,
            today: todaySales?.length || 0,
            revenue: totalRevenue,
            growth_rate: 12.3,
        };
    }

    private async getAIUsageMetrics() {
        // This would be implemented based on AI usage tracking
        return {
            total_operations: 15420,
            today: 342,
            success_rate: 98.5,
            avg_response_time: 1.2,
        };
    }

    private async getSystemMetrics() {
        const { data: healthMetrics } = await this.supabase
            .from('system_health_metrics')
            .select('*')
            .order('recorded_at', { ascending: false })
            .limit(1);

        const latestMetrics = healthMetrics?.[0];

        return {
            uptime: 99.9,
            cpu_usage: latestMetrics?.metric_name === 'cpu_usage' ? latestMetrics.metric_value : 45.2,
            memory_usage: 67.8,
            disk_usage: 23.1,
        };
    }

    // Admin Users Management
    async getAdminUsers(): Promise<AdminUser[]> {
        const { data, error } = await this.supabase
            .from('admin_users')
            .select(`
        *,
        user:users(email, user_metadata)
      `)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch admin users: ${error.message}`);
        }

        return data || [];
    }

    async createAdminUser(adminData: {
        user_id: string;
        role: string;
        permissions?: Record<string, boolean>;
    }): Promise<AdminUser> {
        const { data, error } = await this.supabase
            .from('admin_users')
            .insert(adminData)
            .select(`
        *,
        user:users(email, user_metadata)
      `)
            .single();

        if (error) {
            throw new Error(`Failed to create admin user: ${error.message}`);
        }

        return data;
    }

    async updateAdminUser(id: string, updates: Partial<AdminUser>): Promise<AdminUser> {
        const { data, error } = await this.supabase
            .from('admin_users')
            .update(updates)
            .eq('id', id)
            .select(`
        *,
        user:users(email, user_metadata)
      `)
            .single();

        if (error) {
            throw new Error(`Failed to update admin user: ${error.message}`);
        }

        return data;
    }

    async deleteAdminUser(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('admin_users')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to delete admin user: ${error.message}`);
        }
    }

    // User Management
    async getUsers(filters: UserManagementFilters = {}) {
        let query = this.supabase
            .from('users')
            .select(`
        *,
        subscription_tier,
        last_sign_in_at
      `);

        if (filters.search) {
            query = query.or(`email.ilike.%${filters.search}%,user_metadata->>full_name.ilike.%${filters.search}%`);
        }

        if (filters.subscription_tier) {
            query = query.eq('subscription_tier', filters.subscription_tier);
        }

        if (filters.created_after) {
            query = query.gte('created_at', filters.created_after);
        }

        if (filters.created_before) {
            query = query.lte('created_at', filters.created_before);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range((filters.page - 1) * filters.limit, filters.page * filters.limit - 1);

        if (error) {
            throw new Error(`Failed to fetch users: ${error.message}`);
        }

        return { data: data || [], count: count || 0 };
    }

    async getUserById(id: string) {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw new Error(`Failed to fetch user: ${error.message}`);
        }

        return data;
    }

    async updateUser(id: string, updates: any) {
        const { data, error } = await this.supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update user: ${error.message}`);
        }

        return data;
    }

    async suspendUser(id: string, reason: string) {
        const { error } = await this.supabase
            .from('users')
            .update({
                is_suspended: true,
                suspension_reason: reason,
                suspended_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to suspend user: ${error.message}`);
        }
    }

    // Product Management
    async getProducts(filters: ProductManagementFilters = {}) {
        let query = this.supabase
            .from('products')
            .select(`
        *,
        creator:users(email, user_metadata)
      `);

        if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        if (filters.category) {
            query = query.eq('category', filters.category);
        }

        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        if (filters.creator_id) {
            query = query.eq('user_id', filters.creator_id);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range((filters.page - 1) * filters.limit, filters.page * filters.limit - 1);

        if (error) {
            throw new Error(`Failed to fetch products: ${error.message}`);
        }

        return { data: data || [], count: count || 0 };
    }

    async updateProduct(id: string, updates: any) {
        const { data, error } = await this.supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update product: ${error.message}`);
        }

        return data;
    }

    async deleteProduct(id: string) {
        const { error } = await this.supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to delete product: ${error.message}`);
        }
    }

    // Content Reports
    async getContentReports(filters: { status?: string; priority?: string } = {}) {
        let query = this.supabase
            .from('content_reports')
            .select(`
        *,
        reporter:users!reporter_id(email, user_metadata),
        reviewer:admin_users!reviewed_by(user:users(email, user_metadata))
      `);

        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        if (filters.priority) {
            query = query.eq('priority', filters.priority);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch content reports: ${error.message}`);
        }

        return data || [];
    }

    async updateContentReport(id: string, updates: Partial<ContentReport>) {
        const { data, error } = await this.supabase
            .from('content_reports')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update content report: ${error.message}`);
        }

        return data;
    }

    // Audit Logs
    async getAuditLogs(filters: AuditLogFilters = {}) {
        let query = this.supabase
            .from('audit_logs')
            .select(`
        *,
        admin:admin_users(user:users(email, user_metadata))
      `);

        if (filters.admin_id) {
            query = query.eq('admin_id', filters.admin_id);
        }

        if (filters.action) {
            query = query.ilike('action', `%${filters.action}%`);
        }

        if (filters.target_type) {
            query = query.eq('target_type', filters.target_type);
        }

        if (filters.date_from) {
            query = query.gte('created_at', filters.date_from);
        }

        if (filters.date_to) {
            query = query.lte('created_at', filters.date_to);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range((filters.page - 1) * filters.limit, filters.page * filters.limit - 1);

        if (error) {
            throw new Error(`Failed to fetch audit logs: ${error.message}`);
        }

        return { data: data || [], count: count || 0 };
    }

    async createAuditLog(logData: {
        action: string;
        target_type?: string;
        target_id?: string;
        details?: Record<string, any>;
    }) {
        const { data: adminUser } = await this.supabase
            .from('admin_users')
            .select('id')
            .eq('user_id', (await this.supabase.auth.getUser()).data.user?.id)
            .single();

        if (!adminUser) {
            throw new Error('Admin user not found');
        }

        const { data, error } = await this.supabase.rpc('log_admin_action', {
            p_admin_id: adminUser.id,
            p_action: logData.action,
            p_target_type: logData.target_type,
            p_target_id: logData.target_id,
            p_details: logData.details || {},
        });

        if (error) {
            throw new Error(`Failed to create audit log: ${error.message}`);
        }

        return data;
    }

    // System Settings
    async getSystemSettings(): Promise<SystemSetting[]> {
        const { data, error } = await this.supabase
            .from('system_settings')
            .select('*')
            .order('category', { ascending: true });

        if (error) {
            throw new Error(`Failed to fetch system settings: ${error.message}`);
        }

        return data || [];
    }

    async updateSystemSetting(id: string, updates: Partial<SystemSetting>) {
        const { data, error } = await this.supabase
            .from('system_settings')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update system setting: ${error.message}`);
        }

        return data;
    }

    // System Health
    async getSystemHealth(): Promise<SystemHealthMetric[]> {
        const { data, error } = await this.supabase
            .from('system_health_metrics')
            .select('*')
            .order('recorded_at', { ascending: false })
            .limit(50);

        if (error) {
            throw new Error(`Failed to fetch system health: ${error.message}`);
        }

        return data || [];
    }

    async updateSystemHealth(metricData: {
        metric_name: string;
        metric_value: number;
        metric_unit?: string;
        status?: string;
        details?: Record<string, any>;
    }) {
        const { data, error } = await this.supabase.rpc('update_system_health', {
            p_metric_name: metricData.metric_name,
            p_metric_value: metricData.metric_value,
            p_metric_unit: metricData.metric_unit,
            p_status: metricData.status || 'normal',
            p_details: metricData.details || {},
        });

        if (error) {
            throw new Error(`Failed to update system health: ${error.message}`);
        }

        return data;
    }

    // Bulk Operations
    async createBulkOperation(operationData: {
        operation_type: string;
        target_ids: string[];
        action: string;
        parameters?: Record<string, any>;
    }): Promise<BulkOperation> {
        const { data: adminUser } = await this.supabase
            .from('admin_users')
            .select('id')
            .eq('user_id', (await this.supabase.auth.getUser()).data.user?.id)
            .single();

        if (!adminUser) {
            throw new Error('Admin user not found');
        }

        const { data, error } = await this.supabase
            .from('bulk_operations')
            .insert({
                admin_id: adminUser.id,
                ...operationData,
                total_items: operationData.target_ids.length,
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create bulk operation: ${error.message}`);
        }

        return data;
    }

    async getBulkOperations(): Promise<BulkOperation[]> {
        const { data, error } = await this.supabase
            .from('bulk_operations')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch bulk operations: ${error.message}`);
        }

        return data || [];
    }

    async updateBulkOperation(id: string, updates: Partial<BulkOperation>) {
        const { data, error } = await this.supabase
            .from('bulk_operations')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update bulk operation: ${error.message}`);
        }

        return data;
    }

    // Admin Actions
    async executeAdminAction(action: AdminActionInput) {
        // Log the action
        await this.createAuditLog({
            action: `${action.type}_${action.action}`,
            target_type: action.type,
            target_id: action.target_ids.join(','),
            details: action.parameters,
        });

        // Create bulk operation for tracking
        const bulkOp = await this.createBulkOperation({
            operation_type: `${action.type}_action`,
            target_ids: action.target_ids,
            action: action.action,
            parameters: action.parameters,
        });

        // Execute the action based on type
        switch (action.type) {
            case 'user':
                return this.executeUserAction(action, bulkOp.id);
            case 'product':
                return this.executeProductAction(action, bulkOp.id);
            case 'content':
                return this.executeContentAction(action, bulkOp.id);
            default:
                throw new Error(`Unknown action type: ${action.type}`);
        }
    }

    private async executeUserAction(action: AdminActionInput, bulkOpId: string) {
        const results: any[] = [];

        for (const userId of action.target_ids) {
            try {
                switch (action.action) {
                    case 'suspend':
                        await this.suspendUser(userId, action.parameters?.reason || 'Admin action');
                        results.push({ id: userId, status: 'success' });
                        break;
                    case 'activate':
                        await this.updateUser(userId, { is_suspended: false, suspension_reason: null });
                        results.push({ id: userId, status: 'success' });
                        break;
                    case 'change_tier':
                        await this.updateUser(userId, { subscription_tier: action.parameters?.tier });
                        results.push({ id: userId, status: 'success' });
                        break;
                    default:
                        results.push({ id: userId, status: 'error', error: 'Unknown action' });
                }
            } catch (error) {
                results.push({ id: userId, status: 'error', error: (error as Error).message });
            }
        }

        // Update bulk operation
        await this.updateBulkOperation(bulkOpId, {
            status: 'completed',
            progress: 100,
            results: { actions: results },
            completed_at: new Date().toISOString(),
        });

        return results;
    }

    private async executeProductAction(action: AdminActionInput, bulkOpId: string) {
        const results: any[] = [];

        for (const productId of action.target_ids) {
            try {
                switch (action.action) {
                    case 'publish':
                        await this.updateProduct(productId, { status: 'published' });
                        results.push({ id: productId, status: 'success' });
                        break;
                    case 'archive':
                        await this.updateProduct(productId, { status: 'archived' });
                        results.push({ id: productId, status: 'success' });
                        break;
                    case 'delete':
                        await this.deleteProduct(productId);
                        results.push({ id: productId, status: 'success' });
                        break;
                    default:
                        results.push({ id: productId, status: 'error', error: 'Unknown action' });
                }
            } catch (error) {
                results.push({ id: productId, status: 'error', error: (error as Error).message });
            }
        }

        // Update bulk operation
        await this.updateBulkOperation(bulkOpId, {
            status: 'completed',
            progress: 100,
            results: { actions: results },
            completed_at: new Date().toISOString(),
        });

        return results;
    }

    private async executeContentAction(action: AdminActionInput, bulkOpId: string) {
        const results: any[] = [];

        for (const reportId of action.target_ids) {
            try {
                switch (action.action) {
                    case 'resolve':
                        await this.updateContentReport(reportId, {
                            status: 'resolved',
                            resolution_notes: action.parameters?.notes,
                            resolved_at: new Date().toISOString(),
                        });
                        results.push({ id: reportId, status: 'success' });
                        break;
                    case 'dismiss':
                        await this.updateContentReport(reportId, {
                            status: 'dismissed',
                            resolution_notes: action.parameters?.notes,
                            resolved_at: new Date().toISOString(),
                        });
                        results.push({ id: reportId, status: 'success' });
                        break;
                    default:
                        results.push({ id: reportId, status: 'error', error: 'Unknown action' });
                }
            } catch (error) {
                results.push({ id: reportId, status: 'error', error: (error as Error).message });
            }
        }

        // Update bulk operation
        await this.updateBulkOperation(bulkOpId, {
            status: 'completed',
            progress: 100,
            results: { actions: results },
            completed_at: new Date().toISOString(),
        });

        return results;
    }
}

export const adminService = new AdminService();