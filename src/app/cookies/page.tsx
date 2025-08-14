'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Calendar,
  Shield,
  Cookie,
  Settings,
  Eye,
  ArrowRight,
  Download,
  Printer,
} from 'lucide-react';

const lastUpdated = 'December 14, 2024';

const cookieTypes = [
  {
    type: 'Essential Cookies',
    description:
      'These cookies are necessary for the website to function and cannot be switched off.',
    examples: ['Authentication', 'Security', 'Load balancing'],
    retention: 'Session or up to 1 year',
    canDisable: false,
  },
  {
    type: 'Analytics Cookies',
    description:
      'Help us understand how visitors interact with our website by collecting information anonymously.',
    examples: ['Google Analytics', 'Page views', 'User behavior'],
    retention: 'Up to 2 years',
    canDisable: true,
  },
  {
    type: 'Marketing Cookies',
    description:
      'Used to track visitors across websites to display relevant advertisements.',
    examples: ['Facebook Pixel', 'Google Ads', 'Retargeting'],
    retention: 'Up to 2 years',
    canDisable: true,
  },
  {
    type: 'Preference Cookies',
    description:
      'Remember your preferences and settings to provide a personalized experience.',
    examples: ['Language settings', 'Theme preferences', 'Dashboard layout'],
    retention: 'Up to 1 year',
    canDisable: true,
  },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Cookie className="w-4 h-4" />
                  Cookie Policy
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Cookie Policy
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Learn about how we use cookies and similar technologies to
                  improve your experience on our website.
                </p>

                <div className="flex items-center justify-center gap-4 mt-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Last updated: {lastUpdated}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="prose prose-lg max-w-none"
              >
                <div className="space-y-12">
                  {/* Introduction */}
                  <div className="p-8 rounded-2xl border bg-card/50 backdrop-blur-sm">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Cookie className="w-6 h-6 text-primary" />
                      What Are Cookies?
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Cookies are small text files that are placed on your
                      computer or mobile device when you visit our website. They
                      are widely used to make websites work more efficiently and
                      provide information to website owners.
                    </p>
                    <p className="text-muted-foreground leading-relaxed mt-4">
                      We use cookies to enhance your browsing experience,
                      analyze site traffic, personalize content, and serve
                      targeted advertisements. This policy explains what cookies
                      we use and why.
                    </p>
                  </div>

                  {/* Cookie Types */}
                  <div>
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                      <Settings className="w-6 h-6 text-primary" />
                      Types of Cookies We Use
                    </h2>

                    <div className="grid gap-6">
                      {cookieTypes.map((cookie, index) => (
                        <motion.div
                          key={cookie.type}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          className="p-6 rounded-2xl border bg-card/50 backdrop-blur-sm"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-semibold">
                              {cookie.type}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                cookie.canDisable
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                  : 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                              }`}
                            >
                              {cookie.canDisable ? 'Optional' : 'Required'}
                            </span>
                          </div>

                          <p className="text-muted-foreground mb-4">
                            {cookie.description}
                          </p>

                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h4 className="font-medium mb-2">Examples:</h4>
                              <ul className="text-muted-foreground space-y-1">
                                {cookie.examples.map((example, i) => (
                                  <li key={i}>• {example}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Retention:</h4>
                              <p className="text-muted-foreground">
                                {cookie.retention}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Managing Cookies */}
                  <div className="p-8 rounded-2xl border bg-card/50 backdrop-blur-sm">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Eye className="w-6 h-6 text-primary" />
                      Managing Your Cookie Preferences
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          Cookie Settings
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          You can manage your cookie preferences at any time by
                          clicking the "Cookie Settings" button in our website
                          footer or by visiting your browser settings.
                        </p>
                        <Button className="mb-4">
                          <Settings className="w-4 h-4 mr-2" />
                          Manage Cookie Preferences
                        </Button>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          Browser Settings
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Most web browsers allow you to control cookies through
                          their settings. You can:
                        </p>
                        <ul className="text-muted-foreground space-y-2 ml-6">
                          <li>• Block all cookies</li>
                          <li>• Block third-party cookies</li>
                          <li>• Delete cookies when you close your browser</li>
                          <li>• Get notified when cookies are set</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <p className="text-sm text-orange-800 dark:text-orange-200">
                          <strong>Note:</strong> Disabling certain cookies may
                          affect the functionality of our website and limit your
                          access to some features.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Third-Party Cookies */}
                  <div className="p-8 rounded-2xl border bg-card/50 backdrop-blur-sm">
                    <h2 className="text-2xl font-bold mb-4">
                      Third-Party Cookies
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      We may use third-party services that set cookies on our
                      website. These include:
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-2">
                          Analytics Services
                        </h3>
                        <ul className="text-muted-foreground space-y-1 text-sm">
                          <li>• Google Analytics</li>
                          <li>• Hotjar</li>
                          <li>• Mixpanel</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">
                          Marketing Services
                        </h3>
                        <ul className="text-muted-foreground space-y-1 text-sm">
                          <li>• Google Ads</li>
                          <li>• Facebook Pixel</li>
                          <li>• LinkedIn Insight Tag</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Updates */}
                  <div className="p-8 rounded-2xl border bg-card/50 backdrop-blur-sm">
                    <h2 className="text-2xl font-bold mb-4">
                      Updates to This Policy
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We may update this Cookie Policy from time to time to
                      reflect changes in our practices or for other operational,
                      legal, or regulatory reasons. We will notify you of any
                      material changes by posting the updated policy on our
                      website.
                    </p>
                  </div>

                  {/* Contact */}
                  <div className="p-8 rounded-2xl border bg-card/50 backdrop-blur-sm">
                    <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      If you have any questions about our use of cookies, please
                      contact us:
                    </p>
                    <div className="space-y-2 text-muted-foreground">
                      <p>Email: privacy@aiproductcreator.com</p>
                      <p>
                        Address: 123 Innovation Drive, San Francisco, CA 94105
                      </p>
                    </div>
                    <Button className="mt-4" asChild>
                      <a href="/contact">
                        Contact Us
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </div>
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
