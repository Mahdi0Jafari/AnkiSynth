/** @type {import('next').NextConfig} */

// Determine if the environment is production (GitHub Pages build)
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  // Inject the repository name as the base path for GitHub Pages routing
  basePath: isProd ? '/AnkiSynth' : '',
  assetPrefix: isProd ? '/AnkiSynth/' : '',
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    // Prevent server-side execution of client-heavy modules
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