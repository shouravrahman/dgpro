'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Testimonials } from '@/components/sections/testimonials';
import { CTA } from '@/components/sections/cta';
import { Button } from '@/components/ui/button';
import {
  Target,
  Heart,
  Zap,
  Users,
  Award,
  TrendingUp,
  Globe,
  Lightbulb,
  Shield,
  Rocket,
  ArrowRight,
  Linkedin,
  Twitter,
  Github,
} from 'lucide-react';

const stats = [
  { label: 'Products Created', value: '10,000+' },
  { label: 'Active Creators', value: '2,500+' },
  { label: 'Revenue Generated', value: '$1M+' },
  { label: 'Countries Served', value: '50+' },
];

const values = [
  {
    icon: Target,
    title: 'Innovation First',
    description:
      "We push the boundaries of what's possible with AI and automation to give creators superpowers.",
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Heart,
    title: 'Creator Success',
    description:
      'Every decision we make is focused on helping our creators build successful, profitable businesses.',
    color: 'from-red-500 to-pink-500',
  },
  {
    icon: Shield,
    title: 'Trust & Security',
    description:
      "We protect our creators' data and intellectual property with enterprise-grade security.",
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Globe,
    title: 'Global Community',
    description:
      'We believe in building an inclusive, diverse community of creators from around the world.',
    color: 'from-purple-500 to-indigo-500',
  },
];

const team = [
  {
    name: 'Sarah Chen',
    role: 'CEO & Co-Founder',
    bio: 'Former VP of Product at TechCorp. 10+ years building AI-powered platforms.',
    image: '/team/sarah.jpg',
    social: {
      linkedin: 'https://linkedin.com/in/sarahchen',
      twitter: 'https://twitter.com/sarahchen',
    },
  },
  {
    name: 'Marcus Rodriguez',
    role: 'CTO & Co-Founder',
    bio: 'Ex-Google engineer. Expert in machine learning and scalable systems.',
    image: '/team/marcus.jpg',
    social: {
      linkedin: 'https://linkedin.com/in/marcusrodriguez',
      github: 'https://github.com/marcusrodriguez',
    },
  },
  {
    name: 'Emily Watson',
    role: 'Head of Design',
    bio: 'Award-winning designer with 8+ years at top design agencies.',
    image: '/team/emily.jpg',
    social: {
      linkedin: 'https://linkedin.com/in/emilywatson',
      twitter: 'https://twitter.com/emilywatson',
    },
  },
  {
    name: 'David Kim',
    role: 'Head of Engineering',
    bio: 'Full-stack architect who built systems serving millions of users.',
    image: '/team/david.jpg',
    social: {
      linkedin: 'https://linkedin.com/in/davidkim',
      github: 'https://github.com/davidkim',
    },
  },
];

const timeline = [
  {
    year: '2022',
    title: 'The Beginning',
    description:
      'Founded by Sarah and Marcus with a vision to democratize digital product creation.',
  },
  {
    year: '2023',
    title: 'First 1000 Users',
    description:
      'Reached our first milestone with creators generating over $100K in revenue.',
  },
  {
    year: '2024',
    title: 'AI Revolution',
    description:
      'Launched advanced AI features and expanded to serve creators in 50+ countries.',
  },
  {
    year: '2025',
    title: 'The Future',
    description:
      'Building the next generation of AI-powered creation tools and marketplace.',
  },
];

export default function AboutPage() {
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
                  Empowering creators to
                  <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    {' '}
                    build the future
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  We believe every creative person has the potential to build a
                  successful digital business. Our mission is to make that
                  journey as simple and profitable as possible.
                </p>
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
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
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

        {/* Story Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Our Story
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      It started with a simple observation: talented creators
                      were struggling to turn their ideas into profitable
                      digital products. The process was complex, time-consuming,
                      and required skills most creators didn't have.
                    </p>
                    <p>
                      As former product leaders at major tech companies, Sarah
                      and Marcus saw an opportunity to use AI and automation to
                      level the playing field. They envisioned a platform where
                      anyone could create, launch, and scale digital products
                      with the power of artificial intelligence.
                    </p>
                    <p>
                      Today, AI Product Creator serves thousands of creators
                      worldwide, helping them generate millions in revenue while
                      building the future of digital entrepreneurship.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative"
                >
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <Lightbulb className="w-24 h-24 text-primary mx-auto mb-4" />
                      <p className="text-lg font-semibold">
                        From Idea to Impact
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
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
                  Our Values
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  The principles that guide everything we do
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8">
                {values.map((value, index) => {
                  const Icon = value.icon;
                  return (
                    <motion.div
                      key={value.title}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="p-8 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300"
                    >
                      <div
                        className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-6`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-4">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {value.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
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
                  Meet Our Team
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  The passionate people behind AI Product Creator
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {team.map((member, index) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="text-center p-6 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300"
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-1">
                      {member.name}
                    </h3>
                    <p className="text-primary text-sm mb-3">{member.role}</p>
                    <p className="text-muted-foreground text-sm mb-4">
                      {member.bio}
                    </p>

                    <div className="flex justify-center space-x-3">
                      {member.social.linkedin && (
                        <a
                          href={member.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-muted hover:bg-primary hover:text-white rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      {member.social.twitter && (
                        <a
                          href={member.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-muted hover:bg-primary hover:text-white rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Twitter className="w-4 h-4" />
                        </a>
                      )}
                      {member.social.github && (
                        <a
                          href={member.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-muted hover:bg-primary hover:text-white rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
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
                  Our Journey
                </h2>
                <p className="text-xl text-muted-foreground">
                  From startup to success story
                </p>
              </motion.div>

              <div className="space-y-8">
                {timeline.map((item, index) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-center gap-8"
                  >
                    <div className="flex-shrink-0 w-20 text-right">
                      <span className="text-2xl font-bold text-primary">
                        {item.year}
                      </span>
                    </div>
                    <div className="flex-shrink-0 w-4 h-4 bg-primary rounded-full"></div>
                    <div className="flex-1 p-6 rounded-2xl border bg-card/50 backdrop-blur-sm">
                      <h3 className="text-lg font-semibold mb-2">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials />

        {/* CTA */}
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
