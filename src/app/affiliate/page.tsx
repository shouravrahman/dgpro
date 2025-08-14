'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { FAQ } from '@/components/ui/faq';
import { Testimonials } from '@/components/sections/testimonials';
import { CTA } from '@/components/sections/cta';
import {
  DollarSign,
  Users,
  Target,
  BarChart3,
  Zap,
  Crown,
  ArrowRight,
  CheckCircle,
  Star,
  Award,
  Link,
  Share2,
  Clock,
  Trophy,
} from 'lucide-react';

const benefits = [
  {
    icon: DollarSign,
    title: 'High Commissions',
    description: 'Earn up to 40% recurring commission on every sale you refer',
    highlight: '40% Commission',
  },
  {
    icon: Clock,
    title: 'Lifetime Payouts',
    description: 'Get paid for the entire lifetime of your referred customers',
    highlight: 'Lifetime Value',
  },
  {
    icon: Target,
    title: 'Easy Conversion',
    description: 'High-converting landing pages and proven marketing materials',
    highlight: '12% Conversion',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Tracking',
    description:
      'Advanced dashboard with detailed analytics and performance metrics',
    highlight: 'Live Analytics',
  },
  {
    icon: Zap,
    title: 'Fast Payouts',
    description: 'Get paid monthly via PayPal, Stripe, or bank transfer',
    highlight: 'Monthly Payouts',
  },
  {
    icon: Users,
    title: 'Dedicated Support',
    description: 'Personal affiliate manager and priority customer support',
    highlight: 'VIP Support',
  },
];

const commissionTiers = [
  {
    tier: 'Starter',
    icon: Star,
    referrals: '1-10',
    commission: '25%',
    features: [
      'Basic marketing materials',
      'Monthly payouts',
      'Email support',
      'Performance dashboard',
    ],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    tier: 'Pro',
    icon: Award,
    referrals: '11-50',
    commission: '30%',
    features: [
      'Advanced marketing kit',
      'Bi-weekly payouts',
      'Priority support',
      'Custom landing pages',
      'A/B testing tools',
    ],
    color: 'from-purple-500 to-pink-500',
    popular: true,
  },
  {
    tier: 'Elite',
    icon: Crown,
    referrals: '51+',
    commission: '40%',
    features: [
      'White-label materials',
      'Weekly payouts',
      'Dedicated manager',
      'Custom integrations',
      'Co-marketing opportunities',
      'Early access to features',
    ],
    color: 'from-orange-500 to-red-500',
  },
];

const stats = [
  { label: 'Active Affiliates', value: '1,200+' },
  { label: 'Total Commissions Paid', value: '$2.5M+' },
  { label: 'Average Monthly Earnings', value: '$3,400' },
  { label: 'Top Affiliate Earnings', value: '$25K/mo' },
];

const steps = [
  {
    step: '1',
    title: 'Apply to Join',
    description:
      'Fill out our simple application form and get approved within 24 hours',
    icon: Users,
  },
  {
    step: '2',
    title: 'Get Your Links',
    description: 'Access your unique affiliate links and marketing materials',
    icon: Link,
  },
  {
    step: '3',
    title: 'Start Promoting',
    description:
      'Share with your audience using our proven marketing strategies',
    icon: Share2,
  },
  {
    step: '4',
    title: 'Earn Commissions',
    description: 'Get paid monthly for every customer you refer',
    icon: DollarSign,
  },
];

const affiliateFAQs = [
  {
    question: 'How much can I earn as an affiliate?',
    answer:
      'Our affiliates earn between $500-$25,000+ per month depending on their audience size and engagement. Top affiliates with the Elite tier earn 40% lifetime commissions on all referrals.',
  },
  {
    question: 'When and how do I get paid?',
    answer:
      'Payments are made monthly via PayPal, Stripe, or bank transfer. Pro and Elite affiliates can opt for bi-weekly or weekly payouts respectively. Minimum payout is $100.',
  },
  {
    question: 'What marketing materials do you provide?',
    answer:
      'We provide banners, email templates, social media content, video scripts, landing pages, and more. Elite affiliates get access to white-label materials and custom creatives.',
  },
  {
    question: 'Is there a minimum traffic requirement?',
    answer:
      'No minimum traffic requirement, but we look for quality over quantity. We prefer affiliates with engaged audiences who would benefit from our product.',
  },
  {
    question: 'Can I promote on paid advertising platforms?',
    answer:
      'Yes, but with restrictions. You cannot bid on our brand terms or create misleading ads. We provide detailed guidelines for paid advertising compliance.',
  },
];

export default function AffiliatePage() {
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Trophy className="w-4 h-4" />
                  Join 1,200+ Successful Affiliates
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Earn up to
                  <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    {' '}
                    40% commission
                  </span>
                  <br />
                  for life
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                  Join our affiliate program and earn recurring commissions by
                  promoting the #1 AI-powered product creation platform. High
                  conversion rates, lifetime payouts, and dedicated support.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="text-lg px-8">
                    Apply Now - It's Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    View Commission Structure
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 rounded-2xl bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5 border"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl md:text-3xl font-bold text-primary mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
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
                  Why Choose Our Affiliate Program?
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  We&apos;ve built the most rewarding affiliate program in the
                  industry
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div
                      key={benefit.title}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="group p-6 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {benefit.highlight}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {benefit.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Commission Tiers */}
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
                  Commission Structure
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  The more you refer, the more you earn. Unlock higher
                  commission rates as you grow.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {commissionTiers.map((tier, index) => {
                  const Icon = tier.icon;
                  return (
                    <motion.div
                      key={tier.tier}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className={`relative p-8 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 ${
                        tier.popular ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      {tier.popular && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                            Most Popular
                          </span>
                        </div>
                      )}

                      <div className="text-center mb-6">
                        <div
                          className={`w-16 h-16 bg-gradient-to-br ${tier.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{tier.tier}</h3>
                        <div className="text-sm text-muted-foreground mb-2">
                          {tier.referrals} referrals
                        </div>
                        <div className="text-4xl font-bold text-primary">
                          {tier.commission}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          recurring commission
                        </div>
                      </div>

                      <ul className="space-y-3">
                        {tier.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-center gap-3"
                          >
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
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
                  How It Works
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Get started in minutes and begin earning commissions right
                  away
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="text-center"
                    >
                      <div className="relative mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-500 rounded-2xl flex items-center justify-center mx-auto">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center text-sm font-bold text-primary">
                          {step.step}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {step.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials />

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-xl text-muted-foreground">
                  Everything you need to know about our affiliate program
                </p>
              </motion.div>

              <FAQ items={affiliateFAQs} />
            </div>
          </div>
        </section>

        {/* CTA */}
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
