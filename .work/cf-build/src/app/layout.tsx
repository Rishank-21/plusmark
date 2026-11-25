import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { Providers } from "@/components/Providers";
import { DevThemeSwitcher } from "@/components/dev/DevThemeSwitcher";
import { META_TITLE_SUFFIX, SITE_URL } from "@/lib/config";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import "./globals.css";

const display = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
  variable: "--font-display"
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans"
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: META_TITLE_SUFFIX,
    template: `%s · ${META_TITLE_SUFFIX}`
  },
  description:
    "Plusmark manufactures writing boards, chalk boards, notice boards, magnetic and ceramic boards, stands and school benches in Ahmedabad and ships across India.",
  keywords: ["white boards", "chalk boards", "notice boards", "magnetic boards", "ceramic boards", "board stands", "school benches", "Plusmark"],
  openGraph: {
    type: "website",
    siteName: "Plusmark",
    url: SITE_URL,
    title: META_TITLE_SUFFIX,
    description: "Quality boards, direct from Plusmark. Order writing and display boards online, delivered across India.",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Plusmark writing and display boards" }]
  },
  twitter: {
    card: "summary_large_image",
    title: META_TITLE_SUFFIX,
    description: "Quality boards, direct from Plusmark. Order writing and display boards online, delivered across India.",
    images: [DEFAULT_OG_IMAGE]
  },
  // Vercel preview builds must never compete with the production URLs.
  robots: process.env.VERCEL_ENV === "preview" ? { index: false, follow: false } : { index: true, follow: true }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-IN"
      data-theme="aurora-indigo"
      className={`${display.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-page text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[999] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-body-sm focus:text-onprimary"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
        <DevThemeSwitcher />
      </body>
    </html>
  );
}
