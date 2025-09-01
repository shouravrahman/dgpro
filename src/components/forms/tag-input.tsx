'use client';

/**
 * Tag Input Component
 * Interactive tag input with suggestions and validation
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  suggestions?: string[];
  allowCustom?: boolean;
  validateTag?: (tag: string) => boolean;
  className?: string;
}

export function TagInput({
  value = [],
  onChange,
  placeholder = 'Add tags...',
  maxTags = 10,
  suggestions = [],
  allowCustom = true,
  validateTag,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on input and existing tags
  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(suggestion)
  );

  // Common tag suggestions for digital products
  const defaultSuggestions = [
    'digital-download',
    'template',
    'design',
    'business',
    'creative',
    'productivity',
    'marketing',
    'education',
    'software',
    'graphics',
    'presentation',
    'document',
    'spreadsheet',
    'ebook',
    'course',
    'tutorial',
    'guide',
    'tool',
    'app',
    'website',
    'mobile',
    'desktop',
    'premium',
    'professional',
    'modern',
    'minimalist',
    'colorful',
    'responsive',
    'customizable',
    'easy-to-use',
    'beginner-friendly',
  ];

  const allSuggestions = [...suggestions, ...defaultSuggestions].filter(
    (suggestion, index, arr) => arr.indexOf(suggestion) === index
  );

  const currentSuggestions = inputValue
    ? allSuggestions.filter(
        (suggestion) =>
          suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
          !value.includes(suggestion)
      )
    : allSuggestions
        .filter((suggestion) => !value.includes(suggestion))
        .slice(0, 8);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();

    if (!trimmedTag) return;
    if (value.includes(trimmedTag)) return;
    if (value.length >= maxTags) return;
    if (validateTag && !validateTag(trimmedTag)) return;

    onChange([...value, trimmedTag]);
    setInputValue('');
    setShowSuggestions(false);
    setFocusedSuggestionIndex(-1);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (
          focusedSuggestionIndex >= 0 &&
          currentSuggestions[focusedSuggestionIndex]
        ) {
          addTag(currentSuggestions[focusedSuggestionIndex]);
        } else if (inputValue && allowCustom) {
          addTag(inputValue);
        }
        break;

      case 'Backspace':
        if (!inputValue && value.length > 0) {
          removeTag(value[value.length - 1]);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        setFocusedSuggestionIndex((prev) =>
          prev < currentSuggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setFocusedSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : currentSuggestions.length - 1
        );
        break;

      case 'Escape':
        setShowSuggestions(false);
        setFocusedSuggestionIndex(-1);
        break;

      case 'Tab':
        if (showSuggestions && focusedSuggestionIndex >= 0) {
          e.preventDefault();
          addTag(currentSuggestions[focusedSuggestionIndex]);
        }
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);
    setFocusedSuggestionIndex(-1);

    // Auto-add tag on comma or semicolon
    if (newValue.includes(',') || newValue.includes(';')) {
      const tags = newValue
        .split(/[,;]/)
        .map((tag) => tag.trim())
        .filter(Boolean);
      tags.forEach((tag) => {
        if (allowCustom) addTag(tag);
      });
      setInputValue('');
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Tags and Input */}
      <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[42px] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <AnimatePresence>
          {value.map((tag) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Badge
                variant="secondary"
                className="flex items-center gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
              >
                <Hash className="w-3 h-3" />
                {tag}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeTag(tag)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            </motion.div>
          ))}
        </AnimatePresence>

        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={value.length === 0 ? placeholder : ''}
          disabled={value.length >= maxTags}
          className="border-0 shadow-none focus-visible:ring-0 flex-1 min-w-[120px] h-6 p-0"
        />

        {allowCustom && inputValue && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => addTag(inputValue)}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add "{inputValue}"
          </Button>
        )}
      </div>

      {/* Tag counter */}
      <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
        <span>
          {value.length}/{maxTags} tags
        </span>
        {allowCustom && (
          <span>
            Press Enter or comma to add • Use Tab to select suggestion
          </span>
        )}
      </div>

      {/* Suggestions */}
      <AnimatePresence>
        {showSuggestions && currentSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-50 mt-1"
          >
            <Card className="shadow-lg">
              <CardContent className="p-2">
                <div className="text-xs text-muted-foreground mb-2 px-2">
                  Suggestions
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {currentSuggestions.map((suggestion, index) => (
                    <Button
                      key={suggestion}
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start text-left h-8 ${
                        index === focusedSuggestionIndex ? 'bg-accent' : ''
                      }`}
                      onClick={() => addTag(suggestion)}
                      onMouseEnter={() => setFocusedSuggestionIndex(index)}
                    >
                      <Hash className="w-3 h-3 mr-2" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
