'use client';

/**
 * Dynamic Form Component
 * Generates forms based on category requirements and templates
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp, Info, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  FormGenerator,
  GeneratedForm,
  FormSection,
} from '@/lib/categories/form-generator';
import { FormField, ConditionalLogic } from '@/lib/categories/types';

interface DynamicFormProps {
  categoryId: string;
  templateId?: string;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onSave?: (data: Record<string, any>) => void;
  className?: string;
}

interface FileUpload {
  file: File;
  preview?: string;
  type: string;
}

export function DynamicForm({
  categoryId,
  templateId,
  initialData = {},
  onSubmit,
  onSave,
  className = '',
}: DynamicFormProps) {
  const [formConfig, setFormConfig] = useState<GeneratedForm | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set()
  );
  const [uploadedFiles, setUploadedFiles] = useState<
    Record<string, FileUpload[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate form configuration
  useEffect(() => {
    try {
      const config = FormGenerator.generateForm(categoryId, templateId);
      setFormConfig(config);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate form');
      setLoading(false);
    }
  }, [categoryId, templateId]);

  // Initialize form with react-hook-form
  const form = useForm({
    resolver: formConfig ? zodResolver(formConfig.schema) : undefined,
    defaultValues: initialData,
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = form;
  const watchedValues = watch();

  // Auto-save functionality
  useEffect(() => {
    if (onSave && Object.keys(watchedValues).length > 0) {
      const timeoutId = setTimeout(() => {
        onSave(watchedValues);
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [watchedValues, onSave]);

  // Check field visibility based on conditional logic
  const isFieldVisible = (field: FormField): boolean => {
    if (!field.conditional) return true;

    return FormGenerator.evaluateConditional(field.conditional, watchedValues);
  };

  // Handle section collapse/expand
  const toggleSection = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  // Handle file uploads
  const handleFileUpload = (fieldName: string, files: FileList | null) => {
    if (!files) return;

    const newFiles: FileUpload[] = [];
    Array.from(files).forEach((file) => {
      const fileUpload: FileUpload = {
        file,
        type: file.type,
      };

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileUpload.preview = e.target?.result as string;
          setUploadedFiles((prev) => ({
            ...prev,
            [fieldName]: [...(prev[fieldName] || []), fileUpload],
          }));
        };
        reader.readAsDataURL(file);
      } else {
        newFiles.push(fileUpload);
      }
    });

    if (newFiles.length > 0) {
      setUploadedFiles((prev) => ({
        ...prev,
        [fieldName]: [...(prev[fieldName] || []), ...newFiles],
      }));
    }

    // Update form value
    setValue(fieldName, [...(uploadedFiles[fieldName] || []), ...newFiles]);
  };

  // Remove uploaded file
  const removeFile = (fieldName: string, index: number) => {
    const updatedFiles =
      uploadedFiles[fieldName]?.filter((_, i) => i !== index) || [];
    setUploadedFiles((prev) => ({
      ...prev,
      [fieldName]: updatedFiles,
    }));
    setValue(fieldName, updatedFiles);
  };

  // Render form field based on type
  const renderField = (field: FormField) => {
    if (!isFieldVisible(field)) return null;

    const fieldError = errors[field.name];
    const fieldConfig = formConfig?.fields.find((f) => f.id === field.id);

    return (
      <div key={field.id} className="space-y-2">
        <div className="flex items-center gap-2">
          <Label
            htmlFor={field.name}
            className={field.validation.required ? 'required' : ''}
          >
            {field.label}
            {field.validation.required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </Label>
          {field.description && (
            <div className="group relative">
              <Info className="h-4 w-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                {field.description}
              </div>
            </div>
          )}
        </div>

        <Controller
          name={field.name}
          control={control}
          render={({ field: formField }) => {
            switch (field.type) {
              case 'text':
              case 'email':
              case 'url':
                return (
                  <Input
                    {...formField}
                    type={field.type}
                    placeholder={field.placeholder}
                    className={fieldError ? 'border-red-500' : ''}
                  />
                );

              case 'textarea':
                return (
                  <Textarea
                    {...formField}
                    placeholder={field.placeholder}
                    rows={4}
                    className={fieldError ? 'border-red-500' : ''}
                  />
                );

              case 'number':
                return (
                  <Input
                    {...formField}
                    type="number"
                    placeholder={field.placeholder}
                    min={field.validation.min}
                    max={field.validation.max}
                    className={fieldError ? 'border-red-500' : ''}
                  />
                );

              case 'select':
                return (
                  <select
                    {...formField}
                    className={`w-full px-3 py-2 border rounded-md ${
                      fieldError ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select an option...</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                );

              case 'multiselect':
                return (
                  <div className="space-y-2">
                    {field.options?.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`${field.name}-${option.value}`}
                          checked={
                            formField.value?.includes(option.value) || false
                          }
                          onCheckedChange={(checked) => {
                            const currentValues = formField.value || [];
                            if (checked) {
                              formField.onChange([
                                ...currentValues,
                                option.value,
                              ]);
                            } else {
                              formField.onChange(
                                currentValues.filter(
                                  (v: string) => v !== option.value
                                )
                              );
                            }
                          }}
                        />
                        <Label htmlFor={`${field.name}-${option.value}`}>
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                );

              case 'boolean':
                return (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={field.name}
                      checked={formField.value || false}
                      onCheckedChange={formField.onChange}
                    />
                    <Label htmlFor={field.name}>{field.label}</Label>
                  </div>
                );

              case 'file':
                return (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Drop files here or click to browse
                      </p>
                      <input
                        type="file"
                        multiple
                        accept={fieldConfig?.props.accept}
                        onChange={(e) =>
                          handleFileUpload(field.name, e.target.files)
                        }
                        className="hidden"
                        id={`file-${field.name}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById(`file-${field.name}`)?.click()
                        }
                      >
                        Choose Files
                      </Button>
                    </div>

                    {/* Display uploaded files */}
                    {uploadedFiles[field.name]?.length > 0 && (
                      <div className="space-y-2">
                        {uploadedFiles[field.name].map((fileUpload, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {fileUpload.preview && (
                                <img
                                  src={fileUpload.preview}
                                  alt="Preview"
                                  className="h-10 w-10 object-cover rounded"
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium">
                                  {fileUpload.file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(fileUpload.file.size / 1024 / 1024).toFixed(
                                    2
                                  )}{' '}
                                  MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(field.name, index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );

              default:
                return (
                  <Input
                    {...formField}
                    placeholder={field.placeholder}
                    className={fieldError ? 'border-red-500' : ''}
                  />
                );
            }
          }}
        />

        {fieldError && (
          <p className="text-sm text-red-500">{fieldError.message}</p>
        )}
      </div>
    );
  };

  // Render form section
  const renderSection = (section: FormSection) => {
    const isCollapsed = collapsedSections.has(section.id);
    const sectionFields =
      formConfig?.fields.filter((field) => section.fields.includes(field.id)) ||
      [];

    return (
      <Card key={section.id} className="mb-6">
        <CardHeader
          className={`cursor-pointer ${section.collapsible ? 'hover:bg-gray-50' : ''}`}
          onClick={
            section.collapsible ? () => toggleSection(section.id) : undefined
          }
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {section.title}
                {section.required && (
                  <Badge variant="secondary">Required</Badge>
                )}
              </CardTitle>
              {section.description && (
                <CardDescription>{section.description}</CardDescription>
              )}
            </div>
            {section.collapsible && (
              <Button variant="ghost" size="sm">
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </CardHeader>

        {(!section.collapsible || !isCollapsed) && (
          <CardContent className="space-y-6">
            {sectionFields.map((field) => renderField(field))}
          </CardContent>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-red-500 mb-4">
          <X className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Form Generation Error
        </h3>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (!formConfig) {
    return null;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-6 ${className}`}
    >
      {formConfig.sections.map(renderSection)}

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="text-sm text-gray-500">
          {onSave && 'Changes are automatically saved'}
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline">
            Save Draft
          </Button>
          <Button type="submit" disabled={!isValid}>
            Create Product
          </Button>
        </div>
      </div>
    </form>
  );
}
