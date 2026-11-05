import type { Metadata } from "next";
import { Mail, MessageCircle, PenLine, Phone } from "lucide-react";
import { ContactForm } from "@/components/static/ContactForm";
import { FactList, LinkRail, PageHeader, Section } from "@/components/static/Editorial";
import { brand } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Contact & support",
  description: "Contact Plusmark in Ahmedabad about board sizes, custom layouts, orders, delivery and returns."
};

export default function ContactPage() {
  const address = brand.address;
  return (
    <>
      <PageHeader
        trail={[{ label: "Home", href: "/" }, { label: "Contact & support" }]}
        sansHeading
        bordered={false}
        title="Talk to the Plusmark desk"
        lead="For a useful answer, share the board type, size, quantity and delivery city. For a schedule or printed board, include the layout or sketch. The published phone and WhatsApp channels reach the business directly."
      />
      <Section id="contact-details" title="Reach the manufacturer" sansHeading bordered={false}>
        <div className="mb-6 grid grid-cols-2 gap-2 lg:hidden">
          <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="col-span-2 flex min-h-12 items-center justify-between gap-3 rounded-md bg-brand px-4 text-white transition-colors hover:bg-brand-deep">
            <span className="flex items-center gap-2 text-body-sm font-medium"><Phone className="size-4" aria-hidden /> Call the desk</span>
            <span className="tabular text-caption text-white/80">{brand.phone}</span>
          </a>
          <a href={`https://wa.me/${brand.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-center gap-2 rounded-md border border-hair-strong bg-surface px-3 text-body-sm font-medium text-navy transition-colors hover:border-brand">
            <MessageCircle className="size-4" aria-hidden /> WhatsApp
          </a>
          <a href={`mailto:${brand.email}`} className="flex min-h-12 items-center justify-center gap-2 rounded-md border border-hair-strong bg-surface px-3 text-body-sm font-medium text-navy transition-colors hover:border-brand">
            <Mail className="size-4" aria-hidden /> Email
          </a>
        </div>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
          <div className="flex flex-col gap-6">
            <div className="hidden gap-3 sm:grid-cols-2 lg:grid">
              <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="flex min-h-32 flex-col justify-between rounded-sm border border-hair bg-surface p-5 transition-colors hover:bg-sand/40">
                <Phone className="size-5 text-navy-deep" aria-hidden /><span><span className="block text-caption text-graphite">Call Plusmark</span><span className="tabular pt-1 font-display text-h3">{brand.phone}</span></span>
              </a>
              <a href={`mailto:${brand.email}`} className="flex min-h-32 flex-col justify-between rounded-sm border border-hair bg-surface p-5 transition-colors hover:bg-sand/40">
                <Mail className="size-5 text-navy-deep" aria-hidden /><span><span className="block text-caption text-graphite">Email</span><span className="block break-all pt-1 text-body-sm font-medium">{brand.email}</span></span>
              </a>
            </div>
            <div className="[&_dl]:border-y-0">
              <FactList rows={[
                { term: "WhatsApp", detail: <a href={`https://wa.me/${brand.whatsapp}`} target="_blank" rel="noopener noreferrer" className="underline decoration-hair-strong underline-offset-4">Message Plusmark</a> },
                { term: "Works", detail: address ? `${address.streetAddress}, ${address.addressLocality}, ${address.addressRegion} ${address.postalCode}, India` : "Ahmedabad, Gujarat" },
                { term: "About a board", detail: "The product name, the size you want and your delivery city. One board is enough; there is no minimum order." },
                { term: "About an existing order", detail: "Share the Plusmark order reference and the contact details used for the purchase. Prototype references are not live business records." }
              ]} />
            </div>
          </div>
          <div className="rounded-sm border border-hair bg-sand/35 p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3"><PenLine className="size-5 text-navy-deep" aria-hidden /><h2 className="font-sans text-h3">Write down your requirement</h2></div>
            <ContactForm />
          </div>
        </div>
      </Section>
      <Section id="support-links" title="The right page for the next step" tone="sand" sansHeading bordered={false}>
        <div className="max-w-3xl [&_ul]:border-y-0">
          <LinkRail links={[
            { label: "Browse the catalogue", href: "/shop", note: "Every board and size" },
            { label: "Track a local prototype order", href: "/track-order", note: "Reference & email" },
            { label: "Read the published Plusmark FAQ", href: "/faq", note: "Products & ordering" },
            { label: "Review draft shipping and return terms", href: "/policies", note: "Pending sign-off" }
          ]} />
        </div>
      </Section>
    </>
  );
}
