import { Metadata } from 'next';
import { AffiliateDashboard } from '@/components/affiliate/AffiliateDashboard';

export const metadata: Metadata = {
  title: 'Affiliate Dashboard | AI Product Creator',
  description:
    'Manage your affiliate account, track referrals, and monitor earnings.',
};

export default function AffiliatePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AffiliateDashboard />
    </div>
  );
}
