/**
 * File Upload System
 * Drag-and-drop file upload with progress indicators and validation
 */

import { createClient } from '@/lib/supabase/client';
import { formValidator } from './validation';
import type { UploadedFile, FileUploadConfig } from '@/types/product-forms';

export interface UploadProgress {
    fileId: string;
    fileName: string;
    progress: number;
    status: 'uploading' | 'processing' | 'completed' | 'error';
    error?: string;
}

export interface UploadOptions {
    bucket: string;
    folder?: string;
    generateThumbnails?: boolean;
    compressImages?: boolean;
    virusScan?: boolean;
    onProgress?: (progress: UploadProgress) => void;
    onComplete?: (file: UploadedFile) => void;
    onError?: (error: Error, fileId: string) => void;
}

export class FileUploadManager {
    private static instance: FileUploadManager;
    private supabase = createClient();
    private activeUploads = new Map<string, AbortController>();

    public static getInstance(): FileUploadManager {
        if (!FileUploadManager.instance) {
            FileUploadManager.instance = new FileUploadManager();
        }
        return FileUploadManager.instance;
    }

    /**
     * Upload single file
     */
    async uploadFile(
        file: File,
        config: FileUploadConfig,
        options: UploadOptions
    ): Promise<UploadedFile> {
        const fileId = this.generateFileId();
        const abortController = new AbortController();
        this.activeUploads.set(fileId, abortController);

        try {
            // Validate file
            const validation = formValidator.validateFile(file, {
                maxSize: config.maxSize,
                allowedTypes: config.allowedTypes,
                allowedExtensions: config.accept
            });

            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }

            // Report initial progress
            options.onProgress?.({
                fileId,
                fileName: file.name,
                progress: 0,
                status: 'uploading'
            });

            // Process file if needed
            const processedFile = await this.processFile(file, config, options);

            // Generate unique file path
            const filePath = this.generateFilePath(processedFile, options);

            // Upload to Supabase Storage
            const { data, error } = await this.supabase.storage
                .from(options.bucket)
                .upload(filePath, processedFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                throw new Error(`Upload failed: ${error.message}`);
            }

            // Report processing status
            options.onProgress?.({
                fileId,
                fileName: file.name,
                progress: 90,
                status: 'processing'
            });

            // Get public URL
            const { data: { publicUrl } } = this.supabase.storage
                .from(options.bucket)
                .getPublicUrl(data.path);

            // Generate thumbnail if needed
            let thumbnailUrl: string | undefined;
            if (config.generateThumbnails && this.isImage(file)) {
                thumbnailUrl = await this.generateThumbnail(file, options);
            }

            // Extract metadata
            const metadata = await this.extractMetadata(file);

            // Create uploaded file record
            const uploadedFile: UploadedFile = {
                id: fileId,
                name: data.path.split('/').pop() || file.name,
                originalName: file.name,
                size: file.size,
                type: file.type,
                url: publicUrl,
                thumbnailUrl,
                metadata,
                uploadedAt: new Date(),
                status: 'completed',
                progress: 100
            };

            // Save to database
            await this.saveFileRecord(uploadedFile);

            // Report completion
            options.onProgress?.({
                fileId,
                fileName: file.name,
                progress: 100,
                status: 'completed'
            });

            options.onComplete?.(uploadedFile);

            return uploadedFile;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';

            options.onProgress?.({
                fileId,
                fileName: file.name,
                progress: 0,
                status: 'error',
                error: errorMessage
            });

            options.onError?.(error as Error, fileId);
            throw error;

        } finally {
            this.activeUploads.delete(fileId);
        }
    }

    /**
     * Upload multiple files
     */
    async uploadFiles(
        files: File[],
        config: FileUploadConfig,
        options: UploadOptions
    ): Promise<UploadedFile[]> {
        const uploadPromises = files.map(file =>
            this.uploadFile(file, config, options)
        );

        const results = await Promise.allSettled(uploadPromises);

        return results
            .filter((result): result is PromiseFulfilledResult<UploadedFile> =>
                result.status === 'fulfilled'
            )
            .map(result => result.value);
    }

    /**
     * Cancel upload
     */
    cancelUpload(fileId: string): void {
        const controller = this.activeUploads.get(fileId);
        if (controller) {
            controller.abort();
            this.activeUploads.delete(fileId);
        }
    }

    /**
     * Cancel all uploads
     */
    cancelAllUploads(): void {
        for (const [fileId, controller] of this.activeUploads) {
            controller.abort();
        }
        this.activeUploads.clear();
    }

    /**
     * Delete uploaded file
     */
    async deleteFile(fileId: string, bucket: string): Promise<void> {
        // Get file record
        const { data: fileRecord, error: fetchError } = await this.supabase
            .from('file_uploads')
            .select('file_path')
            .eq('id', fileId)
            .single();

        if (fetchError || !fileRecord) {
            throw new Error('File not found');
        }

        // Delete from storage
        const { error: storageError } = await this.supabase.storage
            .from(bucket)
            .remove([fileRecord.file_path]);

        if (storageError) {
            throw new Error(`Failed to delete file: ${storageError.message}`);
        }

        // Delete from database
        const { error: dbError } = await this.supabase
            .from('file_uploads')
            .delete()
            .eq('id', fileId);

        if (dbError) {
            throw new Error(`Failed to delete file record: ${dbError.message}`);
        }
    }

    /**
     * Get file info
     */
    async getFileInfo(fileId: string): Promise<UploadedFile | null> {
        const { data, error } = await this.supabase
            .from('file_uploads')
            .select('*')
            .eq('id', fileId)
            .single();

        if (error || !data) {
            return null;
        }

        return {
            id: data.id,
            name: data.filename,
            originalName: data.original_filename,
            size: data.file_size,
            type: data.mime_type,
            url: data.file_path,
            thumbnailUrl: data.metadata?.thumbnailUrl,
            metadata: data.metadata,
            uploadedAt: new Date(data.created_at),
            status: 'completed',
            progress: 100
        };
    }

    /**
     * Process file before upload
     */
    private async processFile(
        file: File,
        config: FileUploadConfig,
        options: UploadOptions
    ): Promise<File> {
        let processedFile = file;

        // Compress images if enabled
        if (config.compressionEnabled && this.isImage(file)) {
            processedFile = await this.compressImage(file);
        }

        // Virus scan if enabled
        if (config.virusScanEnabled) {
            await this.scanForViruses(processedFile);
        }

        return processedFile;
    }

    /**
     * Generate unique file path
     */
    private generateFilePath(file: File, options: UploadOptions): string {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2);
        const extension = file.name.split('.').pop();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

        const folder = options.folder ? `${options.folder}/` : '';
        return `${folder}${timestamp}_${randomString}_${sanitizedName}`;
    }

    /**
     * Generate unique file ID
     */
    private generateFileId(): string {
        return `file_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    }

    /**
     * Check if file is an image
     */
    private isImage(file: File): boolean {
        return file.type.startsWith('image/');
    }

    /**
     * Compress image file
     */
    private async compressImage(file: File, quality = 0.8): Promise<File> {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Calculate new dimensions (max 1920x1080)
                const maxWidth = 1920;
                const maxHeight = 1080;
                let { width, height } = img;

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }

                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name, {
                                type: file.type,
                                lastModified: Date.now()
                            });
                            resolve(compressedFile);
                        } else {
                            resolve(file);
                        }
                    },
                    file.type,
                    quality
                );
            };

            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Generate thumbnail for image
     */
    private async generateThumbnail(file: File, options: UploadOptions): Promise<string> {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = async () => {
                // Thumbnail dimensions
                const thumbSize = 200;
                const ratio = Math.min(thumbSize / img.width, thumbSize / img.height);
                const width = img.width * ratio;
                const height = img.height * ratio;

                canvas.width = width;
                canvas.height = height;

                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(async (blob) => {
                    if (blob) {
                        try {
                            const thumbFile = new File([blob], `thumb_${file.name}`, {
                                type: 'image/jpeg'
                            });

                            const thumbPath = `thumbnails/${this.generateFilePath(thumbFile, options)}`;

                            const { data, error } = await this.supabase.storage
                                .from(options.bucket)
                                .upload(thumbPath, thumbFile);

                            if (error) {
                                reject(error);
                                return;
                            }

                            const { data: { publicUrl } } = this.supabase.storage
                                .from(options.bucket)
                                .getPublicUrl(data.path);

                            resolve(publicUrl);
                        } catch (error) {
                            reject(error);
                        }
                    } else {
                        reject(new Error('Failed to generate thumbnail'));
                    }
                }, 'image/jpeg', 0.8);
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Extract file metadata
     */
    private async extractMetadata(file: File): Promise<Record<string, any>> {
        const metadata: Record<string, any> = {
            originalName: file.name,
            size: file.size,
            type: file.type,
            lastModified: new Date(file.lastModified)
        };

        // Extract image metadata
        if (this.isImage(file)) {
            try {
                const imageMetadata = await this.extractImageMetadata(file);
                metadata.image = imageMetadata;
            } catch (error) {
                console.warn('Failed to extract image metadata:', error);
            }
        }

        return metadata;
    }

    /**
     * Extract image metadata
     */
    private async extractImageMetadata(file: File): Promise<Record<string, any>> {
        return new Promise((resolve) => {
            const img = new Image();

            img.onload = () => {
                resolve({
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    aspectRatio: img.naturalWidth / img.naturalHeight
                });
            };

            img.onerror = () => resolve({});
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Scan file for viruses (placeholder)
     */
    private async scanForViruses(file: File): Promise<void> {
        // In a real implementation, this would integrate with a virus scanning service
        // For now, we'll just check file extensions and basic patterns

        const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.jar'];
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();

        if (dangerousExtensions.includes(extension)) {
            throw new Error('File type not allowed for security reasons');
        }

        // Check file size (extremely large files might be suspicious)
        if (file.size > 1024 * 1024 * 1024) { // 1GB
            throw new Error('File too large');
        }
    }

    /**
     * Save file record to database
     */
    private async saveFileRecord(file: UploadedFile): Promise<void> {
        const { data: { user } } = await this.supabase.auth.getUser();

        const { error } = await this.supabase
            .from('file_uploads')
            .insert({
                id: file.id,
                user_id: user?.id,
                filename: file.name,
                original_filename: file.originalName,
                file_path: file.url,
                file_size: file.size,
                mime_type: file.type,
                file_hash: await this.calculateFileHash(file.url),
                is_public: true,
                download_count: 0,
                metadata: file.metadata
            });

        if (error) {
            console.error('Failed to save file record:', error);
        }
    }

    /**
     * Calculate file hash for deduplication
     */
    private async calculateFileHash(fileUrl: string): Promise<string> {
        try {
            const response = await fetch(fileUrl);
            const buffer = await response.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            console.warn('Failed to calculate file hash:', error);
            return '';
        }
    }

    /**
     * Create drag and drop handlers
     */
    createDragDropHandlers(
        element: HTMLElement,
        config: FileUploadConfig,
        options: UploadOptions
    ): {
        onDragEnter: (e: DragEvent) => void;
        onDragOver: (e: DragEvent) => void;
        onDragLeave: (e: DragEvent) => void;
        onDrop: (e: DragEvent) => void;
    } {
        let dragCounter = 0;

        return {
            onDragEnter: (e: DragEvent) => {
                e.preventDefault();
                dragCounter++;
                element.classList.add('drag-over');
            },

            onDragOver: (e: DragEvent) => {
                e.preventDefault();
            },

            onDragLeave: (e: DragEvent) => {
                e.preventDefault();
                dragCounter--;
                if (dragCounter === 0) {
                    element.classList.remove('drag-over');
                }
            },

            onDrop: (e: DragEvent) => {
                e.preventDefault();
                dragCounter = 0;
                element.classList.remove('drag-over');

                const files = Array.from(e.dataTransfer?.files || []);
                if (files.length > 0) {
                    this.uploadFiles(files, config, options);
                }
            }
        };
    }
}

// Export singleton instance
export const fileUploadManager = FileUploadManager.getInstance();