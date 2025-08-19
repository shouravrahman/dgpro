import { createClient } from '@/lib/supabase/server';
import type {
    UserRole,
    CreatorStep1,
    CreatorStep2,
    CreatorStep3,
    BuyerStep1,
    BuyerStep2,
    BuyerStep3
} from '@/lib/validations/onboarding';

export interface OnboardingStatus {
    userId: string;
    role: UserRole;
    onboardingCompleted: boolean;
    currentStep: number;
    experienceLevel?: string;
    interests: string[];
    preferences: Record<string, any>;
}

export interface OnboardingStepData {
    stepName: string;
    stepNumber: number;
    data: Record<string, any>;
}

export class OnboardingService {
    async getUserOnboardingStatus(userId: string): Promise<OnboardingStatus | null> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .rpc('get_user_onboarding_status')
                .single();

            if (error) {
                console.error('Error fetching onboarding status:', error);
                return null;
            }

            return {
                userId: data.user_id,
                role: data.role,
                onboardingCompleted: data.onboarding_completed,
                currentStep: data.current_step,
                experienceLevel: data.experience_level,
                interests: data.interests || [],
                preferences: data.preferences || {},
            };
        } catch (error) {
            console.error('Error in getUserOnboardingStatus:', error);
            return null;
        }
    }

    async updateUserRole(userId: string, role: UserRole): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('users')
            .update({
                role,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) {
            throw new Error(`Failed to update user role: ${error.message}`);
        }
    }

    async completeOnboardingStep(
        userId: string,
        stepData: OnboardingStepData
    ): Promise<boolean> {
        try {
            const supabase = await createClient();
            const { error } = await supabase
                .rpc('complete_onboarding_step', {
                    step_name: stepData.stepName,
                    step_number: stepData.stepNumber,
                    step_data: stepData.data
                });

            if (error) {
                console.error('Error completing onboarding step:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in completeOnboardingStep:', error);
            return false;
        }
    }

    async updateUserPreferences(
        userId: string,
        category: string,
        preferences: Record<string, any>
    ): Promise<boolean> {
        try {
            const supabase = await createClient();
            const promises = Object.entries(preferences).map(([key, value]) =>
                supabase.rpc('update_user_preference', {
                    category,
                    preference_key: key,
                    preference_value: JSON.stringify(value)
                })
            );

            const results = await Promise.all(promises);
            const hasError = results.some(result => result.error);

            if (hasError) {
                console.error('Error updating user preferences');
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in updateUserPreferences:', error);
            return false;
        }
    }

    async processCreatorStep1(userId: string, data: CreatorStep1): Promise<boolean> {
        try {
            const supabase = await createClient();
            // Update user experience level
            const { error: userError } = await supabase
                .from('users')
                .update({
                    experience_level: data.experienceLevel,
                    interests: data.productTypes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (userError) {
                console.error('Error updating user data:', userError);
                return false;
            }

            // Complete onboarding step
            return await this.completeOnboardingStep(userId, {
                stepName: 'creator_step_1',
                stepNumber: 1,
                data: {
                    productTypes: data.productTypes,
                    experienceLevel: data.experienceLevel
                }
            });
        } catch (error) {
            console.error('Error in processCreatorStep1:', error);
            return false;
        }
    }

    async processCreatorStep2(userId: string, data: CreatorStep2): Promise<boolean> {
        try {
            // Update user preferences
            await this.updateUserPreferences(userId, 'creator', {
                interests: data.interests,
                goals: data.goals,
                timeCommitment: data.timeCommitment
            });

            // Complete onboarding step
            return await this.completeOnboardingStep(userId, {
                stepName: 'creator_step_2',
                stepNumber: 2,
                data
            });
        } catch (error) {
            console.error('Error in processCreatorStep2:', error);
            return false;
        }
    }

    async processCreatorStep3(userId: string, data: CreatorStep3): Promise<boolean> {
        try {
            const supabase = await createClient();
            // Update user preferences
            const { error: userError } = await supabase
                .from('users')
                .update({
                    first_goal: data.firstGoal,
                    preferences: {
                        notifications: data.notifications
                    },
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (userError) {
                console.error('Error updating user data:', userError);
                return false;
            }

            // Complete onboarding step
            return await this.completeOnboardingStep(userId, {
                stepName: 'creator_step_3',
                stepNumber: 3,
                data
            });
        } catch (error) {
            console.error('Error in processCreatorStep3:', error);
            return false;
        }
    }

    async processBuyerStep1(userId: string, data: BuyerStep1): Promise<boolean> {
        try {
            const supabase = await createClient();
            // Update user data
            const { error: userError } = await supabase
                .from('users')
                .update({
                    interests: data.interests,
                    budget_range: data.budgetRange,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (userError) {
                console.error('Error updating user data:', userError);
                return false;
            }

            // Complete onboarding step
            return await this.completeOnboardingStep(userId, {
                stepName: 'buyer_step_1',
                stepNumber: 1,
                data
            });
        } catch (error) {
            console.error('Error in processBuyerStep1:', error);
            return false;
        }
    }

    async processBuyerStep2(userId: string, data: BuyerStep2): Promise<boolean> {
        try {
            // Update user preferences
            await this.updateUserPreferences(userId, 'buyer', {
                categories: data.categories,
                purchaseFrequency: data.purchaseFrequency,
                preferredFormats: data.preferredFormats
            });

            // Complete onboarding step
            return await this.completeOnboardingStep(userId, {
                stepName: 'buyer_step_2',
                stepNumber: 2,
                data
            });
        } catch (error) {
            console.error('Error in processBuyerStep2:', error);
            return false;
        }
    }

    async processBuyerStep3(userId: string, data: BuyerStep3): Promise<boolean> {
        try {
            const supabase = await createClient();
            // Update user preferences
            const { error: userError } = await supabase
                .from('users')
                .update({
                    first_goal: data.firstAction,
                    preferences: {
                        notifications: data.notifications
                    },
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (userError) {
                console.error('Error updating user data:', userError);
                return false;
            }

            // Complete onboarding step
            return await this.completeOnboardingStep(userId, {
                stepName: 'buyer_step_3',
                stepNumber: 3,
                data
            });
        } catch (error) {
            console.error('Error in processBuyerStep3:', error);
            return false;
        }
    }

    async getUserAchievements(userId: string) {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('user_achievements')
                .select('*')
                .eq('user_id', userId)
                .order('earned_at', { ascending: false });

            if (error) {
                console.error('Error fetching user achievements:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getUserAchievements:', error);
            return [];
        }
    }

    async awardAchievement(
        userId: string,
        achievementType: string,
        achievementName: string,
        description: string,
        metadata: Record<string, any> = {}
    ): Promise<boolean> {
        try {
            const supabase = await createClient();
            const { error } = await supabase
                .from('user_achievements')
                .insert({
                    user_id: userId,
                    achievement_type: achievementType,
                    achievement_name: achievementName,
                    description,
                    metadata
                });

            if (error) {
                console.error('Error awarding achievement:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in awardAchievement:', error);
            return false;
        }
    }
}

export const onboardingService = new OnboardingService();