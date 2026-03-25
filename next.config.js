/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';
const repoName = '/AnkiSynth';

const nextConfig = {
  output: 'export',
  // Ensure paths map perfectly to the GitHub Pages sub-directory
  basePath: isProd ? repoName : '',
  assetPrefix: isProd ? repoName : '',
  
  // Keep trailing slash to prevent directory vs file 404 errors on GitHub Pages
  trailingSlash: true, 
  images: { unoptimized: true },
  
  // Vital for pdfjs-dist worker initialization, avoiding Turbopack conflicts
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