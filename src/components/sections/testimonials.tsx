'use client';

// Testimonials Section Component
// Customer testimonials with animated cards and ratings

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'Digital Entrepreneur',
    company: 'CreativeFlow Studio',
    avatar: '/avatars/sarah.jpg',
    rating: 5,
    content:
      'AI Product Creator transformed my business completely. I went from struggling to find profitable product ideas to launching 3 successful digital products in just 2 months. The AI insights are incredibly accurate.',
    revenue: '$15K',
    timeframe: '2 months',
  },
  {
    id: 2,
    name: 'Marcus Rodriguez',
    role: 'Course Creator',
    company: 'TechMastery Academy',
    avatar: '/avatars/marcus.jpg',
    rating: 5,
    content:
      'The market analysis feature is a game-changer. It helped me identify an untapped niche in web development courses. My latest course generated $50K in pre-orders before I even finished creating it.',
    revenue: '$50K',
    timeframe: '3 months',
  },
  {
    id: 3,
    name: 'Emily Watson',
    role: 'Freelance Designer',
    company: 'PixelPerfect Designs',
    avatar: '/avatars/emily.jpg',
    rating: 5,
    content:
      'I was skeptical about AI helping with creative work, but this platform proved me wrong. It suggested design template niches I never considered, and they became my best-selling products.',
    revenue: '$8K',
    timeframe: '1 month',
  },
  {
    id: 4,
    name: 'David Kim',
    role: 'Software Developer',
    company: 'CodeCraft Solutions',
    avatar: '/avatars/david.jpg',
    rating: 5,
    content:
      'The automated product creation tools saved me hundreds of hours. What used to take weeks now takes days. I can focus on innovation while the platform handles the market research and optimization.',
    revenue: '$25K',
    timeframe: '4 months',
  },
  {
    id: 5,
    name: 'Lisa Thompson',
    role: 'Content Creator',
    company: 'Digital Nomad Hub',
    avatar: '/avatars/lisa.jpg',
    rating: 5,
    content:
      'The community aspect is incredible. Learning from other successful creators and getting feedback on my ideas has been invaluable. Plus, the AI suggestions are spot-on every time.',
    revenue: '$12K',
    timeframe: '2 months',
  },
  {
    id: 6,
    name: 'Alex Johnson',
    role: 'Marketing Consultant',
    company: 'GrowthHack Pro',
    avatar: '/avatars/alex.jpg',
    rating: 5,
    content:
      'I recommend this platform to all my clients. The ROI is incredible - most see results within the first month. The analytics dashboard makes it easy to track performance and optimize.',
    revenue: '$35K',
    timeframe: '3 months',
  },
];

const stats = [
  { label: 'Average Revenue Increase', value: '300%' },
  { label: 'Success Rate', value: '94%' },
  { label: 'Time to First Sale', value: '< 30 days' },
  { label: 'Customer Satisfaction', value: '4.9/5' },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(true);

  // Auto-play functionality
  React.useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex(
        (prev) => (prev + 1) % Math.ceil(testimonials.length / 3)
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(testimonials.length / 3));
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) =>
        (prev - 1 + Math.ceil(testimonials.length / 3)) %
        Math.ceil(testimonials.length / 3)
    );
    setIsAutoPlaying(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
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
              <Quote className="w-4 h-4" />
              <span>Success Stories</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Loved by creators
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                {' '}
                worldwide
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join thousands of successful creators who have transformed their
              ideas into profitable businesses.
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 p-8 rounded-2xl bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5 border"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Testimonials Carousel */}
          <div className="relative">
            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">What our creators say</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevSlide}
                  className="w-10 h-10 p-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextSlide}
                  className="w-10 h-10 p-0"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Testimonials Grid with Enhanced Animation */}
            <div className="overflow-hidden">
              <motion.div
                className="flex"
                animate={{
                  x: `-${currentIndex * 100}%`,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
              >
                {Array.from(
                  { length: Math.ceil(testimonials.length / 3) },
                  (_, slideIndex) => (
                    <div key={slideIndex} className="w-full flex-shrink-0">
                      <div className="grid md:grid-cols-3 gap-6">
                        {testimonials
                          .slice(slideIndex * 3, slideIndex * 3 + 3)
                          .map((testimonial, index) => (
                            <motion.div
                              key={testimonial.id}
                              initial={{ opacity: 0, y: 30 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.6, delay: index * 0.1 }}
                              whileHover={{ y: -5 }}
                              className="p-6 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300"
                            >
                              {/* Quote Icon */}
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                                <Quote className="w-5 h-5 text-primary" />
                              </div>

                              {/* Rating */}
                              <div className="flex items-center space-x-1 mb-4">
                                {renderStars(testimonial.rating)}
                              </div>

                              {/* Content */}
                              <p className="text-muted-foreground mb-6 leading-relaxed">
                                "{testimonial.content}"
                              </p>

                              {/* Results */}
                              <div className="flex items-center space-x-4 mb-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-green-600">
                                    {testimonial.revenue}
                                  </div>
                                  <div className="text-xs text-green-600/80">
                                    Revenue
                                  </div>
                                </div>
                                <div className="w-px h-8 bg-green-200 dark:bg-green-800" />
                                <div className="text-center">
                                  <div className="text-lg font-bold text-green-600">
                                    {testimonial.timeframe}
                                  </div>
                                  <div className="text-xs text-green-600/80">
                                    Timeframe
                                  </div>
                                </div>
                              </div>

                              {/* Author */}
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
                                  <span className="text-white font-semibold">
                                    {testimonial.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-semibold">
                                    {testimonial.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {testimonial.role}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {testimonial.company}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  )
                )}
              </motion.div>
            </div>

            {/* Dots Indicator */}
            <div className="flex items-center justify-center space-x-2 mt-8">
              {Array.from(
                { length: Math.ceil(testimonials.length / 3) },
                (_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setIsAutoPlaying(false);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentIndex
                        ? 'bg-primary w-8'
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                )
              )}
            </div>
          </div>

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
                Ready to join our success stories?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Start your journey today and see why thousands of creators trust
                AI Product Creator to transform their ideas into profitable
                businesses.
              </p>
              <Button size="lg" asChild>
                <a href="#pricing">
                  Start Your Success Story
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
