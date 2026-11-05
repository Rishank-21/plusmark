"use client";

import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CheckboxField, TextArea, TextField } from "@/components/ui/Field";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { ErrorState } from "@/components/ui/States";
import { AdminPageHeader, AdminPanel, StatStrip } from "@/components/admin/Metrics";
import { errorMessage, useAdminQuery } from "@/components/admin/useAdminQuery";
import {
  createShippingMethod,
  deleteShippingMethod,
  listShippingMethods,
  saveShippingMethod
} from "@/lib/supabase/admin";
import { useToast } from "@/state/toast";
import type { ShippingMethod } from "@/types";

interface CreateDraft {
  id: string;
  name: string;
  description: string;
}

const EMPTY_CREATE: CreateDraft = { id: "", name: "", description: "" };

export default function AdminShippingPage() {
  const toast = useToast();
  const query = useAdminQuery(() => listShippingMethods());
  const methods = query.data ?? [];

  const [creating, setCreating] = useState<CreateDraft | null>(null);
  const [createErrors, setCreateErrors] = useState<Record<string, string | null>>({});
  const [pendingDelete, setPendingDelete] = useState<ShippingMethod | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const updateLocal = (id: string, patch: Partial<ShippingMethod>) => {
    query.setData((current) => (current ?? []).map((method) => {
      if (method.id !== id) return method;
      const next = { ...method, ...patch };
      return {
        ...next,
        configured: next.priceInr !== null && next.etaMinDays !== null && next.etaMaxDays !== null
      };
    }));
  };

  const save = async (method: ShippingMethod) => {
    if (busyId) return;
    const name = method.name.trim();
    const description = method.description.trim();
    if (!name || !description) {
      toast.push("A method needs a name and a customer description.", "error");
      return;
    }
    if (method.priceInr !== null && method.priceInr < 0) {
      toast.push("Freight cannot be negative. Leave it blank if the rate is still to be confirmed.", "error");
      return;
    }
    if ((method.etaMinDays === null) !== (method.etaMaxDays === null)) {
      toast.push("Enter both delivery estimates, or leave both blank.", "error");
      return;
    }
    if (method.etaMinDays !== null && method.etaMaxDays !== null && method.etaMinDays > method.etaMaxDays) {
      toast.push("The minimum delivery estimate cannot exceed the maximum.", "error");
      return;
    }
    setBusyId(method.id);
    try {
      await saveShippingMethod({ ...method, name, description });
      updateLocal(method.id, { name, description });
      toast.push(`${name} saved`, "success");
    } catch (reason) {
      toast.push(errorMessage(reason, "The shipping method could not be saved."), "error");
    } finally {
      setBusyId(null);
    }
  };

  const create = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!creating) return;
    const next: Record<string, string | null> = {};
    if (!creating.id.trim()) next.id = "Give the method a short identifier.";
    if (!creating.name.trim()) next.name = "Enter the method name customers will see.";
    if (!creating.description.trim()) next.description = "Describe when this method applies.";
    setCreateErrors(next);
    if (Object.values(next).some(Boolean)) return;
    setBusyId("create");
    try {
      await createShippingMethod(creating);
      setCreating(null);
      setCreateErrors({});
      toast.push("Shipping method added", "success");
      query.reload();
    } catch (reason) {
      if (reason instanceof Error && "field" in reason && typeof reason.field === "string") {
        setCreateErrors({ [reason.field]: reason.message });
      }
      toast.push(errorMessage(reason, "The shipping method could not be added."), "error");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setBusyId(target.id);
    try {
      await deleteShippingMethod(target.id);
      query.setData((current) => (current ?? []).filter((method) => method.id !== target.id));
      setPendingDelete(null);
      toast.push(`${target.name} deleted`, "success");
    } catch (reason) {
      toast.push(errorMessage(reason, "The shipping method could not be deleted."), "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="Shipping"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Shipping" }]}
        lede="Freight presentation at checkout. A method without a confirmed rate or delivery window cannot promise anything to the customer."
        actions={
          <Button onClick={() => { setCreating(EMPTY_CREATE); setCreateErrors({}); }} disabled={query.loading || Boolean(query.error)}>
            <Plus className="size-4" aria-hidden />Add method
          </Button>
        }
      />
      <StatStrip
        items={[
          { label: "Methods", value: query.loading ? "—" : String(methods.length) },
          { label: "Available", value: query.loading ? "—" : String(methods.filter((method) => method.available).length) },
          { label: "Priced", value: query.loading ? "—" : String(methods.filter((method) => method.priceInr !== null).length) },
          { label: "Fully configured", value: query.loading ? "—" : String(methods.filter((method) => method.configured).length) },
          { label: "Rate to confirm", value: query.loading ? "—" : String(methods.filter((method) => method.priceInr === null).length) },
          { label: "Timing to confirm", value: query.loading ? "—" : String(methods.filter((method) => method.etaMinDays === null || method.etaMaxDays === null).length) }
        ]}
      />

      {query.error ? (
        <ErrorState title="Shipping methods could not be loaded" body={query.error} onRetry={query.reload} />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {methods.map((method) => (
            <AdminPanel key={method.id} title={method.name} description={method.description}>
              <div className="flex flex-col gap-4">
                <TextField
                  label="Method name"
                  value={method.name}
                  onChange={(event) => updateLocal(method.id, { name: event.target.value })}
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <TextField
                    label="Freight ₹"
                    inputMode="numeric"
                    value={method.priceInr === null ? "" : String(method.priceInr)}
                    placeholder="To confirm"
                    onChange={(event) => updateLocal(method.id, { priceInr: event.target.value.trim() ? Math.max(0, Number.parseInt(event.target.value, 10) || 0) : null })}
                  />
                  <TextField
                    label="ETA minimum days"
                    inputMode="numeric"
                    value={method.etaMinDays === null ? "" : String(method.etaMinDays)}
                    placeholder="To confirm"
                    onChange={(event) => updateLocal(method.id, { etaMinDays: event.target.value.trim() ? Math.max(0, Number.parseInt(event.target.value, 10) || 0) : null })}
                  />
                  <TextField
                    label="ETA maximum days"
                    inputMode="numeric"
                    value={method.etaMaxDays === null ? "" : String(method.etaMaxDays)}
                    placeholder="To confirm"
                    onChange={(event) => updateLocal(method.id, { etaMaxDays: event.target.value.trim() ? Math.max(0, Number.parseInt(event.target.value, 10) || 0) : null })}
                  />
                </div>
                <TextArea
                  label="Customer description"
                  rows={3}
                  value={method.description}
                  onChange={(event) => updateLocal(method.id, { description: event.target.value })}
                />
                <CheckboxField
                  label="Offer at checkout"
                  checked={method.available}
                  onChange={(event) => updateLocal(method.id, { available: event.target.checked })}
                  hint="An available method with no confirmed rate shows “to be confirmed” and cannot be selected."
                />
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hair pt-4">
                  <Badge tone={method.configured ? "success" : "warning"}>
                    {method.configured ? "Configuration complete" : "Rate or timing to confirm"}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="quiet" disabled={busyId === method.id} onClick={() => setPendingDelete(method)} aria-label={`Delete ${method.name}`}>
                      <Trash2 className="size-3.5" aria-hidden />Delete
                    </Button>
                    <Button size="sm" loading={busyId === method.id} onClick={() => save(method)}>
                      <Save className="size-4" aria-hidden />Save
                    </Button>
                  </div>
                </div>
              </div>
            </AdminPanel>
          ))}
          {!query.loading && methods.length === 0 && (
            <AdminPanel title="No shipping methods" description="Checkout has nothing to offer until at least one method exists.">
              <Button onClick={() => { setCreating(EMPTY_CREATE); setCreateErrors({}); }}><Plus className="size-4" aria-hidden />Add the first method</Button>
            </AdminPanel>
          )}
        </div>
      )}

      <AdminPanel title="What a real freight promise needs" description="The missing business decisions, stated plainly.">
        <ul className="list-disc space-y-2 pl-5 text-body-sm leading-relaxed text-graphite">
          <li>Confirmation from Plusmark whether freight is included, extra, or quoted per consignment.</li>
          <li>Delivery estimates and carrier assignment agreed per method.</li>
          <li>A checkout rule that shows “to be confirmed” rather than inventing a fee when a method is unpriced.</li>
          <li>Any carrier rate API needs a server-side key; it must never run in the browser.</li>
        </ul>
      </AdminPanel>

      <Modal
        open={creating !== null}
        onClose={() => { if (busyId !== "create") setCreating(null); }}
        title="Add shipping method"
        description="The method starts unavailable until you set a freight rate and delivery window."
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setCreating(null)} disabled={busyId === "create"}>Cancel</Button>
            <Button type="submit" form="shipping-create-form" loading={busyId === "create"}>Add method</Button>
          </>
        }
      >
        {creating && (
          <form id="shipping-create-form" onSubmit={create} noValidate className="flex flex-col gap-3.5">
            <TextField
              label="Identifier"
              value={creating.id}
              error={createErrors.id}
              onChange={(event) => { setCreating({ ...creating, id: event.target.value }); if (createErrors.id) setCreateErrors((current) => ({ ...current, id: null })); }}
              placeholder="express"
              hint="Lowercase letters, numbers and hyphens. Cannot be changed later."
              required
            />
            <TextField
              label="Method name"
              value={creating.name}
              error={createErrors.name}
              onChange={(event) => { setCreating({ ...creating, name: event.target.value }); if (createErrors.name) setCreateErrors((current) => ({ ...current, name: null })); }}
              placeholder="Express dispatch"
              required
            />
            <TextArea
              label="Customer description"
              rows={2}
              value={creating.description}
              error={createErrors.description}
              onChange={(event) => { setCreating({ ...creating, description: event.target.value }); if (createErrors.description) setCreateErrors((current) => ({ ...current, description: null })); }}
              placeholder="Priority courier where available"
              required
            />
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => { if (!busyId) setPendingDelete(null); }}
        onConfirm={remove}
        title={`Delete ${pendingDelete?.name ?? "method"}?`}
        body="Checkout will stop offering this method immediately. Existing orders keep the freight term they were placed with."
        confirmLabel={busyId ? "Deleting…" : "Delete method"}
        destructive
      />
    </div>
  );
}
