"use client";

import { useParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/Metrics";
import { ProductEditor } from "@/components/admin/ProductEditor";

export default function EditProductPage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <>
      <AdminPageHeader title="Edit product" crumbs={[{ label: "Admin", href: "/admin" }, { label: "Products", href: "/admin/products" }, { label: slug }]} />
      <ProductEditor key={slug} slug={slug} />
    </>
  );
}
