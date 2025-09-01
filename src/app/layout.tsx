import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/components/providers/providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title:
    'AI Product Creator - Transform Ideas into Profitable Digital Products',
  description:
    'Create, analyze, and sell digital products with AI-powered insights. Discover trending opportunities, recreate successful products, and build your digital empire with advanced market intelligence.',
  keywords: [
    'AI product creation',
    'digital products',
    'market analysis',
    'product scraping',
    'trend analysis',
    'digital marketplace',
    'AI insights',
    'product recreation',
    'market intelligence',
    'digital entrepreneurship',
  ],
  authors: [{ name: 'AI Product Creator Team' }],
  creator: 'AI Product Creator',
  publisher: 'AI Product Creator',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://aiproductcreator.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title:
      'AI Product Creator - Transform Ideas into Profitable Digital Products',
    description:
      'Create, analyze, and sell digital products with AI-powered insights. Discover trending opportunities and build your digital empire.',
    url: 'https://aiproductcreator.com',
    siteName: 'AI Product Creator',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Product Creator - Digital Product Creation Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'AI Product Creator - Transform Ideas into Profitable Digital Products',
    description:
      'Create, analyze, and sell digital products with AI-powered insights. Discover trending opportunities and build your digital empire.',
    images: ['/twitter-image.jpg'],
    creator: '@aiproductcreator',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AI Product Creator',
    description:
      'AI-powered platform for creating, analyzing, and selling digital products with market intelligence and trend analysis.',
    url: 'https://aiproductcreator.com',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description:
        'Free tier available with premium plans starting at $29/month',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '2500',
      bestRating: '5',
      worstRating: '1',
    },
    author: {
      '@type': 'Organization',
      name: 'AI Product Creator Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI Product Creator',
      logo: {
        '@type': 'ImageObject',
        url: 'https://aiproductcreator.com/logo.png',
      },
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {/* Analytics Scripts */}
        <script
          defer
          data-domain="aiproductcreator.com"
          src="https://plausible.io/js/script.js"
        />
        {/* Hotjar Tracking Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:3000000,hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
              })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            `,
          }}
        />

        {/* PWA Meta Tags */}
        <meta name="application-name" content="AI Product Creator" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AI Creator" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#3b82f6" />

        {/* PWA Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icons/icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/icon-180x180.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/icon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/icon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="mask-icon"
          href="/icons/safari-pinned-tab.svg"
          color="#3b82f6"
        />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Preload Critical Resources */}
        <link
          rel="preload"
          href="/fonts/geist-sans.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Performance Hints */}
        <link rel="dns-prefetch" href="//plausible.io" />
        <link rel="dns-prefetch" href="//static.hotjar.com" />
        <link rel="preconnect" href="https://api.supabase.co" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
