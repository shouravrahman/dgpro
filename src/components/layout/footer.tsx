'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sparkles,
  Twitter,
  Github,
  Linkedin,
  Mail,
  ArrowRight,
  Heart,
  MapPin,
  Phone,
} from 'lucide-react';

const footerLinks = {
  product: {
    title: 'Product',
    links: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'How it Works', href: '/how-it-works' },
      { name: 'API', href: '/api-docs' },
      { name: 'Integrations', href: '/integrations' },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Affiliate', href: '/affiliate' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
    ],
  },
  resources: {
    title: 'Resources',
    links: [
      { name: 'Documentation', href: '/docs' },
      { name: 'Help Center', href: '/help' },
      { name: 'Community', href: '/community' },
      { name: 'Templates', href: '/templates' },
      { name: 'Tutorials', href: '/tutorials' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'GDPR', href: '/gdpr' },
      { name: 'Security', href: '/security' },
    ],
  },
};

const socialLinks = [
  { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
  { name: 'GitHub', href: 'https://github.com', icon: Github },
  { name: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
  { name: 'Email', href: 'mailto:hello@aiproductcreator.com', icon: Mail },
];

export function Footer() {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup');
  };

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Link href="/" className="flex items-center space-x-2 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    AI Product Creator
                  </span>
                </Link>

                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Transform your ideas into profitable digital products using
                  advanced AI analysis, market insights, and automated creation
                  tools.
                </p>

                {/* Contact Info */}
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>San Francisco, CA</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>hello@aiproductcreator.com</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex items-center space-x-4 mt-6">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <motion.a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 bg-muted hover:bg-primary hover:text-white rounded-lg flex items-center justify-center transition-colors duration-200"
                      >
                        <Icon className="w-5 h-5" />
                      </motion.a>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Links Sections */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {Object.entries(footerLinks).map(([key, section], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <h3 className="font-semibold mb-4">{section.title}</h3>
                    <ul className="space-y-3">
                      {section.links.map((link) => (
                        <li key={link.name}>
                          <Link
                            href={link.href}
                            className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                          >
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Newsletter Section */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h3 className="font-semibold mb-4">Stay Updated</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Get the latest updates, tips, and insights delivered to your
                  inbox.
                </p>

                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full"
                    required
                  />
                  <Button type="submit" className="w-full group">
                    Subscribe
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </form>

                <p className="text-xs text-muted-foreground mt-3">
                  By subscribing, you agree to our Privacy Policy and consent to
                  receive updates.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="py-6 border-t flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0"
        >
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <span>© 2024 AI Product Creator. Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>in San Francisco.</span>
          </div>

          <div className="flex items-center space-x-6 text-sm">
            <Link
              href="/status"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              System Status
            </Link>
            <Link
              href="/sitemap"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Sitemap
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-muted-foreground">
                All systems operational
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
