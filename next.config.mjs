/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NEXT_BASE_PATH || undefined,
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "sqlite-vec", "sqlite-vec-linux-x64"],
  },
};

export default nextConfig;
