'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { FAQ } from '@/components/ui/faq';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Headphones,
  Users,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  inquiryType: z.enum(['general', 'sales', 'support', 'partnership', 'press']),
});

type ContactFormData = z.infer<typeof contactSchema>;

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Us',
    description: "Send us an email and we'll respond within 24 hours",
    contact: 'hello@aiproductcreator.com',
    action: 'mailto:hello@aiproductcreator.com',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: MessageCircle,
    title: 'Live Chat',
    description: 'Chat with our team in real-time during business hours',
    contact: 'Available 9 AM - 6 PM PST',
    action: '#',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Phone,
    title: 'Call Us',
    description: 'Speak directly with our sales and support team',
    contact: '+1 (555) 123-4567',
    action: 'tel:+15551234567',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Headphones,
    title: 'Support Center',
    description: 'Browse our knowledge base and documentation',
    contact: 'help.aiproductcreator.com',
    action: '/help',
    color: 'from-orange-500 to-red-500',
  },
];

const faqs = [
  {
    question: 'How quickly can I get started?',
    answer:
      'You can sign up and start creating products immediately. Our onboarding process takes less than 5 minutes, and you can have your first product idea generated within minutes.',
  },
  {
    question: 'Do you offer custom enterprise solutions?',
    answer:
      'Yes! We offer custom enterprise solutions with dedicated support, custom integrations, white-label options, and volume pricing. Contact our sales team to discuss your specific needs.',
  },
  {
    question: 'What kind of support do you provide?',
    answer:
      'We offer multiple support channels including live chat, email support, comprehensive documentation, video tutorials, and community forums. Pro and Enterprise users get priority support.',
  },
  {
    question: 'Can I integrate with my existing tools?',
    answer:
      'Absolutely! We offer integrations with popular tools like Shopify, WooCommerce, Stripe, PayPal, Zapier, and many more. Our API also allows for custom integrations.',
  },
  {
    question: 'Is there a free trial available?',
    answer:
      'Yes, we offer a free tier that includes 3 products per month and basic AI analysis. You can also try our Pro plan free for 14 days with no credit card required.',
  },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      inquiryType: 'general',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log('Contact form submitted:', data);
      toast.success("Message sent successfully! We'll get back to you soon.");
      setIsSubmitted(true);
      reset();
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  Get in
                  <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    {' '}
                    touch
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Have questions? Need help getting started? Our team is here to
                  support your journey to digital product success.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {contactMethods.map((method, index) => {
                  const Icon = method.icon;
                  return (
                    <motion.a
                      key={method.title}
                      href={method.action}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="group p-6 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 block"
                    >
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${method.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                        {method.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {method.description}
                      </p>
                      <p className="text-sm font-medium text-primary">
                        {method.contact}
                      </p>
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form and Info */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Contact Form */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="p-8 rounded-2xl border bg-card/50 backdrop-blur-sm"
                >
                  <h2 className="text-2xl font-bold mb-6">Send us a message</h2>

                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        Message sent!
                      </h3>
                      <p className="text-muted-foreground">
                        Thank you for reaching out. We&apos;ll get back to you
                        within 24 hours.
                      </p>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      {/* Name and Email */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            {...register('name')}
                            placeholder="Your full name"
                          />
                          {errors.name && (
                            <p className="text-sm text-destructive">
                              {errors.name.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            {...register('email')}
                            placeholder="your@email.com"
                          />
                          {errors.email && (
                            <p className="text-sm text-destructive">
                              {errors.email.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Company and Inquiry Type */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company">Company (Optional)</Label>
                          <Input
                            id="company"
                            {...register('company')}
                            placeholder="Your company name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inquiryType">Inquiry Type *</Label>
                          <select
                            id="inquiryType"
                            {...register('inquiryType')}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="general">General Inquiry</option>
                            <option value="sales">Sales</option>
                            <option value="support">Technical Support</option>
                            <option value="partnership">Partnership</option>
                            <option value="press">Press & Media</option>
                          </select>
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          id="subject"
                          {...register('subject')}
                          placeholder="What's this about?"
                        />
                        {errors.subject && (
                          <p className="text-sm text-destructive">
                            {errors.subject.message}
                          </p>
                        )}
                      </div>

                      {/* Message */}
                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <textarea
                          id="message"
                          {...register('message')}
                          rows={6}
                          placeholder="Tell us more about your inquiry..."
                          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        />
                        {errors.message && (
                          <p className="text-sm text-destructive">
                            {errors.message.message}
                          </p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            Send Message
                          </div>
                        )}
                      </Button>
                    </form>
                  )}
                </motion.div>

                {/* Contact Info and FAQ */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="space-y-8"
                >
                  {/* Office Info */}
                  <div className="p-6 rounded-2xl border bg-card/50 backdrop-blur-sm">
                    <h3 className="text-xl font-semibold mb-4">Our Office</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-primary mt-1" />
                        <div>
                          <p className="font-medium">Address</p>
                          <p className="text-sm text-muted-foreground">
                            123 Innovation Drive
                            <br />
                            San Francisco, CA 94105
                            <br />
                            United States
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-primary mt-1" />
                        <div>
                          <p className="font-medium">Business Hours</p>
                          <p className="text-sm text-muted-foreground">
                            Monday - Friday: 9:00 AM - 6:00 PM PST
                            <br />
                            Saturday: 10:00 AM - 4:00 PM PST
                            <br />
                            Sunday: Closed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Users className="w-5 h-5 text-primary mt-1" />
                        <div>
                          <p className="font-medium">Team</p>
                          <p className="text-sm text-muted-foreground">
                            Our global team of 25+ experts is here to help you
                            succeed
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FAQ */}
                  <div className="p-6 rounded-2xl border bg-card/50 backdrop-blur-sm">
                    <h3 className="text-xl font-semibold mb-4">
                      Frequently Asked Questions
                    </h3>
                    <FAQ items={faqs} title="" description="" />
                    <div className="mt-6 pt-4 border-t">
                      <Button variant="outline" className="w-full">
                        View All FAQs
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
