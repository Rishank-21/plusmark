"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { allSizes, seriesList } from "@/lib/catalog";
import { DEMO_PRICING_LABEL } from "@/lib/config";
import { formatInr } from "@/lib/format";
import { required, validateName } from "@/lib/validation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CheckboxField, SelectField, TextArea, TextField } from "@/components/ui/Field";
import { ConfirmDialog } from "@/components/ui/Modal";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { AdminPanel } from "@/components/admin/Metrics";
import { MediaUploader, VideoUploader } from "@/components/admin/MediaUploader";
import { errorMessage, useAdminQuery } from "@/components/admin/useAdminQuery";
import {
  createAdminProduct,
  getAdminProduct,
  listAdminCategories,
  updateAdminProduct,
  type AdminProductInput
} from "@/lib/supabase/admin";
import { useToast } from "@/state/toast";
import type { BoardType, Category, MediaAsset, PriceMode, Product, ProductSpec, SurfaceKind } from "@/types";

interface VariantDraft {
  key: string;
  id?: string;
  sizeLabel: string;
  sku: string;
  priceMode: PriceMode;
  price: string;
  stock: string;
  available: boolean;
  leadTimeDays: string;
}

interface MediaDraft {
  key: string;
  publicId: string;
  alt: string;
  width: number;
  height: number;
  source: MediaAsset["source"];
}

interface FeatureDraft {
  key: string;
  value: string;
}

interface SpecDraft {
  key: string;
  label: string;
  value: string;
}

interface FormState {
  name: string;
  slug: string;
  categoryId: string;
  subcategoryIds: string[];
  seriesId: string;
  surface: string;
  frame: string;
  corners: string;
  magnetic: boolean;
  doubleSided: boolean;
  boardType: BoardType;
  surfaceKind: SurfaceKind;
  usage: string;
  blurb: string;
  description: string;
  features: FeatureDraft[];
  specs: SpecDraft[];
  customisation: string;
  hsnCode: string;
  gstRatePercent: string;
  bulkSuggestionQuantity: string;
  media: MediaDraft[];
  videoId: string;
  enquiryOnly: boolean;
  needsData: boolean;
  published: boolean;
  featured: boolean;
  variants: VariantDraft[];
}

const BOARD_TYPE_OPTIONS: { value: BoardType; label: string }[] = [
  { value: "n/a", label: "Not a board" },
  { value: "non-magnetic", label: "Non-magnetic" },
  { value: "magnetic", label: "Magnetic" },
  { value: "ceramic", label: "Ceramic steel" }
];

const SURFACE_KIND_OPTIONS: { value: SurfaceKind; label: string }[] = [
  { value: "other", label: "Other / not a writing face" },
  { value: "marker", label: "Marker (white)" },
  { value: "chalk", label: "Chalk (green)" },
  { value: "pin-up", label: "Pin-up (notice)" }
];

const GST_OPTIONS = [
  { value: "0", label: "0% — export / exempt" },
  { value: "5", label: "5% — furniture-class goods" },
  { value: "12", label: "12% — boards (current catalogue rate)" },
  { value: "18", label: "18% — services-class goods" },
  { value: "28", label: "28% — luxury goods" }
];

function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function emptyVariant(): VariantDraft {
  return { key: `v_${Math.random().toString(36).slice(2, 8)}`, sizeLabel: "", sku: "", priceMode: "on_request", price: "", stock: "", available: true, leadTimeDays: "" };
}

