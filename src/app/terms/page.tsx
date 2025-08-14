'use client';

// Terms of Service Page
// Legal terms and conditions

import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Calendar,
  Shield,
  AlertTriangle,
  Mail,
  ArrowRight,
  Download,
  Printer,
} from 'lucide-react';

const lastUpdated = 'December 14, 2024';

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By accessing and using AI Product Creator ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.

These Terms of Service ("Terms") govern your use of our website located at aiproductcreator.com (the "Service") operated by AI Product Creator Inc. ("us", "we", or "our").

Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users and others who access or use the Service.`,
  },
  {
    id: 'description',
    title: '2. Description of Service',
    content: `AI Product Creator is a platform that uses artificial intelligence to help users create, design, and launch digital products. Our services include but are not limited to:

• AI-powered product idea generation and validation
• Market research and competitive analysis
• Product design and prototyping assistance
• Marketing strategy development
• Analytics and performance tracking
• Integration with third-party platforms and tools

We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, with or without notice.`,
  },
  {
    id: 'accounts',
    title: '3. User Accounts',
    content: `To access certain features of the Service, you must register for an account. When you create an account, you must provide information that is accurate, complete, and current at all times.

You are responsible for safeguarding the password and for maintaining the confidentiality of your account. You agree not to disclose your password to any third party and to take sole responsibility for any activities or actions under your account.

You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.`,
  },
  {
    id: 'acceptable-use',
    title: '4. Acceptable Use Policy',
    content: `You agree not to use the Service:

• For any unlawful purpose or to solicit others to perform unlawful acts
• To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances
• To infringe upon or violate our intellectual property rights or the intellectual property rights of others
• To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate
• To submit false or misleading information
• To upload or transmit viruses or any other type of malicious code
• To collect or track the personal information of others
• To spam, phish, pharm, pretext, spider, crawl, or scrape
• For any obscene or immoral purpose or to engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service`,
  },
  {
    id: 'intellectual-property',
    title: '5. Intellectual Property Rights',
    content: `The Service and its original content, features, and functionality are and will remain the exclusive property of AI Product Creator Inc. and its licensors. The Service is protected by copyright, trademark, and other laws.

You retain ownership of any content you create using our Service. However, by using our Service, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content solely for the purpose of providing and improving our Service.

Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.`,
  },
  {
    id: 'user-content',
    title: '6. User-Generated Content',
    content: `Our Service may allow you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.

By posting Content to the Service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service.

You represent and warrant that:
• The Content is yours (you own it) or you have the right to use it
• The Content does not infringe, violate or misappropriate the rights of any third party`,
  },
  {
    id: 'privacy',
    title: '7. Privacy Policy',
    content: `Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.

We collect, use, and protect your personal information in accordance with our Privacy Policy. By using our Service, you consent to the collection and use of your information as outlined in our Privacy Policy.`,
  },
  {
    id: 'payments',
    title: '8. Payments and Billing',
    content: `Certain aspects of the Service may be provided for a fee or other charge. If you elect to use paid aspects of the Service, you agree to the pricing and payment terms as we may establish from time to time.

We may add new services for additional fees and charges, modify fees and charges for existing services, at any time in our sole discretion. Any change to our pricing or payment terms shall become effective in the billing cycle following notice of such change to you.

All fees are non-refundable except as expressly stated in these Terms or as required by applicable law.`,
  },
  {
    id: 'termination',
    title: '9. Termination',
    content: `We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.

Upon termination, your right to use the Service will cease immediately. If you wish to terminate your account, you may simply discontinue using the Service.

All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.`,
  },
  {
    id: 'disclaimers',
    title: '10. Disclaimers',
    content: `The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, this Company:

• Excludes all representations and warranties relating to this website and its contents
• Excludes all liability for damages arising out of or in connection with your use of this website

The Service is provided "AS IS" and "AS AVAILABLE" without any representation or endorsement made and without warranty of any kind whether express or implied.

We do not warrant that the Service will be uninterrupted, timely, secure, or error-free.`,
  },
  {
    id: 'limitation',
    title: '11. Limitation of Liability',
    content: `In no event shall AI Product Creator Inc., nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.

Our total liability to you for all claims arising from or relating to the Service shall not exceed the amount you paid us in the twelve (12) months preceding the claim.`,
  },
  {
    id: 'governing-law',
    title: '12. Governing Law',
    content: `These Terms shall be interpreted and governed by the laws of the State of California, United States, without regard to its conflict of law provisions.

Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.`,
  },
  {
    id: 'changes',
    title: '13. Changes to Terms',
    content: `We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.

By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.`,
  },
  {
    id: 'contact',
    title: '14. Contact Information',
    content: `If you have any questions about these Terms of Service, please contact us:

• Email: legal@aiproductcreator.com
• Address: 123 Innovation Drive, San Francisco, CA 94105
• Phone: +1 (555) 123-4567

For general inquiries, please use: hello@aiproductcreator.com`,
  },
];

export default function TermsPage() {
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
                <FileText className="w-16 h-16 text-primary mx-auto mb-6" />
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Terms of Service
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  Please read these terms carefully before using our service
                </p>

                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-8">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Last updated: {lastUpdated}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Version 2.1</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
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

                {/* Terms Content */}
                <div className="lg:col-span-3">
                  <div className="prose prose-gray max-w-none">
                    {/* Important Notice */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="p-6 rounded-xl border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20 mb-8"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                            Important Notice
                          </h4>
                          <p className="text-sm text-orange-700 dark:text-orange-300 mb-0">
                            These terms constitute a legally binding agreement
                            between you and AI Product Creator Inc. By using our
                            service, you acknowledge that you have read,
                            understood, and agree to be bound by these terms.
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
                  Questions about our terms?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Our legal team is here to help clarify any questions you may
                  have about these terms.
                </p>
                <Button>
                  Contact Legal Team
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
