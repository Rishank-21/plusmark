import { ButtonLink } from "@/components/ui/Button";
import { LinkRail } from "@/components/static/Editorial";

export default function StorefrontNotFound() {
  return (
    <section className="pm-shell py-4xl">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start">
        <div className="flex flex-col items-start gap-5">
          <p className="pm-eyebrow">404 · Page not found</p>
          <h1 className="balance max-w-[16ch] font-display text-display">This page is not on the board.</h1>
          <p className="max-w-reading text-body leading-relaxed text-muted">The address may have changed, or the product or collection may no longer be published. The full catalogue and the Plusmark desk are both still available.</p>
          <div className="flex flex-wrap gap-3 pt-2"><ButtonLink href="/shop" size="lg">Browse all products</ButtonLink><ButtonLink href="/contact" variant="secondary" size="lg">Contact support</ButtonLink></div>
        </div>
        <LinkRail title="Useful destinations" links={[
          { label: "Plusmark collections", href: "/collections", note: "Series & formats" },
          { label: "Browse by collection", href: "/collections", note: "Series and formats" },
          { label: "Frequently asked questions", href: "/faq", note: "Published answers" },
          { label: "Return to the homepage", href: "/" }
        ]} />
      </div>
    </section>
  );
}
