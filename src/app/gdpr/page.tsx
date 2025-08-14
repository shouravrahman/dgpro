'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { FAQ } from '@/components/ui/faq';
import {
  Shield,
  Eye,
  Download,
  Trash2,
  Edit,
  FileText,
  Users,
  Globe,
  CheckCircle,
  ArrowRight,
  Mail,
  Calendar,
} from 'lucide-react';

const gdprRights = [
  {
    icon: Eye,
    title: 'Right to Access',
    description: 'Request a copy of all personal data we hold about you.',
    action: 'Request Data Export',
  },
  {
    icon: Edit,
    title: 'Right to Rectification',
    description: 'Correct any inaccurate or incomplete personal data.',
    action: 'Update Information',
  },
  {
    icon: Trash2,
    title: 'Right to Erasure',
    description:
      'Request deletion of your personal data (right to be forgotten).',
    action: 'Delete Account',
  },
  {
    icon: Download,
    title: 'Right to Portability',
    description: 'Receive your data in a structured, machine-readable format.',
    action: 'Export Data',
  },
  {
    icon: Shield,
    title: 'Right to Object',
    description: 'Object to processing of your data for specific purposes.',
    action: 'Manage Preferences',
  },
  {
    icon: FileText,
    title: 'Right to Restrict',
    description: 'Limit how we process your personal data.',
    action: 'Contact Support',
  },
];

const dataTypes = [
  {
    category: 'Account Information',
    data: ['Name', 'Email address', 'Password (encrypted)', 'Profile picture'],
    purpose: 'Account management and authentication',
    retention: 'Until account deletion',
  },
  {
    category: 'Product Data',
    data: [
      'Created products',
      'Templates',
      'Analytics data',
      'Usage statistics',
    ],
    purpose: 'Service provision and improvement',
    retention: '2 years after account deletion',
  },
  {
    category: 'Communication Data',
    data: ['Support tickets', 'Email communications', 'Feedback'],
    purpose: 'Customer support and service improvement',
    retention: '3 years for support purposes',
  },
  {
    category: 'Technical Data',
    data: ['IP address', 'Browser information', 'Device data', 'Cookies'],
    purpose: 'Security, analytics, and service optimization',
    retention: '1 year or as required by law',
  },
];

const gdprFAQs = [
  {
    question: 'What is GDPR and how does it affect me?',
    answer:
      'The General Data Protection Regulation (GDPR) is a European privacy law that gives you control over your personal data. It applies to all EU residents regardless of where the company is located.',
  },
  {
    question: 'How long do you keep my personal data?',
    answer:
      'We keep your data only as long as necessary for the purposes outlined in our Privacy Policy. Account data is kept until deletion, while some data may be retained longer for legal compliance.',
  },
  {
    question: 'Can I request all my data?',
    answer:
      'Yes, you have the right to request a copy of all personal data we hold about you. We will provide this in a structured, machine-readable format within 30 days.',
  },
  {
    question: 'How do I delete my account and data?',
    answer:
      'You can delete your account from your settings page. This will permanently remove your personal data, though some information may be retained for legal compliance.',
  },
  {
    question: 'Do you share my data with third parties?',
    answer:
      'We only share data with trusted service providers who help us operate our service, and only as outlined in our Privacy Policy. We never sell your personal data.',
  },
];

export default function GDPRPage() {
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 text-sm font-medium mb-6">
                  <Globe className="w-4 h-4" />
                  GDPR Compliant
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Your privacy
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    {' '}
                    rights matter
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  We&apos;re committed to protecting your privacy and giving you
                  full control over your personal data in compliance with GDPR
                  regulations.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* GDPR Rights */}
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
                  Your GDPR Rights
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Exercise your data protection rights with just a few clicks
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {gdprRights.map((right, index) => {
                  const Icon = right.icon;
                  return (
                    <motion.div
                      key={right.title}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="p-6 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {right.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {right.description}
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        {right.action}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Data We Collect */}
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
                  Data We Collect
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Transparency about what data we collect and why
                </p>
              </motion.div>

              <div className="space-y-6">
                {dataTypes.map((type, index) => (
                  <motion.div
                    key={type.category}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="p-6 rounded-2xl border bg-card/50 backdrop-blur-sm"
                  >
                    <div className="grid lg:grid-cols-4 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {type.category}
                        </h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {type.data.map((item, i) => (
                            <li key={i}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Purpose</h4>
                        <p className="text-sm text-muted-foreground">
                          {type.purpose}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Retention</h4>
                        <p className="text-sm text-muted-foreground">
                          {type.retention}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-sm text-green-600">
                          GDPR Compliant
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Data Processing */}
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
                    Legal Basis for Processing
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      We process your personal data based on several legal
                      grounds under GDPR:
                    </p>
                    <ul className="space-y-2 ml-6">
                      <li>
                        • <strong>Contract:</strong> To provide our services to
                        you
                      </li>
                      <li>
                        • <strong>Legitimate Interest:</strong> To improve our
                        services and prevent fraud
                      </li>
                      <li>
                        • <strong>Consent:</strong> For marketing communications
                        (opt-in only)
                      </li>
                      <li>
                        • <strong>Legal Obligation:</strong> To comply with
                        applicable laws
                      </li>
                    </ul>
                    <p>
                      You can withdraw consent at any time, and we will stop
                      processing your data for that purpose unless we have
                      another legal basis.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="p-8 rounded-2xl border bg-card/50 backdrop-blur-sm"
                >
                  <div className="text-center">
                    <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-4">
                      Data Protection Officer
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Our dedicated DPO ensures GDPR compliance and handles all
                      privacy-related inquiries.
                    </p>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Email:</strong> dpo@aiproductcreator.com
                      </p>
                      <p>
                        <strong>Response Time:</strong> Within 30 days
                      </p>
                    </div>
                    <Button className="mt-4" asChild>
                      <a href="mailto:dpo@aiproductcreator.com">
                        <Mail className="w-4 h-4 mr-2" />
                        Contact DPO
                      </a>
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

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
                  GDPR Questions
                </h2>
                <p className="text-xl text-muted-foreground">
                  Common questions about your privacy rights
                </p>
              </motion.div>

              <FAQ items={gdprFAQs} />
            </div>
          </div>
        </section>

        {/* Action Center */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center p-12 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 border"
              >
                <Shield className="w-16 h-16 text-blue-600 mx-auto mb-6" />
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Exercise Your Rights
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Take control of your personal data. Access, update, or delete
                  your information with our easy-to-use privacy tools.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <a href="/settings/privacy">
                      <Shield className="w-5 h-5 mr-2" />
                      Privacy Settings
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="/contact">
                      Contact Privacy Team
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                </div>
                <div className="mt-6 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  We respond to all requests within 30 days
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
