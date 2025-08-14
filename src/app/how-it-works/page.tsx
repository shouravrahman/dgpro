'use client';

// How It Works Page
// Step-by-step guide showing the product creation process

import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { FAQ, commonFAQs } from '@/components/ui/faq';
import {
  Lightbulb,
  Search,
  Target,
  Palette,
  Rocket,
  TrendingUp,
  Zap,
  ArrowRight,
  ArrowDown,
  CheckCircle,
  Play,
  Clock,
  Star,
  BarChart3,
  Settings,
  Globe,
} from 'lucide-react';

const steps = [
  {
    number: 1,
    title: 'Describe Your Idea',
    description:
      'Tell our AI about your product concept, target audience, or market interest. Even a rough idea works perfectly.',
    icon: Lightbulb,
    color: 'from-yellow-500 to-orange-500',
    features: [
      'Natural language input',
      'Idea refinement suggestions',
      'Market opportunity scoring',
      'Audience identification',
    ],
    time: '2 minutes',
    example:
      'I want to create a productivity app for remote workers who struggle with time management...',
  },
  {
    number: 2,
    title: 'AI Market Research',
    description:
      'Our AI analyzes market trends, competitor landscape, and identifies the best opportunities for your product.',
    icon: Search,
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Competitor analysis',
      'Market size estimation',
      'Trend identification',
      'Pricing recommendations',
    ],
    time: '5 minutes',
    example:
      'Found 12 competitors, $2.3B market size, trending keywords: "focus timer", "productivity tracking"...',
  },
  {
    number: 3,
    title: 'Strategic Positioning',
    description:
      'Get a unique positioning strategy, target audience insights, and value proposition that sets you apart.',
    icon: Target,
    color: 'from-green-500 to-emerald-500',
    features: [
      'Unique value proposition',
      'Target persona creation',
      'Positioning strategy',
      'Messaging framework',
    ],
    time: '3 minutes',
    example:
      'Target: Remote managers aged 28-45, Position: "The only productivity app that adapts to your work style"...',
  },
  {
    number: 4,
    title: 'Product Design',
    description:
      'Generate product mockups, user flows, feature specifications, and branding elements tailored to your vision.',
    icon: Palette,
    color: 'from-purple-500 to-pink-500',
    features: [
      'UI/UX mockups',
      'Feature specifications',
      'User flow diagrams',
      'Brand identity',
    ],
    time: '10 minutes',
    example:
      'Created 15 screens, defined 8 core features, generated logo concepts and color palette...',
  },
  {
    number: 5,
    title: 'Launch Strategy',
    description:
      'Receive a complete go-to-market plan including pricing, marketing channels, and launch timeline.',
    icon: Rocket,
    color: 'from-red-500 to-rose-500',
    features: [
      'Pricing strategy',
      'Marketing plan',
      'Launch timeline',
      'Success metrics',
    ],
    time: '5 minutes',
    example:
      'Recommended $29/month pricing, 3-phase launch plan, focus on LinkedIn and productivity communities...',
  },
  {
    number: 6,
    title: 'Track & Optimize',
    description:
      'Monitor performance, get optimization suggestions, and scale your product based on real data and AI insights.',
    icon: TrendingUp,
    color: 'from-indigo-500 to-blue-500',
    features: [
      'Performance analytics',
      'Optimization suggestions',
      'A/B testing guidance',
      'Scaling strategies',
    ],
    time: 'Ongoing',
    example:
      'Conversion rate: 3.2% → 4.8%, suggested feature updates, identified expansion opportunities...',
  },
];

const benefits = [
  {
    icon: Clock,
    title: 'Save 100+ Hours',
    description:
      'Skip months of research and planning. Get comprehensive product insights in under 30 minutes.',
    stat: '100+ hours saved per product',
  },
  {
    icon: Target,
    title: 'Higher Success Rate',
    description:
      'AI-driven insights lead to better product-market fit and higher conversion rates.',
    stat: '3x higher success rate',
  },
  {
    icon: BarChart3,
    title: 'Data-Driven Decisions',
    description:
      'Make informed choices based on real market data, not guesswork.',
    stat: '50+ data points analyzed',
  },
  {
    icon: Zap,
    title: 'Faster Time to Market',
    description:
      'Launch products 10x faster with AI-generated assets and strategies.',
    stat: '10x faster launches',
  },
];

const integrations = [
  {
    name: 'Shopify',
    logo: '/integrations/shopify.svg',
    category: 'E-commerce',
  },
  { name: 'Stripe', logo: '/integrations/stripe.svg', category: 'Payments' },
  { name: 'Figma', logo: '/integrations/figma.svg', category: 'Design' },
  {
    name: 'Notion',
    logo: '/integrations/notion.svg',
    category: 'Productivity',
  },
  { name: 'Zapier', logo: '/integrations/zapier.svg', category: 'Automation' },
  {
    name: 'Google Analytics',
    logo: '/integrations/ga.svg',
    category: 'Analytics',
  },
  {
    name: 'Mailchimp',
    logo: '/integrations/mailchimp.svg',
    category: 'Marketing',
  },
  { name: 'Slack', logo: '/integrations/slack.svg', category: 'Communication' },
];

