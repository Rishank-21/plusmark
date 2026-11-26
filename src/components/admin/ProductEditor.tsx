"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ErrorLine, Input, Area, Loading, Pick, Section } from "@/components/admin/kit";
import { Button } from "@/components/ui/Button";
import { db, rpc, type Json } from "@/lib/backend/admin";
import { useToast } from "@/state/toast";

interface OptionValue { value: string; swatch_hex: string; width_cm: string; height_cm: string }
interface Option { name: string; kind: "size" | "color" | "custom"; values: OptionValue[]; priceBy: Record<string, string> }
interface Variant {
  id?: string; sku: string; title: string; options: Record<string, string>;
  price_inr: string; compare_at_inr: string; cost_inr: string; stock: string;
  available: boolean; track_inventory: boolean; allow_backorder: boolean;
  low_stock_threshold: string; pack_qty: string; lead_time_days: string; weight_g: string; image_public_id: string;
}
interface MediaItem { public_id: string; alt: string }

const EMPTY_FORM = {
  slug: "", name: "", brand: "Plusmark", category_id: "", series_id: "", subcategory_ids: "",
  surface: "", frame: "", corners: "", magnetic: false, double_sided: false,
  board_type: "n/a", surface_kind: "other", usage: "", blurb: "", description: "",
  features: "", specs: "", customisation: "", video_id: "", tags: "", attributes: "{}",
  price_mode: "fixed", gst_rate: "18", hsn_code: "", minimum_order_quantity: "1", bulk_suggestion_quantity: "10",
  enquiry_only: false, needs_data: false, published: false, featured: false
};

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const num = (s: string) => (s.trim() === "" ? null : Number(s));

