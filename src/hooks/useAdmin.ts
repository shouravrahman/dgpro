'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/lib/services/admin';
import type {
    AdminUser,
    AuditLog,
    SystemSetting,
    ContentReport,
    SystemHealthMetric,
    BulkOperation,
    PlatformStats,
    DashboardMetrics,
    UserManagementFilters,
    ProductManagementFilters,
    AuditLogFilters,
    AdminActionInput,
} from '@/types/admin';

export function useAdmin() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAsync = async <T>(operation: () => Promise<T>): Promise<T | null> => {
        try {
            setLoading(true);
            setError(null);
            const result = await operation();
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,

        // Platform Statistics
        getPlatformStats: () => handleAsync(() => adminService.getPlatformStats()),
        getDashboardMetrics: () => handleAsync(() => adminService.getDashboardMetrics()),

        // Admin Users
        getAdminUsers: () => handleAsync(() => adminService.getAdminUsers()),
        createAdminUser: (data: { user_id: string; role: string; permissions?: Record<string, boolean> }) =>
            handleAsync(() => adminService.createAdminUser(data)),
        updateAdminUser: (id: string, updates: Partial<AdminUser>) =>
            handleAsync(() => adminService.updateAdminUser(id, updates)),
        deleteAdminUser: (id: string) => handleAsync(() => adminService.deleteAdminUser(id)),

        // User Management
        getUsers: (filters?: UserManagementFilters) => handleAsync(() => adminService.getUsers(filters)),
        getUserById: (id: string) => handleAsync(() => adminService.getUserById(id)),
        updateUser: (id: string, updates: any) => handleAsync(() => adminService.updateUser(id, updates)),
        suspendUser: (id: string, reason: string) => handleAsync(() => adminService.suspendUser(id, reason)),

        // Product Management
        getProducts: (filters?: ProductManagementFilters) => handleAsync(() => adminService.getProducts(filters)),
        updateProduct: (id: string, updates: any) => handleAsync(() => adminService.updateProduct(id, updates)),
        deleteProduct: (id: string) => handleAsync(() => adminService.deleteProduct(id)),

        // Content Reports
        getContentReports: (filters?: { status?: string; priority?: string }) =>
            handleAsync(() => adminService.getContentReports(filters)),
        updateContentReport: (id: string, updates: Partial<ContentReport>) =>
            handleAsync(() => adminService.updateContentReport(id, updates)),

        // Audit Logs
        getAuditLogs: (filters?: AuditLogFilters) => handleAsync(() => adminService.getAuditLogs(filters)),
        createAuditLog: (data: { action: string; target_type?: string; target_id?: string; details?: Record<string, any> }) =>
            handleAsync(() => adminService.createAuditLog(data)),

        // System Settings
        getSystemSettings: () => handleAsync(() => adminService.getSystemSettings()),
        updateSystemSetting: (id: string, updates: Partial<SystemSetting>) =>
            handleAsync(() => adminService.updateSystemSetting(id, updates)),

        // System Health
        getSystemHealth: () => handleAsync(() => adminService.getSystemHealth()),
        updateSystemHealth: (data: {
            metric_name: string;
            metric_value: number;
            metric_unit?: string;
            status?: string;
            details?: Record<string, any>;
        }) => handleAsync(() => adminService.updateSystemHealth(data)),

        // Bulk Operations
        createBulkOperation: (data: {
            operation_type: string;
            target_ids: string[];
            action: string;
            parameters?: Record<string, any>;
        }) => handleAsync(() => adminService.createBulkOperation(data)),
        getBulkOperations: () => handleAsync(() => adminService.getBulkOperations()),
        updateBulkOperation: (id: string, updates: Partial<BulkOperation>) =>
            handleAsync(() => adminService.updateBulkOperation(id, updates)),

        // Admin Actions
        executeAdminAction: (action: AdminActionInput) => handleAsync(() => adminService.executeAdminAction(action)),
    };
}

export function usePlatformStats() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await adminService.getPlatformStats();
                setStats(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch stats');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

        // Refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    return { stats, loading, error, refetch: () => setLoading(true) };
}

export function useDashboardMetrics() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                setLoading(true);
                const data = await adminService.getDashboardMetrics();
                setMetrics(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();

        // Refresh every 60 seconds
        const interval = setInterval(fetchMetrics, 60000);
        return () => clearInterval(interval);
    }, []);

    return { metrics, loading, error, refetch: () => setLoading(true) };
}

export function useSystemHealth() {
    const [health, setHealth] = useState<SystemHealthMetric[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                setLoading(true);
                const data = await adminService.getSystemHealth();
                setHealth(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch system health');
            } finally {
                setLoading(false);
            }
        };

        fetchHealth();

        // Refresh every 15 seconds for real-time monitoring
        const interval = setInterval(fetchHealth, 15000);
        return () => clearInterval(interval);
    }, []);

    return { health, loading, error, refetch: () => setLoading(true) };
}

export function useContentReports(filters?: { status?: string; priority?: string }) {
    const [reports, setReports] = useState<ContentReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const data = await adminService.getContentReports(filters);
                setReports(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch reports');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [filters?.status, filters?.priority]);

    const updateReport = async (id: string, updates: Partial<ContentReport>) => {
        try {
            await adminService.updateContentReport(id, updates);
            setReports(prev => prev.map(report =>
                report.id === id ? { ...report, ...updates } : report
            ));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update report');
        }
    };

    return { reports, loading, error, updateReport, refetch: () => setLoading(true) };
}

export function useAuditLogs(filters?: AuditLogFilters) {
    const [logs, setLogs] = useState<{ data: AuditLog[]; count: number }>({ data: [], count: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                const data = await adminService.getAuditLogs(filters);
                setLogs(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [filters?.admin_id, filters?.action, filters?.target_type, filters?.date_from, filters?.date_to, filters?.page]);

    return { logs: logs.data, count: logs.count, loading, error, refetch: () => setLoading(true) };
}

export function useBulkOperations() {
    const [operations, setOperations] = useState<BulkOperation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOperations = async () => {
            try {
                setLoading(true);
                const data = await adminService.getBulkOperations();
                setOperations(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch bulk operations');
            } finally {
                setLoading(false);
            }
        };

        fetchOperations();

        // Refresh every 10 seconds to track progress
        const interval = setInterval(fetchOperations, 10000);
        return () => clearInterval(interval);
    }, []);

    return { operations, loading, error, refetch: () => setLoading(true) };
}