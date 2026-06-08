import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { ThemeProvider } from '@/components/theme-provider';
import { ServiceWorkerRegistration } from '@/components/service-worker-registration';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DadCare',
  description: 'Professional Business Accounting & Distribution Management',
  icons: {
    icon: [
      { url: '/icons/icon-192.png?v=3', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png?v=3', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icons/icon-192.png?v=3' }
    ]
  },
  manifest: '/manifest.json?v=3',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DadCare',
  },
};

export const viewport: import('next').Viewport = {
  themeColor: '#2563EB',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head />
      <body className={`${inter.className} h-full antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <Toaster />
          <ServiceWorkerRegistration />
        </ThemeProvider>
      </body>
    </html>
  );
}