export function ProductEditor({ slug }: { slug?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(Boolean(slug));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; parent_id: string | null }[]>([]);
  const [seriesList, setSeriesList] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [alsoBought, setAlsoBought] = useState<string[]>([]);
  const [basePrice, setBasePrice] = useState("");
  const [baseStock, setBaseStock] = useState("0");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const client = db();
        const [cats, ser, prods] = await Promise.all([
          client.from("categories").select("id,name,parent_id").order("sort_order"),
          client.from("series").select("id,name").order("rank"),
          client.from("products").select("id,name,slug").is("deleted_at", null).order("name").limit(1000)
        ]);
        if (!alive) return;
        setCategories(cats.data ?? []);
        setSeriesList(ser.data ?? []);
        setProducts(prods.data ?? []);
        if (!slug) return;
        const { data: p, error: e } = await client
          .from("products")
          .select("*, product_media(*), product_options(*, product_option_values(*)), product_variants(*)")
          .eq("slug", slug)
          .maybeSingle();
        if (e || !p) throw new Error(e?.message ?? "That product was not found.");
        const costs = await client.from("variant_costs").select("variant_id,cost_inr").in("variant_id", (p.product_variants ?? []).map((v: Json) => v.id));
        const rel = await client.from("product_relations").select("related_product_id,kind,sort_order").eq("product_id", p.id).order("sort_order");
        if (!alive) return;
        setId(p.id);
        setForm({
          slug: p.slug, name: p.name, brand: p.brand ?? "", category_id: p.category_id, series_id: p.series_id ?? "",
          subcategory_ids: (p.subcategory_ids ?? []).join(", "), surface: p.surface ?? "", frame: p.frame ?? "", corners: p.corners ?? "",
          magnetic: p.magnetic, double_sided: p.double_sided, board_type: p.board_type, surface_kind: p.surface_kind, usage: p.usage ?? "",
          blurb: p.blurb ?? "", description: p.description ?? "", features: (p.features ?? []).join("\n"),
          specs: (p.specs ?? []).map((s: Json) => `${s.label} | ${s.value}`).join("\n"), customisation: p.customisation ?? "",
          video_id: p.video_id ?? "", tags: (p.tags ?? []).join(", "), attributes: JSON.stringify(p.attributes ?? {}, null, 2),
          price_mode: p.price_mode, gst_rate: String(p.gst_rate), hsn_code: p.hsn_code ?? "",
          minimum_order_quantity: String(p.minimum_order_quantity), bulk_suggestion_quantity: String(p.bulk_suggestion_quantity),
          enquiry_only: p.enquiry_only, needs_data: p.needs_data, published: p.published, featured: p.featured
        });
        setMedia((p.product_media ?? []).sort((a: Json, b: Json) => a.sort_order - b.sort_order).map((m: Json) => ({ public_id: m.public_id, alt: m.alt ?? "" })));
        setOptions(
          (p.product_options ?? []).sort((a: Json, b: Json) => a.sort_order - b.sort_order).map((o: Json) => ({
            name: o.name, kind: o.kind, priceBy: {},
            values: (o.product_option_values ?? []).sort((a: Json, b: Json) => a.sort_order - b.sort_order).map((v: Json) => ({
              value: v.value, swatch_hex: v.swatch_hex ?? "", width_cm: v.width_cm ?? "", height_cm: v.height_cm ?? ""
            }))
          }))
        );
        const costMap = new Map((costs.data ?? []).map((c: Json) => [c.variant_id, c.cost_inr]));
        setVariants(
          (p.product_variants ?? []).sort((a: Json, b: Json) => a.sort_order - b.sort_order).map((v: Json) => ({
            id: v.id, sku: v.sku, title: v.title, options: v.options ?? {}, price_inr: v.price_inr ?? "", compare_at_inr: v.compare_at_inr ?? "",
            cost_inr: costMap.has(v.id) ? String(costMap.get(v.id)) : "", stock: String(v.stock), available: v.available,
            track_inventory: v.track_inventory, allow_backorder: v.allow_backorder, low_stock_threshold: v.low_stock_threshold ?? "",
            pack_qty: String(v.pack_qty), lead_time_days: v.lead_time_days ?? "", weight_g: v.weight_g ?? "", image_public_id: v.image_public_id ?? ""
          }))
        );
        setCompare((rel.data ?? []).filter((r: Json) => r.kind === "compare").map((r: Json) => r.related_product_id));
        setAlsoBought((rel.data ?? []).filter((r: Json) => r.kind === "also_bought").map((r: Json) => r.related_product_id));
      } catch (e) {
        if (alive) setError((e as Error).message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  const set = <K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) => setForm((f) => ({ ...f, [key]: value }));
  const topCategories = categories.filter((c) => !c.parent_id);

  /* ---------------------------- options and variants ---------------------------- */
  const addOption = (kind: Option["kind"]) =>
    setOptions((o) => [...o, { name: kind === "size" ? "Size" : kind === "color" ? "Color" : "Option " + (o.length + 1), kind, values: [], priceBy: {} }]);
  const patchOption = (i: number, patch: Partial<Option>) => setOptions((o) => o.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const addValue = (i: number, text: string) => {
    const parts = text.split(",").map((t) => t.trim()).filter(Boolean);
    if (!parts.length) return;
    setOptions((o) => o.map((x, j) => (j === i ? { ...x, values: [...x.values, ...parts.filter((p) => !x.values.some((v) => v.value === p)).map((value) => ({ value, swatch_hex: "", width_cm: "", height_cm: "" }))] } : x)));
  };
  const patchValue = (i: number, k: number, patch: Partial<OptionValue>) =>
    setOptions((o) => o.map((x, j) => (j === i ? { ...x, values: x.values.map((v, m) => (m === k ? { ...v, ...patch } : v)) } : x)));

  const buildCombinations = () => {
    const axes = options.filter((o) => o.values.length > 0);
    if (!axes.length) { toast.push("Add at least one option with values first.", "error"); return; }
    if (basePrice === "" && form.price_mode === "fixed") { toast.push("Enter a base price first.", "error"); return; }
    let combos: Record<string, string>[] = [{}];
    for (const axis of axes) combos = combos.flatMap((c) => axis.values.map((v) => ({ ...c, [axis.name]: v.value })));
    if (combos.length > 500) { toast.push("That is more than 500 combinations.", "error"); return; }
    const key = (o: Record<string, string>) => JSON.stringify(Object.entries(o).sort());
    const have = new Set(variants.map((v) => key(v.options)));
    const base = form.slug ? form.slug.replace(/-/g, "").toUpperCase() : "ITEM";
    const added: Variant[] = [];
    for (const c of combos) {
      if (have.has(key(c))) continue;
      let price = basePrice;
      for (const axis of axes) {
        const override = axis.priceBy[c[axis.name]];
        if (override !== undefined && override !== "") price = override;
      }
      added.push({
        sku: `${base}-${Object.values(c).map((v) => v.replace(/[^A-Za-z0-9]/g, "").slice(0, 4).toUpperCase()).join("-")}`,
        title: Object.values(c).join(" / "), options: c, price_inr: price, compare_at_inr: "", cost_inr: "", stock: baseStock || "0",
        available: true, track_inventory: true, allow_backorder: false, low_stock_threshold: "", pack_qty: "1", lead_time_days: "", weight_g: "", image_public_id: ""
      });
    }
    setVariants((v) => [...v, ...added]);
    toast.push(`${added.length} variant${added.length === 1 ? "" : "s"} added. Review the prices, then save.`, "success");
  };

  const addSingleVariant = () =>
    setVariants((v) => [...v, { sku: `${(form.slug || "item").replace(/-/g, "").toUpperCase()}-${v.length + 1}`, title: "Default", options: {}, price_inr: basePrice, compare_at_inr: "", cost_inr: "", stock: baseStock || "0", available: true, track_inventory: true, allow_backorder: false, low_stock_threshold: "", pack_qty: "1", lead_time_days: "", weight_g: "", image_public_id: "" }]);
  const patchVariant = (i: number, patch: Partial<Variant>) => setVariants((v) => v.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  /* --------------------------------- uploads --------------------------------- */
  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const added: MediaItem[] = [];
      for (const file of Array.from(files)) {
        const path = `${form.slug || "product"}/${Date.now()}-${file.name.replace(/[^A-Za-z0-9._-]/g, "_")}`;
        const { error: e } = await db().storage.from("product-media").upload(path, file, { contentType: file.type, upsert: false });
        if (e) throw new Error(e.message);
        added.push({ public_id: db().storage.from("product-media").getPublicUrl(path).data.publicUrl, alt: form.name });
      }
      setMedia((m) => [...m, ...added]);
    } catch (e) {
      toast.push((e as Error).message, "error");
    } finally {
      setUploading(false);
    }
  };

  /* ----------------------------------- save ----------------------------------- */
  const payload = useMemo(() => {
    let attributes: Json = {};
    try { attributes = JSON.parse(form.attributes || "{}"); } catch { attributes = null; }
    return {
      ...(id ? { id } : {}),
      slug: form.slug.trim(), name: form.name.trim(), brand: form.brand.trim() || null, category_id: form.category_id,
      series_id: form.series_id || null,
      subcategory_ids: form.subcategory_ids.split(",").map((s) => s.trim()).filter(Boolean),
      surface: form.surface || null, frame: form.frame || null, corners: form.corners || null,
      magnetic: form.magnetic, double_sided: form.double_sided, board_type: form.board_type, surface_kind: form.surface_kind,
      usage: form.usage || null, blurb: form.blurb || null, description: form.description || null,
      features: form.features.split("\n").map((s) => s.trim()).filter(Boolean),
      specs: form.specs.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => { const [label, ...rest] = l.split("|"); return { label: label.trim(), value: rest.join("|").trim() }; }),
      attributes, customisation: form.customisation || null, video_id: form.video_id || null,
      tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
      price_mode: form.price_mode, gst_rate: Number(form.gst_rate), hsn_code: form.hsn_code || null,
      minimum_order_quantity: Number(form.minimum_order_quantity) || 1, bulk_suggestion_quantity: Number(form.bulk_suggestion_quantity) || 10,
      enquiry_only: form.enquiry_only, needs_data: form.needs_data, published: form.published, featured: form.featured,
      media: media.map((m) => ({ public_id: m.public_id, alt: m.alt || form.name })),
      options: options.map((o) => ({ name: o.name.trim(), kind: o.kind, values: o.values.map((v) => ({ value: v.value, swatch_hex: v.swatch_hex || null, width_cm: num(String(v.width_cm)), height_cm: num(String(v.height_cm)) })) })),
      variants: variants.map((v) => ({
        ...(v.id ? { id: v.id } : {}), sku: v.sku.trim(), title: v.title, options: v.options,
        price_mode: form.price_mode === "on_request" || v.price_inr === "" ? "on_request" : "fixed",
        price_inr: num(String(v.price_inr)), compare_at_inr: num(String(v.compare_at_inr)), cost_inr: num(String(v.cost_inr)),
        stock: Number(v.stock) || 0, available: v.available, track_inventory: v.track_inventory, allow_backorder: v.allow_backorder,
        low_stock_threshold: num(String(v.low_stock_threshold)), pack_qty: Number(v.pack_qty) || 1,
        lead_time_days: num(String(v.lead_time_days)), weight_g: num(String(v.weight_g)), image_public_id: v.image_public_id || null
      }))
    };
  }, [form, id, media, options, variants]);

  const save = async () => {
    if (!payload.attributes && payload.attributes !== 0) { toast.push("The extra attributes box is not valid JSON.", "error"); return; }
    if (!payload.name || !payload.slug || !payload.category_id) { toast.push("Name, address (slug) and category are required.", "error"); return; }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(payload.slug)) { toast.push("The address may use lowercase letters, numbers and hyphens only.", "error"); return; }
    setSaving(true);
    try {
      const productId = await rpc<string>("admin_upsert_product", { p: payload });
      await rpc("admin_set_relations", { p_product_id: productId, p_kind: "compare", p_related: compare });
      await rpc("admin_set_relations", { p_product_id: productId, p_kind: "also_bought", p_related: alsoBought });
      toast.push("Product saved.", "success");
      if (!slug) router.replace(`/admin/products/${payload.slug}/edit`);
      else router.refresh();
    } catch (e) {
      toast.push((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading what="Loading product" />;
  if (error) return <ErrorLine message={error} />;

  const otherProducts = products.filter((p) => p.id !== id);
  const picker = (label: string, selected: string[], setSelected: (ids: string[]) => void, hint: string) => (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold text-ink">{label}</h3>
      <p className="text-caption text-muted">{hint}</p>
      <ol className="flex flex-col gap-1">
        {selected.map((pid, i) => {
          const p = products.find((x) => x.id === pid);
          return (
            <li key={pid} className="flex items-center justify-between gap-2 rounded-sm border border-line px-2 py-1 text-body-sm">
              <span>{i + 1}. {p?.name ?? pid}</span>
              <span className="flex gap-1">
                <button type="button" className="px-1 text-muted hover:text-ink" onClick={() => i > 0 && setSelected(selected.map((x, j) => (j === i - 1 ? selected[i] : j === i ? selected[i - 1] : x)))}>↑</button>
                <button type="button" className="px-1 text-muted hover:text-danger" onClick={() => setSelected(selected.filter((x) => x !== pid))}>Remove</button>
              </span>
            </li>
          );
        })}
      </ol>
      <select className="h-10 rounded-md border border-line-strong bg-surface px-2 text-body-sm" value="" onChange={(e) => e.target.value && selected.length < 12 && setSelected([...selected, e.target.value])}>
        <option value="">Add a product…</option>
        {otherProducts.filter((p) => !selected.includes(p.id)).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <Section title="Basics">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Product name" value={form.name} onChange={(e) => { set("name", e.target.value); if (!slug && (!form.slug || form.slug === slugify(form.name))) set("slug", slugify(e.target.value)); }} required />
          <Input label="Address (slug)" hint={slug ? "Changing this changes the product link" : "Used in the product link"} value={form.slug} onChange={(e) => set("slug", e.target.value)} required />
          <Pick label="Category" value={form.category_id} onChange={(v) => set("category_id", v)} options={[["", "Choose…"], ...topCategories.map((c) => [c.id, c.name] as [string, string])]} />
          <Input label="Sub category ids" hint="Comma separated, from the categories page" value={form.subcategory_ids} onChange={(e) => set("subcategory_ids", e.target.value)} />
          <Pick label="Series" value={form.series_id} onChange={(v) => set("series_id", v)} options={[["", "None"], ...seriesList.map((s) => [s.id, s.name] as [string, string])]} />
          <Input label="Brand" value={form.brand} onChange={(e) => set("brand", e.target.value)} />
          <Input label="Short line" value={form.blurb} onChange={(e) => set("blurb", e.target.value)} className="sm:col-span-2" />
          <Area label="Description" value={form.description} onChange={(e) => set("description", e.target.value)} className="sm:col-span-2" />
          <Area label="Features" hint="One per line" value={form.features} onChange={(e) => set("features", e.target.value)} />
          <Area label="Specifications" hint="One per line, as: Label | Value" value={form.specs} onChange={(e) => set("specs", e.target.value)} />
          <Input label="Tags" hint="Comma separated, used for search" value={form.tags} onChange={(e) => set("tags", e.target.value)} />
          <Input label="Made to order note" value={form.customisation} onChange={(e) => set("customisation", e.target.value)} />
        </div>
      </Section>

      <Section title="Attributes (same as the storefront)">
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Surface" value={form.surface} onChange={(e) => set("surface", e.target.value)} />
          <Input label="Frame" value={form.frame} onChange={(e) => set("frame", e.target.value)} />
          <Input label="Corners" value={form.corners} onChange={(e) => set("corners", e.target.value)} />
          <Pick label="Board type" value={form.board_type} onChange={(v) => set("board_type", v)} options={[["n/a", "Not applicable"], ["non-magnetic", "Non magnetic"], ["magnetic", "Magnetic"], ["ceramic", "Ceramic"]]} />
          <Pick label="Surface kind" value={form.surface_kind} onChange={(v) => set("surface_kind", v)} options={[["other", "Other"], ["marker", "Marker"], ["chalk", "Chalk"], ["pin-up", "Pin up"]]} />
          <Input label="Typical use" value={form.usage} onChange={(e) => set("usage", e.target.value)} />
          <Check label="Magnetic" checked={form.magnetic} onChange={(v) => set("magnetic", v)} />
          <Check label="Double sided" checked={form.double_sided} onChange={(v) => set("double_sided", v)} />
          <Input label="Video id" value={form.video_id} onChange={(e) => set("video_id", e.target.value)} />
          <Area label="Any other attributes (JSON)" hint='For example {"material":"Steel","capacity_ml":750}' value={form.attributes} onChange={(e) => set("attributes", e.target.value)} className="sm:col-span-3" />
        </div>
      </Section>

      <Section title="Photos">
        <div className="flex flex-wrap gap-3">
          {media.map((m, i) => (
            <div key={i} className="flex w-48 flex-col gap-1 rounded-sm border border-line p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {/^https?:|^\//.test(m.public_id) && <img src={m.public_id} alt={m.alt} className="h-28 w-full object-cover" />}
              <input className="h-8 rounded-sm border border-line px-1 text-caption" value={m.public_id} onChange={(e) => setMedia(media.map((x, j) => (j === i ? { ...x, public_id: e.target.value } : x)))} aria-label="Image id or link" />
              <div className="flex justify-between text-caption">
                <button type="button" className="text-muted hover:text-ink" onClick={() => i > 0 && setMedia(media.map((x, j) => (j === i - 1 ? media[i] : j === i ? media[i - 1] : x)))}>Move up</button>
                <button type="button" className="text-muted hover:text-danger" onClick={() => setMedia(media.filter((_, j) => j !== i))}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded-md border border-line-strong px-3 py-2 text-body-sm font-medium hover:bg-subtle">
            {uploading ? "Uploading…" : "Upload photos"}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="sr-only" onChange={(e) => void upload(e.target.files)} />
          </label>
          <Button size="sm" variant="secondary" onClick={() => setMedia([...media, { public_id: "", alt: "" }])}>Add by id or link</Button>
          <span className="text-caption text-muted">The first photo is the cover. Cloudinary ids and image links both work.</span>
        </div>
      </Section>

      <Section title="Price and tax">
        <div className="grid gap-3 sm:grid-cols-4">
          <Pick label="Selling" value={form.price_mode} onChange={(v) => set("price_mode", v)} options={[["fixed", "Online at listed prices"], ["on_request", "Price on request"]]} />
          <Input label="GST rate (%)" type="number" step="0.01" value={form.gst_rate} onChange={(e) => set("gst_rate", e.target.value)} />
          <Input label="HSN code" value={form.hsn_code} onChange={(e) => set("hsn_code", e.target.value)} />
          <Input label="Minimum order quantity" type="number" min={1} value={form.minimum_order_quantity} onChange={(e) => set("minimum_order_quantity", e.target.value)} />
          <Input label="Suggest bulk quote from" type="number" min={1} value={form.bulk_suggestion_quantity} onChange={(e) => set("bulk_suggestion_quantity", e.target.value)} />
          <Check label="Enquiry only (cannot be bought online)" checked={form.enquiry_only} onChange={(v) => set("enquiry_only", v)} />
          <Check label="Needs data (shown as incomplete)" checked={form.needs_data} onChange={(v) => set("needs_data", v)} />
        </div>
      </Section>

      <Section title="Sizes, colours and other options" aside={<div className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => addOption("size")}>+ Size</Button><Button size="sm" variant="secondary" onClick={() => addOption("color")}>+ Colour</Button><Button size="sm" variant="secondary" onClick={() => addOption("custom")}>+ Custom option</Button></div>}>
        {options.length === 0 && <p className="text-body-sm text-muted">No options yet. A product with one fixed price can skip this and use a single variant below.</p>}
        <div className="flex flex-col gap-4">
          {options.map((o, i) => (
            <div key={i} className="rounded-md border border-line p-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_10rem_auto]">
                <Input label="Option name" value={o.name} onChange={(e) => patchOption(i, { name: e.target.value })} hint="For example Size, Colour, Pack, Material" />
                <Pick label="Type" value={o.kind} onChange={(v) => patchOption(i, { kind: v as Option["kind"] })} options={[["size", "Size"], ["color", "Colour"], ["custom", "Custom"]]} />
                <div className="flex items-end"><Button size="sm" variant="quiet" onClick={() => setOptions(options.filter((_, j) => j !== i))}>Remove option</Button></div>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {o.values.map((v, k) => (
                  <div key={k} className="grid items-end gap-2 sm:grid-cols-[1fr_8rem_6rem_6rem_9rem_auto]">
                    <Input label={k === 0 ? "Value" : ""} aria-label="Value" value={v.value} onChange={(e) => patchValue(i, k, { value: e.target.value })} />
                    {o.kind === "color" ? <Input label={k === 0 ? "Swatch" : ""} aria-label="Swatch colour" type="color" value={v.swatch_hex || "#000000"} onChange={(e) => patchValue(i, k, { swatch_hex: e.target.value })} /> : <span />}
                    {o.kind === "size" ? <Input label={k === 0 ? "Width cm" : ""} aria-label="Width in cm" type="number" value={String(v.width_cm)} onChange={(e) => patchValue(i, k, { width_cm: e.target.value })} /> : <span />}
                    {o.kind === "size" ? <Input label={k === 0 ? "Height cm" : ""} aria-label="Height in cm" type="number" value={String(v.height_cm)} onChange={(e) => patchValue(i, k, { height_cm: e.target.value })} /> : <span />}
                    <Input label={k === 0 ? "Price when chosen (₹)" : ""} aria-label="Price when this value is chosen" type="number" value={o.priceBy[v.value] ?? ""} onChange={(e) => patchOption(i, { priceBy: { ...o.priceBy, [v.value]: e.target.value } })} placeholder="optional" />
                    <Button size="sm" variant="quiet" onClick={() => patchOption(i, { values: o.values.filter((_, m) => m !== k) })}>×</Button>
                  </div>
                ))}
                <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const inp = (e.currentTarget.elements.namedItem("v") as HTMLInputElement); addValue(i, inp.value); inp.value = ""; }}>
                  <input name="v" className="h-10 flex-1 rounded-md border border-line-strong px-3 text-body-sm" placeholder="Add values, separated by commas (for example Red, Blue, Green)" />
                  <Button type="submit" size="sm" variant="secondary">Add</Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Variants (every sellable combination)" aside={<div className="flex gap-2"><Button size="sm" onClick={buildCombinations}>Build all combinations</Button><Button size="sm" variant="secondary" onClick={addSingleVariant}>+ Single variant</Button></div>}>
        <div className="mb-3 grid gap-3 sm:grid-cols-3">
          <Input label="Base price for new variants (₹, before GST)" type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} />
          <Input label="Starting stock for new variants" type="number" value={baseStock} onChange={(e) => setBaseStock(e.target.value)} />
          <p className="self-end text-caption text-muted">Size and colour prices above override the base price. Edit any row afterwards.</p>
        </div>
        {variants.length === 0 ? <p className="text-body-sm text-muted">No variants yet. A product needs at least one before it can be published.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[60rem] border-collapse text-body-sm">
              <thead><tr className="border-b border-line text-left text-caption uppercase text-muted">
                {["Variant", "SKU", "Price ₹", "MRP ₹", "Cost ₹", "Stock", "Low at", "Track", "Backorder", "Sell", ""].map((h) => <th key={h} className="px-1 py-1 font-medium">{h}</th>)}
              </tr></thead>
              <tbody>
                {variants.map((v, i) => (
                  <tr key={v.id ?? i} className="border-b border-line/60">
                    <td className="px-1 py-1"><input className="h-9 w-40 rounded-sm border border-line px-1" value={v.title} onChange={(e) => patchVariant(i, { title: e.target.value })} /></td>
                    <td className="px-1 py-1"><input className="h-9 w-40 rounded-sm border border-line px-1" value={v.sku} onChange={(e) => patchVariant(i, { sku: e.target.value })} /></td>
                    <td className="px-1 py-1"><input type="number" step="0.01" className="h-9 w-24 rounded-sm border border-line px-1" value={v.price_inr} onChange={(e) => patchVariant(i, { price_inr: e.target.value })} /></td>
                    <td className="px-1 py-1"><input type="number" step="0.01" className="h-9 w-24 rounded-sm border border-line px-1" value={v.compare_at_inr} onChange={(e) => patchVariant(i, { compare_at_inr: e.target.value })} /></td>
                    <td className="px-1 py-1"><input type="number" step="0.01" className="h-9 w-20 rounded-sm border border-line px-1" value={v.cost_inr} onChange={(e) => patchVariant(i, { cost_inr: e.target.value })} /></td>
                    <td className="px-1 py-1"><input type="number" className="h-9 w-20 rounded-sm border border-line px-1" value={v.stock} onChange={(e) => patchVariant(i, { stock: e.target.value })} /></td>
                    <td className="px-1 py-1"><input type="number" className="h-9 w-16 rounded-sm border border-line px-1" value={v.low_stock_threshold} onChange={(e) => patchVariant(i, { low_stock_threshold: e.target.value })} /></td>
                    <td className="px-1 py-1 text-center"><input type="checkbox" checked={v.track_inventory} onChange={(e) => patchVariant(i, { track_inventory: e.target.checked })} /></td>
                    <td className="px-1 py-1 text-center"><input type="checkbox" checked={v.allow_backorder} onChange={(e) => patchVariant(i, { allow_backorder: e.target.checked })} /></td>
                    <td className="px-1 py-1 text-center"><input type="checkbox" checked={v.available} onChange={(e) => patchVariant(i, { available: e.target.checked })} /></td>
                    <td className="px-1 py-1"><button type="button" className="text-caption text-muted hover:text-danger" onClick={() => setVariants(variants.filter((_, j) => j !== i))}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="pt-2 text-caption text-muted">Removed variants that already appear on orders are hidden instead of deleted, so order history stays intact. Cost is private and never shown to customers.</p>
      </Section>

      <Section title="Compare and suggestions (what customers see on the product page)">
        {!id ? <p className="text-body-sm text-muted">Save the product once, then choose its comparison products.</p> : (
          <div className="grid gap-6 lg:grid-cols-2">
            {picker("Compare with similar products", compare, setCompare, "Up to 3 are shown in the comparison table at the bottom of the page, in this order. Leave empty to use the automatic choice.")}
            {picker("You may also like", alsoBought, setAlsoBought, "Shown first. The rest is filled automatically from what other customers bought together.")}
          </div>
        )}
      </Section>

      <Section title="Visibility">
        <div className="flex flex-wrap gap-6">
          <Check label="Published (visible in the shop)" checked={form.published} onChange={(v) => set("published", v)} />
          <Check label="Featured" checked={form.featured} onChange={(v) => set("featured", v)} />
        </div>
      </Section>

      <div className="sticky bottom-0 -mx-1 flex items-center justify-end gap-3 border-t border-line bg-page/95 px-1 py-3 backdrop-blur">
        <Button variant="secondary" onClick={() => router.push("/admin/products")}>Back to products</Button>
        <Button onClick={() => void save()} loading={saving} disabled={saving}>Save product</Button>
      </div>
    </div>
  );
}