function initialValues(product: Product | null, categories: Category[]): FormState {
  if (!product) {
    return {
      name: "",
      slug: "",
      categoryId: categories[0]?.id ?? "",
      subcategoryIds: [],
      seriesId: "",
      surface: "",
      frame: "",
      corners: "",
      magnetic: false,
      doubleSided: false,
      boardType: "n/a",
      surfaceKind: "other",
      usage: "",
      blurb: "",
      description: "",
      features: [{ key: "f_1", value: "" }],
      specs: [],
      customisation: "",
      hsnCode: "",
      gstRatePercent: "12",
      bulkSuggestionQuantity: "10",
      media: [],
      videoId: "",
      enquiryOnly: false,
      needsData: false,
      published: false,
      featured: false,
      variants: [emptyVariant()]
    };
  }
  return {
    name: product.name,
    slug: product.slug,
    categoryId: product.categoryId,
    subcategoryIds: [...product.subcategoryIds],
    seriesId: product.seriesId ?? "",
    surface: product.surface ?? "",
    frame: product.frame ?? "",
    corners: product.corners ?? "",
    magnetic: product.magnetic,
    doubleSided: product.doubleSided,
    boardType: product.boardType,
    surfaceKind: product.surfaceKind,
    usage: product.usage,
    blurb: product.blurb,
    description: product.description,
    features: product.features.length
      ? product.features.map((value, index) => ({ key: `f_${index}`, value }))
      : [{ key: "f_1", value: "" }],
    specs: product.specs.map((spec, index) => ({ key: `s_${index}`, label: spec.label, value: spec.value })),
    customisation: product.customisation ?? "",
    hsnCode: product.hsnCode ?? "",
    gstRatePercent: String(product.gstRatePercent),
    bulkSuggestionQuantity: String(product.bulkSuggestionQuantity),
    media: product.media.map((asset, index) => ({
      key: `m_${index}`,
      publicId: asset.publicId,
      alt: asset.alt,
      width: asset.width,
      height: asset.height,
      source: asset.source
    })),
    videoId: product.videoId ?? "",
    enquiryOnly: product.enquiryOnly,
    needsData: product.needsData,
    published: product.published,
    featured: product.featured,
    variants: product.variants.map((variant) => ({
      key: `v_${variant.id}`,
      id: variant.id,
      sizeLabel: variant.size.label,
      sku: variant.sku,
      priceMode: variant.priceMode,
      price: variant.priceInr === null ? "" : String(variant.priceInr),
      stock: variant.stock === null ? "" : String(variant.stock),
      available: variant.available,
      leadTimeDays: variant.leadTimeDays === null ? "" : String(variant.leadTimeDays)
    }))
  };
}

/** Shared by /admin/products/new and /admin/products/[slug]/edit. */
export function ProductForm({ mode, slug }: { mode: "create" | "edit"; slug?: string }) {
  const query = useAdminQuery(async () => {
    const categories = await listAdminCategories();
    const product = mode === "edit" && slug ? await getAdminProduct(slug) : null;
    return { categories, product };
  });

  if (query.loading) {
    return (
      <div className="flex flex-col gap-4" role="status" aria-live="polite">
        {[0, 1, 2].map((row) => <div key={row} className="h-40 animate-pulse rounded-md border border-hair bg-sand/40" />)}
        <span className="sr-only">Loading the product form</span>
      </div>
    );
  }
  if (query.error) {
    return <ErrorState title="The product form could not be loaded" body={query.error} onRetry={query.reload} />;
  }
  if (mode === "edit" && !query.data?.product) {
    return <EmptyState title="Product not found" body="No catalogue record matches this URL handle." action={{ label: "Back to products", href: "/admin/products" }} />;
  }
  return <ProductFormBody key={query.data?.product?.id ?? "new"} mode={mode} categories={query.data?.categories ?? []} product={query.data?.product ?? null} />;
}

