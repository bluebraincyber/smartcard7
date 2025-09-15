/** @type {import('next').NextConfig} */
const nextConfig = {
  // Forçar a porta 3000
  devIndicators: {
    buildActivity: false,
  },
  // Configuração de porta
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  // Configuração do servidor
  env: {
    PORT: '3000',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    POSTGRES_URL: process.env.POSTGRES_URL,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Rewrite para subdomínios (ex: barbearia.smartcard.app -> /[slug])
        {
          source: '/',
          destination: '/:slug',
          has: [
            {
              type: 'host',
              value: '(?<slug>.*)\\.smartcard\\.app',
            },
          ],
        },
        {
          source: '/:path*',
          destination: '/:slug/:path*',
          has: [
            {
              type: 'host',
              value: '(?<slug>.*)\\.smartcard\\.app',
            },
          ],
        },
      ],
    };
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Desabilitar otimização de imagens para domínios externos problemáticos
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';",
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('pg-native');
    }
    // Resolver problemas com crypto no edge runtime
    config.resolve = config.resolve || {};
    config.resolve.fallback = config.resolve.fallback || {};
    config.resolve.fallback.crypto = false;
    
    return config;
  },
};

module.exports = nextConfig;
