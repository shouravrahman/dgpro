'use client';

// Privacy Policy Page
// Data privacy and protection information

import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Calendar,
  Lock,
  Eye,
  Database,
  Users,
  Globe,
  Mail,
  ArrowRight,
  Download,
  CheckCircle,
  AlertTriangle,
  Cookie,
} from 'lucide-react';

const lastUpdated = 'December 14, 2024';

const sections = [
  {
    id: 'overview',
    title: '1. Overview',
    content: `At AI Product Creator, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.

We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy or our practices with regard to your personal information, please contact us at privacy@aiproductcreator.com.

This Privacy Policy applies to all information collected through our website, mobile applications, and any related services, sales, marketing, or events (collectively, the "Services").`,
  },
  {
    id: 'information-collected',
    title: '2. Information We Collect',
    content: `We collect information you provide directly to us, such as when you:

Personal Information:
• Name and contact information (email address, phone number)
• Account credentials (username, password)
• Payment information (processed securely through third-party providers)
• Profile information and preferences
• Content you create using our services

Automatically Collected Information:
• Device information (IP address, browser type, operating system)
• Usage data (pages visited, time spent, features used)
• Location data (general geographic location)
• Cookies and similar tracking technologies

Third-Party Information:
• Information from social media platforms (if you connect your accounts)
• Data from integrated third-party services
• Public information that helps improve our AI models`,
  },
  {
    id: 'how-we-use',
    title: '3. How We Use Your Information',
    content: `We use the information we collect to:

Service Provision:
• Provide, maintain, and improve our services
• Process transactions and send related information
• Provide customer support and respond to inquiries
• Generate AI-powered insights and recommendations

Communication:
• Send you technical notices, updates, and security alerts
• Communicate about products, services, and promotional offers
• Respond to your comments and questions

Analytics and Improvement:
• Monitor and analyze usage patterns and trends
• Improve our AI models and algorithms
• Develop new features and services
• Conduct research and analytics

Legal and Security:
• Comply with legal obligations
• Protect against fraud and unauthorized access
• Enforce our terms and policies`,
  },
  {
    id: 'information-sharing',
    title: '4. Information Sharing and Disclosure',
    content: `We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:

Service Providers:
• Third-party vendors who assist in operating our services
• Payment processors for billing and transactions
• Cloud hosting and data storage providers
• Analytics and marketing service providers

Business Transfers:
• In connection with mergers, acquisitions, or asset sales
• During bankruptcy or similar proceedings

Legal Requirements:
• To comply with applicable laws and regulations
• To respond to legal process or government requests
• To protect our rights, property, or safety
• To protect the rights, property, or safety of others

With Your Consent:
• When you explicitly consent to sharing
• For purposes you have specifically authorized`,
  },
  {
    id: 'data-security',
    title: '5. Data Security',
    content: `We implement appropriate technical and organizational security measures to protect your personal information:

Technical Safeguards:
• Encryption of data in transit and at rest
• Secure socket layer (SSL) technology
• Regular security assessments and updates
• Access controls and authentication systems

Organizational Measures:
• Employee training on data protection
• Limited access to personal information
• Regular security audits and monitoring
• Incident response procedures

Industry Standards:
• SOC 2 Type II compliance
• GDPR compliance for EU users
• Regular third-party security assessments
• Adherence to industry best practices

Despite our efforts, no security system is impenetrable. We cannot guarantee the absolute security of your information.`,
  },
  {
    id: 'data-retention',
    title: '6. Data Retention',
    content: `We retain your personal information only as long as necessary to fulfill the purposes outlined in this Privacy Policy:

Account Information:
• Retained while your account is active
• Deleted within 30 days of account closure (unless legally required to retain)

Usage Data:
• Aggregated usage data may be retained indefinitely
• Individual usage data deleted after 2 years of inactivity

Content Data:
• User-generated content retained as long as account is active
• Deleted upon account closure or user request

Legal Requirements:
• Some data may be retained longer to comply with legal obligations
• Financial records retained for 7 years as required by law`,
  },
  {
    id: 'your-rights',
    title: '7. Your Privacy Rights',
    content: `Depending on your location, you may have the following rights regarding your personal information:

Access Rights:
• Request access to your personal information
• Receive a copy of your data in a portable format
• Request information about how your data is processed

Control Rights:
• Update or correct your personal information
• Delete your personal information (right to be forgotten)
• Restrict or object to processing of your data
• Withdraw consent where processing is based on consent

Communication Rights:
• Opt out of marketing communications
• Choose cookie preferences
• Control notification settings

To exercise these rights, please contact us at privacy@aiproductcreator.com. We will respond to your request within 30 days.`,
  },
  {
    id: 'cookies',
    title: '8. Cookies and Tracking Technologies',
    content: `We use cookies and similar tracking technologies to enhance your experience:

Essential Cookies:
• Required for basic website functionality
• Authentication and security
• Cannot be disabled

Analytics Cookies:
• Help us understand how you use our services
• Improve website performance and user experience
• Can be disabled through browser settings

Marketing Cookies:
• Personalize content and advertisements
• Track effectiveness of marketing campaigns
• Can be disabled through cookie preferences

Third-Party Cookies:
• Social media plugins and integrations
• Third-party analytics and advertising services
• Governed by third-party privacy policies

You can control cookie settings through your browser preferences or our cookie consent manager.`,
  },
  {
    id: 'international-transfers',
    title: '9. International Data Transfers',
    content: `Your information may be transferred to and processed in countries other than your own:

Data Processing Locations:
• United States (primary data centers)
• European Union (for EU users)
• Other countries where our service providers operate

Safeguards for International Transfers:
• Standard Contractual Clauses (SCCs)
• Adequacy decisions by relevant authorities
• Binding Corporate Rules where applicable
• Other appropriate safeguards as required by law

We ensure that any international transfer of your personal information is subject to appropriate safeguards to protect your privacy rights.`,
  },
  {
    id: 'children-privacy',
    title: "10. Children's Privacy",
    content: `Our services are not intended for children under the age of 13 (or 16 in the EU):

Age Restrictions:
• We do not knowingly collect information from children under 13
• Users must be at least 18 to create an account
• Parental consent required for users under 18

If We Learn of Child Data:
• We will delete the information as soon as possible
• We will terminate the account if applicable
• We will notify parents/guardians if required by law

If you believe we have collected information from a child, please contact us immediately at privacy@aiproductcreator.com.`,
  },
  {
    id: 'california-privacy',
    title: '11. California Privacy Rights (CCPA)',
    content: `If you are a California resident, you have additional rights under the California Consumer Privacy Act:

Right to Know:
• Categories of personal information collected
• Sources of personal information
• Business purposes for collecting information
• Categories of third parties with whom information is shared

Right to Delete:
• Request deletion of personal information
• Exceptions for legal compliance and legitimate business purposes

Right to Opt-Out:
• Opt out of the sale of personal information
• We do not sell personal information to third parties

Right to Non-Discrimination:
• We will not discriminate against you for exercising your rights
• Same quality of service regardless of privacy choices

To exercise these rights, contact us at privacy@aiproductcreator.com or call 1-855-PRIVACY.`,
  },
  {
    id: 'gdpr-rights',
    title: '12. European Privacy Rights (GDPR)',
    content: `If you are in the European Economic Area, you have rights under the General Data Protection Regulation:

Legal Basis for Processing:
• Consent for marketing communications
• Contract performance for service provision
• Legitimate interests for analytics and improvements
• Legal compliance where required

Your GDPR Rights:
• Right of access to your personal data
• Right to rectification of inaccurate data
• Right to erasure (right to be forgotten)
• Right to restrict processing
• Right to data portability
• Right to object to processing
• Rights related to automated decision-making

Data Protection Officer:
• Contact: dpo@aiproductcreator.com
• Available for privacy-related inquiries
• Supervisory authority complaints`,
  },
  {
    id: 'changes',
    title: '13. Changes to This Privacy Policy',
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws:

Notification of Changes:
• Material changes will be communicated via email
• Notice posted on our website for 30 days
• Updated "Last Modified" date at the top of this policy

Your Continued Use:
• Continued use after changes constitutes acceptance
• You may close your account if you disagree with changes
• Previous versions available upon request

We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.`,
  },
  {
    id: 'contact',
    title: '14. Contact Information',
    content: `If you have questions or concerns about this Privacy Policy or our data practices:

Privacy Team:
• Email: privacy@aiproductcreator.com
• Response time: Within 48 hours for privacy inquiries

Data Protection Officer:
• Email: dpo@aiproductcreator.com
• Available for GDPR-related inquiries

Mailing Address:
AI Product Creator Inc.
Attn: Privacy Team
123 Innovation Drive
San Francisco, CA 94105
United States

For general inquiries: hello@aiproductcreator.com`,
  },
];

const privacyFeatures = [
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description:
      'Your data is encrypted in transit and at rest using industry-standard encryption.',
  },
  {
    icon: Shield,
    title: 'SOC 2 Compliant',
    description:
      'We maintain SOC 2 Type II compliance for security and availability.',
  },
  {
    icon: Eye,
    title: 'Transparent Practices',
    description:
      'Clear information about what data we collect and how we use it.',
  },
  {
    icon: Users,
    title: 'No Data Selling',
    description: 'We never sell your personal information to third parties.',
  },
];

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = React.useState('');

  React.useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      let currentSection = '';

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          currentSection = section.getAttribute('data-section') || '';
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-8"
              >
                <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Privacy Policy
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  Your privacy is our priority. Learn how we protect and handle
                  your data.
                </p>

                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-8">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Last updated: {lastUpdated}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>GDPR Compliant</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    <Cookie className="w-4 h-4 mr-2" />
                    Cookie Settings
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Privacy Features */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <h2 className="text-2xl font-bold mb-4">
                  Our Privacy Commitments
                </h2>
                <p className="text-muted-foreground">
                  We're committed to protecting your privacy with
                  industry-leading practices
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {privacyFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="text-center p-6 rounded-2xl border bg-card/50 backdrop-blur-sm"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-4 gap-8">
                {/* Table of Contents */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24">
                    <h3 className="font-semibold mb-4">Table of Contents</h3>
                    <nav className="space-y-2">
                      {sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          className={`block w-full text-left text-sm py-2 px-3 rounded-lg transition-colors duration-200 hover:bg-muted/50 ${
                            activeSection === section.id
                              ? 'bg-primary/10 text-primary border-l-2 border-primary'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {section.title}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>

                {/* Privacy Policy Content */}
                <div className="lg:col-span-3">
                  <div className="prose prose-gray max-w-none">
                    {/* Important Notice */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="p-6 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 mb-8"
                    >
                      <div className="flex items-start gap-3">
                        <Database className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                            Your Data, Your Control
                          </h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mb-0">
                            You have full control over your personal data. You
                            can access, update, or delete your information at
                            any time through your account settings or by
                            contacting us.
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Sections */}
                    {sections.map((section, index) => (
                      <motion.div
                        key={section.id}
                        id={section.id}
                        data-section={section.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
                        className="mb-12 scroll-mt-24"
                      >
                        <h2 className="text-2xl font-bold mb-4 text-foreground">
                          {section.title}
                        </h2>
                        <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {section.content}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-muted/20 border-t">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">
                  Questions about your privacy?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Our privacy team is here to help with any questions about how
                  we handle your data.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button>
                    Contact Privacy Team
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button variant="outline">
                    <Globe className="w-4 h-4 mr-2" />
                    Data Protection Officer
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
