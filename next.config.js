/** @type {import('next').NextConfig} */

// تزریق موتور PWA با بهینه‌سازی برای محیط پروداکشن
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  // فعال‌سازی رجیستر خودکار برای اطمینان از نصب در هر بار لود
  register: true,
  // اجازه به سرویس ورکر جدید برای کنترل سریع‌تر صفحه
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    disableDevLogs: true,
  },
  // در محیط توسعه غیرفعال می‌شود تا باگ‌های کشینگ ایجاد نکند
  disable: process.env.NODE_ENV === "development",
});

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

// خروجی نهایی از درون کوره PWA عبور می‌کند
module.exports = withPWA(nextConfig);