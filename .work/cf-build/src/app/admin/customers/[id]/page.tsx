import { AdminCustomerDetail } from "@/components/admin/AdminCustomerDetail";

export default async function AdminCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  return <AdminCustomerDetail customerId={(await params).id} />;
}
