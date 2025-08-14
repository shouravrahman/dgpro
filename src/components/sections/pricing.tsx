'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import {
  Check,
  X,
  Star,
  Zap,
  Crown,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for getting started with digital product creation',
    icon: Sparkles,
    color: 'from-gray-500 to-gray-600',
    popular: false,
    features: [
      { name: '3 products per month', included: true },
      { name: 'Basic AI analysis', included: true },
      { name: 'Community support', included: true },
      { name: 'Basic templates', included: true },
      { name: 'Standard marketplace listing', included: true },
      { name: 'Advanced AI features', included: false },
      { name: 'Priority support', included: false },
      { name: 'Custom branding', included: false },
      { name: 'Analytics dashboard', included: false },
      { name: 'API access', included: false },
    ],
    cta: 'Get Started Free',
    href: '/auth/register',
  },
  {
    name: 'Pro',
    price: 29,
    period: 'month',
    description: 'For serious creators ready to scale their business',
    icon: TrendingUp,
    color: 'from-primary to-blue-500',
    popular: true,
    features: [
      { name: '50 products per month', included: true },
      { name: 'Advanced AI analysis', included: true },
      { name: 'Priority support', included: true },
      { name: 'Premium templates', included: true },
      { name: 'Featured marketplace listing', included: true },
      { name: 'Analytics dashboard', included: true },
      { name: 'Custom branding', included: true },
      { name: 'A/B testing tools', included: true },
      { name: 'Export capabilities', included: true },
      { name: 'API access', included: false },
    ],
    cta: 'Start Pro Trial',
    href: '/auth/register?plan=pro',
  },
  {
    name: 'Enterprise',
    price: 99,
    period: 'month',
    description: 'For teams and businesses with advanced needs',
    icon: Crown,
    color: 'from-purple-500 to-pink-500',
    popular: false,
    features: [
      { name: 'Unlimited products', included: true },
      { name: 'Enterprise AI features', included: true },
      { name: 'Dedicated support', included: true },
      { name: 'Custom templates', included: true },
      { name: 'White-label solution', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Team collaboration', included: true },
      { name: 'API access', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'SLA guarantee', included: true },
    ],
    cta: 'Contact Sales',
    href: '/contact?plan=enterprise',
  },
];

const faqs = [
  {
    question: 'Can I change my plan anytime?',
    answer:
      'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated.',
  },
  {
    question: 'What happens to my products if I downgrade?',
    answer:
      "Your existing products remain active. You'll just be limited to your new plan's monthly creation limit going forward.",
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'We offer a 30-day money-back guarantee for all paid plans. No questions asked.',
  },
  {
    question: 'Is there a setup fee?',
    answer:
      'No setup fees, ever. You only pay the monthly subscription fee for your chosen plan.',
  },
];

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const { user } = useAuth();

  return (
    <section
      id="pricing"
      className="py-24 bg-gradient-to-b from-muted/20 to-background"
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
              <Star className="w-4 h-4" />
              <span>Simple Pricing</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Choose the perfect plan for
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                {' '}
                your journey
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Start free and scale as you grow. All plans include our core
              features with no hidden fees or surprise charges.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center space-x-4 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  !isAnnual
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  isAnnual
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Annual
                <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              const price =
                isAnnual && plan.price > 0
                  ? Math.round(plan.price * 0.8)
                  : plan.price;

              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                    plan.popular
                      ? 'border-primary bg-card shadow-lg scale-105'
                      : 'border-border bg-card/50 hover:bg-card/80'
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-primary to-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </div>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground mb-4">
                      {plan.description}
                    </p>

                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold">${price}</span>
                      {plan.price > 0 && (
                        <span className="text-muted-foreground ml-1">
                          /{isAnnual ? 'year' : plan.period}
                        </span>
                      )}
                    </div>

                    {isAnnual && plan.price > 0 && (
                      <div className="text-sm text-green-600 mt-1">
                        Save ${plan.price * 12 - price * 12} per year
                      </div>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center space-x-3"
                      >
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        )}
                        <span
                          className={
                            feature.included
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          }
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      asChild
                      className={`w-full ${
                        plan.popular
                          ? 'bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90'
                          : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      <Link href={user ? '/dashboard' : plan.href}>
                        {user ? 'Go to Dashboard' : plan.cta}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <h3 className="text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h3>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 rounded-xl border bg-card/50"
                >
                  <h4 className="text-lg font-semibold mb-3">{faq.question}</h4>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </motion.div>
              ))}
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
            <div className="p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 border">
              <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
              <p className="text-muted-foreground mb-6">
                Our team is here to help you choose the right plan for your
                needs.
              </p>
              <Button asChild variant="outline">
                <Link href="/contact">
                  Contact Sales Team
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
