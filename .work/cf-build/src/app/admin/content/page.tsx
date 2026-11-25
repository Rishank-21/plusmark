"use client";

import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { contentDefaults } from "@/lib/demo-data";
import { ErrorState, Notice } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { CheckboxField, TextArea, TextField } from "@/components/ui/Field";
import { AdminPageHeader, AdminPanel } from "@/components/admin/Metrics";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { errorMessage, useAdminQuery } from "@/components/admin/useAdminQuery";
import { getSiteContent, saveSiteContent } from "@/lib/supabase/admin";
import { useToast } from "@/state/toast";

interface Announcement {
  text: string;
  linkHref: string;
  linkLabel: string | null;
  active: boolean;
}

interface Hero {
  eyebrow: string;
  headline: string;
  supporting: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  imagePublicId: string;
  imageAlt: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function readAnnouncement(value: unknown): Announcement {
  const record = asRecord(value);
  return {
    text: typeof record?.text === "string" ? record.text : contentDefaults.announcement.text,
    linkHref: typeof record?.linkHref === "string" ? record.linkHref : contentDefaults.announcement.linkHref,
    linkLabel: typeof record?.linkLabel === "string" ? record.linkLabel : null,
    active: typeof record?.active === "boolean" ? record.active : contentDefaults.announcement.active
  };
}

function readHero(value: unknown): Hero {
  const record = asRecord(value);
  const fallback = contentDefaults.hero;
  const cta = (input: unknown, base: { label: string; href: string }) => {
    const entry = asRecord(input);
    return {
      label: typeof entry?.label === "string" ? entry.label : base.label,
      href: typeof entry?.href === "string" ? entry.href : base.href
    };
  };
  return {
    eyebrow: typeof record?.eyebrow === "string" ? record.eyebrow : fallback.eyebrow,
    headline: typeof record?.headline === "string" ? record.headline : fallback.headline,
    supporting: typeof record?.supporting === "string" ? record.supporting : fallback.supporting,
    primaryCta: cta(record?.primaryCta, fallback.primaryCta),
    secondaryCta: cta(record?.secondaryCta, fallback.secondaryCta),
    imagePublicId: typeof record?.imagePublicId === "string" ? record.imagePublicId : fallback.imagePublicId,
    imageAlt: typeof record?.imageAlt === "string" ? record.imageAlt : fallback.imageAlt
  };
}

export default function AdminContentPage() {
  const toast = useToast();
  const query = useAdminQuery(() => getSiteContent());
  const [announcement, setAnnouncement] = useState<Announcement>(contentDefaults.announcement);
  const [hero, setHero] = useState<Hero>(contentDefaults.hero);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!query.data) return;
    setAnnouncement(readAnnouncement(query.data.announcement));
    setHero(readHero(query.data.hero));
    setDirty(false);
  }, [query.data]);

  const announcementError = useMemo(() => {
    if (!announcement.active) return null;
    if (!announcement.text.trim()) return "Add the message shown above the header.";
    if (!announcement.linkHref.trim() || !(announcement.linkHref.startsWith("/") || announcement.linkHref.startsWith("https://"))) {
      return "Use an internal path such as /shop or a full https:// address.";
    }
    return null;
  }, [announcement]);

  const heroError = useMemo(() => {
    if (!hero.headline.trim()) return "The hero headline cannot be empty.";
    if (!hero.primaryCta.label.trim() || !hero.primaryCta.href.trim()) return "The primary button needs a label and a link.";
    return null;
  }, [hero]);

  const publish = async () => {
    if (announcementError || heroError) {
      toast.push(announcementError ?? heroError ?? "Check the highlighted fields.", "error");
      return;
    }
    setSaving(true);
    try {
      await Promise.all([
        saveSiteContent("announcement", announcement),
        saveSiteContent("hero", hero)
      ]);
      query.setData((current) => ({
        ...(current ?? {}),
        announcement,
        hero
      }));
      setDirty(false);
      toast.push("Content saved", "success");
    } catch (reason) {
      toast.push(errorMessage(reason, "The content could not be saved."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="Content"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Content" }]}
        lede="The announcement above the header and the homepage hero copy, stored in the live site_content table."
        actions={
          <Button onClick={publish} loading={saving} disabled={query.loading || Boolean(query.error)}>
            <Save className="size-4" aria-hidden />
            {saving ? "Saving…" : "Save content"}
          </Button>
        }
      />
      {query.error ? (
        <ErrorState title="Content could not be loaded" body={query.error} onRetry={query.reload} />
      ) : (
        <>
          {dirty && !saving && (
            <p role="status" className="text-caption text-graphite">
              Local edits are unsaved. Saving writes both records to Supabase.
            </p>
          )}
          <Notice tone="warning" title="Hero copy is stored but not yet rendered">
            <p>
              The announcement bar reads this record on the storefront. The homepage hero is still a coded carousel, so
              the hero fields below are saved for the content switch-over but do not change the storefront yet.
            </p>
          </Notice>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(21rem,0.85fr)] xl:items-start">
            <div className="flex min-w-0 flex-col gap-5">
              <AdminPanel title="Announcement bar" description="The single line above the header on every storefront page.">
                <div className="flex flex-col gap-3.5">
                  <TextField
                    label="Message"
                    value={announcement.text}
                    maxLength={90}
                    error={announcementError && announcement.active ? announcementError : null}
                    hint={`${announcement.text.length} of 90 characters. Keep it factual — no delivery promise or discount claim.`}
                    onChange={(event) => { setAnnouncement({ ...announcement, text: event.target.value }); setDirty(true); }}
                  />
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <TextField
                      label="Link destination"
                      value={announcement.linkHref}
                      onChange={(event) => { setAnnouncement({ ...announcement, linkHref: event.target.value }); setDirty(true); }}
                      hint="An internal path such as /shop or a verified campaign URL."
                    />
                    <TextField
                      label="Link label"
                      value={announcement.linkLabel ?? ""}
                      placeholder="No link label"
                      optional
                      onChange={(event) => { setAnnouncement({ ...announcement, linkLabel: event.target.value || null }); setDirty(true); }}
                    />
                  </div>
                  <CheckboxField
                    label="Show the announcement bar"
                    checked={announcement.active}
                    onChange={(event) => { setAnnouncement({ ...announcement, active: event.target.checked }); setDirty(true); }}
                  />
                </div>
              </AdminPanel>

              <AdminPanel title="Homepage hero" description="Headline, supporting line and the two calls to action.">
                <div className="flex flex-col gap-3.5">
                  <TextField label="Eyebrow" value={hero.eyebrow} onChange={(event) => { setHero({ ...hero, eyebrow: event.target.value }); setDirty(true); }} hint="Small line above the headline. A place name or range name, not a slogan." />
                  <TextArea label="Headline" rows={2} value={hero.headline} error={heroError} onChange={(event) => { setHero({ ...hero, headline: event.target.value }); setDirty(true); }} hint="Keep it a sentence, not a list." />
                  <TextArea label="Supporting line" rows={3} value={hero.supporting} onChange={(event) => { setHero({ ...hero, supporting: event.target.value }); setDirty(true); }} />
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <TextField label="Primary button label" value={hero.primaryCta.label} onChange={(event) => { setHero({ ...hero, primaryCta: { ...hero.primaryCta, label: event.target.value } }); setDirty(true); }} />
                    <TextField label="Primary button link" value={hero.primaryCta.href} onChange={(event) => { setHero({ ...hero, primaryCta: { ...hero.primaryCta, href: event.target.value } }); setDirty(true); }} />
                    <TextField label="Secondary button label" value={hero.secondaryCta.label} onChange={(event) => { setHero({ ...hero, secondaryCta: { ...hero.secondaryCta, label: event.target.value } }); setDirty(true); }} />
                    <TextField label="Secondary button link" value={hero.secondaryCta.href} onChange={(event) => { setHero({ ...hero, secondaryCta: { ...hero.secondaryCta, href: event.target.value } }); setDirty(true); }} />
                  </div>
                  <fieldset className="flex flex-col gap-2">
                    <legend className="text-caption font-medium text-ink">Hero photograph</legend>
                    <MediaUploader
                      items={
                        hero.imagePublicId
                          ? [{ key: "hero-image", publicId: hero.imagePublicId, alt: hero.imageAlt, width: 1600, height: 900, source: "product" }]
                          : []
                      }
                      onChange={(next) => { setHero({ ...hero, imagePublicId: next[0]?.publicId ?? "" }); setDirty(true); }}
                      folder="banners"
                      maxItems={1}
                      noun="slide"
                      showAlt={false}
                      onError={(message) => message && toast.push(message, "error")}
                    />
                  </fieldset>
                  <TextArea label="Image description" rows={2} value={hero.imageAlt} onChange={(event) => { setHero({ ...hero, imageAlt: event.target.value }); setDirty(true); }} hint="Read by screen readers and shown if the photograph fails to load." />
                </div>
              </AdminPanel>
            </div>

            <div className="flex min-w-0 flex-col gap-5">
              <AdminPanel title="Copy preview" description="Typography and spacing are not final.">
                <div className="flex flex-col gap-4 border border-hair bg-canvas p-4">
                  {announcement.active && (
                    <p className="text-center text-[0.625rem] font-medium uppercase tracking-[0.16em] text-graphite">
                      {announcement.text || "Announcement text is empty"}
                    </p>
                  )}
                  <div className="flex flex-col gap-2">
                    <p className="pm-eyebrow">{hero.eyebrow || "Eyebrow"}</p>
                    <p className="font-sans text-h2 font-normal leading-tight text-ink">{hero.headline || "Headline"}</p>
                    <p className="text-body-sm leading-relaxed text-graphite">{hero.supporting || "Supporting line"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-caption font-medium text-onprimary">{hero.primaryCta.label || "Primary"}</span>
                    <span className="inline-flex h-9 items-center rounded-xs border border-hair-strong px-4 text-caption font-medium text-ink">{hero.secondaryCta.label || "Secondary"}</span>
                  </div>
                </div>
                <p className="pt-3 text-[0.6875rem] leading-relaxed text-graphite-light">
                  Announcement changes appear on the storefront after saving. Hero copy is stored for the pending
                  content cut-over and does not alter the current carousel.
                </p>
              </AdminPanel>

              <AdminPanel title="Elsewhere on the site" description="Content that is still coded into page files.">
                <ul className="flex flex-col gap-2 text-body-sm">
                  <li><span className="font-medium text-ink">Homepage hero carousel</span><span className="block text-caption text-graphite">Four coded slides with their own images and links.</span></li>
                  <li><span className="font-medium text-ink">Institutional and policy pages</span><span className="block text-caption text-graphite">Written into page files; some policy items are still marked unresolved.</span></li>
                  <li><span className="font-medium text-ink">FAQ</span><span className="block text-caption text-graphite">Answers combine verified copy with three marked placeholders.</span></li>
                </ul>
              </AdminPanel>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
