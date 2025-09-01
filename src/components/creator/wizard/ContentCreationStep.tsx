'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FileUploadZone } from '@/components/ui/file-upload-zone';
import { PDFEditor } from './editors/PDFEditor';
import { ImageEditor } from './editors/ImageEditor';
import { TextEditor } from './editors/TextEditor';
import { AIContentGenerator } from './editors/AIContentGenerator';
import {
  Upload,
  FileText,
  Image,
  Type,
  Sparkles,
  Eye,
  Download,
  Trash2,
  Edit,
  Wand2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ContentCreationStepProps {
  productType: 'pdf' | 'image' | 'text';
  productData: any;
  updateProductData: (updates: any) => void;
  canProceed: boolean;
}

interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

const MAX_FILE_SIZES = {
  pdf: 50 * 1024 * 1024, // 50MB
  image: 10 * 1024 * 1024, // 10MB
  text: 5 * 1024 * 1024, // 5MB
};

const ACCEPTED_TYPES = {
  pdf: {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
      '.docx',
    ],
  },
  image: {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/svg+xml': ['.svg'],
    'image/webp': ['.webp'],
    'application/zip': ['.zip'], // For image packs
  },
  text: {
    'text/plain': ['.txt'],
    'text/markdown': ['.md'],
    'application/json': ['.json'],
    'text/csv': ['.csv'],
  },
};

