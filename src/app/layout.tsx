import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import SessionProvider from '@/components/providers/SessionProvider';
import { SidebarProvider } from '@/components/providers/sidebar-provider';
import { ThemeProvider } from '@/contexts/theme-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SmartCard - Cartão Digital Inteligente',
  description: 'Cartão digital interativo e universal para pequenos e médios negócios',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
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
        {/* Script para prevenir flash de tema incorreto */}
        <Script id="theme-script" strategy="beforeInteractive">
          {`
            (function() {
              try {
                // Verificar tema salvo
                var savedTheme = localStorage.getItem('theme');
                var theme;
                
                if (savedTheme === 'light' || savedTheme === 'dark') {
                  theme = savedTheme;
                } else {
                  // Usar preferência do sistema
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  theme = prefersDark ? 'dark' : 'light';
                }
                
                // Aplicar tema imediatamente
                document.documentElement.classList.add(theme);
                document.documentElement.setAttribute('data-theme', theme);
                
                // Debug
                console.log('🎨 Tema inicial aplicado:', theme);
              } catch (error) {
                console.warn('Erro ao aplicar tema inicial:', error);
                // Fallback para tema claro
                document.documentElement.classList.add('light');
                document.documentElement.setAttribute('data-theme', 'light');
              }
            })();
          `}
        </Script>
        
        {/* Meta tags para PWA */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body 
        className="
          min-h-screen 
          bg-background text-foreground
          transition-colors duration-300 ease-in-out
          antialiased
        "
        suppressHydrationWarning
      >
        {/* Providers aninhados na ordem correta */}
        <SessionProvider>
          <ThemeProvider>
            <SidebarProvider>
              {/* Container principal */}
              <div className="relative min-h-screen">
                {children}
              </div>
            </SidebarProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
