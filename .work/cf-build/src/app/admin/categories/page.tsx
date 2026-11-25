"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ErrorState } from "@/components/ui/States";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TextArea, TextField } from "@/components/ui/Field";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { AdminPageHeader, StatStrip } from "@/components/admin/Metrics";
import { FilterBar, SearchControl } from "@/components/admin/FilterBar";
import { DataTable, type AdminColumn } from "@/components/admin/DataTable";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { errorMessage, useAdminQuery } from "@/components/admin/useAdminQuery";
import { deleteCategory, listAdminCategories, listAdminProducts, saveCategory } from "@/lib/supabase/admin";
import { useToast } from "@/state/toast";
import type { Category } from "@/types";

interface Row extends Category {
  productCount: number;
}

interface Draft {
  id: string;
  name: string;
  subject: string;
  description: string;
  image: string;
  subcategories: string;
}

const EMPTY: Draft = { id: "", name: "", subject: "", description: "", image: "", subcategories: "" };

function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function draftFor(category: Category): Draft {
  return {
    id: category.id,
    name: category.name,
    subject: category.subject,
    description: category.description,
    image: category.image ?? "",
    subcategories: category.subcategories.map((sub) => sub.name).join(", ")
  };
}

export default function AdminCategoriesPage() {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<{ category?: Category } | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const data = useAdminQuery<{ categories: Category[]; counts: Record<string, number> }>(async () => {
    const [categories, products] = await Promise.all([listAdminCategories(), listAdminProducts()]);
    const counts: Record<string, number> = {};
    products.forEach((product) => {
      counts[product.categoryId] = (counts[product.categoryId] ?? 0) + 1;
    });
    return { categories, counts };
  });

  const categories = data.data?.categories ?? [];
  const counts = data.data?.counts ?? {};

  const rows = useMemo<Row[]>(() => {
    const needle = query.trim().toLowerCase();
    return categories
      .map((category) => ({ ...category, productCount: counts[category.id] ?? 0 }))
      .filter((row) =>
        !needle ? true : `${row.name} ${row.id} ${row.subject} ${row.description}`.toLowerCase().includes(needle)
      );
  }, [categories, counts, query]);

  const openCreate = () => {
    setEditing({});
    setDraft(EMPTY);
    setErrors({});
  };

  const openEdit = (category: Category) => {
    setEditing({ category });
    setDraft(draftFor(category));
    setErrors({});
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const isNew = !editing?.category;
    const id = isNew ? draft.id.trim().toLowerCase() || slugify(draft.name) : editing.category!.id;
    const next: Record<string, string> = {};
    if (!draft.name.trim()) next.name = "Enter a category name.";
    if (!id.trim()) next.id = "Enter an identifier or a name to generate one.";
    if (!draft.description.trim()) next.description = "Add the short description shown on category pages.";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    const existingSubs = editing?.category?.subcategories ?? [];
    const subcategories = draft.subcategories
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean)
      .map((name) => {
        const id = slugify(name);
        const match = existingSubs.find((sub) => sub.id === id || sub.name === name);
        return { id, name, image: match?.image ?? null };
      });

    setSaving(true);
    try {
      const saved = await saveCategory({
        id,
        name: draft.name,
        subject: draft.subject,
        description: draft.description,
        image: draft.image.trim() || null,
        subcategories,
        isNew
      });
      data.setData((current) =>
        current
          ? {
              ...current,
              categories: isNew
                ? [...current.categories, saved]
                : current.categories.map((category) => (category.id === saved.id ? saved : category))
            }
          : current
      );
      toast.push(isNew ? `${saved.name} was created.` : `${saved.name} was saved.`);
      setEditing(null);
    } catch (reason) {
      toast.push(errorMessage(reason, "The category could not be saved."), "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (category: Category) => {
    try {
      await deleteCategory(category.id);
      data.setData((current) =>
        current ? { ...current, categories: current.categories.filter((row) => row.id !== category.id) } : current
      );
      toast.push(`${category.name} was deleted.`);
    } catch (reason) {
      toast.push(errorMessage(reason, "The category could not be deleted."), "error");
    }
  };

  const columns: AdminColumn<Row>[] = [
    {
      id: "name",
      header: "Category",
      minWidth: "15rem",
      sortValue: (row) => row.name,
      render: (row) => (
        <span className="flex flex-col leading-tight">
          <span className="font-medium">{row.name}</span>
          <span className="text-caption text-graphite">{row.id}</span>
        </span>
      )
    },
    {
      id: "subject",
      header: "Subject",
      minWidth: "12rem",
      sortValue: (row) => row.subject,
      render: (row) => row.subject || <span className="text-graphite">—</span>
    },
    {
      id: "description",
      header: "Description",
      minWidth: "20rem",
      render: (row) => <span className="line-clamp-2 max-w-[22rem] text-caption text-graphite">{row.description}</span>
    },
    {
      id: "subcategories",
      header: "Subcategories",
      minWidth: "16rem",
      render: (row) =>
        row.subcategories.length ? (
          <span className="block max-w-[17rem] text-caption text-graphite">
            {row.subcategories.map((sub) => sub.name).join(", ")}
          </span>
        ) : (
          <span className="text-caption text-graphite">None</span>
        )
    },
    {
      id: "count",
      header: "Products",
      numeric: true,
      sortValue: (row) => row.productCount,
      render: (row) => row.productCount
    },
    {
      id: "actions",
      header: "Actions",
      render: (row) => (
        <span className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => openEdit(row)}
            aria-label={`Edit ${row.name}`}
            className="flex size-9 items-center justify-center rounded-xs border border-hair-strong text-graphite transition-colors hover:border-ink hover:text-ink"
          >
            <Pencil className="size-3.5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setPendingDelete(row)}
            aria-label={`Delete ${row.name}`}
            className="flex size-9 items-center justify-center rounded-xs border border-hair-strong text-graphite transition-colors hover:border-danger hover:text-danger"
          >
            <Trash2 className="size-3.5" aria-hidden />
          </button>
        </span>
      )
    }
  ];

  if (data.error) {
    return (
      <div className="flex flex-col gap-5">
        <AdminPageHeader title="Categories" crumbs={[{ label: "Admin", href: "/admin" }, { label: "Categories" }]} />
        <ErrorState title="Categories could not be loaded" body={data.error} onRetry={data.reload} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="Categories"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Categories" }]}
        lede="The catalogue taxonomy stored in Supabase. Identifiers are part of public URLs, so change them only with redirects in mind."
        actions={
          <Button size="md" onClick={openCreate}>
            <Plus className="size-4" aria-hidden />
            Add category
          </Button>
        }
      />

      <StatStrip
        items={[
          { label: "Categories", value: String(categories.length) },
          { label: "Subcategories", value: String(categories.reduce((sum, category) => sum + category.subcategories.length, 0)) },
          { label: "Products", value: String(Object.values(counts).reduce((sum, value) => sum + value, 0)) },
          { label: "Empty categories", value: String(categories.filter((category) => !counts[category.id]).length) }
        ]}
      />

      <FilterBar
        resultLabel={`${rows.length} of ${categories.length} categories match`}
        onReset={query ? () => setQuery("") : undefined}
      >
        <SearchControl
          label="Search categories"
          value={query}
          onChange={setQuery}
          className="grow"
          width="w-full min-w-[16rem]"
          placeholder="Name, identifier, subject or description"
        />
      </FilterBar>

      <DataTable
        caption="Catalogue categories with subject, subcategory names and product counts"
        columns={columns}
        rows={rows}
        keyFor={(row) => row.id}
        resetKey={query}
        pageSize={12}
        loading={data.loading}
        defaultSort={{ id: "name", dir: "asc" }}
        emptyTitle="No category matches that search"
        emptyBody="Clear the search field to restore the full taxonomy."
      />

      <Modal
        open={editing !== null}
        onClose={() => (saving ? undefined : setEditing(null))}
        title={editing?.category ? `Edit ${editing.category.name}` : "New category"}
        description="Saved directly to the categories table."
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="pm-category-form" disabled={saving}>
              {saving ? "Saving…" : "Save category"}
            </Button>
          </>
        }
      >
        <form id="pm-category-form" onSubmit={submit} noValidate className="flex flex-col gap-4">
          <TextField
            label="Name"
            value={draft.name}
            error={errors.name ?? null}
            required
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            placeholder="White boards"
          />
          <TextField
            label="Identifier"
            value={draft.id}
            error={errors.id ?? null}
            required
            disabled={Boolean(editing?.category)}
            hint="Lowercase letters, numbers and hyphens. Used in /shop/… URLs."
            onChange={(event) => setDraft((current) => ({ ...current, id: event.target.value }))}
            placeholder="white-boards"
          />
          <TextField
            label="Subject"
            value={draft.subject}
            optional
            onChange={(event) => setDraft((current) => ({ ...current, subject: event.target.value }))}
            placeholder="Classroom and office writing surfaces"
          />
          <TextArea
            label="Description"
            value={draft.description}
            error={errors.description ?? null}
            required
            rows={3}
            onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
          />
          <fieldset className="flex flex-col gap-2">
            <legend className="text-caption font-medium text-ink">Category image</legend>
            <MediaUploader
              items={
                draft.image
                  ? [{ key: "category-image", publicId: draft.image, alt: draft.name, width: 900, height: 675, source: "product" }]
                  : []
              }
              onChange={(next) => setDraft((current) => ({ ...current, image: next[0]?.publicId ?? "" }))}
              folder="categories"
              maxItems={1}
              noun="category"
              showAlt={false}
              onError={(message) => message && toast.push(message, "error")}
            />
          </fieldset>
          <TextField
            label="Subcategories"
            value={draft.subcategories}
            optional
            hint="Comma-separated names. Identifiers are generated from each name."
            onChange={(event) => setDraft((current) => ({ ...current, subcategories: event.target.value }))}
            placeholder="Magnetic, Non-magnetic"
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) void remove(pendingDelete);
        }}
        title="Delete this category?"
        body={
          pendingDelete
            ? `${pendingDelete.name} will be removed. Categories that still hold products cannot be deleted until those products are moved.`
            : ""
        }
        confirmLabel="Delete category"
        destructive
      />

      <p className="text-caption text-graphite">
        Storefront category pages still read the static catalogue feed; see the final report for the sync plan.{" "}
        <ButtonLink href="/shop" variant="secondary" size="sm">
          View storefront
        </ButtonLink>
      </p>
    </div>
  );
}
