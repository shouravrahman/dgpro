'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';

export function OnboardingComplete() {
  const router = useRouter();

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 relative">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />

            {/* Animated sparkles */}
            <div className="absolute -top-2 -right-2 w-4 h-4">
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3">
              <Sparkles className="w-3 h-3 text-blue-400 animate-pulse animation-delay-300" />
            </div>
            <div className="absolute top-1 -left-3 w-2 h-2">
              <Sparkles className="w-2 h-2 text-purple-400 animate-pulse animation-delay-700" />
            </div>
          </div>

          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome Aboard! 🎉
          </CardTitle>

          <CardDescription className="text-gray-600 dark:text-gray-400">
            Your onboarding is complete! We've personalized your experience
            based on your preferences.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              What's Next?
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 text-left">
              <li>• Explore personalized product recommendations</li>
              <li>• Connect with creators in your interests</li>
              <li>• Set up your profile and preferences</li>
              <li>• Start discovering amazing digital products</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleGoToDashboard}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              You can always update your preferences later in settings
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
