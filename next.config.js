/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  // Ensure trailing slashes are added to URLs for GH Pages compatibility
  trailingSlash: true, 
  basePath: isProd ? '/AnkiSynth' : '',
  // Asset prefix must NOT have a trailing slash if basePath is used
  assetPrefix: isProd ? '/AnkiSynth' : '',
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig;