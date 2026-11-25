import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ExternalLink, Mail, MessageCircle, Phone, ShieldCheck } from "lucide-react";
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
    <footer className="mt-10 bg-shell text-shell-on md:mt-16">
      <div className="pm-shell py-9 md:py-14 lg:py-16">
        <div className="grid gap-7 md:grid-cols-2 md:gap-10 lg:grid-cols-[1.35fr_1fr_1fr_1fr] lg:gap-12">
          <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-1">
            <Link href="/" className="w-fit rounded-xs" aria-label="Plusmark home">
              <Image
                src="/images/plusmark/brand/plusmark-white.png"
                alt="Plusmark"
                width={1304}
                height={261}
                sizes="239px"
                className="h-10 w-auto md:h-12"
              />
            </Link>
            <p className="max-w-sm text-body-sm leading-relaxed text-shell-on/72">
              Writing boards, chalk boards, notice boards and display systems made in Ahmedabad, shipped across India.
              Order a single board online.
            </p>
            <p className="text-caption font-medium uppercase tracking-[0.12em] text-shell-on/55">Established 2015</p>
            <a
              href="https://plusmarkboards.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 text-body-sm text-shell-on/80 underline decoration-shell-on/30 underline-offset-4 transition-colors hover:text-shell-on hover:decoration-shell-on"
            >
              plusmarkboards.com
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
            <address className="flex flex-col gap-1 pt-2 text-caption not-italic leading-relaxed text-shell-on/60">
              <span>{brand.legalName}</span>
              <span>{brand.address?.streetAddress}</span>
              <span>
                {brand.address?.addressLocality}, {brand.address?.addressRegion} {brand.address?.postalCode}
              </span>
            </address>
          </div>

          <div className="md:hidden">
            <MobileGroup title="Shop" defaultOpen>
              <ul className="flex flex-col">
                {categories.slice(0, 7).map((category) => (
                  <li key={category.id}>
                    <MobileFooterLink href={`/shop/${category.slug}`}>{category.name}</MobileFooterLink>
                  </li>
                ))}
                <li><MobileFooterLink href="/shop">All products</MobileFooterLink></li>
              </ul>
            </MobileGroup>
            <MobileGroup title="Customer care">
              <ul className="flex flex-col">
                {SUPPORT_LINKS.map((link) => (
                  <li key={link.href}>
                    <MobileFooterLink href={link.href}>{link.label}</MobileFooterLink>
                  </li>
                ))}
              </ul>
              <ul className="flex flex-col pt-1">
                <li>
                  <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="flex min-h-11 items-center gap-3 text-body-sm text-shell-on/75">
                    <Phone className="size-4 shrink-0 text-shell-on/55" aria-hidden />
                    <span className="tabular">{brand.phone}</span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${brand.email}`} className="flex min-h-11 items-center gap-3 text-body-sm text-shell-on/75">
                    <Mail className="size-4 shrink-0 text-shell-on/55" aria-hidden />
                    {brand.email}
                  </a>
                </li>
                <li>
                  <a href={`https://wa.me/${brand.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-3 text-body-sm text-shell-on/75">
                    <MessageCircle className="size-4 shrink-0 text-shell-on/55" aria-hidden />
                    WhatsApp Plusmark
                  </a>
                </li>
              </ul>
            </MobileGroup>
            <MobileGroup title="Policies">
              <ul className="flex flex-col">
                {POLICY_LINKS.map((link) => (
                  <li key={link.href}>
                    <MobileFooterLink href={link.href}>{link.label}</MobileFooterLink>
                  </li>
                ))}
              </ul>
            </MobileGroup>
            <MobileGroup title="Browse by collection">
              <ul className="flex flex-col">
                <li><MobileFooterLink href="/collections">All collections</MobileFooterLink></li>
                <li><MobileFooterLink href="/collections/ceramic-boards">Ceramic boards</MobileFooterLink></li>
                <li><MobileFooterLink href="/shop">All products</MobileFooterLink></li>
              </ul>
            </MobileGroup>
          </div>

          <div className="hidden md:contents">
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
                <p className="text-label font-medium uppercase tracking-[0.12em] text-shell-on/50">Here to help</p>
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
              </div>
            </FooterColumn>
          </div>
        </div>
      </div>

      <div className="border-t border-shell-on/15 md:hidden">
        <div className="pm-shell flex flex-col gap-3 py-4">
          <p className="flex items-center gap-2 text-caption text-shell-on/70">
            <ShieldCheck className="size-4 text-shell-on/60" aria-hidden />
            Secure payments via Razorpay
          </p>
          <div className="flex items-center gap-2">
            <SocialLink href={`tel:${brand.phone.replace(/\s/g, "")}`} label="Call Plusmark">
              <Phone className="size-[18px]" aria-hidden />
            </SocialLink>
            <SocialLink href={`https://wa.me/${brand.whatsapp}`} label="WhatsApp Plusmark" external>
              <MessageCircle className="size-[18px]" aria-hidden />
            </SocialLink>
            <SocialLink href={`mailto:${brand.email}`} label="Email Plusmark">
              <Mail className="size-[18px]" aria-hidden />
            </SocialLink>
          </div>
        </div>
      </div>

      <div className="border-t border-shell-on/15">
        <div className="pm-shell flex flex-col gap-2 py-5 text-caption text-shell-on/55 max-md:text-[0.75rem] lg:flex-row lg:items-center lg:justify-between">
          <p>© {new Date().getFullYear()} {brand.legalName}. All rights reserved.</p>
          <p className="max-w-2xl lg:text-right">
            Made-to-order sizes show as price on request until Plusmark confirms the figure. Catalogue reference:{" "}
            <a href="https://plusmarkboards.com/" className="text-shell-on/80 underline decoration-shell-on/30 underline-offset-4 hover:text-shell-on" target="_blank" rel="noopener noreferrer">
              plusmarkboards.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function MobileGroup({
  title,
  children,
  defaultOpen = false
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="pm-accordion border-b border-shell-on/15" open={defaultOpen}>
      <summary className="flex min-h-12 items-center justify-between gap-3 text-[0.875rem] font-medium text-shell-on/85">
        {title}
        <ChevronDown className="pm-accordion-chevron size-4 text-shell-on/55 transition-transform duration-200" aria-hidden />
      </summary>
      <div className="pb-3">{children}</div>
    </details>
  );
}

function MobileFooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex min-h-11 items-center rounded-xs text-body-sm text-shell-on/72 transition-colors hover:text-shell-on">
      {children}
    </Link>
  );
}

function SocialLink({
  href,
  label,
  external,
  children
}: {
  href: string;
  label: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex size-11 items-center justify-center rounded-full border border-shell-on/20 text-shell-on/80 transition-colors hover:border-shell-on/40 hover:text-shell-on"
    >
      {children}
    </a>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-sans text-label font-medium uppercase tracking-[0.14em] text-shell-on/55">{title}</h2>
      {children}
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-block rounded-xs text-body-sm text-shell-on/72 transition-colors hover:text-shell-on">
      {children}
    </Link>
  );
}
