'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  Zap,
  Shield,
  Users,
  DollarSign,
  BarChart3,
  Sparkles,
  Target,
  Rocket,
  Globe,
  Award,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Product Generation',
    description:
      'Advanced machine learning algorithms analyze market trends and generate profitable product ideas tailored to your niche.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Market Analysis',
    description:
      'Get instant insights into market demand, competition levels, and pricing strategies across multiple platforms.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Zap,
    title: 'Instant Product Creation',
    description:
      'Transform ideas into ready-to-sell digital products in minutes with our automated creation and optimization tools.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description:
      'Bank-level security with end-to-end encryption, secure payments, and comprehensive data protection.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Users,
    title: 'Community & Collaboration',
    description:
      'Connect with fellow creators, share insights, and collaborate on projects within our thriving community.',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: DollarSign,
    title: 'Revenue Optimization',
    description:
      'Maximize your earnings with dynamic pricing, affiliate programs, and multi-platform distribution strategies.',
    color: 'from-green-500 to-teal-500',
  },
];

const stats = [
  {
    icon: BarChart3,
    value: '300%',
    label: 'Average Revenue Increase',
    description: 'Creators see significant growth within 3 months',
  },
  {
    icon: Sparkles,
    value: '10K+',
    label: 'Products Generated',
    description: 'Successful digital products created monthly',
  },
  {
    icon: Target,
    value: '94%',
    label: 'Success Rate',
    description: 'Products that generate revenue within 30 days',
  },
  {
    icon: Rocket,
    value: '2.5K+',
    label: 'Active Creators',
    description: 'Growing community of successful entrepreneurs',
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="py-24 bg-gradient-to-b from-background to-muted/20"
    >
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
              <Sparkles className="w-4 h-4" />
              <span>Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything you need to
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                {' '}
                succeed
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools, insights, and
              support you need to create and sell profitable digital products.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group p-8 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300"
                >
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5 rounded-3xl" />

            <div className="relative p-8 md:p-12">
              <div className="text-center mb-12">
                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                  Proven Results That Speak for Themselves
                </h3>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of successful creators who have transformed
                  their ideas into profitable businesses.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="text-center group"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                        {stat.value}
                      </div>
                      <div className="font-semibold mb-1">{stat.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {stat.description}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mt-16"
          >
            <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground mb-4">
              <Globe className="w-4 h-4" />
              <span>Trusted by creators in 50+ countries</span>
              <Award className="w-4 h-4" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
