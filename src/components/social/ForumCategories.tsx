'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  MessageCircle,
  Users,
  Clock,
  TrendingUp,
  Plus,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ForumCategory } from '@/types/social';
import { useAuth } from '@/lib/auth/context';

export function ForumCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/social/forum/categories');
      const data = await response.json();

      if (response.ok) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching forum categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Community Forum</h1>
          <p className="text-muted-foreground">
            Connect with other creators and share your knowledge
          </p>
        </div>

        {user && (
          <Button asChild>
            <Link href="/forum/new-topic">
              <Plus className="h-4 w-4 mr-2" />
              New Topic
            </Link>
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Forum Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">
              {categories.reduce((sum, cat) => sum + (cat.topic_count || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Topics</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{categories.length}</div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">24h</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">Live</div>
            <div className="text-sm text-muted-foreground">Online Now</div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-4">
        {filteredCategories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Link
                  href={`/forum/categories/${category.slug}`}
                  className="block"
                >
                  <div className="flex items-start gap-4">
                    {/* Category Icon */}
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      <MessageCircle
                        className="h-6 w-6"
                        style={{ color: category.color }}
                      />
                    </div>

                    {/* Category Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {category.topic_count || 0}
                          </div>
                        </div>
                      </div>

                      {category.description && (
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {category.description}
                        </p>
                      )}

                      {/* Latest Topic */}
                      {category.latest_topic && (
                        <div className="flex items-center gap-2 text-sm">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={
                                category.latest_topic.author?.avatar_url || ''
                              }
                            />
                            <AvatarFallback className="text-xs">
                              {category.latest_topic.author
                                ?.display_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground">Latest:</span>
                          <Link
                            href={`/forum/topics/${category.latest_topic.slug}`}
                            className="font-medium hover:text-primary transition-colors truncate"
                          >
                            {category.latest_topic.title}
                          </Link>
                          <span className="text-muted-foreground">
                            {new Date(
                              category.latest_topic.created_at
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Categories Found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Forum categories will appear here'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
