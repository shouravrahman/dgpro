'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Pricing } from '@/components/sections/pricing';
import { FAQ, commonFAQs } from '@/components/ui/faq';
import { Button } from '@/components/ui/button';
import {
  Check,
  X,
  Star,
  Zap,
  Shield,
  Headphones,
  Users,
  Crown,
  ArrowRight,
  Calculator,
  TrendingUp,
} from 'lucide-react';

const features = [
  {
    category: 'Core Features',
    items: [
      {
        name: 'AI Product Ideas',
        free: '3/month',
        pro: 'Unlimited',
        enterprise: 'Unlimited',
      },
      {
        name: 'Market Analysis',
        free: 'Basic',
        pro: 'Advanced',
        enterprise: 'Premium',
      },
      { name: 'Competitor Research', free: false, pro: true, enterprise: true },
      { name: 'Trend Analysis', free: false, pro: true, enterprise: true },
      { name: 'Revenue Projections', free: false, pro: true, enterprise: true },
    ],
  },
  {
    category: 'Creation Tools',
    items: [
      {
        name: 'Product Templates',
        free: '5',
        pro: '50+',
        enterprise: 'Unlimited',
      },
      { name: 'Custom Branding', free: false, pro: true, enterprise: true },
      { name: 'Advanced Editor', free: false, pro: true, enterprise: true },
      {
        name: 'Collaboration Tools',
        free: false,
        pro: '5 users',
        enterprise: 'Unlimited',
      },
      { name: 'Version Control', free: false, pro: true, enterprise: true },
    ],
  },
  {
    category: 'Analytics & Insights',
    items: [
      {
        name: 'Performance Dashboard',
        free: 'Basic',
        pro: 'Advanced',
        enterprise: 'Premium',
      },
      { name: 'Custom Reports', free: false, pro: true, enterprise: true },
      { name: 'A/B Testing', free: false, pro: true, enterprise: true },
      { name: 'Conversion Tracking', free: false, pro: true, enterprise: true },
      { name: 'ROI Calculator', free: false, pro: true, enterprise: true },
    ],
  },
  {
    category: 'Integrations',
    items: [
      {
        name: 'Basic Integrations',
        free: '3',
        pro: '20+',
        enterprise: 'Unlimited',
      },
      { name: 'API Access', free: false, pro: 'Limited', enterprise: 'Full' },
      { name: 'Webhooks', free: false, pro: true, enterprise: true },
      {
        name: 'Custom Integrations',
        free: false,
        pro: false,
        enterprise: true,
      },
      {
        name: 'White-label Options',
        free: false,
        pro: false,
        enterprise: true,
      },
    ],
  },
  {
    category: 'Support',
    items: [
      { name: 'Community Support', free: true, pro: true, enterprise: true },
      { name: 'Email Support', free: false, pro: true, enterprise: true },
      { name: 'Priority Support', free: false, pro: false, enterprise: true },
      { name: 'Dedicated Manager', free: false, pro: false, enterprise: true },
      { name: 'Custom Training', free: false, pro: false, enterprise: true },
    ],
  },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Digital Entrepreneur',
    plan: 'Pro',
    quote:
      'The Pro plan paid for itself within the first month. The advanced analytics helped me identify a $50K opportunity I would have missed.',
    revenue: '$50K',
  },
  {
    name: 'Marcus Chen',
    role: 'Startup Founder',
    plan: 'Enterprise',
    quote:
      'Enterprise features like custom integrations and dedicated support have been game-changers for scaling our product line.',
    revenue: '$200K',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Content Creator',
    plan: 'Pro',
    quote:
      'I went from struggling with product ideas to launching 3 successful digital products in 6 months. The ROI is incredible.',
    revenue: '$75K',
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'annual'>(
    'monthly'
  );

  const renderFeatureValue = (value: string | boolean | number) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-500" />
      ) : (
        <X className="w-5 h-5 text-muted-foreground" />
      );
    }
    return <span className="text-sm font-medium">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Simple, transparent
                  <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    {' '}
                    pricing
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                  Choose the perfect plan for your creative journey. Start free,
                  scale as you grow, and unlock your full potential.
                </p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 mb-12">
                  <span
                    className={`text-sm ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    Monthly
                  </span>
                  <button
                    onClick={() =>
                      setBillingCycle(
                        billingCycle === 'monthly' ? 'annual' : 'monthly'
                      )
                    }
                    className="relative w-14 h-7 bg-muted rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    <div
                      className={`absolute top-1 left-1 w-5 h-5 bg-primary rounded-full transition-transform duration-200 ${billingCycle === 'annual' ? 'translate-x-7' : ''}`}
                    />
                  </button>
                  <span
                    className={`text-sm ${billingCycle === 'annual' ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    Annual
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Save 20%
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-20">
          <div className="container mx-auto px-4">
            <Pricing />
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Compare all features
                </h2>
                <p className="text-lg text-muted-foreground">
                  See exactly what's included in each plan
                </p>
              </motion.div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-4 px-6 font-semibold">
                        Features
                      </th>
                      <th className="text-center py-4 px-6 font-semibold">
                        Free
                      </th>
                      <th className="text-center py-4 px-6 font-semibold">
                        <div className="flex items-center justify-center gap-2">
                          <Star className="w-4 h-4 text-primary" />
                          Pro
                        </div>
                      </th>
                      <th className="text-center py-4 px-6 font-semibold">
                        <div className="flex items-center justify-center gap-2">
                          <Crown className="w-4 h-4 text-purple-500" />
                          Enterprise
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((category, categoryIndex) => (
                      <React.Fragment key={category.category}>
                        <tr className="bg-muted/50">
                          <td
                            colSpan={4}
                            className="py-3 px-6 font-semibold text-sm text-primary"
                          >
                            {category.category}
                          </td>
                        </tr>
                        {category.items.map((feature, featureIndex) => (
                          <motion.tr
                            key={feature.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 0.5,
                              delay: categoryIndex * 0.1 + featureIndex * 0.05,
                            }}
                            className="border-b border-border/50 hover:bg-muted/20"
                          >
                            <td className="py-4 px-6">{feature.name}</td>
                            <td className="py-4 px-6 text-center">
                              {renderFeatureValue(feature.free)}
                            </td>
                            <td className="py-4 px-6 text-center">
                              {renderFeatureValue(feature.pro)}
                            </td>
                            <td className="py-4 px-6 text-center">
                              {renderFeatureValue(feature.enterprise)}
                            </td>
                          </motion.tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Success stories from our customers
                </h2>
                <p className="text-lg text-muted-foreground">
                  See how the right plan helped creators achieve their goals
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="p-6 rounded-2xl border bg-card/50 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {testimonial.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </div>
                      </div>
                      <div className="ml-auto">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {testimonial.plan}
                        </span>
                      </div>
                    </div>
                    <blockquote className="text-muted-foreground mb-4">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="flex items-center gap-2 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-semibold">
                        {testimonial.revenue} generated
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ROI Calculator */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <Calculator className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Calculate your ROI
                </h2>
                <p className="text-lg text-muted-foreground">
                  See how much you could earn with AI Product Creator
                </p>
              </motion.div>

              <div className="p-8 rounded-2xl border bg-card/50 backdrop-blur-sm">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      Average Creator Results
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Products created per month:</span>
                        <span className="font-semibold">3-5</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average revenue per product:</span>
                        <span className="font-semibold">$2,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time saved per product:</span>
                        <span className="font-semibold">40 hours</span>
                      </div>
                      <div className="flex justify-between border-t pt-4">
                        <span className="font-semibold">
                          Monthly potential:
                        </span>
                        <span className="font-bold text-green-600">
                          $7,500 - $12,500
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      Your Investment
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Pro plan (monthly):</span>
                        <span className="font-semibold">$49</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pro plan (annual):</span>
                        <span className="font-semibold">$39/month</span>
                      </div>
                      <div className="flex justify-between border-t pt-4">
                        <span className="font-semibold">
                          ROI (conservative):
                        </span>
                        <span className="font-bold text-green-600">
                          15,200%
                        </span>
                      </div>
                    </div>
                    <Button className="w-full mt-6">
                      Start Your Free Trial
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <FAQ
              items={commonFAQs.pricing}
              title="Pricing FAQ"
              description="Common questions about our pricing and billing"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Ready to start creating?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Join thousands of creators who are building successful digital
                  products with AI
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="text-lg px-8">
                    Start Free Trial
                    <Zap className="w-5 h-5 ml-2" />
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Contact Sales
                    <Users className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
