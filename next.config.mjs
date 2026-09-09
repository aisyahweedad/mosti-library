/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "sqlite-vec", "sqlite-vec-linux-x64"],
  },
};

export default nextConfig;