function ProductFormBody({ mode, categories, product }: { mode: "create" | "edit"; categories: Category[]; product: Product | null }) {
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState<FormState>(() => initialValues(product, categories));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const category = categories.find((entry) => entry.id === values.categoryId);
  const sizeOptions = useMemo(() => allSizes(), []);

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setErrors((current) => {
      const name = key as string;
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const updateVariant = (key: string, patch: Partial<VariantDraft>) => {
    setValues((current) => ({
      ...current,
      variants: current.variants.map((variant) => (variant.key === key ? { ...variant, ...patch } : variant))
    }));
    setDirty(true);
  };

  const errorList = Object.entries(errors);

  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};

    const nameError = validateName(values.name, "Product name") ?? required(values.name, "Product name");
    if (nameError) next.name = nameError;

    const slug = values.slug.trim() || slugify(values.name);
    if (!slug) next.slug = "A URL handle is required — it is generated from the name if left blank.";

    if (!values.categoryId) next.categoryId = "Choose the category this product belongs to.";
    if (!values.usage.trim()) next.usage = "Describe where this product is used — it drives the category page copy.";
    if (values.blurb.trim().length < 20) next.blurb = "Write at least 20 characters — this is the one-line summary.";
    if (values.description.trim().length < 40) next.description = "Write at least 40 characters of product description.";

    const features = values.features.map((f) => f.value.trim()).filter(Boolean);
    if (features.length === 0) next.features = "Add at least one feature line.";

    if (values.hsnCode.trim() && !/^\d{6,8}$/.test(values.hsnCode.trim())) {
      next.hsnCode = "HSN/SAC is 6 to 8 digits. Leave blank until the accounts team confirms it.";
    }

    const bulk = Number.parseInt(values.bulkSuggestionQuantity, 10);
    if (!Number.isFinite(bulk) || bulk < 1) next.bulkSuggestionQuantity = "Bulk suggestion quantity must be 1 or more.";

    const media = values.media.filter((m) => m.publicId.trim());
    if (values.published && media.length === 0) next.media = "A published product needs at least one image.";
    if (media.some((m) => !m.alt.trim())) next.mediaAlt = "Every image needs a short description for screen readers.";

    values.variants.forEach((variant, index) => {
      const rowErrors: Record<string, string> = {};
      if (!variant.sizeLabel.trim()) rowErrors.size = "Size label is required.";
      if (!variant.sku.trim()) rowErrors.sku = "SKU is required.";
      else if (!/^[A-Z0-9-]{6,32}$/.test(variant.sku.trim())) rowErrors.sku = "SKU: 6–32 characters, A–Z, 0–9 and hyphens.";
      if (variant.priceMode === "fixed") {
        const price = Number.parseFloat(variant.price);
        if (!Number.isFinite(price) || price <= 0) rowErrors.price = "Enter a price above 0, or set the mode to “Price on request”.";
      }
      if (variant.stock.trim()) {
        const stock = Number.parseInt(variant.stock, 10);
        if (!Number.isInteger(stock) || stock < 0) rowErrors.stock = "Stock must be a whole number of 0 or more.";
      }
      if (variant.leadTimeDays.trim()) {
        const lead = Number.parseInt(variant.leadTimeDays, 10);
        if (!Number.isInteger(lead) || lead < 0) rowErrors.lead = "Lead time must be a whole number of days.";
      }
      for (const [field, message] of Object.entries(rowErrors)) {
        next[`variant_${index}_${field}`] = `Variant ${index + 1}: ${message}`;
      }
    });

    const skus = values.variants.map((v) => v.sku.trim().toUpperCase()).filter(Boolean);
    const duplicate = skus.find((sku, index) => skus.indexOf(sku) !== index);
    if (duplicate) next.duplicateSku = `SKU ${duplicate} appears on more than one variant row.`;

    return next;
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    setSubmitted(true);
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      document.getElementById("pm-admin-product-errors")?.scrollIntoView({ block: "center" });
      return;
    }

    const slug = values.slug.trim() || slugify(values.name);
    const fixed = values.variants.some((variant) => variant.priceMode === "fixed");
    const payload: AdminProductInput = {
      name: values.name.trim(),
      slug,
      categoryId: values.categoryId,
      seriesId: values.seriesId || null,
      subcategoryIds: values.subcategoryIds,
      surface: values.surface.trim(),
      frame: values.frame.trim(),
      corners: values.corners.trim(),
      magnetic: values.magnetic,
      doubleSided: values.doubleSided,
      boardType: values.boardType,
      surfaceKind: values.surfaceKind,
      usage: values.usage.trim(),
      blurb: values.blurb.trim(),
      description: values.description.trim(),
      features: values.features.map((f) => f.value.trim()).filter(Boolean),
      specs: values.specs
        .map((spec) => ({ label: spec.label.trim(), value: spec.value.trim() }))
        .filter((spec): spec is ProductSpec => Boolean(spec.label && spec.value)),
      customisation: values.customisation.trim() || null,
      media: values.media
        .filter((entry) => entry.publicId.trim())
        .map((entry) => ({
          publicId: entry.publicId.trim(),
          alt: entry.alt.trim(),
          width: entry.width,
          height: entry.height,
          source: entry.source
        })),
      videoId: values.videoId.trim() || null,
      priceMode: fixed ? "fixed" : "on_request",
      gstRatePercent: Number.parseInt(values.gstRatePercent, 10),
      hsnCode: values.hsnCode.trim() || null,
      bulkSuggestionQuantity: Number.parseInt(values.bulkSuggestionQuantity, 10),
      enquiryOnly: values.enquiryOnly,
      needsData: values.needsData,
      published: values.published,
      featured: values.featured,
      variants: values.variants.map((variant) => ({
        id: variant.id,
        sizeLabel: variant.sizeLabel.trim(),
        sku: variant.sku.trim().toUpperCase(),
        priceMode: variant.priceMode,
        priceInr: variant.priceMode === "fixed" ? Math.round(Number.parseFloat(variant.price)) : null,
        stock: variant.stock.trim() ? Number.parseInt(variant.stock, 10) : null,
        available: variant.available,
        leadTimeDays: variant.leadTimeDays.trim() ? Number.parseInt(variant.leadTimeDays, 10) : null
      }))
    };

    setSaving(true);
    try {
      if (mode === "edit" && product) {
        await updateAdminProduct(product.id, payload, product.slug);
      } else {
        await createAdminProduct(payload);
      }
      setDirty(false);
      toast.push(mode === "edit" ? "Product saved" : "Product created", "success");
      router.push("/admin/products");
      router.refresh();
    } catch (reason) {
      if (reason instanceof Error && "field" in reason && typeof reason.field === "string") {
        setErrors({ [reason.field]: reason.message });
      }
      toast.push(errorMessage(reason, "The product could not be saved."), "error");
    } finally {
      setSaving(false);
    }
  };

  const variantError = (index: number, field: string) => errors[`variant_${index}_${field}`]?.split(": ").slice(1).join(": ");

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      {submitted && errorList.length > 0 && (
        <div id="pm-admin-product-errors" className="rounded-sm border border-danger/35 bg-danger-wash p-4" role="alert">
          <p className="text-body-sm font-medium text-danger">
            {errorList.length} {errorList.length === 1 ? "problem" : "problems"} on this form
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {errorList.map(([field, message]) => (
              <li key={field} className="text-caption leading-relaxed text-ink">{message}</li>
            ))}
          </ul>
        </div>
      )}

      <AdminPanel title="Identity" description="Name, URL handle and where the product sits in the catalogue.">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Product name"
            value={values.name}
            error={errors.name ?? null}
            required
            onChange={(event) => {
              set("name", event.target.value);
              if (mode === "create" && !values.slug) set("slug", slugify(event.target.value));
            }}
            placeholder="Metallic Premium White Board"
          />
          <TextField
            label="URL handle"
            value={values.slug}
            error={errors.slug ?? null}
            required
            hint={`Creates /product/${values.slug || "…"}`}
            onChange={(event) => set("slug", event.target.value)}
          />
          <SelectField
            label="Category"
            value={values.categoryId}
            error={errors.categoryId ?? null}
            options={categories.map((entry) => ({ value: entry.id, label: entry.name }))}
            onChange={(event) => {
              set("categoryId", event.target.value);
              set("subcategoryIds", []);
            }}
          />
          <SelectField
            label="Series"
            value={values.seriesId}
            optional
            hint="Series groups boards that share a surface and build."
            options={[{ value: "", label: "Not in a series" }, ...seriesList.map((entry) => ({ value: entry.id, label: entry.name }))]}
            onChange={(event) => set("seriesId", event.target.value)}
          />
        </div>

        {category && category.subcategories.length > 0 ? (
          <fieldset className="mt-4 border-t border-hair pt-4">
            <legend className="pm-eyebrow">Subcategories in {category.name}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {category.subcategories.map((sub) => {
                const checked = values.subcategoryIds.includes(sub.id);
                return (
                  <label
                    key={sub.id}
                    className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xs border px-3 text-body-sm transition-colors ${
                      checked ? "border-blue bg-blue-wash text-navy" : "border-hair-strong text-graphite hover:border-blue"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() =>
                        set(
                          "subcategoryIds",
                          checked ? values.subcategoryIds.filter((id) => id !== sub.id) : [...values.subcategoryIds, sub.id]
                        )
                      }
                    />
                    {sub.name}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : (
          <p className="mt-4 border-t border-hair pt-3 text-caption text-graphite">
            {category ? `${category.name} has no subcategories yet.` : "Choose a category to see its subcategories."}
          </p>
        )}
      </AdminPanel>

      <AdminPanel title="Specification" description="What the board is physically made of, and how it is used.">
        <div className="grid gap-4 md:grid-cols-3">
          <TextField label="Surface" optional value={values.surface} onChange={(event) => set("surface", event.target.value)} placeholder="High Gloss Marker Grade HPL Sheet" />
          <TextField label="Frame" optional value={values.frame} onChange={(event) => set("frame", event.target.value)} placeholder="Aluminium anodized frame, heavy-duty" />
          <TextField label="Corners" optional value={values.corners} onChange={(event) => set("corners", event.target.value)} placeholder="Dual-tone corners" />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <SelectField
            label="Board type"
            value={values.boardType}
            options={BOARD_TYPE_OPTIONS}
            hint="Construction, not the writing surface."
            onChange={(event) => set("boardType", event.target.value as BoardType)}
          />
          <SelectField
            label="Writing surface"
            value={values.surfaceKind}
            options={SURFACE_KIND_OPTIONS}
            hint="Drives the marker / chalk / pin-up filter."
            onChange={(event) => set("surfaceKind", event.target.value as SurfaceKind)}
          />
        </div>
        <div className="mt-4 flex flex-col gap-3 border-t border-hair pt-4 sm:flex-row sm:gap-8">
          <CheckboxField label="Magnetic face" checked={values.magnetic} onChange={(event) => set("magnetic", event.target.checked)} />
          <CheckboxField label="Double-sided" checked={values.doubleSided} onChange={(event) => set("doubleSided", event.target.checked)} />
        </div>
        <div className="mt-4">
          <TextArea
            label="Customisation note"
            optional
            rows={2}
            value={values.customisation}
            hint="Sizes, layouts or colours made to order. Leave blank when the product is only sold as listed."
            onChange={(event) => set("customisation", event.target.value)}
          />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextField label="Usage" value={values.usage} error={errors.usage ?? null} required onChange={(event) => set("usage", event.target.value)} placeholder="Classrooms, corridors and staff rooms" />
          <TextArea label="One-line summary" rows={2} value={values.blurb} error={errors.blurb ?? null} required onChange={(event) => set("blurb", event.target.value)} />
        </div>
        <div className="mt-4">
          <TextArea
            label="Full description"
            rows={6}
            value={values.description}
            error={errors.description ?? null}
            required
            hint="Plain language: what it is, how it is made, and what a price covers."
            onChange={(event) => set("description", event.target.value)}
          />
        </div>
      </AdminPanel>

      <AdminPanel
        title="Feature lines"
        description="Bullets shown on the product page. Do not state a specification Plusmark has not confirmed."
        aside={<AddRow label="Add feature" onClick={() => set("features", [...values.features, { key: `f_${Date.now()}`, value: "" }])} />}
      >
        <div className="flex flex-col gap-2">
          {errors.features && <p role="alert" className="text-caption font-medium text-danger">{errors.features}</p>}
          {values.features.map((feature, index) => (
            <div key={feature.key} className="flex items-center gap-2">
              <label className="sr-only" htmlFor={`feature-${feature.key}`}>Feature line {index + 1}</label>
              <input
                id={`feature-${feature.key}`}
                value={feature.value}
                onChange={(event) =>
                  set("features", values.features.map((entry) => (entry.key === feature.key ? { ...entry, value: event.target.value } : entry)))
                }
                placeholder="Pan-India dispatch from Ahmedabad"
                className="h-11 w-full rounded-xs border border-hair-strong bg-surface px-3 text-body-sm text-ink placeholder:text-graphite-light"
              />
              <button
                type="button"
                onClick={() => set("features", values.features.filter((entry) => entry.key !== feature.key))}
                disabled={values.features.length === 1}
                aria-label={`Remove feature line ${index + 1}`}
                className="flex size-11 shrink-0 items-center justify-center rounded-xs border border-hair-strong text-graphite transition-colors hover:border-danger hover:text-danger disabled:opacity-40"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      </AdminPanel>

      <AdminPanel
        title="Published spec table"
        description="Rows shown as a specification table on the product page. Only enter values Plusmark has published."
        aside={
          <AddRow
            label="Add spec row"
            onClick={() => set("specs", [...values.specs, { key: `s_${Date.now()}`, label: "", value: "" }])}
          />
        }
      >
        {values.specs.length === 0 ? (
          <p className="text-body-sm text-graphite">No spec rows. The product page falls back to the surface, frame and corner fields above.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {values.specs.map((spec, index) => (
              <div key={spec.key} className="flex items-center gap-2">
                <label className="sr-only" htmlFor={`spec-label-${spec.key}`}>Spec label {index + 1}</label>
                <input
                  id={`spec-label-${spec.key}`}
                  value={spec.label}
                  onChange={(event) =>
                    set("specs", values.specs.map((entry) => (entry.key === spec.key ? { ...entry, label: event.target.value } : entry)))
                  }
                  placeholder="Material"
                  className="h-11 w-40 shrink-0 rounded-xs border border-hair-strong bg-surface px-3 text-body-sm text-ink placeholder:text-graphite-light"
                />
                <label className="sr-only" htmlFor={`spec-value-${spec.key}`}>Spec value {index + 1}</label>
                <input
                  id={`spec-value-${spec.key}`}
                  value={spec.value}
                  onChange={(event) =>
                    set("specs", values.specs.map((entry) => (entry.key === spec.key ? { ...entry, value: event.target.value } : entry)))
                  }
                  placeholder="Marker grade HPL"
                  className="h-11 w-full rounded-xs border border-hair-strong bg-surface px-3 text-body-sm text-ink placeholder:text-graphite-light"
                />
                <button
                  type="button"
                  onClick={() => set("specs", values.specs.filter((entry) => entry.key !== spec.key))}
                  aria-label={`Remove spec row ${index + 1}`}
                  className="flex size-11 shrink-0 items-center justify-center rounded-xs border border-hair-strong text-graphite transition-colors hover:border-danger hover:text-danger"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            ))}
          </div>
        )}
      </AdminPanel>

      <AdminPanel
        title="Sizes and pricing"
        description="One row per published size. The SKU, price mode and stock behaviour live here."
        aside={<AddRow label="Add size" onClick={() => set("variants", [...values.variants, emptyVariant()])} />}
      >
        {errors.duplicateSku && (
          <p role="alert" className="mb-3 rounded-xs border border-danger/30 bg-danger-wash px-3 py-2 text-caption font-medium text-danger">
            {errors.duplicateSku}
          </p>
        )}
        <div className="flex flex-col gap-3">
          {values.variants.map((variant, index) => (
            <fieldset key={variant.key} className="rounded-sm border border-hair bg-sand/25 p-3">
              <legend className="px-1 text-caption font-medium text-graphite">Size {index + 1}</legend>
              <div className="grid gap-3 lg:grid-cols-12">
                <div className="lg:col-span-3">
                  <TextField
                    label="Size label"
                    value={variant.sizeLabel}
                    error={variantError(index, "size") ?? null}
                    list="pm-admin-sizes"
                    required
                    onChange={(event) => updateVariant(variant.key, { sizeLabel: event.target.value })}
                    placeholder="4 x 3 ft"
                  />
                </div>
                <div className="lg:col-span-3">
                  <TextField
                    label="SKU"
                    value={variant.sku}
                    error={variantError(index, "sku") ?? null}
                    required
                    onChange={(event) => updateVariant(variant.key, { sku: event.target.value.toUpperCase() })}
                    placeholder="PM-MP-WHI-430000"
                  />
                </div>
                <div className="lg:col-span-2">
                  <SelectField
                    label="Price mode"
                    value={variant.priceMode}
                    options={[
                      { value: "on_request", label: "On request" },
                      { value: "fixed", label: "Fixed price" }
                    ]}
                    onChange={(event) => updateVariant(variant.key, { priceMode: event.target.value as PriceMode })}
                  />
                </div>
                <div className="lg:col-span-2">
                  <TextField
                    label="Price ₹"
                    value={variant.price}
                    error={variantError(index, "price") ?? null}
                    inputMode="numeric"
                    disabled={variant.priceMode === "on_request"}
                    hint={variant.priceMode === "on_request" ? "Customers see “Price on request”." : DEMO_PRICING_LABEL}
                    onChange={(event) => updateVariant(variant.key, { price: event.target.value })}
                  />
                </div>
                <div className="lg:col-span-1">
                  <TextField
                    label="Stock"
                    value={variant.stock}
                    error={variantError(index, "stock") ?? null}
                    inputMode="numeric"
                    hint="Blank = untracked"
                    onChange={(event) => updateVariant(variant.key, { stock: event.target.value })}
                  />
                </div>
                <div className="lg:col-span-1">
                  <TextField
                    label="Lead days"
                    value={variant.leadTimeDays}
                    error={variantError(index, "lead") ?? null}
                    inputMode="numeric"
                    onChange={(event) => updateVariant(variant.key, { leadTimeDays: event.target.value })}
                  />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-hair pt-3">
                <CheckboxField
                  label="Available to order"
                  checked={variant.available}
                  onChange={(event) => updateVariant(variant.key, { available: event.target.checked })}
                />
                <div className="flex items-center gap-3">
                  {variant.priceMode === "fixed" && Number.parseFloat(variant.price) > 0 && (
                    <span className="tabular text-caption text-graphite">renders as {formatInr(Math.round(Number.parseFloat(variant.price)))}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => set("variants", values.variants.filter((entry) => entry.key !== variant.key))}
                    disabled={values.variants.length === 1}
                    aria-label={`Remove size ${index + 1}`}
                    className="inline-flex h-11 items-center gap-2 rounded-xs border border-hair-strong px-3 text-caption font-medium text-graphite transition-colors hover:border-danger hover:text-danger disabled:opacity-40"
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Remove
                  </button>
                </div>
              </div>
            </fieldset>
          ))}
        </div>
        <datalist id="pm-admin-sizes">
          {sizeOptions.map((size) => <option key={size.id} value={size.label} />)}
        </datalist>
      </AdminPanel>

      <AdminPanel
        title="Photographs"
        description="Uploaded straight to Cloudinary. JPEG, PNG, WebP or AVIF up to 10 MB; MP4, WebM or MOV video up to 100 MB."
      >
        {(errors.media || errors.mediaAlt || mediaError) && (
          <p role="alert" className="mb-3 text-caption font-medium text-danger">{errors.media ?? errors.mediaAlt ?? mediaError}</p>
        )}
        <MediaUploader
          items={values.media}
          onChange={(next) => set("media", next)}
          folder="products"
          onError={setMediaError}
        />
        <div className="mt-4 border-t border-hair pt-4">
          <VideoUploader
            videoId={values.videoId}
            onChange={(id) => set("videoId", id)}
            onError={setMediaError}
          />
        </div>
      </AdminPanel>

      <AdminPanel title="Commercials and publishing" description="Tax settings and whether the product is live on the storefront.">
        <div className="grid gap-4 md:grid-cols-3">
          <TextField
            label="HSN / SAC code"
            optional
            value={values.hsnCode}
            error={errors.hsnCode ?? null}
            hint="Plusmark has not confirmed HSN codes yet — leave blank if unsure."
            onChange={(event) => set("hsnCode", event.target.value)}
            placeholder="48229020"
          />
          <SelectField label="GST rate" value={values.gstRatePercent} options={GST_OPTIONS} onChange={(event) => set("gstRatePercent", event.target.value)} />
          <TextField
            label="Bulk suggestion quantity"
            value={values.bulkSuggestionQuantity}
            error={errors.bulkSuggestionQuantity ?? null}
            inputMode="numeric"
            hint="Retail minimum stays at 1 unit."
            onChange={(event) => set("bulkSuggestionQuantity", event.target.value)}
          />
        </div>
        <div className="mt-4 flex flex-col gap-3 border-t border-hair pt-4 sm:flex-row sm:gap-8">
          <CheckboxField label="Published on the storefront" checked={values.published} onChange={(event) => set("published", event.target.checked)} />
          <CheckboxField
            label="Featured selection"
            hint="Manual curation. Plusmark publishes no sales statistics."
            checked={values.featured}
            onChange={(event) => set("featured", event.target.checked)}
          />
        </div>
        <div className="mt-4 flex flex-col gap-3 border-t border-hair pt-4 sm:flex-row sm:gap-8">
          <CheckboxField
            label="Enquiry only — price on request"
            hint="No add-to-cart. The product page offers WhatsApp and the contact form instead."
            checked={values.enquiryOnly}
            onChange={(event) => set("enquiryOnly", event.target.checked)}
          />
          <CheckboxField
            label="Needs data"
            hint="Flags the record in the admin list until specs, sizes, dimensions or photos are supplied."
            checked={values.needsData}
            onChange={(event) => set("needsData", event.target.checked)}
          />
        </div>
      </AdminPanel>

      <div className="sticky bottom-0 -mx-3 flex flex-wrap items-center gap-3 border-t border-hair bg-canvas/95 px-3 py-3 backdrop-blur-[2px] sm:mx-0 sm:px-0">
        <Button type="submit" loading={saving}>
          {mode === "create" ? "Create product" : "Save changes"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => (dirty ? setConfirmLeave(true) : router.push("/admin/products"))}>
          Cancel
        </Button>
        <span className="ml-auto flex items-center gap-2 text-caption text-graphite">
          {dirty ? <><Badge tone="warning">Unsaved</Badge>Changes are not saved yet.</> : <><Badge tone="neutral">Saved</Badge>No unsaved changes.</>}
        </span>
      </div>

      <ConfirmDialog
        open={confirmLeave}
        onClose={() => setConfirmLeave(false)}
        onConfirm={() => { setDirty(false); setConfirmLeave(false); router.push("/admin/products"); }}
        title="Discard unsaved changes?"
        body="Leaving this page drops the edits made since the last save. Uploaded images stay in storage until removed here."
        confirmLabel="Discard changes"
        destructive
      />
    </form>
  );
}

function AddRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-11 items-center gap-1.5 rounded-xs border border-hair-strong px-3 text-caption font-medium text-ink transition-colors hover:border-ink hover:bg-sand/60"
    >
      <Plus className="size-4" aria-hidden />
      {label}
    </button>
  );
}
