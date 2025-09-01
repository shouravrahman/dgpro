'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Eye,
  Download,
  Edit,
  Layout,
  Type,
  Image,
  Palette,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PDFEditorProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onPreviewChange: (preview: string) => void;
}

export function PDFEditor({
  files,
  onFilesChange,
  onPreviewChange,
}: PDFEditorProps) {
  const [activeTab, setActiveTab] = useState('layout');
  const [selectedPage, setSelectedPage] = useState(0);

  const handlePreviewUpdate = useCallback(() => {
    // Generate preview HTML for the PDF content
    const previewHTML = `
      <div class="pdf-preview">
        <div class="page">
          <h1>PDF Document Preview</h1>
          <p>This is a preview of your PDF content. The actual PDF will be generated with proper formatting.</p>
          <div class="content-sections">
            ${files
              .map(
                (file, index) => `
              <div class="file-section">
                <h3>File ${index + 1}: ${file.name}</h3>
                <p>Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;
    onPreviewChange(previewHTML);
  }, [files, onPreviewChange]);

  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No PDF Files</h3>
          <p className="text-muted-foreground mb-4">
            Upload PDF files to start editing
          </p>
          <Button onClick={() => setActiveTab('upload')}>Upload Files</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* File Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            PDF Files ({files.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'border rounded-lg p-4 cursor-pointer transition-all',
                  selectedPage === index
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                )}
                onClick={() => setSelectedPage(index)}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FileText className="w-8 h-8 text-primary" />
                    <Badge variant="outline">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </Badge>
                  </div>
                  <h4 className="font-medium text-sm truncate">{file.name}</h4>
                  <p className="text-xs text-muted-foreground">PDF Document</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Editor Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="design" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Design
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Page Layout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Single Column', 'Two Column', 'Three Column', 'Custom'].map(
                  (layout) => (
                    <Button
                      key={layout}
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center"
                    >
                      <Layout className="w-6 h-6 mb-2" />
                      <span className="text-xs">{layout}</span>
                    </Button>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Elements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: 'Text Block', icon: Type },
                  { name: 'Image', icon: Image },
                  { name: 'Table', icon: Layout },
                  { name: 'Chart', icon: Layout },
                  { name: 'Header', icon: Type },
                  { name: 'Footer', icon: Type },
                ].map((element) => (
                  <Button
                    key={element.name}
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center"
                  >
                    <element.icon className="w-5 h-5 mb-1" />
                    <span className="text-xs">{element.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Design Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Color Scheme</h4>
                  <div className="flex gap-2">
                    {[
                      '#3B82F6',
                      '#EF4444',
                      '#10B981',
                      '#F59E0B',
                      '#8B5CF6',
                    ].map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Typography</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['Arial', 'Times New Roman', 'Helvetica', 'Georgia'].map(
                      (font) => (
                        <Button key={font} variant="outline" size="sm">
                          {font}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>PDF Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Page Size</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {['A4', 'Letter', 'Legal'].map((size) => (
                      <Button key={size} variant="outline" size="sm">
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Quality</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {['Standard', 'High', 'Print'].map((quality) => (
                      <Button key={quality} variant="outline" size="sm">
                        {quality}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handlePreviewUpdate}>
          <Eye className="w-4 h-4 mr-2" />
          Update Preview
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button>
            <Edit className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
