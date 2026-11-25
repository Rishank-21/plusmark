import { AdminPageHeader } from "@/components/admin/Metrics";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Edit product · Plusmark admin", robots: { index: false, follow: false } };

export default async function AdminEditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="Edit product"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: "Edit product" }
        ]}
        lede={`Editing the live catalogue record for ${slug}. Saving rewrites the product and reconciles its size rows in Supabase.`}
      />
      <ProductForm mode="edit" slug={slug} />
    </div>
  );
}
