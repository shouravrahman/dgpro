'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Zap,
  Eye,
  Download,
  Star,
  Users,
  DollarSign,
  Clock,
  Play,
  ExternalLink,
} from 'lucide-react';

const showcaseProducts = [
  {
    id: 1,
    title: 'AI Course Creator Pro',
    category: 'Educational',
    description:
      'Complete course creation toolkit with AI-powered content generation and student engagement analytics.',
    image: '/showcase/course-creator.jpg',
    price: '$197',
    sales: '2.3K',
    rating: 4.9,
    tags: ['AI-Powered', 'Course Creation', 'Analytics'],
    color: 'from-blue-500 to-cyan-500',
    demoUrl: '#',
    features: [
      'AI Content Generation',
      'Student Analytics',
      'Multi-format Export',
      'Engagement Tracking',
    ],
  },
  {
    id: 2,
    title: 'Design System Builder',
    category: 'Design Tools',
    description:
      'Professional design system generator with component libraries and style guides.',
    image: '/showcase/design-system.jpg',
    price: '$149',
    sales: '1.8K',
    rating: 4.8,
    tags: ['Design Systems', 'Components', 'Style Guides'],
    color: 'from-purple-500 to-pink-500',
    demoUrl: '#',
    features: [
      'Component Library',
      'Style Guide Generator',
      'Export to Figma',
      'Team Collaboration',
    ],
  },
  {
    id: 3,
    title: 'Marketing Automation Suite',
    category: 'Marketing',
    description:
      'Complete marketing automation platform with email campaigns and social media scheduling.',
    image: '/showcase/marketing-suite.jpg',
    price: '$299',
    sales: '3.1K',
    rating: 4.9,
    tags: ['Automation', 'Email Marketing', 'Social Media'],
    color: 'from-green-500 to-emerald-500',
    demoUrl: '#',
    features: [
      'Email Automation',
      'Social Scheduling',
      'Analytics Dashboard',
      'Lead Scoring',
    ],
  },
  {
    id: 4,
    title: 'E-commerce Analytics Pro',
    category: 'Analytics',
    description:
      'Advanced e-commerce analytics with predictive insights and revenue optimization.',
    image: '/showcase/ecommerce-analytics.jpg',
    price: '$249',
    sales: '1.5K',
    rating: 4.7,
    tags: ['Analytics', 'E-commerce', 'Predictions'],
    color: 'from-orange-500 to-red-500',
    demoUrl: '#',
    features: [
      'Predictive Analytics',
      'Revenue Optimization',
      'Customer Insights',
      'ROI Tracking',
    ],
  },
  {
    id: 5,
    title: 'Content Calendar Manager',
    category: 'Productivity',
    description:
      'AI-powered content planning and scheduling tool for social media and blogs.',
    image: '/showcase/content-calendar.jpg',
    price: '$97',
    sales: '4.2K',
    rating: 4.8,
    tags: ['Content Planning', 'AI Writing', 'Scheduling'],
    color: 'from-indigo-500 to-blue-500',
    demoUrl: '#',
    features: [
      'AI Content Ideas',
      'Multi-platform Scheduling',
      'Performance Tracking',
      'Team Collaboration',
    ],
  },
  {
    id: 6,
    title: 'SaaS Metrics Dashboard',
    category: 'Business Intelligence',
    description:
      'Comprehensive SaaS metrics tracking with churn prediction and growth analytics.',
    image: '/showcase/saas-metrics.jpg',
    price: '$399',
    sales: '890',
    rating: 4.9,
    tags: ['SaaS Metrics', 'Churn Prediction', 'Growth Analytics'],
    color: 'from-teal-500 to-green-500',
    demoUrl: '#',
    features: [
      'Churn Prediction',
      'MRR Tracking',
      'Customer Lifetime Value',
      'Growth Forecasting',
    ],
  },
];

const categories = [
  'All',
  'Educational',
  'Design Tools',
  'Marketing',
  'Analytics',
  'Productivity',
  'Business Intelligence',
];

export function ProductShowcase() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  const filteredProducts =
    selectedCategory === 'All'
      ? showcaseProducts
      : showcaseProducts.filter(
          (product) => product.category === selectedCategory
        );

  return (
    <section className="py-24 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm font-medium text-primary mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Product Showcase</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Products created with
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                {' '}
                AI Product Creator
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover amazing digital products built by our community using
              AI-powered insights and market intelligence.
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-2 mb-12"
          >
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </motion.div>

          {/* Products Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  onHoverStart={() => setHoveredProduct(product.id)}
                  onHoverEnd={() => setHoveredProduct(null)}
                  className="group relative overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300"
                >
                  {/* Product Image/Preview */}
                  <div className="relative h-48 overflow-hidden">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${product.color} opacity-90`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-6xl font-bold opacity-20">
                        {product.title.charAt(0)}
                      </div>
                    </div>

                    {/* Hover Overlay */}
                    <AnimatePresence>
                      {hoveredProduct === product.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center space-x-4"
                        >
                          <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ delay: 0.1 }}
                            className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                          >
                            <Eye className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ delay: 0.2 }}
                            className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                          >
                            <Play className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ delay: 0.3 }}
                            className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                        {product.category}
                      </span>
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs font-medium text-white">
                        {product.rating}
                      </span>
                    </div>
                  </div>

                  {/* Product Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                        {product.title}
                      </h3>
                      <div className="text-2xl font-bold text-primary">
                        {product.price}
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {product.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Features */}
                    <div className="space-y-2 mb-6">
                      {product.features
                        .slice(0, 3)
                        .map((feature, featureIndex) => (
                          <div
                            key={featureIndex}
                            className="flex items-center space-x-2 text-sm text-muted-foreground"
                          >
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            <span>{feature}</span>
                          </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-6 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-1 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{product.sales}</span>
                        <span className="text-muted-foreground">sales</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-green-500 font-medium">+24%</span>
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex space-x-2">
                      <Button className="flex-1" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Get Template
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mt-16"
          >
            <div className="p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 border">
              <h3 className="text-2xl font-bold mb-4">
                Ready to create your own success story?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands of creators who are building profitable digital
                products with AI-powered insights.
              </p>
              <Button size="lg">
                Start Creating Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
