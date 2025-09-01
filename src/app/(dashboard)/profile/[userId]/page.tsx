import { UserProfile } from '@/components/social/UserProfile';

interface ProfilePageProps {
  params: {
    userId: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <UserProfile userId={params.userId} />
    </div>
  );
}

export const metadata = {
  title: 'User Profile - AI Product Creator',
  description: 'View user profile and activity',
};
