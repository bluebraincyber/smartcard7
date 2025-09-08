import { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic' // impede execução no build
export const runtime = 'nodejs'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_URL || 'https://smartcard7.vercel.app'
  
  // Por ora, sitemap estático para evitar problemas no build
  // TODO: Implementar busca dinâmica via API em runtime

    // URLs estáticas
    const staticUrls: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/auth/login`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/auth/register`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
    ]

    return staticUrls
}
