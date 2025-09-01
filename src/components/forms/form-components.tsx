'use client';

import { forwardRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UseFormRegister,
  FieldError,
  UseFormWatch,
  Control,
  useController,
} from 'react-hook-form';
import {
  Eye,
  EyeOff,
  Upload,
  X,
  Check,
  AlertCircle,
  Info,
  Search,
  Calendar,
  Clock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  FormError,
  FormSuccess,
  FieldValidation,
} from '@/components/ui/form-validation';
import { InputSanitizer } from '@/lib/security/input-sanitization';
import { cn } from '@/lib/utils';

// Base form field props
interface BaseFieldProps {
  label?: string;
  error?: FieldError | string;
  success?: string;
  info?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  description?: string;
}

// Enhanced Input Field
interface InputFieldProps extends BaseFieldProps {
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  register: UseFormRegister<any>;
  watch?: UseFormWatch<any>;
  autoComplete?: string;
  maxLength?: number;
  showCharCount?: boolean;
  sanitize?: boolean;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (value: string) => boolean | string;
  };
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      name,
      label,
      type = 'text',
      placeholder,
      error,
      success,
      info,
      required,
      disabled,
      className,
      description,
      register,
      watch,
      autoComplete,
      maxLength,
      showCharCount,
      sanitize = true,
      validation,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const watchedValue = watch?.(name) || '';
    const charCount = watchedValue?.length || 0;

    const inputType = type === 'password' && showPassword ? 'text' : type;
    const hasError = !!error;
    const hasSuccess = !!success && !hasError;

    const registerProps = register(name, {
      required: required ? `${label || name} is required` : false,
      pattern: validation?.pattern
        ? {
            value: validation.pattern,
            message: `Invalid ${label || name} format`,
          }
        : undefined,
      minLength: validation?.minLength
        ? {
            value: validation.minLength,
            message: `${label || name} must be at least ${validation.minLength} characters`,
          }
        : undefined,
      maxLength: validation?.maxLength
        ? {
            value: validation.maxLength,
            message: `${label || name} must be less than ${validation.maxLength} characters`,
          }
        : undefined,
      validate: validation?.custom,
      setValueAs: sanitize
        ? (value: string) => {
            if (type === 'email') return InputSanitizer.sanitizeEmail(value);
            if (type === 'url') return InputSanitizer.sanitizeURL(value);
            if (type === 'tel')
              return InputSanitizer.sanitizePhoneNumber(value);
            return InputSanitizer.sanitizeText(value);
          }
        : undefined,
    });

    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <Label htmlFor={name} className="flex items-center gap-1">
            {label}
            {required && <span className="text-red-500">*</span>}
          </Label>
        )}

        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        <div className="relative">
          <Input
            {...registerProps}
            {...props}
            ref={ref}
            id={name}
            type={inputType}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            maxLength={maxLength}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              'transition-all duration-200',
              hasError &&
                'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              hasSuccess &&
                'border-green-500 focus:border-green-500 focus:ring-green-500/20',
              isFocused && 'ring-2 ring-primary/20',
              type === 'password' && 'pr-10'
            )}
          />

          {/* Password toggle */}
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Validation indicator */}
          <FieldValidation
            isValid={hasSuccess}
            isInvalid={hasError}
            className="right-3"
          />
        </div>

        {/* Character count */}
        {showCharCount && maxLength && (
          <div className="flex justify-end">
            <span
              className={cn(
                'text-xs',
                charCount > maxLength * 0.9
                  ? 'text-red-500'
                  : 'text-muted-foreground'
              )}
            >
              {charCount}/{maxLength}
            </span>
          </div>
        )}

        {/* Error message */}
        <FormError error={error} />

        {/* Success message */}
        {success && <FormSuccess message={success} />}

        {/* Info message */}
        {info && !error && !success && (
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <Info className="w-4 h-4" />
            <span>{info}</span>
          </div>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

// Enhanced Textarea Field
interface TextareaFieldProps extends BaseFieldProps {
  name: string;
  placeholder?: string;
  register: UseFormRegister<any>;
  watch?: UseFormWatch<any>;
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
  autoResize?: boolean;
  sanitize?: boolean;
}

export const TextareaField = forwardRef<
  HTMLTextAreaElement,
  TextareaFieldProps
>(
  (
    {
      name,
      label,
      placeholder,
      error,
      success,
      info,
      required,
      disabled,
      className,
      description,
      register,
      watch,
      rows = 4,
      maxLength,
      showCharCount,
      autoResize,
      sanitize = true,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const watchedValue = watch?.(name) || '';
    const charCount = watchedValue?.length || 0;

    const hasError = !!error;
    const hasSuccess = !!success && !hasError;

    const registerProps = register(name, {
      required: required ? `${label || name} is required` : false,
      maxLength: maxLength
        ? {
            value: maxLength,
            message: `${label || name} must be less than ${maxLength} characters`,
          }
        : undefined,
      setValueAs: sanitize ? InputSanitizer.sanitizeText : undefined,
    });

    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <Label htmlFor={name} className="flex items-center gap-1">
            {label}
            {required && <span className="text-red-500">*</span>}
          </Label>
        )}

        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        <div className="relative">
          <Textarea
            {...registerProps}
            {...props}
            ref={ref}
            id={name}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            maxLength={maxLength}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              'transition-all duration-200 resize-none',
              hasError &&
                'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              hasSuccess &&
                'border-green-500 focus:border-green-500 focus:ring-green-500/20',
              isFocused && 'ring-2 ring-primary/20',
              autoResize && 'resize-y'
            )}
          />
        </div>

        {/* Character count */}
        {showCharCount && maxLength && (
          <div className="flex justify-end">
            <span
              className={cn(
                'text-xs',
                charCount > maxLength * 0.9
                  ? 'text-red-500'
                  : 'text-muted-foreground'
              )}
            >
              {charCount}/{maxLength}
            </span>
          </div>
        )}

        <FormError error={error} />
        {success && <FormSuccess message={success} />}
        {info && !error && !success && (
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <Info className="w-4 h-4" />
            <span>{info}</span>
          </div>
        )}
      </div>
    );
  }
);

