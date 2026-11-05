"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ErrorState } from "@/components/ui/States";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CheckboxField, SelectField, TextArea, TextField } from "@/components/ui/Field";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { formatDate, formatInr } from "@/lib/format";
import { AdminPageHeader, AdminPanel, StatStrip } from "@/components/admin/Metrics";
import { FilterBar, FilterSelect, SearchControl } from "@/components/admin/FilterBar";
import { DataTable, type AdminColumn } from "@/components/admin/DataTable";
import { errorMessage, useAdminQuery } from "@/components/admin/useAdminQuery";
import { deleteCoupon, listAdminCoupons, saveCoupon, setCouponActive } from "@/lib/supabase/admin";
import { useToast } from "@/state/toast";
import type { Coupon } from "@/types";

const ALL = "all";

interface Draft {
  id: string;
  code: string;
  description: string;
  kind: "percent" | "flat";
  value: string;
  minimum: string;
  usageLimit: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function inDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function emptyDraft(): Draft {
  return {
    id: "",
    code: "",
    description: "",
    kind: "percent",
    value: "",
    minimum: "",
    usageLimit: "",
    startsAt: today(),
    endsAt: inDays(30),
    active: true
  };
}

function draftFor(coupon: Coupon): Draft {
  return {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description,
    kind: coupon.kind,
    value: String(coupon.value),
    minimum: coupon.minimumOrderInr ? String(coupon.minimumOrderInr) : "",
    usageLimit: coupon.usageLimit === null ? "" : String(coupon.usageLimit),
    startsAt: coupon.startsAt,
    endsAt: coupon.endsAt,
    active: coupon.active
  };
}

export default function AdminCouponsPage() {
  const toast = useToast();
  const query = useAdminQuery(() => listAdminCoupons());
  const coupons = query.data ?? [];

  const [search, setSearch] = useState("");
  const [state, setState] = useState(ALL);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Coupon | null>(null);

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return coupons.filter((coupon) => {
      const now = today();
      const live = coupon.active && coupon.startsAt <= now && coupon.endsAt >= now;
      if (state === "active" && !coupon.active) return false;
      if (state === "scheduled" && (!coupon.active || coupon.startsAt <= now)) return false;
      if (state === "expired" && coupon.endsAt >= now) return false;
      if (state === "live" && !live) return false;
      return !needle || `${coupon.code} ${coupon.description}`.toLowerCase().includes(needle);
    });
  }, [coupons, search, state]);

  const openCreate = () => {
    setEditing(emptyDraft());
    setErrors({});
  };

  const openEdit = (coupon: Coupon) => {
    setEditing(draftFor(coupon));
    setErrors({});
  };

  const validate = (draft: Draft): Record<string, string | null> => {
    const next: Record<string, string | null> = {};
    const code = draft.code.trim().toUpperCase();
    if (!code) next.code = "Enter a coupon code.";
    else if (!/^[A-Z0-9-]{3,32}$/.test(code)) next.code = "Use 3–32 letters, numbers or hyphens.";
    if (!draft.description.trim()) next.description = "Describe the offer for the customer.";
    const value = Number.parseInt(draft.value, 10);
    if (!draft.value.trim()) next.value = "Enter the discount amount.";
    else if (!Number.isFinite(value) || value <= 0) next.value = "The discount must be greater than zero.";
    else if (draft.kind === "percent" && value > 100) next.value = "A percentage cannot exceed 100%.";
    if (draft.minimum.trim()) {
      const floor = Number.parseInt(draft.minimum, 10);
      if (!Number.isFinite(floor) || floor < 0) next.minimum = "Enter a minimum order in rupees, or leave blank.";
    }
    if (draft.usageLimit.trim()) {
      const limit = Number.parseInt(draft.usageLimit, 10);
      if (!Number.isFinite(limit) || limit <= 0) next.usageLimit = "Enter a redemptions limit, or leave blank.";
    }
    if (!draft.startsAt) next.startsAt = "Choose a start date.";
    if (!draft.endsAt) next.endsAt = "Choose an end date.";
    else if (draft.startsAt && draft.endsAt < draft.startsAt) next.endsAt = "The end date must be on or after the start date.";
    return next;
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing || saving) return;
    const next = validate(editing);
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    setSaving(true);
    try {
      const saved = await saveCoupon({
        id: editing.id || undefined,
        code: editing.code.trim().toUpperCase(),
        description: editing.description.trim(),
        kind: editing.kind,
        value: Number.parseInt(editing.value, 10),
        minimumOrderInr: editing.minimum.trim() ? Number.parseInt(editing.minimum, 10) : 0,
        active: editing.active,
        startsAt: editing.startsAt,
        endsAt: editing.endsAt,
        usageLimit: editing.usageLimit.trim() ? Number.parseInt(editing.usageLimit, 10) : null
      });
      query.setData((current) => {
        const list = current ?? [];
        return editing.id ? list.map((coupon) => (coupon.id === saved.id ? saved : coupon)) : [saved, ...list];
      });
      toast.push(editing.id ? `${saved.code} updated` : `${saved.code} created`, "success");
      setEditing(null);
    } catch (reason) {
      if (reason instanceof Error && "field" in reason && typeof reason.field === "string") {
        setErrors({ [reason.field]: reason.message });
      }
      toast.push(errorMessage(reason, "The coupon could not be saved."), "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    setBusyId(coupon.id);
    try {
      await setCouponActive(coupon.id, !coupon.active);
      query.setData((current) => (current ?? []).map((entry) => entry.id === coupon.id ? { ...entry, active: !coupon.active } : entry));
      toast.push(`${coupon.code} ${coupon.active ? "deactivated" : "activated"}`, "success");
    } catch (reason) {
      toast.push(errorMessage(reason, "The coupon state could not be saved."), "error");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setBusyId(target.id);
    try {
      await deleteCoupon(target.id);
      query.setData((current) => (current ?? []).filter((coupon) => coupon.id !== target.id));
      toast.push(`${target.code} deleted`, "success");
      setPendingDelete(null);
    } catch (reason) {
      toast.push(errorMessage(reason, "The coupon could not be deleted."), "error");
    } finally {
      setBusyId(null);
    }
  };

  const columns: AdminColumn<Coupon>[] = [
    {
      id: "code",
      header: "Code",
      minWidth: "16rem",
      sortValue: (coupon) => coupon.code,
      render: (coupon) => (
        <span className="flex flex-col leading-tight">
          <span className="font-medium tabular text-ink">
            {coupon.code} <span className="font-normal text-graphite">· {coupon.kind === "percent" ? `${coupon.value}% off` : `${formatInr(coupon.value)} off`}</span>
          </span>
          <span className="text-caption text-graphite">{coupon.description}</span>
        </span>
      )
    },
    {
      id: "minimum",
      header: "Minimum",
      numeric: true,
      minWidth: "7rem",
      sortValue: (coupon) => coupon.minimumOrderInr,
      render: (coupon) => (coupon.minimumOrderInr > 0 ? formatInr(coupon.minimumOrderInr) : "None")
    },
    {
      id: "used",
      header: "Used",
      numeric: true,
      minWidth: "6rem",
      sortValue: (coupon) => coupon.usedCount,
      render: (coupon) => `${coupon.usedCount}${coupon.usageLimit !== null ? ` / ${coupon.usageLimit}` : ""}`
    },
    {
      id: "validity",
      header: "Validity",
      minWidth: "11rem",
      sortValue: (coupon) => coupon.startsAt,
      render: (coupon) => (
        <span className="flex flex-col items-start gap-1 leading-tight">
          <span className="tabular text-caption text-graphite">{formatDate(coupon.startsAt)} → {formatDate(coupon.endsAt)}</span>
          <Badge tone={coupon.active ? "success" : "neutral"}>{coupon.active ? "Active" : "Inactive"}</Badge>
        </span>
      )
    },
    {
      id: "actions",
      header: "Actions",
      minWidth: "12rem",
      render: (coupon) => (
        <span className="flex flex-wrap items-center gap-1.5">
          <Button size="sm" variant="quiet" onClick={() => openEdit(coupon)} aria-label={`Edit ${coupon.code}`}>
            <Pencil className="size-3.5" aria-hidden />Edit
          </Button>
          <Button size="sm" variant="quiet" disabled={busyId === coupon.id} onClick={() => toggleActive(coupon)}>
            {coupon.active ? "Deactivate" : "Activate"}
          </Button>
          <Button size="sm" variant="quiet" disabled={busyId === coupon.id} onClick={() => setPendingDelete(coupon)} aria-label={`Delete ${coupon.code}`}>
            <Trash2 className="size-3.5" aria-hidden />
          </Button>
        </span>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="Coupons"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Coupons" }]}
        lede="Promotion codes and their minimum-order rules. Codes are validated again on the server at checkout; this screen writes to the live coupons table."
        actions={<Button onClick={openCreate} disabled={query.loading}><Plus className="size-4" aria-hidden />New coupon</Button>}
      />
      <StatStrip
        items={[
          { label: "Coupons", value: query.loading ? "—" : String(coupons.length) },
          { label: "Active", value: query.loading ? "—" : String(coupons.filter((coupon) => coupon.active).length) },
          { label: "Live now", value: query.loading ? "—" : String(coupons.filter((coupon) => coupon.active && coupon.startsAt <= today() && coupon.endsAt >= today()).length) },
          { label: "Redemptions", value: query.loading ? "—" : coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0).toLocaleString("en-IN") },
          { label: "Percent codes", value: query.loading ? "—" : String(coupons.filter((coupon) => coupon.kind === "percent").length) },
          { label: "Flat codes", value: query.loading ? "—" : String(coupons.filter((coupon) => coupon.kind === "flat").length) }
        ]}
      />

      {query.error ? (
        <ErrorState title="Coupons could not be loaded" body={query.error} onRetry={query.reload} />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(21rem,0.8fr)] xl:items-start">
          <div className="flex min-w-0 flex-col gap-4">
            <FilterBar
              resultLabel={`${rows.length} of ${coupons.length} codes match`}
              onReset={search || state !== ALL ? () => { setSearch(""); setState(ALL); } : undefined}
            >
              <SearchControl label="Search coupons" value={search} onChange={setSearch} className="grow" width="w-full min-w-[15rem]" placeholder="Code or description" />
              <FilterSelect
                label="State"
                value={state}
                onChange={setState}
                options={[
                  { value: ALL, label: "All states" },
                  { value: "live", label: "Live now" },
                  { value: "active", label: "Active" },
                  { value: "scheduled", label: "Scheduled" },
                  { value: "expired", label: "Ended" }
                ]}
              />
            </FilterBar>
            <DataTable
              caption="Coupons with discount, minimum order, redemptions, validity window and actions"
              columns={columns}
              rows={rows}
              keyFor={(coupon) => coupon.id}
              loading={query.loading}
              resetKey={`${search}|${state}`}
              pageSize={10}
              defaultSort={{ id: "code", dir: "asc" }}
              emptyTitle="No coupon matches these filters"
              emptyBody="Clear the search or switch the state filter."
            />
          </div>

          <AdminPanel title="How codes are applied" description="Server-side rules, not browser guesses.">
            <ul className="list-disc space-y-2 pl-5 text-body-sm leading-relaxed text-graphite">
              <li>Checkout reads active coupons from the live table and re-checks dates, minimum order and the usage limit before applying a discount.</li>
              <li>Deactivating a code stops new redemptions immediately; existing orders keep the discount they were placed with.</li>
              <li>Deleting a code removes it from checkout. It does not alter orders that already used it.</li>
              <li>Used counts are incremented by the order flow, not by this screen.</li>
            </ul>
          </AdminPanel>
        </div>
      )}

      <Modal
        open={editing !== null}
        onClose={() => { if (!saving) setEditing(null); }}
        title={editing?.id ? "Edit coupon" : "New coupon"}
        description={editing?.id ? "Changes apply to the live checkout once saved." : "The code becomes redeemable according to the dates and state below."}
        size="md"
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="coupon-form" disabled={saving}>{saving ? "Saving…" : editing?.id ? "Save coupon" : "Create coupon"}</Button>
          </>
        }
      >
        {editing && (
          <form id="coupon-form" onSubmit={submit} noValidate className="flex flex-col gap-3.5">
            <TextField
              label="Code"
              value={editing.code}
              error={errors.code}
              onChange={(event) => { setEditing({ ...editing, code: event.target.value.toUpperCase() }); if (errors.code) setErrors((current) => ({ ...current, code: null })); }}
              placeholder="INSTITUTION15"
              hint="3–32 letters, numbers or hyphens. Redemption is case-insensitive."
              required
            />
            <TextArea
              label="Customer description"
              rows={2}
              value={editing.description}
              error={errors.description}
              onChange={(event) => { setEditing({ ...editing, description: event.target.value }); if (errors.description) setErrors((current) => ({ ...current, description: null })); }}
              placeholder="15% off orders above ₹50,000"
              required
            />
            <div className="grid gap-3.5 sm:grid-cols-2">
              <SelectField
                label="Discount type"
                value={editing.kind}
                onChange={(event) => setEditing({ ...editing, kind: event.target.value as "percent" | "flat" })}
                options={[{ value: "percent", label: "Percentage off goods value" }, { value: "flat", label: "Flat rupee amount off" }]}
              />
              <TextField
                label={editing.kind === "percent" ? "Percentage" : "Amount ₹"}
                inputMode="numeric"
                value={editing.value}
                error={errors.value}
                onChange={(event) => { setEditing({ ...editing, value: event.target.value }); if (errors.value) setErrors((current) => ({ ...current, value: null })); }}
                placeholder={editing.kind === "percent" ? "15" : "500"}
                required
              />
              <TextField
                label="Minimum order value"
                inputMode="numeric"
                value={editing.minimum}
                error={errors.minimum}
                onChange={(event) => { setEditing({ ...editing, minimum: event.target.value }); if (errors.minimum) setErrors((current) => ({ ...current, minimum: null })); }}
                placeholder="0"
                hint="Rupees. Leave blank for no minimum."
                optional
              />
              <TextField
                label="Redemption limit"
                inputMode="numeric"
                value={editing.usageLimit}
                error={errors.usageLimit}
                onChange={(event) => { setEditing({ ...editing, usageLimit: event.target.value }); if (errors.usageLimit) setErrors((current) => ({ ...current, usageLimit: null })); }}
                placeholder="Unlimited"
                hint="Leave blank for no limit."
                optional
              />
              <TextField
                label="Starts"
                type="date"
                value={editing.startsAt}
                error={errors.startsAt}
                onChange={(event) => { setEditing({ ...editing, startsAt: event.target.value }); if (errors.startsAt) setErrors((current) => ({ ...current, startsAt: null })); }}
                required
              />
              <TextField
                label="Ends"
                type="date"
                value={editing.endsAt}
                error={errors.endsAt}
                onChange={(event) => { setEditing({ ...editing, endsAt: event.target.value }); if (errors.endsAt) setErrors((current) => ({ ...current, endsAt: null })); }}
                required
              />
            </div>
            <CheckboxField
              label="Active"
              checked={editing.active}
              onChange={(event) => setEditing({ ...editing, active: event.target.checked })}
              hint="Inactive codes are kept on record but rejected at checkout."
            />
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => { if (busyId === null) setPendingDelete(null); }}
        onConfirm={remove}
        title={`Delete ${pendingDelete?.code ?? "coupon"}?`}
        body="The code stops working at checkout immediately. Orders that already used it keep their discount. This cannot be undone."
        confirmLabel={busyId ? "Deleting…" : "Delete coupon"}
        destructive
      />
    </div>
  );
}
