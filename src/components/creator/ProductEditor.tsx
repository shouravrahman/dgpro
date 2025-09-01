'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Eye, Upload, X } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploadZone } from '@/components/ui/file-upload-zone';
import { TextEditor } from './wizard/editors/TextEditor';
import { ImageEditor } from './wizard/editors/ImageEditor';
import { PDFEditor } from './wizard/editors/PDFEditor';
import { ProductPreview } from './ProductPreview';
import { useCreator } from '@/hooks/useCreator';
import { toast } from 'sonner';
import type { SimpleProduct as Product } from '@/types/creator';

interface ProductEditorProps {
  product: Product;
  onClose: () => void;
  onSave: () => void;
}

export function ProductEditor({
  product,
  onClose,
  onSave,
}: ProductEditorProps) {
  const [formData, setFormData] = useState({
    title: product.title,
    description: product.description,
    price: product.price,
    category: product.category,
    tags: product.tags?.join(', ') || '',
    status: product.status,
    featured: product.featured || false,
    allowComments: product.allowComments ?? true,
    downloadLimit: product.downloadLimit || 0,
    licenseType: product.licenseType || 'standard',
  });

  const [files, setFiles] = useState(product.files || []);
  const [thumbnail, setThumbnail] = useState(product.thumbnail);
  const [showPreview, setShowPreview] = useState(false);
  const [activeEditor, setActiveEditor] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { updateProduct, uploadFile } = useCreator();

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (uploadedFiles: File[]) => {
    try {
      const newFiles = [];
      for (const file of uploadedFiles) {
        const uploadedFile = await uploadFile(file);
        newFiles.push(uploadedFile);
      }
      setFiles((prev) => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} file(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload files');
    }
  };

  const handleThumbnailUpload = async (file: File) => {
    try {
      const uploadedFile = await uploadFile(file);
      setThumbnail(uploadedFile.url);
      toast.success('Thumbnail updated');
    } catch (error) {
      toast.error('Failed to upload thumbnail');
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedProduct = {
        ...product,
        ...formData,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        files,
        thumbnail,
      };

      await updateProduct(product.id, updatedProduct);
      toast.success('Product updated successfully');
      onSave();
    } catch (error) {
      toast.error('Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };

  const previewProduct = {
    ...product,
    ...formData,
    tags: formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    files,
    thumbnail,
  };

  if (showPreview) {
    return (
      <ProductPreview
        product={previewProduct}
        onClose={() => setShowPreview(false)}
        onEdit={() => setShowPreview(false)}
      />
    );
  }

  if (activeEditor) {
    const file = files.find((f) => f.id === activeEditor);
    if (!file) return null;

    const EditorComponent = file.type.startsWith('image/')
      ? ImageEditor
      : file.type === 'application/pdf'
        ? PDFEditor
        : TextEditor;

    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Button variant="ghost" onClick={() => setActiveEditor(null)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Editor
            </Button>
            <h1 className="text-lg font-semibold">Editing: {file.name}</h1>
            <div className="w-20" />
          </div>
        </div>
        <EditorComponent
          file={file}
          onSave={(updatedFile) => {
            setFiles((prev) =>
              prev.map((f) => (f.id === activeEditor ? updatedFile : f))
            );
            setActiveEditor(null);
          }}
          onCancel={() => setActiveEditor(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" onClick={onClose}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
          <h1 className="text-lg font-semibold">Edit Product</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="files">Files & Content</TabsTrigger>
            <TabsTrigger value="pricing">Pricing & Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>
                  Basic details about your product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter product title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange('description', e.target.value)
                    }
                    placeholder="Describe your product"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleInputChange('category', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ebook">E-book</SelectItem>
                        <SelectItem value="template">Template</SelectItem>
                        <SelectItem value="course">Course</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="graphics">Graphics</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleInputChange('status', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="Enter tags separated by commas"
                  />
                  <p className="text-sm text-muted-foreground">
                    Separate tags with commas to help customers find your
                    product
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Thumbnail */}
            <Card>
              <CardHeader>
                <CardTitle>Product Thumbnail</CardTitle>
                <CardDescription>
                  Upload an image to represent your product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {thumbnail && (
                    <div className="relative w-full max-w-md">
                      <img
                        src={thumbnail}
                        alt="Product thumbnail"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setThumbnail(undefined)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <FileUploadZone
                    onFilesSelected={(files) => {
                      if (files[0]) handleThumbnailUpload(files[0]);
                    }}
                    accept="image/*"
                    maxFiles={1}
                    className="max-w-md"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Files</CardTitle>
                <CardDescription>
                  Upload and manage the files customers will receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileUploadZone onFilesSelected={handleFileUpload} multiple />

                {files.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Uploaded Files</h4>
                    <div className="space-y-2">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {file.name.split('.').pop()?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {(file.type.startsWith('text/') ||
                              file.type.startsWith('image/') ||
                              file.type === 'application/pdf') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setActiveEditor(file.id)}
                              >
                                Edit
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveFile(file.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
                <CardDescription>
                  Set your product price and licensing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      handleInputChange(
                        'price',
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseType">License Type</Label>
                  <Select
                    value={formData.licenseType}
                    onValueChange={(value) =>
                      handleInputChange('licenseType', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard License</SelectItem>
                      <SelectItem value="extended">Extended License</SelectItem>
                      <SelectItem value="exclusive">
                        Exclusive License
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="downloadLimit">Download Limit</Label>
                  <Input
                    id="downloadLimit"
                    type="number"
                    min="0"
                    value={formData.downloadLimit}
                    onChange={(e) =>
                      handleInputChange(
                        'downloadLimit',
                        parseInt(e.target.value) || 0
                      )
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    0 = unlimited downloads
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Settings</CardTitle>
                <CardDescription>
                  Configure additional product options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Featured Product</Label>
                    <p className="text-sm text-muted-foreground">
                      Show this product in featured sections
                    </p>
                  </div>
                  <Switch
                    checked={formData.featured}
                    onCheckedChange={(checked) =>
                      handleInputChange('featured', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Comments</Label>
                    <p className="text-sm text-muted-foreground">
                      Let customers leave reviews and comments
                    </p>
                  </div>
                  <Switch
                    checked={formData.allowComments}
                    onCheckedChange={(checked) =>
                      handleInputChange('allowComments', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
