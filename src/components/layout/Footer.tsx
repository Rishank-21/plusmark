import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { categories, brand } from "@/lib/catalog";
import { Breadcrumbs } from "@/components/ui/Nav";

export { Breadcrumbs };

const SUPPORT_LINKS = [
  { label: "Contact & support", href: "/contact" },
  { label: "Track an order", href: "/track-order" },
  { label: "Order history", href: "/account/orders" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "My account", href: "/account" },
  { label: "FAQ", href: "/faq" }
];

const POLICY_LINKS = [
  { label: "Shipping policy", href: "/policies/shipping" },
  { label: "Returns & refunds", href: "/policies/returns" },
  { label: "Privacy policy", href: "/policies/privacy" },
  { label: "Terms & conditions", href: "/policies/terms" }
];

export function Footer() {
  return (
    <footer className="mt-16 bg-brand-deep text-white">
      <div className="pm-shell py-14 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr] lg:gap-12">
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="w-fit rounded-xs" aria-label="Plusmark Retail home">
              <Image
                src="/images/plusmark/brand/plusmark-retail-white.png"
                alt="Plusmark Retail"
                width={1375}
                height={480}
                className="h-20 w-auto"
              />
            </Link>
            <p className="max-w-sm text-body-sm leading-relaxed text-white/72">
              Writing boards, chalk boards, notice boards and display systems made in Ahmedabad, shipped across India.
              Order a single board online.
            </p>
            <p className="text-caption font-medium uppercase tracking-[0.12em] text-white/55">Established 2015</p>
            <a
              href="https://plusmarkboards.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 text-body-sm text-white/80 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
            >
              plusmarkboards.com
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
            <address className="flex flex-col gap-1 pt-2 text-caption not-italic leading-relaxed text-white/60">
              <span>{brand.legalName}</span>
              <span>{brand.address?.streetAddress}</span>
              <span>
                {brand.address?.addressLocality}, {brand.address?.addressRegion} {brand.address?.postalCode}
              </span>
            </address>
          </div>

          <FooterColumn title="Shop">
            <ul className="flex flex-col gap-2.5">
              {categories.slice(0, 7).map((category) => (
                <li key={category.id}><FooterLink href={`/shop/${category.slug}`}>{category.name}</FooterLink></li>
              ))}
              <li><FooterLink href="/shop">All products</FooterLink></li>
            </ul>
          </FooterColumn>

          <FooterColumn title="Customer care">
            <ul className="flex flex-col gap-2.5">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}><FooterLink href={link.href}>{link.label}</FooterLink></li>
              ))}
            </ul>
            <div className="mt-5 flex flex-col items-start gap-2">
              <p className="text-label font-medium uppercase tracking-[0.12em] text-white/50">Here to help</p>
              <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="footer-contact tabular">{brand.phone}</a>
              <a href={`mailto:${brand.email}`} className="footer-contact">{brand.email}</a>
              <a href={`https://wa.me/${brand.whatsapp}`} target="_blank" rel="noopener noreferrer" className="footer-contact">
                WhatsApp Plusmark
              </a>
            </div>
          </FooterColumn>

          <FooterColumn title="Policies">
            <ul className="flex flex-col gap-2.5">
              {POLICY_LINKS.map((link) => (
                <li key={link.href}><FooterLink href={link.href}>{link.label}</FooterLink></li>
              ))}
            </ul>
            <div className="mt-5 flex flex-col items-start gap-2.5">
              <FooterLink href="/collections">Browse by collection</FooterLink>
              <FooterLink href="/admin">Admin sign in</FooterLink>
            </div>
          </FooterColumn>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="pm-shell flex flex-col gap-2 py-5 text-caption text-white/55 lg:flex-row lg:items-center lg:justify-between">
          <p>© {new Date().getFullYear()} {brand.legalName}. All rights reserved.</p>
          <p className="max-w-2xl lg:text-right">
            Made-to-order sizes show as price on request until Plusmark confirms the figure. Catalogue reference:{" "}
            <a href="https://plusmarkboards.com/" className="text-white/80 underline decoration-white/30 underline-offset-4 hover:text-white" target="_blank" rel="noopener noreferrer">
              plusmarkboards.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-sans text-label font-medium uppercase tracking-[0.14em] text-white/55">{title}</h2>
      {children}
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-block rounded-xs text-body-sm text-white/72 transition-colors hover:text-white">
      {children}
    </Link>
  );
}
