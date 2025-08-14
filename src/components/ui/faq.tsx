'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

interface FAQProps {
  items: FAQItem[];
  title?: string;
  description?: string;
  className?: string;
  showCategories?: boolean;
  defaultOpen?: number;
}

export function FAQ({
  items,
  title = 'Frequently Asked Questions',
  description,
  className,
  showCategories = false,
  defaultOpen,
}: FAQProps) {
  const [openItems, setOpenItems] = React.useState<Set<number>>(
    new Set(defaultOpen !== undefined ? [defaultOpen] : [])
  );

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const categories = showCategories
    ? Array.from(new Set(items.map((item) => item.category).filter(Boolean)))
    : [];

  const getItemsByCategory = (category?: string) => {
    return items
      .map((item, index) => ({ ...item, originalIndex: index }))
      .filter((item) => !showCategories || item.category === category);
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-3 mb-4"
        >
          <HelpCircle className="w-8 h-8 text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
        </motion.div>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            {description}
          </motion.p>
        )}
      </div>

      {/* FAQ Items */}
      <div className="max-w-4xl mx-auto">
        {showCategories && categories.length > 0 ? (
          // Categorized FAQ
          <div className="space-y-12">
            {categories.map((category, categoryIndex) => (
              <motion.div
                key={category}
                initial={{ y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              >
                <h3 className="text-xl font-semibold mb-6 text-primary">
                  {category}
                </h3>
                <div className="space-y-4">
                  {getItemsByCategory(category).map((item, index) => (
                    <FAQItem
                      key={item.originalIndex}
                      item={item}
                      index={item.originalIndex}
                      isOpen={openItems.has(item.originalIndex)}
                      onToggle={() => toggleItem(item.originalIndex)}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Simple FAQ list
          <div className="space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <FAQItem
                  item={item}
                  index={index}
                  isOpen={openItems.has(index)}
                  onToggle={() => toggleItem(index)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface FAQItemProps {
  item: FAQItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ item, index, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border border-border/50 rounded-xl bg-card/50 backdrop-blur-sm overflow-hidden hover:bg-card/80 transition-colors duration-200">
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-muted/20 transition-colors duration-200"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
      >
        <span className="font-medium text-foreground pr-4">
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-answer-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-0">
              <div className="text-muted-foreground leading-relaxed">
                {item.answer}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Predefined FAQ sets for common use cases
export const commonFAQs = {
  general: [
    {
      question: 'How quickly can I get started?',
      answer:
        'You can sign up and start creating products immediately. Our onboarding process takes less than 5 minutes, and you can have your first product idea generated within minutes.',
      category: 'Getting Started',
    },
    {
      question: 'Do you offer custom enterprise solutions?',
      answer:
        'Yes! We offer custom enterprise solutions with dedicated support, custom integrations, white-label options, and volume pricing. Contact our sales team to discuss your specific needs.',
      category: 'Enterprise',
    },
    {
      question: 'What kind of support do you provide?',
      answer:
        'We offer multiple support channels including live chat, email support, comprehensive documentation, video tutorials, and community forums. Pro and Enterprise users get priority support.',
      category: 'Support',
    },
    {
      question: 'Can I integrate with my existing tools?',
      answer:
        'Absolutely! We offer integrations with popular tools like Shopify, WooCommerce, Stripe, PayPal, Zapier, and many more. Our API also allows for custom integrations.',
      category: 'Integrations',
    },
    {
      question: 'Is there a free trial available?',
      answer:
        'Yes, we offer a free tier that includes 3 products per month and basic AI analysis. You can also try our Pro plan free for 14 days with no credit card required.',
      category: 'Pricing',
    },
  ],

  pricing: [
    {
      question: 'Can I change my plan at any time?',
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing adjustments.",
      category: 'Billing',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise customers.',
      category: 'Billing',
    },
    {
      question: 'Do you offer refunds?',
      answer:
        "Yes, we offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact us for a full refund.",
      category: 'Billing',
    },
    {
      question: 'Are there any setup fees?',
      answer:
        'No, there are no setup fees or hidden costs. You only pay the monthly or annual subscription fee for your chosen plan.',
      category: 'Billing',
    },
  ],

  technical: [
    {
      question: 'What AI models do you use?',
      answer:
        'We use a combination of advanced AI models including GPT-4, Claude, and our proprietary models trained specifically for product creation and market analysis.',
      category: 'Technology',
    },
    {
      question: 'How secure is my data?',
      answer:
        'We use enterprise-grade security with end-to-end encryption, SOC 2 compliance, and regular security audits. Your data is never shared with third parties.',
      category: 'Security',
    },
    {
      question: 'Do you have an API?',
      answer:
        'Yes, we offer a comprehensive REST API that allows you to integrate our AI capabilities into your own applications and workflows.',
      category: 'Technology',
    },
    {
      question: 'What file formats do you support?',
      answer:
        'We support a wide range of formats including PDF, DOCX, CSV, JSON, images (PNG, JPG, SVG), and can export to various formats based on your needs.',
      category: 'Technology',
    },
  ],
};
