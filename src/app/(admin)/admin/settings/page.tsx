import { AdminLayout } from '@/components/admin/AdminLayout';
import { SystemSettings } from '@/components/admin/SystemSettings';

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <SystemSettings />
    </AdminLayout>
  );
}
