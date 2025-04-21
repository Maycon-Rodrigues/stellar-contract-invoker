/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...config.externals, "sodium-native"];
    }
    return config;
  },
};

module.exports = nextConfig;
