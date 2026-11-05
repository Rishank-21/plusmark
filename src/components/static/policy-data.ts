export interface PolicySectionData {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  pending?: { label: string; context?: string }[];
}

export interface PolicyDefinition {
  slug: string;
  title: string;
  summary: string;
  confirmed: string[];
  pending: string[];
  sections: PolicySectionData[];
}

export const policies: PolicyDefinition[] = [
  {
    slug: "shipping",
    title: "Shipping policy",
    summary: "What is known about pan-India dispatch, and the freight and delivery terms that still need to be confirmed for each order.",
    confirmed: ["Plusmark manufactures in Ahmedabad and publishes pan-India dispatch.", "Boards can be ordered one at a time or in larger quantities.", "The delivery destination and order details are confirmed before dispatch."],
    pending: ["Freight rates and who pays each charge", "Dispatch and delivery estimates", "Carrier, tracking and installation arrangements", "Damage-on-arrival evidence and resolution window"],
    sections: [
      { title: "Before an order is accepted", paragraphs: ["Share the complete delivery address, site contact, product sizes and quantities. Large boards can have different handling requirements, so a single shipping rule cannot responsibly be applied to every order.", "Any dispatch date, freight charge or delivery commitment must appear in the written order confirmation from Plusmark. This prototype does not create such a commitment."], pending: [{ label: "Order-specific dispatch estimate" }, { label: "Freight charge and tax treatment" }] },
      { title: "Delivery and receiving", paragraphs: ["The buyer should confirm site access, unloading arrangements and the person authorised to receive the consignment with the desk. Whether installation or wall mounting is included has not been published as a standard service."], bullets: ["Confirm access for the vehicle and the largest board size.", "Confirm who unloads and checks the consignment.", "Keep the order reference and invoice available for any delivery query."], pending: [{ label: "Carrier and tracking process" }, { label: "Delivery window" }] },
      { title: "Damage or a delivery discrepancy", paragraphs: ["Contact the Plusmark desk with the order reference and a description of the issue. The business has not signed off a standard evidence list, notification window or resolution timeline for this storefront, so none is asserted here."], pending: [{ label: "Damage notification window" }, { label: "Replacement or refund resolution" }] }
    ]
  },
  {
    slug: "returns",
    title: "Returns & refunds policy",
    summary: "A draft framework for standard and made-to-order boards. Return eligibility, windows and refund timings await Plusmark’s written approval.",
    confirmed: ["Plusmark makes non-standard sizes and layouts to order.", "The order confirmation defines the product, size and quantity.", "Order-specific questions are handled by the Plusmark support team."],
    pending: ["Return eligibility for standard and custom products", "Return request window and return freight", "Inspection, restocking and deduction rules", "Refund method and processing timeline"],
    sections: [
      { title: "Check your order confirmation before paying", paragraphs: ["Confirm the series, writing face, size, quantity and any custom layout against the order confirmation. Custom dimensions, line marking and printed schedules are made for the particular requirement; this draft does not presume that they can be returned as ordinary stock.", "No return window is promised by this prototype. The applicable terms must be confirmed with Plusmark before payment."], pending: [{ label: "Standard-product return window" }, { label: "Made-to-order cancellation and return rules" }] },
      { title: "Requesting help with an order", paragraphs: ["Use the published phone, email or WhatsApp channel and provide the business order reference, the affected items and a clear description of the issue. A local prototype reference is not a Plusmark order and cannot be used to request a refund."], bullets: ["Do not discard packaging or documentation until the desk advises you.", "Do not send an item back without a confirmed return instruction and destination.", "Any inspection requirement and freight responsibility must be agreed with the desk."], pending: [{ label: "Evidence and inspection procedure" }, { label: "Return freight responsibility" }] },
      { title: "Refunds", paragraphs: ["No refund timeline, deduction schedule or payment-route rule has been signed off. If a refund is approved for a real Plusmark order, its amount, method and timing must be confirmed in writing by the business."], pending: [{ label: "Refund processing timeline" }, { label: "Refund method and any deductions" }] }
    ]
  },
  {
    slug: "privacy",
    title: "Privacy policy",
    summary: "What the Plusmark account, cart and order prototype collects, and the production privacy decisions still required before real customer data is collected.",
    confirmed: ["Account profiles, saved addresses and saved boards are stored in the configured Supabase project and protected by row-level security.", "Guest cart and prototype order records stay in browser local storage.", "The custom frontend does not request raw card details.", "External channels such as WhatsApp and email have their own providers and privacy terms."],
    pending: ["Production data controller and contact for privacy requests", "Supabase hosting region and retention schedule", "Order, invoice and enquiry retention obligations", "Production analytics, cookie and consent choices"],
    sections: [
      { title: "Information in this prototype", paragraphs: ["Creating an account asks for a name, email address, mobile number and password. The profile row, delivery addresses and saved boards live in the Supabase project configured for this site, and row-level security limits them to the signed-in account holder. Cart contents, prototype orders and enquiries remain in your browser using local storage.", "Clearing site data removes the local records. Account data can be changed from the account screens; do not enter sensitive financial credentials."] },
      { title: "Payments and external services", paragraphs: ["The custom frontend does not ask for or store raw card numbers, CVV values or internet-banking passwords. A production Razorpay integration must use the provider checkout and server-side verification; this prototype does not process a real payment.", "Product media is delivered through Cloudinary. Telephone, email and WhatsApp links hand you to those respective services when you choose them. Their handling of information is governed by their own terms."] },
      { title: "Before production launch", paragraphs: ["A production privacy notice must identify the responsible business, the data collected and why, service providers, retention periods, security practices and the route for access, correction or deletion requests. Those operational details have not been supplied and are therefore left open rather than invented."], pending: [{ label: "Approved production privacy notice" }, { label: "Privacy request contact and response process" }] }
    ]
  },
  {
    slug: "terms",
    title: "Terms & conditions",
    summary: "Prototype-use terms and the boundaries between catalogue information, demo interactions and a real Plusmark contract.",
    confirmed: ["Catalogue content is drawn from Plusmark’s published product and organisation information.", "Demo prices and records are explicitly labelled and are not business quotations or transactions.", "A real order requires written confirmation by Plusmark."],
    pending: ["Final legal entity naming and governing terms", "Order validity and payment terms", "Order cancellation and acceptance rules", "Warranty wording, if any, approved by Plusmark"],
    sections: [
      { title: "Catalogue and order confirmation", paragraphs: ["Product names, published sizes and construction descriptions are presented from the Plusmark catalogue. The exact specification for an order must be confirmed with Plusmark, particularly for custom sizes and layouts.", "Demo rate-card figures exist only to exercise the interface. They are not offers or list prices. Freight and any unresolved policy terms must also be confirmed for the order."] },
      { title: "Prototype orders and accounts", paragraphs: ["A browser-local account does not verify identity. A prototype order, enquiry, status or reference is not transmitted to Plusmark and does not create a contract, payment obligation, shipment or refund right.", "No payment-success screen in this prototype represents a real transaction. Production order acceptance, inventory, prices, permissions and payment status must come from secured server-side systems."], pending: [{ label: "Production order acceptance terms" }, { label: "Production account and acceptable-use terms" }] },
      { title: "Business terms still to be approved", paragraphs: ["Plusmark must approve the final terms covering quotations, taxes, payment, cancellation, custom work, delivery, returns and any warranty. This prototype deliberately does not invent a warranty duration, certification, service level or legal jurisdiction."], pending: [{ label: "Complete signed-off commercial terms" }, { label: "Governing law and dispute process" }] }
    ]
  }
];

export function getPolicy(slug: string) {
  return policies.find((policy) => policy.slug === slug);
}
