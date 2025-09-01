'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, X, TrendingUp, Hash, Grid3X3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchSuggestion {
  type: 'product' | 'category' | 'tag';
  text: string;
  slug?: string;
  category: string;
}

interface MarketplaceSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  trendingSearches?: string[];
  loading?: boolean;
}

export function MarketplaceSearch({
  value,
  onChange,
  onSearch,
  placeholder = 'Search for products, creators, or categories...',
  suggestions = [],
  recentSearches = [],
  trendingSearches = [],
  loading = false,
}: MarketplaceSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleInputChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);

    // Show suggestions when typing
    setShowSuggestions(newValue.length > 0);

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (newValue.trim()) {
      debounceRef.current = setTimeout(() => {
        // Trigger search suggestions API call here if needed
      }, 300);
    }
  };

  const handleSearch = (query?: string) => {
    const searchQuery = query || localValue;
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setShowSuggestions(false);
      setIsOpen(false);

      // Add to recent searches (would be stored in localStorage or state)
      const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      const updated = [
        searchQuery,
        ...recent.filter((s: string) => s !== searchQuery),
      ].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setLocalValue('');
    onChange('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'category':
        return <Grid3X3 className="w-4 h-4" />;
      case 'tag':
        return <Hash className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const groupedSuggestions = suggestions.reduce(
    (acc, suggestion) => {
      if (!acc[suggestion.category]) {
        acc[suggestion.category] = [];
      }
      acc[suggestion.category].push(suggestion);
      return acc;
    },
    {} as Record<string, SearchSuggestion[]>
  );

  return (
    <div className="relative w-full max-w-2xl">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              ref={inputRef}
              value={localValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="pl-10 pr-20 h-12 text-base"
              disabled={loading}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              {localValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              <Button
                onClick={() => handleSearch()}
                size="sm"
                className="h-8"
                disabled={loading || !localValue.trim()}
              >
                Search
              </Button>
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="w-full p-0"
          align="start"
          style={{ width: 'var(--radix-popover-trigger-width)' }}
        >
          <Command>
            <CommandList className="max-h-80">
              {/* Recent Searches */}
              {recentSearches.length > 0 && !localValue && (
                <CommandGroup heading="Recent Searches">
                  {recentSearches.map((search, index) => (
                    <CommandItem
                      key={`recent-${index}`}
                      onSelect={() => handleSearch(search)}
                      className="cursor-pointer"
                    >
                      <Search className="w-4 h-4 mr-2 text-muted-foreground" />
                      {search}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Trending Searches */}
              {trendingSearches.length > 0 && !localValue && (
                <CommandGroup heading="Trending">
                  {trendingSearches.map((search, index) => (
                    <CommandItem
                      key={`trending-${index}`}
                      onSelect={() => handleSearch(search)}
                      className="cursor-pointer"
                    >
                      <TrendingUp className="w-4 h-4 mr-2 text-orange-500" />
                      {search}
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Trending
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Search Suggestions */}
              {localValue && Object.keys(groupedSuggestions).length > 0 && (
                <>
                  {Object.entries(groupedSuggestions).map(
                    ([category, items]) => (
                      <CommandGroup key={category} heading={category}>
                        {items.map((suggestion, index) => (
                          <CommandItem
                            key={`${category}-${index}`}
                            onSelect={() => handleSearch(suggestion.text)}
                            className="cursor-pointer"
                          >
                            {getSuggestionIcon(suggestion.type)}
                            <span className="ml-2">{suggestion.text}</span>
                            <Badge
                              variant="outline"
                              className="ml-auto text-xs"
                            >
                              {suggestion.type}
                            </Badge>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )
                  )}
                </>
              )}

              {/* No Results */}
              {localValue && Object.keys(groupedSuggestions).length === 0 && (
                <CommandEmpty>
                  <div className="text-center py-4">
                    <Search className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No suggestions found for "{localValue}"
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSearch()}
                      className="mt-2"
                    >
                      Search anyway
                    </Button>
                  </div>
                </CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Search Loading Indicator */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border rounded-md p-3 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">
                Searching...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
