import { Inter } from 'next/font/google';
import './globals.css';
import SessionProvider from '@/components/providers/SessionProvider';
import { SidebarProvider } from '@/components/providers/sidebar-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SmartCard - Cartão Digital Inteligente',
  description: 'Cartão digital interativo e universal para pequenos e médios negócios',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className={inter.className}>
      <body>
        <SessionProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
