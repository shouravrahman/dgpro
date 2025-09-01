'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Link,
  Eye,
  Download,
  Save,
  Undo,
  Redo,
  Search,
  Replace,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onPreviewChange: (preview: string) => void;
}

interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  alignment: 'left' | 'center' | 'right';
}

export function TextEditor({
  content,
  onChange,
  onPreviewChange,
}: TextEditorProps) {
  const [activeTab, setActiveTab] = useState('write');
  const [formatState, setFormatState] = useState<FormatState>({
    bold: false,
    italic: false,
    underline: false,
    alignment: 'left',
  });
  const [fontSize, setFontSize] = useState('16');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const words = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    const chars = content.length;
    setWordCount(words);
    setCharCount(chars);
  }, [content]);

  const handleContentChange = useCallback(
    (value: string) => {
      onChange(value);

      // Generate preview HTML
      const previewHTML = `
      <div class="text-content" style="
        font-family: ${fontFamily}, sans-serif;
        font-size: ${fontSize}px;
        line-height: 1.6;
        text-align: ${formatState.alignment};
      ">
        ${value
          .split('\n\n')
          .map(
            (paragraph) =>
              `<p style="margin-bottom: 1em;">${paragraph.replace(/\n/g, '<br>')}</p>`
          )
          .join('')}
      </div>
    `;
      onPreviewChange(previewHTML);
    },
    [onChange, onPreviewChange, fontFamily, fontSize, formatState.alignment]
  );

  const insertText = useCallback(
    (before: string, after: string = '') => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      const newText =
        content.substring(0, start) +
        before +
        selectedText +
        after +
        content.substring(end);

      handleContentChange(newText);

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, end + before.length);
      }, 0);
    },
    [content, handleContentChange]
  );

  const formatText = useCallback(
    (format: keyof FormatState) => {
      if (format === 'alignment') return;

      const formatMap = {
        bold: ['**', '**'],
        italic: ['*', '*'],
        underline: ['<u>', '</u>'],
      };

      const [before, after] = formatMap[format];
      insertText(before, after);

      setFormatState((prev) => ({
        ...prev,
        [format]: !prev[format],
      }));
    },
    [insertText]
  );

  const insertElement = useCallback(
    (element: string) => {
      const elements = {
        heading1: '# ',
        heading2: '## ',
        heading3: '### ',
        bulletList: '• ',
        numberedList: '1. ',
        quote: '> ',
        link: '[Link Text](https://example.com)',
        divider: '\n---\n',
      };

      insertText(elements[element as keyof typeof elements] || '');
    },
    [insertText]
  );

  const templates = [
    {
      name: 'Blog Post',
      content: `# Blog Post Title

## Introduction
Write your engaging introduction here...

## Main Content
Your main content goes here. Break it into sections for better readability.

### Subsection
Add subsections as needed.

## Conclusion
Wrap up your post with a strong conclusion.

---
*Published on ${new Date().toLocaleDateString()}*`,
    },
    {
      name: 'Article',
      content: `# Article Title

**Summary:** Brief summary of the article content.

## Overview
Provide an overview of the topic...

## Key Points
• Point one
• Point two  
• Point three

## Detailed Analysis
Go into detail about your topic...

## References
1. Reference one
2. Reference two`,
    },
    {
      name: 'Guide',
      content: `# Step-by-Step Guide

## What You'll Learn
By the end of this guide, you'll be able to...

## Prerequisites
Before starting, make sure you have:
• Requirement one
• Requirement two

## Step 1: Getting Started
Detailed instructions for step one...

## Step 2: Next Steps
Continue with step two...

## Troubleshooting
Common issues and solutions:

**Problem:** Issue description
**Solution:** How to fix it

## Conclusion
Summary of what was accomplished...`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Editor Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
              <span>~{Math.ceil(wordCount / 200)} min read</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <Type className="w-3 h-3 mr-1" />
                Text Content
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="format">Format</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="space-y-4">
          {/* Toolbar */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-1 flex-wrap">
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant={formatState.bold ? 'default' : 'outline'}
                    onClick={() => formatText('bold')}
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={formatState.italic ? 'default' : 'outline'}
                    onClick={() => formatText('italic')}
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={formatState.underline ? 'default' : 'outline'}
                    onClick={() => formatText('underline')}
                  >
                    <Underline className="w-4 h-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6" />

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => insertElement('heading1')}
                  >
                    H1
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => insertElement('heading2')}
                  >
                    H2
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => insertElement('heading3')}
                  >
                    H3
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6" />

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => insertElement('bulletList')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => insertElement('numberedList')}
                  >
                    <ListOrdered className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => insertElement('quote')}
                  >
                    <Quote className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => insertElement('link')}
                  >
                    <Link className="w-4 h-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6" />

                <div className="flex items-center gap-1">
                  <Button size="sm" variant="outline">
                    <Undo className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Redo className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Text Editor */}
          <Card>
            <CardContent className="p-0">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Start writing your content here..."
                className="min-h-[400px] border-0 resize-none focus-visible:ring-0 text-base leading-relaxed"
                style={{
                  fontFamily: fontFamily,
                  fontSize: `${fontSize}px`,
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="format" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Font Family</label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                      <SelectItem value="Times New Roman">
                        Times New Roman
                      </SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Font Size</label>
                  <Select value={fontSize} onValueChange={setFontSize}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12px</SelectItem>
                      <SelectItem value="14">14px</SelectItem>
                      <SelectItem value="16">16px</SelectItem>
                      <SelectItem value="18">18px</SelectItem>
                      <SelectItem value="20">20px</SelectItem>
                      <SelectItem value="24">24px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Text Alignment</label>
                <div className="flex gap-1 mt-1">
                  {[
                    { value: 'left', icon: AlignLeft },
                    { value: 'center', icon: AlignCenter },
                    { value: 'right', icon: AlignRight },
                  ].map(({ value, icon: Icon }) => (
                    <Button
                      key={value}
                      size="sm"
                      variant={
                        formatState.alignment === value ? 'default' : 'outline'
                      }
                      onClick={() =>
                        setFormatState((prev) => ({
                          ...prev,
                          alignment: value as any,
                        }))
                      }
                    >
                      <Icon className="w-4 h-4" />
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <motion.div
                    key={template.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">{template.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {template.content.substring(0, 100)}...
                        </p>
                        <Button
                          size="sm"
                          onClick={() => handleContentChange(template.content)}
                          className="w-full"
                        >
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Search className="w-4 h-4 mr-2" />
            Find
          </Button>
          <Button variant="outline" size="sm">
            <Replace className="w-4 h-4 mr-2" />
            Replace
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
