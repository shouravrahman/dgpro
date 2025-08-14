// User Service
// Handles all user-related database operations

import type { Database } from '@/types/database';
import type { DatabaseClient } from '../index';

export class UserService {
    constructor(private client: DatabaseClient) { }

    async getUser(id: string) {
        const { data, error } = await this.client
            .from('users')
            .select(`
        *,
        user_profiles (*)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    async getUserStats(userId: string) {
        const { data, error } = await this.client
            .from('user_stats')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    }

    async updateUser(id: string, updates: Database['public']['Tables']['users']['Update']) {
        const { data, error } = await this.client
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async createUserProfile(profile: Database['public']['Tables']['user_profiles']['Insert']) {
        const { data, error } = await this.client
            .from('user_profiles')
            .insert(profile)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateUserProfile(userId: string, updates: Database['public']['Tables']['user_profiles']['Update']) {
        const { data, error } = await this.client
            .from('user_profiles')
            .update(updates)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getUserFollowers(userId: string, limit = 20, offset = 0) {
        const { data, error } = await this.client
            .from('user_follows')
            .select(`
        *,
        follower:users!user_follows_follower_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
            .eq('following_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return data;
    }

    async getUserFollowing(userId: string, limit = 20, offset = 0) {
        const { data, error } = await this.client
            .from('user_follows')
            .select(`
        *,
        following:users!user_follows_following_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
            .eq('follower_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return data;
    }

    async followUser(followerId: string, followingId: string) {
        const { data, error } = await this.client
            .from('user_follows')
            .insert({
                follower_id: followerId,
                following_id: followingId
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async unfollowUser(followerId: string, followingId: string) {
        const { error } = await this.client
            .from('user_follows')
            .delete()
            .eq('follower_id', followerId)
            .eq('following_id', followingId);

        if (error) throw error;
    }

    async isFollowing(followerId: string, followingId: string): Promise<boolean> {
        const { data, error } = await this.client
            .from('user_follows')
            .select('id')
            .eq('follower_id', followerId)
            .eq('following_id', followingId)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
        return !!data;
    }
}