'use client';

import { useState, useEffect } from 'react';
import { UserProfile, ProductReview, ForumTopic, Notification } from '@/types/social';

export function useUserProfile(userId: string) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;

        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/social/profiles?user_id=${userId}`);
                const data = await response.json();

                if (response.ok) {
                    setProfile(data.profile);
                } else {
                    setError(data.error || 'Failed to fetch profile');
                }
            } catch (err) {
                setError('Failed to fetch profile');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    return { profile, isLoading, error, refetch: () => fetchProfile() };
}

export function useProductReviews(productId: string) {
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!productId) return;

        const fetchReviews = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/social/reviews?product_id=${productId}`);
                const data = await response.json();

                if (response.ok) {
                    setReviews(data.reviews);
                } else {
                    setError(data.error || 'Failed to fetch reviews');
                }
            } catch (err) {
                setError('Failed to fetch reviews');
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, [productId]);

    return { reviews, isLoading, error, refetch: () => fetchReviews() };
}

export function useForumTopics(categoryId?: string) {
    const [topics, setTopics] = useState<ForumTopic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                setIsLoading(true);
                const params = new URLSearchParams();
                if (categoryId) params.append('category_id', categoryId);

                const response = await fetch(`/api/social/forum/topics?${params}`);
                const data = await response.json();

                if (response.ok) {
                    setTopics(data.topics);
                } else {
                    setError(data.error || 'Failed to fetch topics');
                }
            } catch (err) {
                setError('Failed to fetch topics');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTopics();
    }, [categoryId]);

    return { topics, isLoading, error, refetch: () => fetchTopics() };
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch('/api/social/notifications');
                const data = await response.json();

                if (response.ok) {
                    setNotifications(data.notifications);
                    setUnreadCount(data.notifications.filter((n: Notification) => !n.is_read).length);
                }
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (notificationId: string) => {
        try {
            const response = await fetch(`/api/social/notifications/${notificationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_read: true }),
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/social/notifications/mark-all-read', {
                method: 'POST',
            });

            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                setUnreadCount(0);
            }
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err);
        }
    };

    return {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
    };
}

export function useFollowStatus(userId: string) {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const checkFollowStatus = async () => {
            try {
                const response = await fetch(`/api/social/follows/status?following_id=${userId}`);
                const data = await response.json();

                if (response.ok) {
                    setIsFollowing(data.isFollowing);
                }
            } catch (err) {
                console.error('Failed to check follow status:', err);
            } finally {
                setIsLoading(false);
            }
        };

        checkFollowStatus();
    }, [userId]);

    const toggleFollow = async () => {
        try {
            const response = await fetch('/api/social/follows', {
                method: isFollowing ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ following_id: userId }),
            });

            if (response.ok) {
                setIsFollowing(!isFollowing);
                return true;
            }
            return false;
        } catch (err) {
            console.error('Failed to toggle follow:', err);
            return false;
        }
    };

    return { isFollowing, isLoading, toggleFollow };
}