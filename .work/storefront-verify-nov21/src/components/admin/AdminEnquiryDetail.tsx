"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Paperclip } from "lucide-react";
import { demoEnquiries, demoQuotations } from "@/lib/demo-data";
import { getProduct } from "@/lib/catalog";
import { formatDate, formatDateTime, variantLabel } from "@/lib/format";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/States";
import { AdminPageHeader, AdminPanel, StatStrip } from "@/components/admin/Metrics";
import { PrototypeResult, usePrototypeAction } from "@/components/admin/PrototypeResult";
import type { EnquiryStatus } from "@/types";

const NEXT_STATUS: Partial<Record<EnquiryStatus, EnquiryStatus[]>> = {
  new: ["contacted", "rejected"],
  contacted: ["quote_sent", "rejected"],
  quote_sent: ["negotiation", "accepted", "rejected"],
  negotiation: ["accepted", "rejected"],
  accepted: [],
  rejected: []
};

const STATUS_LABEL: Record<EnquiryStatus, string> = { new: "New", contacted: "Contacted", quote_sent: "Quote sent", negotiation: "Negotiation", accepted: "Accepted", rejected: "Rejected" };

export function AdminEnquiryDetail({ enquiryId }: { enquiryId: string }) {
  const enquiry = demoEnquiries.find((entry) => entry.id === enquiryId);
  const prototype = usePrototypeAction();
  const [note, setNote] = useState("");
  if (!enquiry) return <EmptyState title="Enquiry not found" body="This synthetic enquiry identifier is not in the demonstration set." action={{ label: "Back to enquiries", href: "/admin/enquiries" }} />;
  const quotation = demoQuotations.find((entry) => entry.enquiryId === enquiry.id);
  const nextStatuses = NEXT_STATUS[enquiry.status] ?? [];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title={enquiry.reference} demo crumbs={[{ label: "Admin", href: "/admin" }, { label: "Enquiries", href: "/admin/enquiries" }, { label: enquiry.reference }]} lede={`${enquiry.organisationName} · ${enquiry.contactName} · received ${formatDate(enquiry.createdAt)}`} actions={<><ButtonLink href="/admin/enquiries" variant="secondary">All enquiries</ButtonLink>{quotation ? <ButtonLink href={`/admin/quotations/${quotation.id}`}>Open {quotation.reference}</ButtonLink> : <Button onClick={() => prototype.record("Quotation creation requested", [`A draft quotation for ${enquiry.reference} would be created with ${enquiry.lines.length} lines`, "The pricing service would apply commercial rules; the prototype has not calculated a quote", "No quotation record was created"])}><FileText className="size-4" aria-hidden />Request quotation</Button>}</>} />
      <div className="flex flex-wrap items-center gap-3"><StatusBadge status={enquiry.status} /><Badge tone="neutral">{enquiry.customerType}</Badge><span className="text-caption text-graphite">{enquiry.city} · {enquiry.pincode}</span></div>
      {prototype.request && <PrototypeResult action={prototype.request.action} details={prototype.request.details}><Button variant="quiet" size="sm" onClick={prototype.clear}>Dismiss</Button></PrototypeResult>}
      <StatStrip items={[
        { label: "Lines", value: String(enquiry.lines.length) },
        { label: "Units", value: enquiry.lines.reduce((sum, line) => sum + line.quantity, 0).toLocaleString("en-IN") },
        { label: "Quotation", value: quotation ? quotation.reference : "Not issued" },
        { label: "Contact", value: enquiry.contactName },
        { label: "GSTIN", value: enquiry.gstin ?? "Not supplied" }
      ]} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.7fr)] xl:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <AdminPanel title="Requested lines" description="Products and sizes as submitted against the catalogue." padded={false}>
            <div className="overflow-x-auto"><table className="w-full min-w-[38rem] border-collapse text-left"><thead className="bg-sand/45"><tr>{["Product", "Size", "SKU", "Qty", "Line note"].map((label, index) => <th key={label} scope="col" className={`px-4 py-3 text-label font-medium uppercase tracking-[0.1em] text-graphite ${index === 3 ? "text-right" : ""}`}>{label}</th>)}</tr></thead><tbody className="divide-y divide-hair">{enquiry.lines.map((line) => { const product = getProduct(line.productId); const variant = product?.variants.find((entry) => entry.id === line.variantId); return <tr key={line.id}><th scope="row" className="px-4 py-3 text-body-sm font-medium text-ink">{product ? <Link href={`/product/${product.slug}`} className="underline decoration-hair-strong underline-offset-4 hover:decoration-ink">{product.name}</Link> : "Product not in catalogue"}</th><td className="px-4 py-3 text-body-sm text-graphite">{variant ? variantLabel(variant) : "Variant unavailable"}</td><td className="tabular px-4 py-3 text-caption text-graphite">{variant?.sku ?? "—"}</td><td className="tabular px-4 py-3 text-right text-body-sm">{line.quantity}</td><td className="px-4 py-3 text-caption text-graphite">{line.note ?? "—"}</td></tr>; })}</tbody></table></div>
          </AdminPanel>
          <AdminPanel title="Requirement notes" description="Exactly what the buyer supplied, including delivery context.">
            <p className="whitespace-pre-wrap text-body-sm leading-relaxed text-graphite">{enquiry.additionalRequirements ?? "No additional requirements were supplied with this demonstration enquiry."}</p>
            {enquiry.attachmentName && <div className="mt-4 flex items-center gap-2 rounded-sm border border-dashed border-hair-strong bg-sand/35 px-3 py-2 text-caption text-graphite"><Paperclip className="size-4" aria-hidden />{enquiry.attachmentName}<span className="ml-auto text-[0.6875rem]">Metadata only — no file stored</span></div>}
          </AdminPanel>
          <AdminPanel title="Internal notes" description="Visible to the desk only. This prototype does not store a new note.">
            {enquiry.internalNotes.length ? <ul className="flex flex-col divide-y divide-hair">{enquiry.internalNotes.map((entry) => <li key={entry.id} className="py-3 first:pt-0 last:pb-0"><div className="flex flex-wrap items-baseline justify-between gap-2"><span className="text-caption font-medium text-ink">{entry.author}</span><span className="text-[0.6875rem] text-graphite">{formatDateTime(entry.at)}</span></div><p className="pt-1 text-body-sm leading-relaxed text-graphite">{entry.body}</p></li>)}</ul> : <p className="text-body-sm text-graphite">No internal notes on this enquiry.</p>}
            <form className="mt-5 flex flex-col gap-3 border-t border-hair pt-4" onSubmit={(event) => { event.preventDefault(); if (!note.trim()) return; prototype.record("Internal note submission requested", [`A note would be appended to ${enquiry.reference}: “${note.trim().slice(0, 160)}${note.trim().length > 160 ? "…" : ""}”`, "The authenticated administrator would be recorded as the author", "No note was stored and the enquiry was not changed"]); setNote(""); }}><TextArea label="Add an internal note" rows={3} value={note} onChange={(event) => setNote(event.target.value)} hint="Prototype: submission shows the write that is missing, then clears the field." /><Button type="submit" variant="secondary" size="sm" className="self-start">Submit note</Button></form>
          </AdminPanel>
        </div>
        <div className="flex flex-col gap-6">
          <AdminPanel title="Contact">
            <dl className="flex flex-col gap-2 text-body-sm"><div><dt className="text-caption text-graphite">Organisation</dt><dd className="text-ink">{enquiry.organisationName}</dd></div><div><dt className="text-caption text-graphite">Contact</dt><dd className="text-ink">{enquiry.contactName}</dd></div><div><dt className="text-caption text-graphite">Email</dt><dd className="break-all text-ink">{enquiry.email}</dd></div><div><dt className="text-caption text-graphite">Phone</dt><dd className="text-ink">{enquiry.phone}</dd></div><div><dt className="text-caption text-graphite">Delivery</dt><dd className="text-ink">{enquiry.city} {enquiry.pincode}</dd></div></dl>
          </AdminPanel>
          <AdminPanel title="Move enquiry" description="Status flow for the sales desk.">
            <div className="flex flex-wrap gap-2">{nextStatuses.length ? nextStatuses.map((next) => <Button key={next} size="sm" variant={next === "rejected" ? "secondary" : "primary"} onClick={() => prototype.record(`Enquiry move to “${STATUS_LABEL[next]}” requested`, [`${enquiry.reference} would move from “${STATUS_LABEL[enquiry.status]}” to “${STATUS_LABEL[next]}”`, "The enquiry service would record the administrator, time and reason", "No enquiry status changed"])}>{STATUS_LABEL[next]}</Button>) : <p className="text-body-sm text-graphite">This enquiry has reached a terminal state in the prototype flow.</p>}</div>
          </AdminPanel>
          {quotation && <AdminPanel title="Quotation"><div className="flex flex-col gap-2 text-body-sm"><span className="tabular font-medium">{quotation.reference}</span><StatusBadge status={quotation.status} /><span className="text-caption text-graphite">Issued {formatDate(quotation.issuedAt)} · valid until {formatDate(quotation.validUntil)}</span><ButtonLink href={`/admin/quotations/${quotation.id}`} variant="secondary" size="sm" className="mt-2 self-start">Open quotation</ButtonLink></div></AdminPanel>}
        </div>
      </div>
    </div>
  );
}
