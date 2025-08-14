'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Lock,
  Key,
  Eye,
  Server,
  AlertTriangle,
  CheckCircle,
  Globe,
  Users,
  FileText,
  ArrowRight,
  Award,
} from 'lucide-react';

const securityFeatures = [
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description:
      'All data is encrypted in transit and at rest using industry-standard AES-256 encryption.',
    status: 'Implemented',
  },
  {
    icon: Key,
    title: 'Multi-Factor Authentication',
    description:
      'Secure your account with 2FA using authenticator apps, SMS, or hardware keys.',
    status: 'Available',
  },
  {
    icon: Server,
    title: 'Secure Infrastructure',
    description:
      'Hosted on enterprise-grade cloud infrastructure with 99.9% uptime guarantee.',
    status: 'Active',
  },
  {
    icon: Eye,
    title: 'Privacy by Design',
    description:
      'Built with privacy principles from the ground up, minimizing data collection.',
    status: 'Core Feature',
  },
  {
    icon: Users,
    title: 'Access Controls',
    description:
      'Role-based permissions and audit logs for all user activities.',
    status: 'Enterprise',
  },
  {
    icon: Globe,
    title: 'Global Compliance',
    description:
      'GDPR, CCPA, and SOC 2 compliant with regular third-party audits.',
    status: 'Certified',
  },
];

const certifications = [
  {
    name: 'SOC 2 Type II',
    description:
      'Annual security audit covering security, availability, and confidentiality.',
    icon: Award,
    status: 'Current',
  },
  {
    name: 'GDPR Compliant',
    description: 'Full compliance with European data protection regulations.',
    icon: Shield,
    status: 'Verified',
  },
  {
    name: 'ISO 27001',
    description: 'Information security management system certification.',
    icon: CheckCircle,
    status: 'In Progress',
  },
];

const securityPractices = [
  'Regular security audits and penetration testing',
  'Automated vulnerability scanning and patching',
  'Employee security training and background checks',
  'Incident response plan with 24/7 monitoring',
  'Data backup and disaster recovery procedures',
  'Secure development lifecycle (SDLC) practices',
];

export default function SecurityPage() {
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-sm font-medium mb-6">
                  <Shield className="w-4 h-4" />
                  Enterprise-Grade Security
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Your data is
                  <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                    {' '}
                    secure with us
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  We take security seriously. Learn about our comprehensive
                  security measures, certifications, and commitment to
                  protecting your data and privacy.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Security Features */}
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
                  Security Features
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Multiple layers of protection to keep your data safe
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {securityFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="p-6 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs font-medium rounded-full">
                          {feature.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Certifications */}
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
                  Certifications & Compliance
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Independently verified security and compliance standards
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {certifications.map((cert, index) => {
                  const Icon = cert.icon;
                  return (
                    <motion.div
                      key={cert.name}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="text-center p-8 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {cert.name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        {cert.description}
                      </p>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          cert.status === 'Current' ||
                          cert.status === 'Verified'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                        }`}
                      >
                        {cert.status}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Security Practices */}
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
                  Security Practices
                </h2>
                <p className="text-xl text-muted-foreground">
                  Our comprehensive approach to security
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="p-8 rounded-2xl border bg-card/50 backdrop-blur-sm"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  {securityPractices.map((practice, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{practice}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Incident Response */}
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
                    Incident Response
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      We maintain a comprehensive incident response plan to
                      quickly identify, contain, and resolve any security
                      incidents.
                    </p>
                    <p>
                      Our security team monitors systems 24/7 and can respond to
                      incidents within minutes. We also maintain transparent
                      communication with affected users throughout any incident.
                    </p>
                    <p>
                      In the unlikely event of a security incident, we will
                      notify affected users within 72 hours and provide regular
                      updates until resolution.
                    </p>
                  </div>
                  <Button className="mt-6" asChild>
                    <a href="/contact">
                      Report Security Issue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="p-8 rounded-2xl border bg-card/50 backdrop-blur-sm"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">
                      Security Contact
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Found a security vulnerability? We appreciate responsible
                      disclosure.
                    </p>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Email:</strong> security@aiproductcreator.com
                      </p>
                      <p>
                        <strong>Response Time:</strong> Within 24 hours
                      </p>
                      <p>
                        <strong>PGP Key:</strong> Available on request
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Center CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center p-12 rounded-2xl bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 border"
              >
                <Shield className="w-16 h-16 text-green-600 mx-auto mb-6" />
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Questions About Security?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Our security team is here to help. Get detailed information
                  about our security practices, compliance reports, and more.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <a href="/contact">
                      Contact Security Team
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="/docs/security">
                      View Documentation
                      <FileText className="w-5 h-5 ml-2" />
                    </a>
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
