// GST tax invoice PDF. Allowed for: the order's owner (signed in), a guest with the order token or
// order number + email, or an admin. Only exists once the order has an invoice number.
// deno-lint-ignore-file no-explicit-any
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";
import { adminClient, callerClient, callerUserId, corsFor, json, preflight, timingSafeEqual } from "../_shared/common.ts";

const safe = (s: unknown) => String(s ?? "").replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");
const money = (n: unknown) => Number(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen",
  "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
function below1000(n: number): string {
  const parts: string[] = [];
  if (n >= 100) { parts.push(ONES[Math.floor(n / 100)] + " Hundred"); n %= 100; }
  if (n >= 20) { parts.push(TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "")); }
  else if (n > 0) parts.push(ONES[n]);
  return parts.join(" ");
}
function rupeesInWords(amount: number): string {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  const units: [number, string][] = [[10000000, "Crore"], [100000, "Lakh"], [1000, "Thousand"]];
  let n = rupees;
  const out: string[] = [];
  for (const [v, name] of units) {
    if (n >= v) { out.push(below1000(Math.floor(n / v)) + " " + name); n %= v; }
  }
  if (n > 0) out.push(below1000(n));
  let words = (out.join(" ") || "Zero") + " Rupees";
  if (paise > 0) words += " and " + below1000(paise) + " Paise";
  return words + " Only";
}

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return json(req, { error: "method_not_allowed" }, 405);
  try {
    const b = await req.json().catch(() => ({}));
    const db = adminClient();
    let q = db.from("orders").select("*");
    if (/^[0-9a-f-]{36}$/i.test(String(b.order_id ?? ""))) q = q.eq("id", b.order_id);
    else if (b.order_number) q = q.eq("order_number", String(b.order_number).toUpperCase());
    else return json(req, { error: "bad_request" }, 400);
    const { data: o } = await q.maybeSingle();
    if (!o) return json(req, { error: "not_found" }, 404);

    const uid = await callerUserId(req);
    let allowed = Boolean(uid && o.user_id === uid);
    if (!allowed && b.guest_token) allowed = timingSafeEqual(String(b.guest_token), o.guest_token);
    if (!allowed && b.email) allowed = String(b.email).trim().toLowerCase() === String(o.email).toLowerCase();
    if (!allowed && uid) {
      const { data: isAdmin } = await callerClient(req).rpc("is_admin");
      allowed = isAdmin === true;
    }
    if (!allowed) return json(req, { error: "not_found" }, 404);
    if (!o.invoice_number) return json(req, { error: "no_invoice_yet", message: "Invoice is created once the order is paid or dispatched." }, 409);

    const [{ data: items }, { data: s }] = await Promise.all([
      db.from("order_items").select("*").eq("order_id", o.id).order("name"),
      db.from("store_settings").select("*").single(),
    ]);
    const lines: any[] = items ?? [];

    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const W = 595, H = 842, M = 36;
    let page = pdf.addPage([W, H]);
    let y = H - M;
    const text = (t: string, x: number, yy: number, size = 9, f = font, color = rgb(0, 0, 0)) =>
      page.drawText(safe(t), { x, y: yy, size, font: f, color });
    const right = (t: string, xr: number, yy: number, size = 9, f = font) =>
      page.drawText(safe(t), { x: xr - f.widthOfTextAtSize(safe(t), size), y: yy, size, font: f });
    const line = (yy: number, x1 = M, x2 = W - M, th = 0.5) =>
      page.drawLine({ start: { x: x1, y: yy }, end: { x: x2, y: yy }, thickness: th, color: rgb(0.6, 0.6, 0.6) });

    // header
    text(s.seller_name ?? "Plusmark", M, y - 14, 18, bold);
    right("TAX INVOICE", W - M, y - 14, 16, bold);
    y -= 32;
    for (const l of [s.seller_address, s.seller_gstin ? `GSTIN: ${s.seller_gstin}` : null,
      [s.seller_phone, s.seller_email].filter(Boolean).join("  |  ")].filter(Boolean)) {
      text(String(l), M, y, 9); y -= 12;
    }
    let ry = H - M - 32;
    right(`Invoice no: ${o.invoice_number}`, W - M, ry, 9, bold); ry -= 12;
    right(`Invoice date: ${new Date(o.paid_at ?? o.placed_at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}`, W - M, ry); ry -= 12;
    right(`Order no: ${o.order_number}`, W - M, ry); ry -= 12;
    right(`Payment: ${o.payment_status === "paid" ? "Paid" : "Pending"} (${o.payment_method})`, W - M, ry);
    y = Math.min(y, ry) - 10;
    line(y); y -= 14;

    const addr = (a: any) => [a?.recipientName, a?.line1, a?.line2, a?.landmark, `${a?.city ?? ""}, ${a?.state ?? ""} ${a?.pincode ?? ""}`,
      a?.phone ? `Phone: ${a.phone}` : null].filter(Boolean) as string[];
    text("Bill to", M, y, 9, bold); text("Ship to / Place of supply", W / 2, y, 9, bold); y -= 12;
    const bill = addr(o.billing_address), ship = addr(o.shipping_address);
    for (let i = 0; i < Math.max(bill.length, ship.length); i++) {
      if (bill[i]) text(bill[i], M, y - i * 11, 9);
      if (ship[i]) text(ship[i], W / 2, y - i * 11, 9);
    }
    y -= Math.max(bill.length, ship.length) * 11 + 6;
    text(`Customer: ${o.customer_name ?? ""}   Email: ${o.email}   Mobile: ${o.phone}`, M, y, 8.5); y -= 14;

    // table
    const cols = [
      { h: "#", x: M, w: 16, r: false }, { h: "Description", x: M + 16, w: 150, r: false },
      { h: "HSN", x: M + 168, w: 38, r: false }, { h: "Qty", x: M + 208, w: 22, r: true },
      { h: "Unit price", x: M + 232, w: 52, r: true }, { h: "Disc.", x: M + 286, w: 40, r: true },
      { h: "Taxable", x: M + 328, w: 56, r: true }, { h: "GST%", x: M + 386, w: 30, r: true },
      { h: "GST", x: M + 418, w: 44, r: true }, { h: "Total", x: M + 464, w: 59, r: true },
    ];
    const head = () => {
      page.drawRectangle({ x: M, y: y - 4, width: W - 2 * M, height: 16, color: rgb(0.93, 0.93, 0.93) });
      for (const c of cols) c.r ? right(c.h, c.x + c.w, y, 8, bold) : text(c.h, c.x + 2, y, 8, bold);
      y -= 16;
    };
    head();
    const row = (cells: string[], boldRow = false) => {
      if (y < 150) { page = pdf.addPage([W, H]); y = H - M; head(); }
      const f = boldRow ? bold : font;
      cols.forEach((c, i) => {
        const t = cells[i] ?? "";
        if (c.r) right(t, c.x + c.w, y, 8, f);
        else {
          let tt = safe(t);
          while (f.widthOfTextAtSize(tt, 8) > c.w - 2 && tt.length > 1) tt = tt.slice(0, -1);
          text(tt, c.x + 2, y, 8, f);
        }
      });
      y -= 13;
    };
    let sumTaxable = 0, sumGst = 0;
    lines.forEach((it, i) => {
      sumTaxable += Number(it.taxable_inr); sumGst += Number(it.gst_inr);
      row([String(i + 1), `${it.name}${it.variant_label ? " - " + it.variant_label : ""}`, it.hsn_code ?? "", String(it.quantity),
        money(it.unit_price_inr), money(it.discount_inr), money(it.taxable_inr), String(Number(it.gst_rate)), money(it.gst_inr), money(it.line_total_inr)]);
    });
    const shipTaxable = Number(o.taxable_inr) - sumTaxable, shipGst = Number(o.gst_inr) - sumGst;
    if (shipTaxable > 0.004 || shipGst > 0.004) {
      const rate = shipTaxable > 0 ? Math.round((shipGst / shipTaxable) * 100) : 0;
      row([String(lines.length + 1), "Shipping & handling", "9965", "1", "", "", money(shipTaxable), String(rate), money(shipGst), money(shipTaxable + shipGst)]);
    }
    line(y + 8); y -= 6;

    // totals
    const tot = (label: string, value: string, strong = false) => {
      if (y < 90) { page = pdf.addPage([W, H]); y = H - M; }
      const f = strong ? bold : font;
      text(label, W - M - 230, y, strong ? 10 : 9, f); right(value, W - M, y, strong ? 10 : 9, f); y -= strong ? 15 : 12;
    };
    tot("Total taxable value", "Rs " + money(o.taxable_inr));
    if (Number(o.igst_inr) > 0) tot("IGST", "Rs " + money(o.igst_inr));
    else { tot("CGST", "Rs " + money(o.cgst_inr)); tot("SGST / UTGST", "Rs " + money(o.sgst_inr)); }
    if (Number(o.discount_inr) > 0) tot(`Discount applied${o.coupon_code ? " (" + o.coupon_code + ")" : ""}`, "Rs " + money(o.discount_inr));
    tot("Invoice total", "Rs " + money(o.total_inr), true);
    if (Number(o.refunded_inr) > 0) tot("Refunded", "Rs " + money(o.refunded_inr));
    y -= 4;
    text(`Amount in words: ${rupeesInWords(Number(o.total_inr))}`, M, y, 8.5, bold); y -= 14;
    text(o.prices_include_gst ? "Listed prices are inclusive of GST." : "GST is charged on the taxable value as shown.", M, y, 8); y -= 24;
    text("Declaration: We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.", M, y, 7.5); y -= 10;
    text("This is a computer generated invoice and does not need a signature.", M, y, 7.5);
    right(`For ${s.seller_name ?? "Plusmark"}`, W - M, y, 9, bold);

    const bytes = await pdf.save();
    return new Response(bytes, {
      status: 200,
      headers: {
        ...corsFor(req),
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${String(o.invoice_number).replace(/[^A-Za-z0-9._-]/g, "-")}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    console.error("invoice", e);
    return json(req, { error: "invoice_failed", message: (e as Error).message }, 500);
  }
});
