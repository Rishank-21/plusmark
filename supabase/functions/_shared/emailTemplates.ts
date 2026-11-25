// Order emails. Every email carries the order number in the subject and heading.
// deno-lint-ignore-file no-explicit-any

const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const inr = (n: unknown) =>
  "Rs " + Number(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const BRAND = "#0f766e";

function addressBlock(a: any): string {
  if (!a) return "";
  const lines = [a.recipientName, a.line1, a.line2, a.landmark, `${a.city ?? ""}, ${a.state ?? ""} ${a.pincode ?? ""}`, a.phone ? `Phone: ${a.phone}` : ""]
    .filter(Boolean);
  return lines.map(esc).join("<br>");
}

function itemsTable(items: any[]): string {
  const rows = (items ?? []).map((i) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eee">
        <strong>${esc(i.name)}</strong><br>
        <span style="color:#666;font-size:13px">${esc(i.variant_label ?? "")}${i.sku ? ` &middot; SKU ${esc(i.sku)}` : ""}</span>
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center">${esc(i.quantity)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right">${inr(i.line_total_inr)}</td>
    </tr>`).join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px">
    <tr style="color:#666;font-size:12px;text-transform:uppercase">
      <th align="left" style="padding-bottom:6px">Item</th><th style="padding-bottom:6px">Qty</th><th align="right" style="padding-bottom:6px">Amount</th></tr>${rows}</table>`;
}

function totalsTable(o: any): string {
  const row = (label: string, value: string, strong = false) =>
    `<tr><td style="padding:3px 0;${strong ? "font-weight:bold;font-size:16px;border-top:2px solid #333;padding-top:8px" : "color:#555"}">${label}</td>
     <td style="padding:3px 0;text-align:right;${strong ? "font-weight:bold;font-size:16px;border-top:2px solid #333;padding-top:8px" : ""}">${value}</td></tr>`;
  const gstRows = Number(o.igst_inr) > 0
    ? row("IGST", inr(o.igst_inr))
    : row("CGST", inr(o.cgst_inr)) + row("SGST", inr(o.sgst_inr));
  return `<table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin-top:12px">
    ${row("Subtotal", inr(o.subtotal_inr))}
    ${Number(o.discount_inr) > 0 ? row(`Discount${o.coupon_code ? ` (${esc(o.coupon_code)})` : ""}`, "- " + inr(o.discount_inr)) : ""}
    ${row("Shipping", Number(o.shipping_inr) === 0 ? "Free" : inr(o.shipping_inr))}
    ${Number(o.cod_fee_inr) > 0 ? row("Cash on delivery fee", inr(o.cod_fee_inr)) : ""}
    ${row(o.prices_include_gst ? "Taxable value (excl. GST)" : "Taxable value", inr(o.taxable_inr))}
    ${gstRows}
    ${row("Total", inr(o.total_inr), true)}
    </table>
    <p style="color:#777;font-size:12px;margin:6px 0 0">${o.prices_include_gst ? "All prices include GST." : "GST added as shown."}${o.invoice_number ? ` Invoice no. ${esc(o.invoice_number)}.` : ""}</p>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:20px 0"><a href="${esc(href)}" style="background:${BRAND};color:#fff;text-decoration:none;padding:12px 22px;border-radius:6px;display:inline-block;font-weight:bold">${esc(label)}</a></p>`;
}

function layout(brand: string, preheader: string, heading: string, body: string, footer: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#222">
  <span style="display:none;max-height:0;overflow:hidden">${esc(preheader)}</span>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0"><tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:8px;overflow:hidden">
      <tr><td style="background:${BRAND};color:#fff;padding:18px 28px;font-size:20px;font-weight:bold">${esc(brand)}</td></tr>
      <tr><td style="padding:28px">
        <h1 style="margin:0 0 14px;font-size:21px">${esc(heading)}</h1>
        ${body}
      </td></tr>
      <tr><td style="padding:16px 28px;background:#fafafa;color:#777;font-size:12px;line-height:1.5">${footer}</td></tr>
    </table>
  </td></tr></table></body></html>`;
}

export interface Rendered { html: string; text: string }

export function renderEmail(template: string, payload: any, siteUrl: string): Rendered {
  const o = payload.order ?? {};
  const items = payload.items ?? [];
  const seller = payload.seller ?? {};
  const extra = payload.extra ?? {};
  const brand = seller.name ?? "Plusmark";
  const num = o.order_number ?? "";
  const first = (o.customer_name ?? "").split(" ")[0] || "there";
  const trackUrl = `${siteUrl}/track-order?order=${encodeURIComponent(num)}&token=${encodeURIComponent(o.guest_token ?? "")}`;
  const orderUrl = o.user_id ? `${siteUrl}/account/orders/${o.id}` : trackUrl;
  const footer = `${esc(brand)}${seller.address ? " &middot; " + esc(seller.address) : ""}${seller.gstin ? "<br>GSTIN " + esc(seller.gstin) : ""}
    <br>Questions? Reply to this email${seller.phone ? " or call " + esc(seller.phone) : ""}. Quote order number <strong>${esc(num)}</strong>.`;
  const orderBlock = `<p style="margin:0 0 14px;color:#555">Order number: <strong style="color:#000">${esc(num)}</strong></p>`;
  const shipTo = `<p style="margin:18px 0 4px;font-weight:bold">Delivering to</p><p style="margin:0;color:#444;font-size:14px;line-height:1.5">${addressBlock(o.shipping_address)}</p>`;

  let heading = "";
  let intro = "";
  let extraHtml = "";
  let showItems = false;
  let cta: [string, string] | null = [orderUrl, "View order"];
  let admin = false;

  switch (template) {
    case "order_confirmation": {
      heading = `Thank you, your order ${num} is confirmed`;
      intro = o.payment_method === "cod"
        ? `Hi ${esc(first)}, we have received your order. Please keep ${inr(o.total_inr)} ready to pay at delivery.`
        : `Hi ${esc(first)}, we have received your payment of ${inr(o.total_inr)} and are getting your order ready.`;
      showItems = true;
      extraHtml = shipTo;
      break;
    }
    case "payment_failed":
      heading = `Payment failed for order ${num}`;
      intro = `Hi ${esc(first)}, your payment did not go through, so the order is not confirmed yet. Your items are held for a short time. You can retry the payment from your order page.`;
      cta = [orderUrl, "Retry payment"];
      break;
    case "order_processing":
      heading = `We are packing order ${num}`;
      intro = `Hi ${esc(first)}, your order is being packed and will be handed to the courier soon.`;
      showItems = true;
      break;
    case "order_shipped": {
      const sh = extra.shipment ?? (payload.shipments ?? [])[0] ?? {};
      heading = `Order ${num} is on its way`;
      intro = `Hi ${esc(first)}, your order has been shipped.`;
      extraHtml = `<table width="100%" cellpadding="8" cellspacing="0" style="background:#f0fdf9;border-radius:6px;font-size:14px;margin:6px 0">
        <tr><td><strong>Courier</strong></td><td>${esc(sh.carrier_name ?? "Plusmark delivery")}</td></tr>
        <tr><td><strong>Tracking number</strong></td><td>${esc(sh.tracking_number ?? "-")}</td></tr>
        ${sh.eta_from ? `<tr><td><strong>Expected delivery</strong></td><td>${esc(sh.eta_from)}${sh.eta_to ? " to " + esc(sh.eta_to) : ""}</td></tr>` : ""}
      </table>` + shipTo;
      cta = sh.tracking_url ? [sh.tracking_url, "Track your package"] : [orderUrl, "View order"];
      showItems = true;
      break;
    }
    case "order_delivered":
      heading = `Order ${num} was delivered`;
      intro = `Hi ${esc(first)}, your order has been delivered. If anything is not right you can request a return from your order page within ${esc(extra.return_window_days ?? 7)} days.`;
      break;
    case "order_cancelled":
      heading = `Order ${num} was cancelled`;
      intro = `Hi ${esc(first)}, your order has been cancelled.${extra.note ? " Note: " + esc(extra.note) : ""}${
        o.payment_status === "paid" || o.payment_status === "partially_refunded" ? " Any amount you paid will be refunded to the original payment method; we will email you once it is processed." : ""}`;
      showItems = true;
      break;
    case "return_requested":
      heading = `Return request received (${extra.return_number ?? ""})`;
      intro = `Hi ${esc(first)}, we have received your return request for order ${esc(num)}. We will review it and email you the next step.`;
      break;
    case "return_approved":
      heading = `Return approved (${extra.return_number ?? ""})`;
      intro = `Hi ${esc(first)}, your return for order ${esc(num)} is approved.${extra.note ? " " + esc(extra.note) : ""} We will share pickup or drop-off details if needed.`;
      break;
    case "return_rejected":
      heading = `Update on your return (${extra.return_number ?? ""})`;
      intro = `Hi ${esc(first)}, we could not approve this return.${extra.note ? " Reason: " + esc(extra.note) : ""}`;
      break;
    case "return_received":
      heading = `We received your return (${extra.return_number ?? ""})`;
      intro = `Hi ${esc(first)}, your returned item has reached us. Your refund (if applicable) will be processed shortly.`;
      break;
    case "refund_processed":
      heading = `Refund of ${inr(extra.amount)} processed`;
      intro = `Hi ${esc(first)}, we have refunded ${inr(extra.amount)} for order ${esc(num)}. It usually reaches your account in 5 to 7 working days.`;
      break;
    case "admin_new_order":
      admin = true;
      heading = `New order ${num}`;
      intro = `${esc(o.customer_name ?? o.email)} (${esc(o.email)}, ${esc(o.phone)}) placed an order worth ${inr(o.total_inr)} via ${esc(o.payment_method)}.`;
      showItems = true;
      extraHtml = shipTo;
      cta = null;
      break;
    case "admin_attention":
      admin = true;
      heading = `Order ${num} needs attention`;
      intro = `Reason: ${esc(extra.reason ?? o.needs_attention ?? "see admin")}`;
      cta = null;
      break;
    default:
      heading = `Update on order ${num}`;
      intro = `Hi ${esc(first)}, there is an update on your order.`;
  }

  const body = `${orderBlock}<p style="font-size:15px;line-height:1.6;margin:0 0 14px">${intro}</p>
    ${showItems ? itemsTable(items) + totalsTable(o) : ""}${extraHtml}${cta ? button(cta[0], cta[1]) : ""}`;
  const html = layout(brand, heading, heading, body, footer);

  const textLines = [
    heading, "", `Order number: ${num}`, "",
    intro.replace(/<[^>]+>/g, ""),
    "",
    ...(showItems ? [...items.map((i: any) => `- ${i.name} (${i.variant_label ?? ""}) x${i.quantity}  ${inr(i.line_total_inr)}`), "", `Total: ${inr(o.total_inr)}`] : []),
    ...(cta ? ["", `${cta[1]}: ${cta[0]}`] : []),
    "", `${brand}${seller.phone ? " | " + seller.phone : ""}`,
  ];
  void admin;
  return { html, text: textLines.join("\n") };
}
