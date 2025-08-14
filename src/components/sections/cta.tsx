'use client';

// Call-to-Action Section Component
// Final conversion section with compelling messaging

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  Users,
  Clock,
  Shield,
  Star,
} from 'lucide-react';

const benefits = [
  {
    icon: Zap,
    title: 'Launch in Minutes',
    description: 'Go from idea to market-ready product in record time',
  },
  {
    icon: TrendingUp,
    title: 'Proven Success',
    description: '94% of our users see revenue within 30 days',
  },
  {
    icon: Users,
    title: 'Join 2.5K+ Creators',
    description: 'Be part of our thriving community of entrepreneurs',
  },
  {
    icon: Shield,
    title: 'Risk-Free Trial',
    description: '30-day money-back guarantee on all plans',
  },
];

const urgencyFactors = [
  '🔥 Limited time: 50% off Pro plan for new users',
  '⚡ Join 127 creators who signed up today',
  '🎯 Only 48 hours left for early bird pricing',
  '💎 Exclusive bonus: Free market analysis report',
];

export function CTA() {
  const { user } = useAuth();
  const [currentUrgency, setCurrentUrgency] = React.useState(0);

  // Rotate urgency messages
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentUrgency((prev) => (prev + 1) % urgencyFactors.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5" />

      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-2xl"
        />
        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-primary/10 rounded-full blur-2xl"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Urgency Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <motion.div
              key={currentUrgency}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-full px-4 py-2 text-sm font-medium text-orange-600"
            >
              <Clock className="w-4 h-4" />
              <span>{urgencyFactors[currentUrgency]}</span>
            </motion.div>
          </motion.div>

          {/* Main CTA Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to transform your
              <span className="bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
                {' '}
                ideas into income?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of successful creators who are already building
              profitable digital products with AI-powered insights and
              automation.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              {user ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    asChild
                    className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
                  >
                    <Link href="/dashboard">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Go to Dashboard
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      asChild
                      className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
                    >
                      <Link href="/register">
                        <Sparkles className="w-5 h-5 mr-2" />
                        Start Creating Free
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      asChild
                      className="text-lg px-8 py-6"
                    >
                      <Link href="/login">Already have an account?</Link>
                    </Button>
                  </motion.div>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <span>4.9/5 from 1,200+ reviews</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-muted-foreground/30" />
              <div>✨ No credit card required</div>
              <div className="hidden sm:block w-px h-4 bg-muted-foreground/30" />
              <div>🚀 Setup in 2 minutes</div>
            </div>
          </motion.div>

          {/* Benefits Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="text-center p-6 rounded-xl border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Final Push */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center"
          >
            <div className="p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 border">
              <h3 className="text-2xl font-bold mb-4">
                Don&apos;t let another great idea slip away
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Every day you wait is a day your competitors get ahead. Start
                building your digital product empire today with the power of AI
                on your side.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {!user && (
                  <>
                    <Button
                      size="lg"
                      asChild
                      className="bg-gradient-to-r from-primary to-blue-500"
                    >
                      <Link href="/register">
                        Start Your Free Account
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      or{' '}
                      <Link
                        href="/contact"
                        className="text-primary hover:underline"
                      >
                        talk to our team
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
