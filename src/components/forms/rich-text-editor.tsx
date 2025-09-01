'use client';

/**
 * Rich Text Editor Component
 * Advanced rich text editor with formatting options
 */

import React, { useCallback, useMemo } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Link,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  toolbar?: string[];
  minHeight?: number;
  maxHeight?: number;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  error,
  toolbar = [
    'bold',
    'italic',
    'underline',
    'link',
    'bulletList',
    'orderedList',
    'blockquote',
    'code',
  ],
  minHeight = 200,
  maxHeight = 400,
}: RichTextEditorProps) {
  // For now, we'll use a simple textarea with markdown-like formatting
  // In a production app, you'd integrate with a proper rich text editor like TipTap or Quill

  const [isPreview, setIsPreview] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertText = useCallback(
    (before: string, after: string = '') => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);

      const newText =
        value.substring(0, start) +
        before +
        selectedText +
        after +
        value.substring(end);
      onChange(newText);

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + before.length,
          start + before.length + selectedText.length
        );
      }, 0);
    },
    [value, onChange]
  );

  const formatActions = useMemo(
    () => ({
      bold: () => insertText('**', '**'),
      italic: () => insertText('*', '*'),
      underline: () => insertText('<u>', '</u>'),
      link: () => {
        const url = prompt('Enter URL:');
        if (url) {
          insertText('[', `](${url})`);
        }
      },
      bulletList: () => insertText('\n- '),
      orderedList: () => insertText('\n1. '),
      blockquote: () => insertText('\n> '),
      code: () => insertText('`', '`'),
      codeBlock: () => insertText('\n```\n', '\n```\n'),
      heading1: () => insertText('\n# '),
      heading2: () => insertText('\n## '),
      heading3: () => insertText('\n### '),
    }),
    [insertText]
  );

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering for preview
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>'
      )
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^\- (.*$)/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li>$1. $2</li>')
      .replace(/\n/g, '<br>');
  };

  const toolbarButtons = [
    { id: 'bold', icon: Bold, label: 'Bold', shortcut: 'Ctrl+B' },
    { id: 'italic', icon: Italic, label: 'Italic', shortcut: 'Ctrl+I' },
    {
      id: 'underline',
      icon: Underline,
      label: 'Underline',
      shortcut: 'Ctrl+U',
    },
    { id: 'separator1', type: 'separator' },
    { id: 'link', icon: Link, label: 'Link', shortcut: 'Ctrl+K' },
    { id: 'separator2', type: 'separator' },
    { id: 'bulletList', icon: List, label: 'Bullet List' },
    { id: 'orderedList', icon: ListOrdered, label: 'Numbered List' },
    { id: 'blockquote', icon: Quote, label: 'Quote' },
    { id: 'code', icon: Code, label: 'Inline Code' },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          formatActions.bold();
          break;
        case 'i':
          e.preventDefault();
          formatActions.italic();
          break;
        case 'u':
          e.preventDefault();
          formatActions.underline();
          break;
        case 'k':
          e.preventDefault();
          formatActions.link();
          break;
      }
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
        {toolbarButtons.map((button) => {
          if (button.type === 'separator') {
            return (
              <Separator
                key={button.id}
                orientation="vertical"
                className="h-6"
              />
            );
          }

          if (!toolbar.includes(button.id)) {
            return null;
          }

          const Icon = button.icon;
          return (
            <Button
              key={button.id}
              variant="ghost"
              size="sm"
              onClick={() =>
                formatActions[button.id as keyof typeof formatActions]?.()
              }
              title={`${button.label} ${button.shortcut ? `(${button.shortcut})` : ''}`}
              className="h-8 w-8 p-0"
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
          className="text-xs"
        >
          {isPreview ? 'Edit' : 'Preview'}
        </Button>
      </div>

      {/* Editor/Preview */}
      <div className="relative">
        {isPreview ? (
          <div
            className="p-4 prose prose-sm max-w-none"
            style={{ minHeight, maxHeight }}
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(value || 'Nothing to preview...'),
            }}
          />
        ) : (
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`border-0 resize-none focus-visible:ring-0 ${error ? 'border-destructive' : ''}`}
            style={{ minHeight, maxHeight }}
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-2 border-t bg-muted/50 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Markdown supported</span>
          <span>{value.length} characters</span>
        </div>

        <div className="flex items-center gap-2">
          <span>**bold**</span>
          <span>*italic*</span>
          <span>[link](url)</span>
          <span>`code`</span>
        </div>
      </div>
    </div>
  );
}
