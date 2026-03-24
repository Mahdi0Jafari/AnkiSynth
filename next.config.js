/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  // حذف گزینه optimizeFonts چون در نسخه جدید باعث خطا می‌شود
  trailingSlash: true, 
  basePath: isProd ? '/AnkiSynth' : '',
  assetPrefix: isProd ? '/AnkiSynth' : '',
  images: { unoptimized: true },
  
  // این بخش برای pdfjs-dist حیاتی است اما با Turbopack تداخل دارد
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