TextareaField.displayName = 'TextareaField';

// File Upload Field
interface FileUploadFieldProps extends BaseFieldProps {
  name: string;
  control: Control<any>;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  preview?: boolean;
  onFileSelect?: (files: File[]) => void;
}

export function FileUploadField({
  name,
  label,
  error,
  success,
  info,
  required,
  disabled,
  className,
  description,
  control,
  accept,
  multiple,
  maxSize = 10,
  maxFiles = 5,
  preview = true,
  onFileSelect,
}: FileUploadFieldProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { field } = useController({
    name,
    control,
    rules: {
      required: required ? `${label || name} is required` : false,
      validate: (files: File[]) => {
        if (!files || files.length === 0) return true;

        if (files.length > maxFiles) {
          return `Maximum ${maxFiles} files allowed`;
        }

        for (const file of files) {
          if (file.size > maxSize * 1024 * 1024) {
            return `File "${file.name}" exceeds ${maxSize}MB limit`;
          }
        }

        return true;
      },
    },
  });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    setSelectedFiles(fileArray);
    field.onChange(fileArray);
    onFileSelect?.(fileArray);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    field.onChange(newFiles);
    onFileSelect?.(newFiles);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-all duration-200',
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 dark:border-gray-600',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-red-500'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span className="font-medium">Click to upload</span> or drag and
            drop
          </p>
          <p className="text-xs text-gray-500">
            {accept ? `Accepted formats: ${accept}` : 'All file types accepted'}
            {maxSize && ` • Max size: ${maxSize}MB`}
            {multiple && ` • Max files: ${maxFiles}`}
          </p>
        </div>
      </div>

      {/* File preview */}
      {preview && selectedFiles.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selected Files:</Label>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                    <Upload className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <FormError error={error} />
      {success && <FormSuccess message={success} />}
      {info && !error && !success && (
        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <Info className="w-4 h-4" />
          <span>{info}</span>
        </div>
      )}
    </div>
  );
}

// Tag Input Field
interface TagInputFieldProps extends BaseFieldProps {
  name: string;
  control: Control<any>;
  placeholder?: string;
  maxTags?: number;
  suggestions?: string[];
  allowCustom?: boolean;
}

export function TagInputField({
  name,
  label,
  error,
  success,
  info,
  required,
  disabled,
  className,
  description,
  control,
  placeholder = 'Add tags...',
  maxTags = 10,
  suggestions = [],
  allowCustom = true,
}: TagInputFieldProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { field } = useController({
    name,
    control,
    defaultValue: [],
    rules: {
      required: required ? `${label || name} is required` : false,
      validate: (tags: string[]) => {
        if (tags.length > maxTags) {
          return `Maximum ${maxTags} tags allowed`;
        }
        return true;
      },
    },
  });

  const tags: string[] = field.value || [];

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      field.onChange([...tags, trimmedTag]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    field.onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (allowCustom) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(suggestion.toLowerCase())
  );

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <div className="relative">
        <div
          className={cn(
            'min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
            'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
            error && 'border-red-500 focus-within:ring-red-500/20',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <div className="flex flex-wrap gap-1 mb-1">
            <AnimatePresence>
              {tags.map((tag) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-500 transition-colors"
                      disabled={disabled}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={tags.length === 0 ? placeholder : ''}
            disabled={disabled || tags.length >= maxTags}
            className="w-full bg-transparent border-0 outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {showSuggestions && filteredSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-40 overflow-y-auto"
            >
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addTag(suggestion)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {tags.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {tags.length}/{maxTags} tags
        </p>
      )}

      <FormError error={error} />
      {success && <FormSuccess message={success} />}
      {info && !error && !success && (
        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <Info className="w-4 h-4" />
          <span>{info}</span>
        </div>
      )}
    </div>
  );
}