const videoThumbnail = {
  title: 'Watch How It Works',
  duration: '3:42',
  views: '12.5K',
  thumbnail: '/video-thumbnail.jpg',
};

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = React.useState(0);

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
                  From idea to
                  <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    {' '}
                    profitable product
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                  Discover how AI Product Creator transforms your creative ideas
                  into market-ready digital products in just 6 simple steps.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                  <Button size="lg" className="text-lg px-8">
                    Start Creating Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    <Play className="w-5 h-5 mr-2" />
                    Watch Demo
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={benefit.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="text-center"
                    >
                      <div className="text-2xl font-bold text-primary mb-1">
                        {benefit.stat.split(' ')[0]}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {benefit.stat.split(' ').slice(1).join(' ')}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Video Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-purple-500/20 border"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto hover:scale-110 transition-transform duration-300 cursor-pointer">
                      <Play className="w-8 h-8 text-primary ml-1" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {videoThumbnail.title}
                    </h3>
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                      <span>{videoThumbnail.duration}</span>
                      <span>•</span>
                      <span>{videoThumbnail.views} views</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Steps Section */}
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
                  How it works
                </h2>
                <p className="text-lg text-muted-foreground">
                  Six simple steps to transform your idea into a profitable
                  product
                </p>
              </motion.div>

              <div className="space-y-16">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isEven = index % 2 === 0;

                  return (
                    <motion.div
                      key={step.number}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className={`grid lg:grid-cols-2 gap-12 items-center ${!isEven ? 'lg:grid-flow-col-dense' : ''}`}
                    >
                      {/* Content */}
                      <div
                        className={
                          isEven ? 'lg:pr-8' : 'lg:pl-8 lg:col-start-2'
                        }
                      >
                        <div className="flex items-center gap-4 mb-6">
                          <div
                            className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center`}
                          >
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Step {step.number}
                            </div>
                            <h3 className="text-2xl font-bold">{step.title}</h3>
                          </div>
                          <div className="ml-auto">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              {step.time}
                            </div>
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-6 text-lg">
                          {step.description}
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                          {step.features.map((feature, featureIndex) => (
                            <div
                              key={featureIndex}
                              className="flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <div className="p-4 rounded-lg bg-muted/50 border-l-4 border-primary">
                          <div className="text-sm text-muted-foreground mb-1">
                            Example output:
                          </div>
                          <div className="text-sm italic">"{step.example}"</div>
                        </div>
                      </div>

                      {/* Visual */}
                      <div className={`${!isEven ? 'lg:col-start-1' : ''}`}>
                        <div className="relative">
                          <div className="aspect-square bg-gradient-to-br from-muted/50 to-muted/20 rounded-2xl border flex items-center justify-center">
                            <Icon
                              className={`w-24 h-24 bg-gradient-to-br ${step.color} bg-clip-text text-transparent`}
                            />
                          </div>
                          <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                            {step.number}
                          </div>
                        </div>
                      </div>

                      {/* Arrow (except for last step) */}
                      {index < steps.length - 1 && (
                        <div className="lg:col-span-2 flex justify-center py-8">
                          <ArrowDown className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
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
                  Why creators choose our process
                </h2>
                <p className="text-lg text-muted-foreground">
                  The benefits that make the difference
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div
                      key={benefit.title}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="text-center p-6 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors duration-300"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {benefit.description}
                      </p>
                      <div className="text-2xl font-bold text-primary">
                        {benefit.stat}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Integrations Section */}
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
                <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Seamless integrations
                </h2>
                <p className="text-lg text-muted-foreground">
                  Connect with your favorite tools and platforms
                </p>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {integrations.map((integration, index) => (
                  <motion.div
                    key={integration.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors duration-300 text-center group"
                  >
                    <div className="w-12 h-12 bg-muted rounded-lg mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Settings className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="font-medium mb-1">{integration.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {integration.category}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <FAQ
              items={[
                ...commonFAQs.general.slice(0, 3),
                {
                  question: 'How accurate are the AI-generated insights?',
                  answer:
                    'Our AI analyzes millions of data points from real market data, competitor information, and successful product launches. While no prediction is 100% accurate, our insights have helped creators achieve a 3x higher success rate compared to traditional methods.',
                  category: 'AI & Technology',
                },
                {
                  question: 'Can I customize the generated recommendations?',
                  answer:
                    'Absolutely! All AI-generated content serves as a starting point. You can edit, refine, and customize every aspect of your product strategy, design, and marketing plan to match your vision and requirements.',
                  category: 'Customization',
                },
                {
                  question: "What if I don't like the initial results?",
                  answer:
                    'You can regenerate results as many times as needed. Our AI learns from your feedback and preferences to provide better recommendations. You can also adjust input parameters to explore different directions.',
                  category: 'Process',
                },
              ]}
              title="Common Questions"
              description="Everything you need to know about our process"
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
                  Ready to turn your idea into reality?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Join thousands of creators who have successfully launched
                  products using our AI-powered process
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="text-lg px-8">
                    Start Your First Product
                    <Rocket className="w-5 h-5 ml-2" />
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    View Examples
                    <Star className="w-5 h-5 ml-2" />
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
