"use client";

import { AdminPageHeader } from "@/components/admin/Metrics";
import { ProductEditor } from "@/components/admin/ProductEditor";

export default function NewProductPage() {
  return (
    <>
      <AdminPageHeader title="New product" crumbs={[{ label: "Admin", href: "/admin" }, { label: "Products", href: "/admin/products" }, { label: "New" }]} />
      <ProductEditor />
    </>
  );
}