export function ContentCreationStep({
  productType,
  productData,
  updateProductData,
  canProceed,
}: ContentCreationStepProps) {
  const [activeTab, setActiveTab] = useState('upload');
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    async (files: File[]) => {
      const validFiles: FileWithPreview[] = [];
      const maxSize = MAX_FILE_SIZES[productType];

      for (const file of files) {
        // Validate file size
        if (file.size > maxSize) {
          toast.error(
            `File ${file.name} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`
          );
          continue;
        }

        // Validate file type
        const acceptedTypes = ACCEPTED_TYPES[productType];
        const isValidType = Object.keys(acceptedTypes).some(
          (type) =>
            file.type === type || file.type.startsWith(type.split('/')[0])
        );

        if (!isValidType) {
          toast.error(`File ${file.name} is not a supported format`);
          continue;
        }

        // Create preview for images
        let preview: string | undefined;
        if (file.type.startsWith('image/')) {
          preview = URL.createObjectURL(file);
        }

        validFiles.push({
          ...file,
          id: `${Date.now()}-${Math.random()}`,
          preview,
        });
      }

      if (validFiles.length > 0) {
        // Simulate upload progress
        setUploadProgress(0);
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              return 100;
            }
            return prev + 10;
          });
        }, 100);

        updateProductData({
          content: {
            ...productData.content,
            files: [...productData.content.files, ...validFiles],
          },
        });

        toast.success(`${validFiles.length} file(s) uploaded successfully`);
      }
    },
    [productType, productData.content, updateProductData]
  );

  const handleRemoveFile = useCallback(
    (fileId: string) => {
      const updatedFiles = productData.content.files.filter(
        (file: FileWithPreview) => file.id !== fileId
      );
      updateProductData({
        content: {
          ...productData.content,
          files: updatedFiles,
        },
      });
    },
    [productData.content, updateProductData]
  );

  const handleAIGenerate = useCallback(
    async (prompt: string, options: any) => {
      setIsGenerating(true);
      try {
        const response = await fetch('/api/ai/generate-content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: productType,
            prompt,
            options,
            productInfo: {
              title: productData.title,
              description: productData.description,
              category: productData.category,
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate content');
        }

        const result = await response.json();

        updateProductData({
          content: {
            ...productData.content,
            instructions: prompt,
            aiGenerated: true,
            preview: result.preview,
          },
        });

        toast.success('Content generated successfully!');
        setActiveTab('preview');
      } catch (error) {
        console.error('AI generation error:', error);
        toast.error('Failed to generate content. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    },
    [productType, productData, updateProductData]
  );

  const renderEditor = () => {
    switch (productType) {
      case 'pdf':
        return (
          <PDFEditor
            files={productData.content.files}
            onFilesChange={(files) =>
              updateProductData({
                content: { ...productData.content, files },
              })
            }
            onPreviewChange={(preview) =>
              updateProductData({
                content: { ...productData.content, preview },
              })
            }
          />
        );
      case 'image':
        return (
          <ImageEditor
            files={productData.content.files}
            onFilesChange={(files) =>
              updateProductData({
                content: { ...productData.content, files },
              })
            }
            onPreviewChange={(preview) =>
              updateProductData({
                content: { ...productData.content, preview },
              })
            }
          />
        );
      case 'text':
        return (
          <TextEditor
            content={productData.content.instructions || ''}
            onChange={(content) =>
              updateProductData({
                content: { ...productData.content, instructions: content },
              })
            }
            onPreviewChange={(preview) =>
              updateProductData({
                content: { ...productData.content, preview },
              })
            }
          />
        );
      default:
        return null;
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'upload':
        return Upload;
      case 'ai':
        return Sparkles;
      case 'edit':
        return Edit;
      case 'preview':
        return Eye;
      default:
        return FileText;
    }
  };

  return (
    <div className="space-y-6">
      {/* Content Creation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {['upload', 'ai', 'edit', 'preview'].map((tab) => {
            const Icon = getTabIcon(tab);
            return (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FileUploadZone
                  onFilesSelected={handleFileUpload}
                  acceptedTypes={ACCEPTED_TYPES[productType]}
                  maxSize={MAX_FILE_SIZES[productType]}
                  multiple={productType === 'image'}
                  className="min-h-[200px]"
                />

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-4">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Uploaded Files */}
            {productData.content.files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>
                      Uploaded Files ({productData.content.files.length})
                    </span>
                    <Badge variant="outline">
                      {(
                        productData.content.files.reduce(
                          (acc: number, file: File) => acc + file.size,
                          0
                        ) /
                        (1024 * 1024)
                      ).toFixed(1)}{' '}
                      MB
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {productData.content.files.map((file: FileWithPreview) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="border rounded-lg p-3 space-y-2"
                      >
                        {file.preview && (
                          <div className="aspect-video bg-muted rounded overflow-hidden">
                            <img
                              src={file.preview}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="space-y-1">
                          <p className="text-sm font-medium truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / (1024 * 1024)).toFixed(1)} MB
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveTab('edit')}
                            className="flex-1"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveFile(file.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </TabsContent>

        {/* AI Generation Tab */}
        <TabsContent value="ai" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AIContentGenerator
              productType={productType}
              productData={productData}
              onGenerate={handleAIGenerate}
              isGenerating={isGenerating}
            />
          </motion.div>
        </TabsContent>

        {/* Edit Tab */}
        <TabsContent value="edit" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {renderEditor()}
          </motion.div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Content Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {productData.content.preview ? (
                  <div className="space-y-4">
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: productData.content.preview,
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={productData.content.aiGenerated || false}
                        onCheckedChange={(checked) =>
                          updateProductData({
                            content: {
                              ...productData.content,
                              aiGenerated: checked,
                            },
                          })
                        }
                      />
                      <Label className="text-sm">
                        This content was generated using AI
                      </Label>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No preview available yet</p>
                    <p className="text-sm">
                      Upload files or generate content to see a preview
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Content Status */}
      <Card
        className={cn(
          'border-2',
          canProceed
            ? 'border-green-200 bg-green-50 dark:bg-green-950/20'
            : 'border-orange-200 bg-orange-50 dark:bg-orange-950/20'
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {canProceed ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-600" />
            )}
            <div>
              <p
                className={cn(
                  'font-medium',
                  canProceed
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-orange-900 dark:text-orange-100'
                )}
              >
                {canProceed ? 'Content Ready' : 'Content Required'}
              </p>
              <p
                className={cn(
                  'text-sm',
                  canProceed
                    ? 'text-green-700 dark:text-green-200'
                    : 'text-orange-700 dark:text-orange-200'
                )}
              >
                {canProceed
                  ? `You have ${productData.content.files.length} file(s) ready for your product`
                  : 'Please upload files or generate content to continue'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
