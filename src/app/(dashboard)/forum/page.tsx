import { ForumCategories } from '@/components/social/ForumCategories';

export default function ForumPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ForumCategories />
    </div>
  );
}

export const metadata = {
  title: 'Community Forum - AI Product Creator',
  description:
    'Connect with other creators and share your knowledge in our community forum',
};
