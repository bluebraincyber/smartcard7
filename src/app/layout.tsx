import { Inter } from 'next/font/google';
import './globals.css';
import SessionProvider from '@/components/providers/SessionProvider';
import { SidebarProvider } from '@/components/providers/sidebar-provider';
import { ToastProvider } from '@/components/providers/toast-provider';
import { ThemeProvider } from '@/contexts/theme-context';
import { RootLayoutClient } from './root-layout-client';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SmartCard - Cartão Digital Inteligente',
  description: 'Cartão digital interativo e universal para pequenos e médios negócios',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SmartCard',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#3072F9',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="pt-br" 
      className={inter.className}
      suppressHydrationWarning
    >
      <head>
        {/* Meta tags para PWA */}
        <meta name="theme-color" content="#3072F9" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body 
        className="
          min-h-screen 
          bg-bg text-fg
          transition-colors duration-300 ease-in-out
          antialiased
        "
        suppressHydrationWarning
      >
        {/* Providers: Session + Theme + Sidebar + Toast */}
        <SessionProvider>
          <ThemeProvider>
            <SidebarProvider>
              <ToastProvider />
              <RootLayoutClient>
                {children}
              </RootLayoutClient>
            </SidebarProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
