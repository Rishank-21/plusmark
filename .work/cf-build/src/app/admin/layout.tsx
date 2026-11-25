import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s · Plusmark Admin"
  },
  description: "Internal operations desk for Plusmark. Catalogue, orders and content are read from and written to Supabase under an administrator role.",
  robots: { index: false, follow: false }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
