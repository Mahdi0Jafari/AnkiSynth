import type { Metadata, Viewport } from 'next';
import './globals.css';

/**
 * Global System Metadata Configuration
 * Specifically tuned for GitHub Pages deployment and personal branding.
 */
export const metadata: Metadata = {
  // FIX: Resolves the "metadataBase" warning by providing the absolute production URL.
  // This allows Next.js to generate absolute URLs for social media crawlers.
  metadataBase: new URL('https://mahdi0jafari.github.io/AnkiSynth/'),

  title: 'AnkiSynth AI | The Digital Forge',
  description: 'Refine raw data into knowledge with AI-powered flashcard synthesis. Engineered by Mahdi Jafari for high-performance cognitive retention.',
  keywords: ['Anki', 'Flashcards', 'AI', 'Spaced Repetition', 'Study', 'Language Learning', 'AnkiSynth', 'Mahdi Jafari'],
  authors: [{ name: 'Mahdi Jafari', url: 'https://github.com/Mahdi0Jafari' }],
  creator: 'Mahdi Jafari',
  
  // Single Source of Truth for Icons (SVG for infinite scalability)
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },

  // Social Graph Optimization (Open Graph)
  openGraph: {
    title: 'AnkiSynth AI | Intelligent Knowledge Extraction',
    description: 'Transform documents and text into Anki flashcards in seconds.',
    url: 'https://mahdi0jafari.github.io/AnkiSynth/',
    siteName: 'AnkiSynth AI',
    images: [
      {
        url: '/logo.svg', // Next.js will automatically resolve this to an absolute URL
        width: 800,
        height: 600,
        alt: 'AnkiSynth AI Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  // X (Twitter) Branding & Metadata
  twitter: {
    card: 'summary_large_image',
    title: 'AnkiSynth AI | The Digital Forge',
    description: 'AI-powered flashcard synthesis by Mahdi Jafari.',
    creator: '@Mahdi0Jafari',
    images: ['/logo.svg'],
  },

  // PWA Manifest Link
  manifest: '/manifest.json',
};

/**
 * Viewport Configuration (Next.js 14+ Standard)
 */
export const viewport: Viewport = {
  themeColor: '#0e0e10',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Resource Hints for performance optimization */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Inter:wght@300;400;500;600&family=Roboto+Mono&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="selection:bg-primary/30 selection:text-primary-foreground antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}