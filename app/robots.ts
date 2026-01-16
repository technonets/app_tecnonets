import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/compra-exitosa/'],
    },
    sitemap: 'https://tecnonets.com/sitemap.xml',
  }
}
