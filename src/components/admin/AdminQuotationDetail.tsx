"use client";

import Link from "next/link";
import { ArrowRight, FileDown, Send } from "lucide-react";
import { demoEnquiries, demoOrders, demoQuotations } from "@/lib/demo-data";
import { formatDate, formatDateTime, formatInr } from "@/lib/format";
import { StatusBadge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Notice, EmptyState } from "@/components/ui/States";
import { AdminPageHeader, AdminPanel, StatStrip } from "@/components/admin/Metrics";
import { PrototypeResult, usePrototypeAction } from "@/components/admin/PrototypeResult";
import type { Quotation } from "@/types";

const MOVES: Record<Quotation["status"], { next: Quotation["status"]; label: string }[]> = {
  draft: [{ next: "sent", label: "Mark as sent" }],
  sent: [
    { next: "accepted", label: "Mark accepted" },
    { next: "rejected", label: "Mark rejected" }
  ],
  accepted: [{ next: "converted", label: "Convert to order" }],
  rejected: [],
  converted: []
};

export function AdminQuotationDetail({ quotationId }: { quotationId: string }) {
  const quotation = demoQuotations.find((entry) => entry.id === quotationId);
  const prototype = usePrototypeAction();

  if (!quotation) {
    return (
      <EmptyState
        title="Quotation record not found"
        body="No demonstration quotation carries this reference. It may have been mistyped, or it sits outside the synthetic set."
        action={{ label: "Back to quotations", href: "/admin/quotations" }}
      />
    );
  }

  const enquiry = demoEnquiries.find((entry) => entry.id === quotation.enquiryId);
  const order = quotation.orderId ? demoOrders.find((entry) => entry.reference === quotation.orderId) : undefined;
  const gross = quotation.lines.reduce((sum, line) => sum + line.lineTotalInr, 0);
  const taxable = gross - quotation.discountInr;
  const gst = Math.round((taxable * quotation.gstPercent) / 100);
  const units = quotation.lines.reduce((sum, line) => sum + line.quantity, 0);

  const requestMove = (next: Quotation["status"]) => {
    prototype.record(`Quotation move to “${next}” requested`, [
      `Quotation ${quotation.reference} would move from “${quotation.status}” to “${next}”`,
      next === "converted"
        ? "The order service would create an order from these lines; totals, tax and freight would be re-priced server-side"
        : "The sales desk service would update the quotation record and notify the customer contact",
      "No document was issued, no email was sent and no order was created"
    ]);
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={quotation.reference}
        demo
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Quotations", href: "/admin/quotations" },
          { label: quotation.reference }
        ]}
        lede={`Issued ${formatDateTime(quotation.issuedAt)} · valid until ${formatDate(quotation.validUntil)}${enquiry ? ` · ${enquiry.organisationName}` : ""}`}
        actions={
          <>
            <ButtonLink href="/admin/quotations" variant="secondary">All quotations</ButtonLink>
            <Button
              variant="secondary"
              onClick={() =>
                prototype.record("Quotation document requested", [
                  `A PDF for ${quotation.reference} would be rendered from the quotation service`,
                  "This browser holds no signed document and downloaded nothing"
                ])
              }
            >
              <FileDown className="size-4" aria-hidden />
              Download PDF
            </Button>
            {quotation.status === "draft" && (
              <Button onClick={() => requestMove("sent")}>
                <Send className="size-4" aria-hidden />
                Mark as sent
              </Button>
            )}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={quotation.status} />
        {enquiry && <span className="text-caption text-graphite">{enquiry.reference} · {enquiry.contactName} · {enquiry.city}</span>}
      </div>

      {prototype.request && (
        <PrototypeResult action={prototype.request.action} details={prototype.request.details}>
          <Button type="button" variant="quiet" size="sm" onClick={prototype.clear}>Dismiss</Button>
        </PrototypeResult>
      )}

      <StatStrip
        items={[
          { label: "Lines", value: String(quotation.lines.length) },
          { label: "Units", value: units.toLocaleString("en-IN") },
          { label: "Goods value", value: formatInr(gross) },
          { label: "Discount", value: formatInr(quotation.discountInr) },
          { label: "GST", value: formatInr(gst), note: `${quotation.gstPercent}% on taxable value` },
          { label: "Quoted total", value: formatInr(quotation.totalInr), note: "Prototype rate card" }
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(20rem,0.8fr)] xl:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <AdminPanel title="Quoted lines" description="Larger quantities use a prototype bulk rate; none of these figures are Plusmark prices." padded={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] border-collapse text-left">
                <thead className="bg-sand/45">
                  <tr>
                    {["Item", "Qty", "Unit", "Line total"].map((label, index) => (
                      <th key={label} scope="col" className={`px-4 py-3 text-label font-medium uppercase tracking-[0.1em] text-graphite ${index > 1 ? "text-right" : ""}`}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-hair">
                  {quotation.lines.map((line) => (
                    <tr key={line.id}>
                      <th scope="row" className="px-4 py-3 text-body-sm font-medium text-ink">{line.label}</th>
                      <td className="tabular px-4 py-3 text-right text-body-sm">{line.quantity.toLocaleString("en-IN")}</td>
                      <td className="tabular px-4 py-3 text-right text-body-sm">{formatInr(line.unitPriceInr)}</td>
                      <td className="tabular px-4 py-3 text-right text-body-sm font-medium">{formatInr(line.lineTotalInr)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="flex flex-col gap-2 border-t border-hair px-4 py-4 text-body-sm">
              <div className="flex justify-between gap-4"><dt className="text-graphite">Goods value</dt><dd className="tabular text-ink">{formatInr(gross)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-graphite">Discount</dt><dd className="tabular text-ink">− {formatInr(quotation.discountInr)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-graphite">GST at {quotation.gstPercent}%</dt><dd className="tabular text-ink">{formatInr(gst)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-graphite">Freight</dt><dd className="tabular text-ink">{formatInr(quotation.shippingInr)}</dd></div>
              <div className="flex justify-between gap-4 border-t border-hair pt-2 text-price"><dt className="font-medium text-ink">Quoted total</dt><dd className="tabular font-medium text-ink">{formatInr(quotation.totalInr)}</dd></div>
            </dl>
          </AdminPanel>

          <AdminPanel title="Terms shown on the quotation" description="Text carried by the demonstration document.">
            <p className="text-body-sm leading-relaxed text-graphite">{quotation.terms}</p>
            <p className="pt-3 text-caption leading-relaxed text-graphite-light">
              These terms are demonstration copy. Plusmark must approve the final quotation wording, tax treatment and
              freight rule before any document is issued to a customer.
            </p>
          </AdminPanel>

          <AdminPanel title="Advance this quotation" description="Every move below is a request, not a write.">
            <div className="flex flex-wrap gap-2">
              {MOVES[quotation.status].length ? (
                MOVES[quotation.status].map((move) => (
                  <Button key={move.next} variant={move.next === "rejected" ? "secondary" : "primary"} size="sm" onClick={() => requestMove(move.next)}>
                    {move.label}
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Button>
                ))
              ) : (
                <p className="text-body-sm text-graphite">
                  {quotation.status === "converted"
                    ? "This quotation has already been converted. Its order record is linked in the panel beside."
                    : "A rejected quotation has no forward move in the prototype workflow."}
                </p>
              )}
            </div>
            <p className="pt-3 text-caption leading-relaxed text-graphite">
              Sending, accepting or converting a quotation changes a commercial commitment. The production flow must run
              it through an authenticated service, re-price the lines and keep an audit trail.
            </p>
          </AdminPanel>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <AdminPanel title="Enquiry">
            {enquiry ? (
              <div className="flex flex-col gap-1 text-body-sm">
                <span className="font-medium text-ink">{enquiry.organisationName}</span>
                <span className="text-graphite">{enquiry.contactName}</span>
                <span className="break-all text-graphite">{enquiry.email}</span>
                <span className="text-graphite">{enquiry.phone}</span>
                <Link href={`/admin/enquiries/${enquiry.id}`} className="pm-link pt-2 text-caption font-medium">
                  Open {enquiry.reference}
                </Link>
              </div>
            ) : (
              <p className="text-body-sm text-graphite">The enquiry this quotation came from is not in the demonstration set.</p>
            )}
          </AdminPanel>

          <AdminPanel title="Document dates">
            <dl className="flex flex-col gap-2 text-body-sm">
              <div className="flex justify-between gap-3"><dt className="text-graphite">Issued</dt><dd className="tabular text-ink">{formatDate(quotation.issuedAt)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-graphite">Valid until</dt><dd className="tabular text-ink">{formatDate(quotation.validUntil)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-graphite">Status</dt><dd><StatusBadge status={quotation.status} /></dd></div>
            </dl>
          </AdminPanel>

          <AdminPanel title="Order">
            {order ? (
              <div className="flex flex-col gap-2 text-body-sm">
                <span className="font-medium text-ink">{order.reference}</span>
                <span className="text-graphite">Created from this quotation in the demonstration set.</span>
                <Link href={`/admin/orders/${order.id}`} className="pm-link text-caption font-medium">Open the order record</Link>
              </div>
            ) : (
              <p className="text-body-sm text-graphite">No order has been created from this quotation.</p>
            )}
          </AdminPanel>

          <Notice tone="warning" title="Not an invoice">
            A quotation states a proposed price. It does not record a payment, reserve stock or oblige Plusmark to supply
            at that figure. Invoicing and payment belong to the order and Razorpay record.
          </Notice>
        </div>
      </div>
    </div>
  );
}
