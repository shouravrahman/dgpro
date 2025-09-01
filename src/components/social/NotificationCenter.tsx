'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  X,
  User,
  Star,
  MessageSquare,
  Award,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Notification, NotificationType } from '@/types/social';
import { useNotifications } from '@/hooks/useSocial';
import { cn } from '@/lib/utils';

const notificationIcons: Record<NotificationType, React.ComponentType<any>> = {
  follow: User,
  review: Star,
  reply: MessageSquare,
  mention: MessageSquare,
  badge_earned: Award,
  product_featured: TrendingUp,
  moderation_action: Bell,
};

const notificationColors: Record<NotificationType, string> = {
  follow: 'text-blue-500',
  review: 'text-yellow-500',
  reply: 'text-green-500',
  mention: 'text-purple-500',
  badge_earned: 'text-orange-500',
  product_featured: 'text-pink-500',
  moderation_action: 'text-red-500',
};

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    if (notification.action_url) {
      setIsOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={cn('relative', className)}>
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="text-xs"
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <AnimatePresence>
                    {notifications.map((notification) => {
                      const IconComponent =
                        notificationIcons[notification.type];
                      const iconColor = notificationColors[notification.type];

                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div
                            className={cn(
                              'p-4 hover:bg-muted/50 cursor-pointer transition-colors border-l-4',
                              notification.is_read
                                ? 'border-l-transparent'
                                : 'border-l-primary bg-muted/20'
                            )}
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                          >
                            <div className="flex gap-3">
                              <div
                                className={cn('flex-shrink-0 mt-1', iconColor)}
                              >
                                <IconComponent className="h-4 w-4" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <p
                                      className={cn(
                                        'text-sm font-medium',
                                        !notification.is_read && 'font-semibold'
                                      )}
                                    >
                                      {notification.title}
                                    </p>
                                    {notification.message && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {notification.message}
                                      </p>
                                    )}
                                  </div>

                                  {!notification.is_read && (
                                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                                  )}
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(
                                      notification.created_at
                                    ).toLocaleDateString()}
                                  </span>

                                  {notification.action_url && (
                                    <Link
                                      href={notification.action_url}
                                      className="text-xs text-primary hover:underline"
                                      onClick={() => setIsOpen(false)}
                                    >
                                      View
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </ScrollArea>

            {notifications.length > 0 && (
              <div className="p-4 border-t">
                <Button variant="ghost" className="w-full text-sm" asChild>
                  <Link href="/notifications">View All Notifications</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
