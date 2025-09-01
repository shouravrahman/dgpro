'use client';

import { useEffect, useRef, useCallback } from 'react';
import { UseFormWatch, UseFormGetValues } from 'react-hook-form';
import { debounce } from 'lodash';

interface AutoSaveOptions {
    key: string; // Unique key for localStorage
    delay?: number; // Debounce delay in milliseconds
    enabled?: boolean; // Enable/disable autosave
    onSave?: (data: any) => void; // Callback when data is saved
    onRestore?: (data: any) => void; // Callback when data is restored
    exclude?: string[]; // Fields to exclude from autosave
    compress?: boolean; // Compress data before saving
}

interface AutoSaveReturn {
    clearSaved: () => void;
    hasSavedData: boolean;
    restoreData: () => any;
    saveNow: () => void;
}

export function useFormAutoSave<T extends Record<string, any>>(
    watch: UseFormWatch<T>,
    getValues: UseFormGetValues<T>,
    options: AutoSaveOptions
): AutoSaveReturn {
    const {
        key,
        delay = 2000,
        enabled = true,
        onSave,
        onRestore,
        exclude = [],
        compress = false
    } = options;

    const savedDataRef = useRef<any>(null);
    const isRestoringRef = useRef(false);

    // Create storage key
    const storageKey = `form-autosave-${key}`;

    // Compress/decompress utilities
    const compressData = useCallback((data: any): string => {
        if (!compress) return JSON.stringify(data);

        try {
            // Simple compression by removing whitespace and common patterns
            const jsonString = JSON.stringify(data);
            return jsonString
                .replace(/\s+/g, ' ')
                .replace(/,\s*}/g, '}')
                .replace(/{\s*,/g, '{')
                .replace(/\[\s*,/g, '[')
                .replace(/,\s*\]/g, ']');
        } catch {
            return JSON.stringify(data);
        }
    }, [compress]);

    const decompressData = useCallback((compressed: string): any => {
        try {
            return JSON.parse(compressed);
        } catch {
            return null;
        }
    }, []);

    // Save data to localStorage
    const saveData = useCallback((data: any) => {
        if (!enabled || isRestoringRef.current) return;

        try {
            // Filter out excluded fields
            const filteredData = { ...data };
            exclude.forEach(field => {
                delete filteredData[field];
            });

            // Remove empty or undefined values
            const cleanData = Object.entries(filteredData).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    acc[key] = value;
                }
                return acc;
            }, {} as any);

            // Only save if there's meaningful data
            if (Object.keys(cleanData).length === 0) return;

            const compressed = compressData({
                data: cleanData,
                timestamp: Date.now(),
                version: '1.0'
            });

            localStorage.setItem(storageKey, compressed);
            savedDataRef.current = cleanData;
            onSave?.(cleanData);
        } catch (error) {
            console.warn('Failed to save form data:', error);
        }
    }, [enabled, exclude, compressData, storageKey, onSave]);

    // Debounced save function
    const debouncedSave = useCallback(
        debounce((data: any) => saveData(data), delay),
        [saveData, delay]
    );

    // Load data from localStorage
    const loadData = useCallback((): any => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (!saved) return null;

            const parsed = decompressData(saved);
            if (!parsed || !parsed.data) return null;

            // Check if data is not too old (7 days)
            const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
            if (parsed.timestamp && Date.now() - parsed.timestamp > maxAge) {
                localStorage.removeItem(storageKey);
                return null;
            }

            return parsed.data;
        } catch (error) {
            console.warn('Failed to load saved form data:', error);
            return null;
        }
    }, [storageKey, decompressData]);

    // Clear saved data
    const clearSaved = useCallback(() => {
        try {
            localStorage.removeItem(storageKey);
            savedDataRef.current = null;
        } catch (error) {
            console.warn('Failed to clear saved form data:', error);
        }
    }, [storageKey]);

    // Restore data
    const restoreData = useCallback(() => {
        const data = loadData();
        if (data) {
            isRestoringRef.current = true;
            onRestore?.(data);
            setTimeout(() => {
                isRestoringRef.current = false;
            }, 100);
        }
        return data;
    }, [loadData, onRestore]);

    // Save immediately
    const saveNow = useCallback(() => {
        const currentData = getValues();
        saveData(currentData);
    }, [getValues, saveData]);

    // Check if there's saved data
    const hasSavedData = !!loadData();

    // Watch for form changes and auto-save
    useEffect(() => {
        if (!enabled) return;

        const subscription = watch((data) => {
            if (!isRestoringRef.current) {
                debouncedSave(data);
            }
        });

        return () => {
            subscription.unsubscribe();
            debouncedSave.cancel();
        };
    }, [watch, debouncedSave, enabled]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            debouncedSave.cancel();
        };
    }, [debouncedSave]);

    // Save on page unload
    useEffect(() => {
        if (!enabled) return;

        const handleBeforeUnload = () => {
            debouncedSave.cancel();
            const currentData = getValues();
            saveData(currentData);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [enabled, getValues, saveData, debouncedSave]);

    return {
        clearSaved,
        hasSavedData,
        restoreData,
        saveNow
    };
}

// Hook for form recovery notification
export function useFormRecovery<T extends Record<string, any>>(
    autoSave: AutoSaveReturn,
    setValue: (name: keyof T, value: any) => void
) {
    const showRecoveryPrompt = useCallback(() => {
        if (!autoSave.hasSavedData) return false;

        const shouldRestore = window.confirm(
            'We found unsaved changes from your previous session. Would you like to restore them?'
        );

        if (shouldRestore) {
            const data = autoSave.restoreData();
            if (data) {
                Object.entries(data).forEach(([key, value]) => {
                    setValue(key as keyof T, value);
                });
                return true;
            }
        } else {
            autoSave.clearSaved();
        }

        return false;
    }, [autoSave, setValue]);

    return { showRecoveryPrompt };
}

// Auto-save status component
interface AutoSaveStatusProps {
    isSaving?: boolean;
    lastSaved?: Date;
    className?: string;
}

export function AutoSaveStatus({
    isSaving,
    lastSaved,
    className
}: AutoSaveStatusProps) {
    if (isSaving) {
        return (
            <div className= {`flex items-center gap-2 text-sm text-muted-foreground ${className}`
    }>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Saving...
    </div>
    );
}

if (lastSaved) {
    const timeAgo = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
    const displayTime = timeAgo < 60
        ? 'just now'
        : timeAgo < 3600
            ? `${Math.floor(timeAgo / 60)}m ago`
            : `${Math.floor(timeAgo / 3600)}h ago`;

    return (
        <div className= {`flex items-center gap-2 text-sm text-green-600 dark:text-green-400 ${className}`
}>
    <div className="w-2 h-2 bg-green-500 rounded-full" />
        Saved { displayTime }
</div>
    );
  }

return null;
}

// Multi-step form auto-save
export function useMultiStepAutoSave<T extends Record<string, any>>(
    currentStep: number,
    watch: UseFormWatch<T>,
    getValues: UseFormGetValues<T>,
    baseKey: string
) {
    const stepKey = `${baseKey}-step-${currentStep}`;

    const autoSave = useFormAutoSave(watch, getValues, {
        key: stepKey,
        delay: 1500,
        enabled: true,
        exclude: ['confirmPassword', 'agreeToTerms'] // Common fields to exclude
    });

    // Clear previous steps when moving forward
    const clearPreviousSteps = useCallback(() => {
        for (let i = 0; i < currentStep; i++) {
            const prevKey = `form-autosave-${baseKey}-step-${i}`;
            localStorage.removeItem(prevKey);
        }
    }, [currentStep, baseKey]);

    // Clear all steps
    const clearAllSteps = useCallback(() => {
        for (let i = 0; i <= 10; i++) { // Assume max 10 steps
            const stepKey = `form-autosave-${baseKey}-step-${i}`;
            localStorage.removeItem(stepKey);
        }
    }, [baseKey]);

    return {
        ...autoSave,
        clearPreviousSteps,
        clearAllSteps
    };
}