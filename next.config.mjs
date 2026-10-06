/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Product photos uploaded from /admin live in Supabase Storage
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
