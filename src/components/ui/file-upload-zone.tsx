'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Upload,
  File,
  Image,
  FileText,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: Record<string, string[]>;
  maxSize?: number;
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
}

export function FileUploadZone({
  onFilesSelected,
  acceptedTypes,
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = true,
  className,
  disabled = false,
}: FileUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle');

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      setDragActive(false);

      if (rejectedFiles.length > 0) {
        setUploadStatus('error');
        setTimeout(() => setUploadStatus('idle'), 3000);
        return;
      }

      if (acceptedFiles.length > 0) {
        setUploadStatus('uploading');
        try {
          await onFilesSelected(acceptedFiles);
          setUploadStatus('success');
          setTimeout(() => setUploadStatus('idle'), 2000);
        } catch (error) {
          setUploadStatus('error');
          setTimeout(() => setUploadStatus('idle'), 3000);
        }
      }
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxSize,
    multiple,
    disabled,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const getIcon = () => {
    if (uploadStatus === 'success') return CheckCircle;
    if (uploadStatus === 'error') return AlertCircle;

    // Determine icon based on accepted types
    if (acceptedTypes) {
      const types = Object.keys(acceptedTypes);
      if (types.some((type) => type.startsWith('image/'))) return Image;
      if (
        types.some((type) => type.includes('pdf') || type.includes('document'))
      )
        return FileText;
    }
    return Upload;
  };

  const Icon = getIcon();

  const getStatusColor = () => {
    switch (uploadStatus) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'uploading':
        return 'text-blue-600';
      default:
        return isDragActive ? 'text-primary' : 'text-muted-foreground';
    }
  };

  const getStatusMessage = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Uploading files...';
      case 'success':
        return 'Files uploaded successfully!';
      case 'error':
        return 'Upload failed. Please try again.';
      default:
        return isDragActive
          ? 'Drop files here'
          : `Drag & drop files here, or click to select`;
    }
  };

  const formatFileTypes = () => {
    if (!acceptedTypes) return '';

    const extensions = Object.values(acceptedTypes).flat();
    return extensions.join(', ').toUpperCase();
  };

  const formatMaxSize = () => {
    const mb = maxSize / (1024 * 1024);
    return mb >= 1 ? `${mb}MB` : `${Math.round(maxSize / 1024)}KB`;
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer',
        'hover:border-primary/50 hover:bg-primary/5',
        isDragActive && 'border-primary bg-primary/10',
        uploadStatus === 'success' &&
          'border-green-500 bg-green-50 dark:bg-green-950/20',
        uploadStatus === 'error' &&
          'border-red-500 bg-red-50 dark:bg-red-950/20',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          animate={{
            scale: isDragActive ? 1.1 : 1,
            rotate: uploadStatus === 'uploading' ? 360 : 0,
          }}
          transition={{
            scale: { duration: 0.2 },
            rotate: {
              duration: 1,
              repeat: uploadStatus === 'uploading' ? Infinity : 0,
              ease: 'linear',
            },
          }}
          className={cn('mb-4', getStatusColor())}
        >
          <Icon className="w-12 h-12" />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={uploadStatus}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            <p className={cn('text-lg font-medium', getStatusColor())}>
              {getStatusMessage()}
            </p>

            {uploadStatus === 'idle' && (
              <>
                <p className="text-sm text-muted-foreground">
                  {formatFileTypes() &&
                    `Supported formats: ${formatFileTypes()}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  Maximum file size: {formatMaxSize()}
                  {multiple && ' • Multiple files allowed'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  disabled={disabled}
                >
                  <File className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Loading overlay */}
      {uploadStatus === 'uploading' && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <div className="flex items-center gap-2 text-primary">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-sm font-medium">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}
