import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
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
   title: {
      template: '%s | Locality',
      default: 'Locality',
   },
   description: 'Project management interface inspired by Linear and powered by Jazz.',
   icons: {
      icon: [{ url: '/images/icon.png', type: 'image/png' }],
      shortcut: '/images/icon.png',
   },
   openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://locality.app/',
      title: 'Locality',
      description: 'Project management interface inspired by Linear and powered by Jazz.',
      siteName: 'Locality',
      images: [
         {
            url: '/banner.png',
            width: 1200,
            height: 630,
            alt: 'Locality - Modern issue tracking and project management',
         },
      ],
   },
   twitter: {
      card: 'summary_large_image',
      title: 'Locality',
      description: 'Project management interface inspired by Linear and powered by Jazz.',
      images: ['/banner.png'],
      creator: '@locality',
   },
};

import { AppProviders } from '@/components/providers';

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="en" suppressHydrationWarning>
         <head>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
         </head>
         <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}>
            <AppProviders>{children}</AppProviders>
         </body>
      </html>
   );
}
