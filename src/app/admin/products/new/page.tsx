import { AdminPageHeader } from "@/components/admin/Metrics";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "New product · Plusmark admin", robots: { index: false, follow: false } };

export default function AdminNewProductPage() {
  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="New product"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: "New product" }
        ]}
        lede="Create a catalogue record with its sizes, SKUs, tax settings and images. Saving writes to Supabase and checks your administrator role."
      />
      <ProductForm mode="create" />
    </div>
  );
}
