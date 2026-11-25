/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : null;
const cloudinaryCloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "drt0rpkn2";

const nextConfig = {
  // Static-first: the catalogue, content, auth and account pages export as plain HTML for Cloudflare Pages.
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  devIndicators: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: `/${cloudinaryCloud}/**`
      },
      ...(supabaseHost
        ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
        : [])
    ],
    formats: ["image/avif", "image/webp"]
  }
};

module.exports = nextConfig;
