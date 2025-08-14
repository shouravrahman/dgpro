'use client';

// Top Products Section Component
// Showcase of trending and featured products

import React from 'react';
import { motion } from 'framer-motion';
import { ProductCard } from '@/components/ui/product-card';
import { Button } from '@/components/ui/button';
import { TrendingUp, ArrowRight, Grid, List } from 'lucide-react';

// Mock data - in real app this would come from the database
const mockProducts = [
  {
    id: '1',
    name: 'Modern Website Template Pack',
    description:
      'Beautiful, responsive website templates for creative agencies and portfolios. Built with modern HTML5, CSS3, and JavaScript.',
    price: 49.99,
    originalPrice: 79.99,
    currency: 'USD',
    image: '/products/website-template.jpg',
    category: 'Website Templates',
    author: {
      name: 'Sarah Chen',
      avatar: '/avatars/sarah.jpg',
      verified: true,
    },
    stats: {
      rating: 4.9,
      reviews: 234,
      downloads: 1250,
      views: 5600,
      likes: 89,
    },
    tags: ['HTML', 'CSS', 'JavaScript', 'Responsive', 'Modern'],
    createdAt: '2024-01-15',
    featured: true,
    trending: true,
  },
  {
    id: '2',
    name: 'AI-Powered Business Plan Generator',
    description:
      'Comprehensive business plan templates with AI-generated content and financial projections for startups.',
    price: 29.99,
    currency: 'USD',
    image: '/products/business-plan.jpg',
    category: 'Business Tools',
    author: {
      name: 'Marcus Rodriguez',
      avatar: '/avatars/marcus.jpg',
      verified: true,
    },
    stats: {
      rating: 4.8,
      reviews: 156,
      downloads: 890,
      views: 3200,
      likes: 67,
    },
    tags: ['Business', 'AI', 'Templates', 'Startup'],
    createdAt: '2024-01-20',
    trending: true,
  },
  {
    id: '3',
    name: 'Social Media Graphics Bundle',
    description:
      'Complete collection of Instagram, Facebook, and Twitter post templates with editable designs.',
    price: 19.99,
    currency: 'USD',
    image: '/products/social-graphics.jpg',
    category: 'Design Assets',
    author: {
      name: 'Emily Watson',
      avatar: '/avatars/emily.jpg',
      verified: false,
    },
    stats: {
      rating: 4.7,
      reviews: 89,
      downloads: 567,
      views: 2100,
      likes: 45,
    },
    tags: ['Social Media', 'Graphics', 'Templates', 'Instagram'],
    createdAt: '2024-01-25',
    featured: true,
  },
  {
    id: '4',
    name: 'Chrome Extension Starter Kit',
    description:
      'Complete development kit for building Chrome extensions with React, TypeScript, and modern tooling.',
    price: 39.99,
    currency: 'USD',
    image: '/products/chrome-extension.jpg',
    category: 'Development Tools',
    author: {
      name: 'David Kim',
      avatar: '/avatars/david.jpg',
      verified: true,
    },
    stats: {
      rating: 4.9,
      reviews: 78,
      downloads: 345,
      views: 1800,
      likes: 34,
    },
    tags: ['Chrome', 'Extension', 'React', 'TypeScript'],
    createdAt: '2024-01-30',
  },
  {
    id: '5',
    name: 'Digital Marketing Course Bundle',
    description:
      'Complete digital marketing course with video lessons, worksheets, and real-world case studies.',
    price: 99.99,
    originalPrice: 149.99,
    currency: 'USD',
    image: '/products/marketing-course.jpg',
    category: 'Online Courses',
    author: {
      name: 'Lisa Thompson',
      avatar: '/avatars/lisa.jpg',
      verified: true,
    },
    stats: {
      rating: 4.8,
      reviews: 312,
      downloads: 1890,
      views: 8900,
      likes: 156,
    },
    tags: ['Marketing', 'Course', 'SEO', 'Social Media'],
    createdAt: '2024-02-01',
    featured: true,
  },
  {
    id: '6',
    name: 'Productivity App UI Kit',
    description:
      'Modern UI components and screens for productivity applications with Figma and Sketch files.',
    price: 0,
    currency: 'USD',
    image: '/products/ui-kit.jpg',
    category: 'UI/UX Design',
    author: {
      name: 'Alex Johnson',
      avatar: '/avatars/alex.jpg',
      verified: true,
    },
    stats: {
      rating: 4.6,
      reviews: 45,
      downloads: 2340,
      views: 4500,
      likes: 78,
    },
    tags: ['UI Kit', 'Figma', 'Sketch', 'Mobile'],
    createdAt: '2024-02-05',
    trending: true,
  },
];

const categories = [
  'All Categories',
  'Website Templates',
  'Business Tools',
  'Design Assets',
  'Development Tools',
  'Online Courses',
  'UI/UX Design',
];

export function TopProducts() {
  const [selectedCategory, setSelectedCategory] =
    React.useState('All Categories');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  const filteredProducts =
    selectedCategory === 'All Categories'
      ? mockProducts
      : mockProducts.filter((product) => product.category === selectedCategory);

  return (
    <section className="py-24 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm font-medium text-primary mb-4">
              <TrendingUp className="w-4 h-4" />
              <span>Top Products</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Discover
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                {' '}
                trending products
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore the most popular and successful digital products created
              by our community.
            </p>
          </motion.div>

          {/* Filters and Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col md:flex-row items-center justify-between mb-12 space-y-4 md:space-y-0"
          >
            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 p-1 bg-muted rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'grid'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'list'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Products Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={`grid gap-6 mb-12 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <ProductCard
                  product={product}
                  variant={viewMode === 'list' ? 'compact' : 'default'}
                  onLike={(id) => console.log('Liked product:', id)}
                  onAddToCart={(id) => console.log('Added to cart:', id)}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Load More / View All */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center"
          >
            <Button size="lg" variant="outline" className="group">
              View All Products
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Showing {filteredProducts.length} of 1,000+ products
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
