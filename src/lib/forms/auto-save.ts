/**
 * Auto-save System
 * Automatic form data saving and recovery functionality
 */

import { createClient } from '@/lib/supabase/client';
import type { ProductFormData, AutoSaveConfig } from '@/types/product-forms';

export interface AutoSaveDraft {
    id: string;
    userId: string;
    formId: string;
    data: Record<string, any>;
    metadata: {
        step: string;
        progress: number;
        lastModified: Date;
        version: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

export class AutoSaveManager {
    private static instance: AutoSaveManager;
    private saveTimers = new Map<string, NodeJS.Timeout>();
    private supabase = createClient();

    public static getInstance(): AutoSaveManager {
        if (!AutoSaveManager.instance) {
            AutoSaveManager.instance = new AutoSaveManager();
        }
        return AutoSaveManager.instance;
    }

    /**
     * Initialize auto-save for a form
     */
    initializeAutoSave(
        formId: string,
        config: AutoSaveConfig,
        onSave?: (draft: AutoSaveDraft) => void,
        onError?: (error: Error) => void
    ): void {
        if (!config.enabled) return;

        // Clear existing timer if any
        this.clearAutoSave(formId);

        // Set up periodic auto-save
        const timer = setInterval(async () => {
            try {
                const formData = this.getFormDataFromDOM(formId);
                if (formData && this.hasChanges(formId, formData)) {
                    const draft = await this.saveDraft(formId, formData);
                    onSave?.(draft);
                }
            } catch (error) {
                console.error('Auto-save failed:', error);
                onError?.(error as Error);
            }
        }, config.interval);

        this.saveTimers.set(formId, timer);

        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveBeforeUnload(formId);
        });

        // Save on visibility change (tab switch)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveBeforeUnload(formId);
            }
        });
    }

    /**
     * Clear auto-save for a form
     */
    clearAutoSave(formId: string): void {
        const timer = this.saveTimers.get(formId);
        if (timer) {
            clearInterval(timer);
            this.saveTimers.delete(formId);
        }
    }

    /**
     * Save draft manually
     */
    async saveDraft(
        formId: string,
        data: Record<string, any>,
        metadata?: Partial<AutoSaveDraft['metadata']>
    ): Promise<AutoSaveDraft> {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        // Compress data if enabled
        const compressedData = await this.compressData(data);

        // Encrypt data if enabled
        const encryptedData = await this.encryptData(compressedData);

        const draftData = {
            user_id: user.id,
            form_id: formId,
            data: encryptedData,
            metadata: {
                step: metadata?.step || 'unknown',
                progress: metadata?.progress || 0,
                lastModified: new Date(),
                version: (metadata?.version || 0) + 1,
                ...metadata
            }
        };

        const { data: draft, error } = await this.supabase
            .from('form_drafts')
            .upsert(draftData, {
                onConflict: 'user_id,form_id'
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to save draft: ${error.message}`);
        }

        // Clean up old drafts
        await this.cleanupOldDrafts(user.id, formId);

        return {
            id: draft.id,
            userId: draft.user_id,
            formId: draft.form_id,
            data: await this.decryptData(draft.data),
            metadata: draft.metadata,
            createdAt: new Date(draft.created_at),
            updatedAt: new Date(draft.updated_at)
        };
    }

    /**
     * Load draft for a form
     */
    async loadDraft(formId: string): Promise<AutoSaveDraft | null> {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) {
            return null;
        }

        const { data: draft, error } = await this.supabase
            .from('form_drafts')
            .select('*')
            .eq('user_id', user.id)
            .eq('form_id', formId)
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !draft) {
            return null;
        }

        return {
            id: draft.id,
            userId: draft.user_id,
            formId: draft.form_id,
            data: await this.decryptData(draft.data),
            metadata: draft.metadata,
            createdAt: new Date(draft.created_at),
            updatedAt: new Date(draft.updated_at)
        };
    }

    /**
     * Get all drafts for a user
     */
    async getUserDrafts(userId?: string): Promise<AutoSaveDraft[]> {
        const { data: { user } } = await this.supabase.auth.getUser();
        const targetUserId = userId || user?.id;

        if (!targetUserId) {
            return [];
        }

        const { data: drafts, error } = await this.supabase
            .from('form_drafts')
            .select('*')
            .eq('user_id', targetUserId)
            .order('updated_at', { ascending: false });

        if (error || !drafts) {
            return [];
        }

        return Promise.all(drafts.map(async (draft) => ({
            id: draft.id,
            userId: draft.user_id,
            formId: draft.form_id,
            data: await this.decryptData(draft.data),
            metadata: draft.metadata,
            createdAt: new Date(draft.created_at),
            updatedAt: new Date(draft.updated_at)
        })));
    }

    /**
     * Delete draft
     */
    async deleteDraft(draftId: string): Promise<void> {
        const { error } = await this.supabase
            .from('form_drafts')
            .delete()
            .eq('id', draftId);

        if (error) {
            throw new Error(`Failed to delete draft: ${error.message}`);
        }
    }

    /**
     * Delete all drafts for a form
     */
    async deleteFormDrafts(formId: string): Promise<void> {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) return;

        const { error } = await this.supabase
            .from('form_drafts')
            .delete()
            .eq('user_id', user.id)
            .eq('form_id', formId);

        if (error) {
            throw new Error(`Failed to delete form drafts: ${error.message}`);
        }
    }

    /**
     * Check if form has unsaved changes
     */
    hasUnsavedChanges(formId: string): boolean {
        const lastSaved = localStorage.getItem(`form_last_saved_${formId}`);
        const currentData = this.getFormDataFromDOM(formId);
        const lastSavedData = lastSaved ? JSON.parse(lastSaved) : null;

        return JSON.stringify(currentData) !== JSON.stringify(lastSavedData);
    }

    /**
     * Mark form as saved
     */
    markAsSaved(formId: string, data: Record<string, any>): void {
        localStorage.setItem(`form_last_saved_${formId}`, JSON.stringify(data));
        localStorage.setItem(`form_last_saved_time_${formId}`, new Date().toISOString());
    }

    /**
     * Get form data from DOM elements
     */
    private getFormDataFromDOM(formId: string): Record<string, any> | null {
        const form = document.getElementById(formId) as HTMLFormElement;
        if (!form) return null;

        const formData = new FormData(form);
        const data: Record<string, any> = {};

        for (const [key, value] of formData.entries()) {
            if (data[key]) {
                // Handle multiple values (checkboxes, multi-select)
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }

        return data;
    }

    /**
     * Check if data has changes since last save
     */
    private hasChanges(formId: string, currentData: Record<string, any>): boolean {
        const lastSaved = localStorage.getItem(`form_last_saved_${formId}`);
        if (!lastSaved) return true;

        const lastSavedData = JSON.parse(lastSaved);
        return JSON.stringify(currentData) !== JSON.stringify(lastSavedData);
    }

    /**
     * Save before page unload
     */
    private async saveBeforeUnload(formId: string): Promise<void> {
        try {
            const formData = this.getFormDataFromDOM(formId);
            if (formData && this.hasChanges(formId, formData)) {
                // Use sendBeacon for reliable saving on page unload
                const { data: { user } } = await this.supabase.auth.getUser();
                if (user) {
                    const payload = {
                        userId: user.id,
                        formId,
                        data: formData,
                        timestamp: new Date().toISOString()
                    };

                    navigator.sendBeacon('/api/forms/auto-save', JSON.stringify(payload));
                }
            }
        } catch (error) {
            console.error('Failed to save before unload:', error);
        }
    }

    /**
     * Compress data to reduce storage size
     */
    private async compressData(data: Record<string, any>): Promise<string> {
        // Simple JSON stringification for now
        // In production, you might want to use actual compression like gzip
        return JSON.stringify(data);
    }

    /**
     * Decompress data
     */
    private async decompressData(compressedData: string): Promise<Record<string, any>> {
        return JSON.parse(compressedData);
    }

    /**
     * Encrypt sensitive data
     */
    private async encryptData(data: string): Promise<string> {
        // For now, just return the data as-is
        // In production, implement proper encryption
        return data;
    }

    /**
     * Decrypt data
     */
    private async decryptData(encryptedData: string): Promise<Record<string, any>> {
        // For now, just parse the JSON
        // In production, implement proper decryption
        return JSON.parse(encryptedData);
    }

    /**
     * Clean up old drafts to prevent storage bloat
     */
    private async cleanupOldDrafts(userId: string, formId: string, maxDrafts = 5): Promise<void> {
        const { data: drafts } = await this.supabase
            .from('form_drafts')
            .select('id, created_at')
            .eq('user_id', userId)
            .eq('form_id', formId)
            .order('created_at', { ascending: false });

        if (drafts && drafts.length > maxDrafts) {
            const draftsToDelete = drafts.slice(maxDrafts);
            const idsToDelete = draftsToDelete.map(d => d.id);

            await this.supabase
                .from('form_drafts')
                .delete()
                .in('id', idsToDelete);
        }
    }

    /**
     * Get auto-save status
     */
    getAutoSaveStatus(formId: string): {
        isEnabled: boolean;
        lastSaved: Date | null;
        hasUnsavedChanges: boolean;
    } {
        const lastSavedTime = localStorage.getItem(`form_last_saved_time_${formId}`);

        return {
            isEnabled: this.saveTimers.has(formId),
            lastSaved: lastSavedTime ? new Date(lastSavedTime) : null,
            hasUnsavedChanges: this.hasUnsavedChanges(formId)
        };
    }

    /**
     * Force save current form state
     */
    async forceSave(formId: string): Promise<AutoSaveDraft | null> {
        const formData = this.getFormDataFromDOM(formId);
        if (!formData) return null;

        const draft = await this.saveDraft(formId, formData);
        this.markAsSaved(formId, formData);
        return draft;
    }

    /**
     * Restore form from draft
     */
    async restoreFromDraft(formId: string, draftId?: string): Promise<boolean> {
        try {
            let draft: AutoSaveDraft | null;

            if (draftId) {
                // Load specific draft
                const { data, error } = await this.supabase
                    .from('form_drafts')
                    .select('*')
                    .eq('id', draftId)
                    .single();

                if (error || !data) return false;

                draft = {
                    id: data.id,
                    userId: data.user_id,
                    formId: data.form_id,
                    data: await this.decryptData(data.data),
                    metadata: data.metadata,
                    createdAt: new Date(data.created_at),
                    updatedAt: new Date(data.updated_at)
                };
            } else {
                // Load latest draft
                draft = await this.loadDraft(formId);
            }

            if (!draft) return false;

            // Populate form with draft data
            this.populateForm(formId, draft.data);
            this.markAsSaved(formId, draft.data);

            return true;
        } catch (error) {
            console.error('Failed to restore from draft:', error);
            return false;
        }
    }

    /**
     * Populate form with data
     */
    private populateForm(formId: string, data: Record<string, any>): void {
        const form = document.getElementById(formId) as HTMLFormElement;
        if (!form) return;

        Object.entries(data).forEach(([key, value]) => {
            const element = form.querySelector(`[name="${key}"]`) as HTMLInputElement;
            if (element) {
                if (element.type === 'checkbox' || element.type === 'radio') {
                    element.checked = Boolean(value);
                } else {
                    element.value = String(value);
                }
            }
        });

        // Trigger change events to update React state
        const event = new Event('change', { bubbles: true });
        form.dispatchEvent(event);
    }
}

// Export singleton instance
export const autoSaveManager = AutoSaveManager.getInstance();