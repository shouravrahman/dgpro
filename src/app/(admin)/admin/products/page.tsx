import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductManagement } from '@/components/admin/ProductManagement';

export default function AdminProductsPage() {
  return (
    <AdminLayout>
      <ProductManagement />
    </AdminLayout>
  );
}
