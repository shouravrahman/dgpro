'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  MapPin,
  Globe,
  Calendar,
  Star,
  Users,
  UserPlus,
  UserMinus,
  Badge,
  Edit3,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge as UIBadge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  UserProfile as UserProfileType,
  UserBadge,
  UserStats,
} from '@/types/social';
import { useAuth } from '@/lib/auth/context';
import { toast } from 'sonner';

interface UserProfileProps {
  userId: string;
  onEdit?: () => void;
}

export function UserProfile({ userId, onEdit }: UserProfileProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    fetchProfile();
    fetchUserStats();
    if (!isOwnProfile) {
      checkFollowStatus();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/social/profiles?user_id=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setProfile(data.profile);
        setBadges(data.profile.user_badges || []);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`/api/social/stats?user_id=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setUserStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const checkFollowStatus = async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `/api/social/follows/status?following_id=${userId}`
      );
      const data = await response.json();

      if (response.ok) {
        setIsFollowing(data.isFollowing);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      toast.error('Please log in to follow users');
      return;
    }

    setFollowLoading(true);
    try {
      const response = await fetch('/api/social/follows', {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ following_id: userId }),
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                total_followers: prev.total_followers + (isFollowing ? -1 : 1),
              }
            : null
        );
        toast.success(isFollowing ? 'Unfollowed user' : 'Following user');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update follow status');
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Profile Not Found</h3>
          <p className="text-muted-foreground">
            This user hasn't set up their profile yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback className="text-2xl">
                  {profile.display_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold">
                      {profile.display_name || 'Anonymous User'}
                    </h1>
                    {profile.is_verified && (
                      <UIBadge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800"
                      >
                        <Badge className="h-3 w-3 mr-1" />
                        Verified
                      </UIBadge>
                    )}
                  </div>
                  {profile.bio && (
                    <p className="text-muted-foreground mb-2">{profile.bio}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.location}
                      </div>
                    )}
                    {profile.website_url && (
                      <a
                        href={profile.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <Globe className="h-4 w-4" />
                        Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {new Date(profile.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {isOwnProfile ? (
                    <Button onClick={onEdit} variant="outline">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <Button
                      onClick={handleFollow}
                      disabled={followLoading}
                      variant={isFollowing ? 'outline' : 'default'}
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {profile.total_followers}
                  </div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {profile.total_following}
                  </div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold flex items-center gap-1">
                    <Star className="h-5 w-5 text-yellow-500" />
                    {profile.reputation_score}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Reputation
                  </div>
                </div>
              </div>

              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <UIBadge key={index} variant="secondary">
                        {skill}
                      </UIBadge>
                    ))}
                  </div>
                </div>
              )}

              {/* Badges */}
              {badges.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Badges</h3>
                  <div className="flex flex-wrap gap-2">
                    {badges.map((userBadge) => (
                      <motion.div
                        key={userBadge.id}
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                        style={{
                          backgroundColor: userBadge.badge?.color + '20',
                          color: userBadge.badge?.color,
                        }}
                      >
                        <Badge className="h-3 w-3" />
                        {userBadge.badge?.name}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Recent Activity</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Activity feed coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Products</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Product showcase coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Reviews</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                User reviews coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          {userStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    {userStats.products_created}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Products Created
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    {userStats.reviews_written}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Reviews Written
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    {userStats.topics_created}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Topics Created
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    {userStats.badges_earned}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Badges Earned
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
