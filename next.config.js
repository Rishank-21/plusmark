const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : null;
const cloudinaryCloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "drt0rpkn2";

const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  async redirects() {
    return [
      // ADC notice boards became their own top-level category in the Nov 2026
      // catalogue sync; the old subcategory URL stays reachable.
      {
        source: "/shop/notice-boards/notice-boards-adc",
        destination: "/shop/acrylic-door-cover-notice-boards",
        permanent: true
      }
    ];
  },
  images: {
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
