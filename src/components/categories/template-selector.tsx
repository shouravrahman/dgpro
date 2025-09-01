'use client';

/**
 * Template Selector Component
 * Displays and allows selection of category-specific templates
 */

import React, { useState, useMemo } from 'react';
import { Star, Eye, Download, Zap, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CategoryTemplate } from '@/lib/categories/types';
import { getCategoryById } from '@/lib/categories/definitions';

interface TemplateSelectorProps {
  categoryId: string;
  selectedTemplate?: string;
  onTemplateSelect: (templateId: string | null) => void;
  showPreview?: boolean;
  className?: string;
}

interface TemplatePreviewProps {
  template: CategoryTemplate;
  categoryName: string;
}

function TemplatePreview({ template, categoryName }: TemplatePreviewProps) {
  return (
    <div className="space-y-6">
      {/* Template Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">{template.name}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {template.description}
        </p>
        <Badge variant="outline" className="mb-4">
          {categoryName}
        </Badge>
      </div>

      {/* Template Preview Image */}
      <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        {template.preview ? (
          <img
            src={template.preview}
            alt={`${template.name} preview`}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="text-center">
            <Eye className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">Preview not available</p>
          </div>
        )}
      </div>

      {/* Template Structure */}
      <div className="space-y-4">
        <h4 className="font-semibold">Template Structure</h4>
        <div className="grid gap-3">
          {template.structure.sections.map((section, index) => (
            <div
              key={section.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div>
                <p className="font-medium">{section.name}</p>
                <p className="text-sm text-gray-500 capitalize">
                  {section.type}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={section.required ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {section.required ? 'Required' : 'Optional'}
                </Badge>
                <span className="text-xs text-gray-400">#{section.order}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Default Values */}
      {Object.keys(template.defaultValues).length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold">Pre-filled Values</h4>
          <div className="grid gap-2">
            {Object.entries(template.defaultValues).map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
              >
                <span className="text-sm font-medium capitalize">
                  {key.replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {Array.isArray(value) ? value.join(', ') : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template Features */}
      <div className="space-y-4">
        <h4 className="font-semibold">Features</h4>
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-500" />
            <span className="text-sm">
              Quick setup with pre-configured sections
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">Professional design and layout</span>
          </div>
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-green-500" />
            <span className="text-sm">Ready-to-use default values</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TemplateSelector({
  categoryId,
  selectedTemplate,
  onTemplateSelect,
  showPreview = true,
  className = '',
}: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] =
    useState<CategoryTemplate | null>(null);

  const category = getCategoryById(categoryId);
  const templates = category?.templates || [];

  // Filter templates based on search
  const filteredTemplates = useMemo(() => {
    if (!searchQuery) return templates;

    const query = searchQuery.toLowerCase();
    return templates.filter(
      (template) =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query)
    );
  }, [templates, searchQuery]);

  // Sort templates - popular first, then alphabetical
  const sortedTemplates = useMemo(() => {
    return [...filteredTemplates].sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [filteredTemplates]);

  const handleTemplateSelect = (templateId: string) => {
    if (selectedTemplate === templateId) {
      onTemplateSelect(null); // Deselect if already selected
    } else {
      onTemplateSelect(templateId);
    }
  };

  if (!category) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">Category not found</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Choose a Template</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start with a pre-designed template or create from scratch
          </p>
        </div>

        {templates.length > 3 && (
          <div className="w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          </div>
        )}
      </div>

      {/* Template Options */}
      <div className="grid gap-4">
        {/* Start from Scratch Option */}
        <Card
          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
            selectedTemplate === null
              ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950'
              : 'hover:shadow-lg'
          }`}
          onClick={() => onTemplateSelect(null)}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Start from Scratch
                </CardTitle>
                <CardDescription>
                  Create your product with a blank form tailored to{' '}
                  {category.name}
                </CardDescription>
              </div>
              <Badge variant="outline">Custom</Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Template Cards */}
        {sortedTemplates.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {sortedTemplates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedTemplate === template.id
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {template.name}
                        {template.isPopular && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {template.description}
                      </CardDescription>
                    </div>

                    {showPreview && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewTemplate(template);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Template Preview</DialogTitle>
                            <DialogDescription>
                              Preview the structure and features of this
                              template
                            </DialogDescription>
                          </DialogHeader>
                          {previewTemplate && (
                            <TemplatePreview
                              template={previewTemplate}
                              categoryName={category.name}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Template Preview Image */}
                  {template.preview && (
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 overflow-hidden">
                      <img
                        src={template.preview}
                        alt={`${template.name} preview`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Template Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{template.structure.sections.length} sections</span>
                    <span>
                      {Object.keys(template.defaultValues).length} pre-filled
                      fields
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No templates found
            </h4>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'No templates available for this category yet'}
            </p>
          </div>
        )}
      </div>

      {/* Selected Template Info */}
      {selectedTemplate && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900 dark:text-blue-100">
              Template Selected
            </span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {selectedTemplate === null
              ? "You'll start with a blank form customized for this category."
              : `Using "${sortedTemplates.find((t) => t.id === selectedTemplate)?.name}" template with pre-configured sections and default values.`}
          </p>
        </div>
      )}
    </div>
  );
}
