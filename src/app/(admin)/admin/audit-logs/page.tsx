import { AdminLayout } from '@/components/admin/AdminLayout';
import { AuditLogs } from '@/components/admin/AuditLogs';

export default function AdminAuditLogsPage() {
  return (
    <AdminLayout>
      <AuditLogs />
    </AdminLayout>
  );
}
