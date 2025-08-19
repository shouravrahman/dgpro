'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Clock, Mail, Twitter, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MaintenanceModeProps {
  estimatedDuration?: string;
  endTime?: Date;
  message?: string;
  showNotifyForm?: boolean;
}

export function MaintenanceMode({
  estimatedDuration = '2 hours',
  endTime,
  message = "We're currently performing scheduled maintenance to improve your experience. We'll be back online shortly!",
  showNotifyForm = true,
}: MaintenanceModeProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!endTime) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = endTime.getTime();
      const difference = end - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft(null);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Here you would typically send the email to your backend
    console.log('Subscribing email for maintenance updates:', email);

    setIsSubscribed(true);
    setTimeout(() => {
      setIsSubscribed(false);
      setEmail('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 dark:from-orange-950/20 dark:via-yellow-950/20 dark:to-amber-950/20 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated maintenance icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative mb-8"
        >
          <div className="mx-auto w-32 h-32 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Wrench className="w-16 h-16 text-orange-600 dark:text-orange-400" />
            </motion.div>
          </div>

          {/* Floating gears */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full opacity-60"
          />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-4 -left-4 w-6 h-6 bg-orange-400 rounded-full opacity-50"
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Under Maintenance
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
            {message}
          </p>
        </motion.div>

        {/* Countdown timer */}
        {timeLeft && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Estimated time remaining:
              </span>
            </div>

            <div className="flex justify-center gap-4">
              {[
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg min-w-[80px]"
                >
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {item.value.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Estimated duration (when no specific end time) */}
        {!endTime && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-800 dark:text-orange-300">
                Estimated duration: {estimatedDuration}
              </span>
            </div>
          </motion.div>
        )}

        {/* Notification signup */}
        {showNotifyForm && !isSubscribed && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Get notified when we're back
            </h2>

            <form
              onSubmit={handleNotifySubmit}
              className="flex gap-2 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" className="px-6">
                Notify Me
              </Button>
            </form>
          </motion.div>
        )}

        {/* Success message */}
        {isSubscribed && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg"
          >
            <p className="text-green-800 dark:text-green-300 font-medium">
              ✅ Thanks! We'll notify you as soon as we're back online.
            </p>
          </motion.div>
        )}

        {/* Social links */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mb-8"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Stay updated on our progress:
          </p>

          <div className="flex justify-center gap-4">
            {[
              { icon: Twitter, href: '#', label: 'Twitter' },
              { icon: MessageCircle, href: '#', label: 'Discord' },
              {
                icon: Mail,
                href: 'mailto:support@example.com',
                label: 'Email',
              },
            ].map((social, index) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.label}
                  href={social.href}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                  aria-label={social.label}
                >
                  <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.a>
              );
            })}
          </div>
        </motion.div>

        {/* Status message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="p-4 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 rounded-xl"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            🔧 <strong>What we're doing:</strong> Upgrading our servers and
            databases to serve you better. Thanks for your patience!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
