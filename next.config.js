const nextConfig = {
  env: {
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
              value: '(?<slug>.*)\.smartcard\.app',
            },
          ],
        },
        {
          source: '/:path*',
          destination: '/:slug/:path*',
          has: [
            {
              type: 'host',
              value: '(?<slug>.*)\.smartcard\.app',
            },
          ],
        },
      ],
    };
  },
  images: {
    domains: ['localhost', 'smartcard.app'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
