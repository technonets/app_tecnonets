import { MetadataRoute } from 'next'
import { getPosts } from '@/lib/blog'
import { getProducts } from '@/lib/products'
import { getAllGuides } from '@/lib/guides'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL
  const baseUrl = 'https://tecnonets.com'

  // Fetch dynamic routes
  const posts = await getPosts()
  const products = await getProducts()
  const guides = await getAllGuides()

  // Blog Posts
  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Products - usando createdDate cuando esté disponible
  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/tienda/${product.id}`,
    lastModified: product.createdDate ? new Date(product.createdDate) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  const guideEntries: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: `${baseUrl}/guias/${guide.slug}`,
    lastModified: new Date(guide.date),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  // Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tienda`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guias`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/servicios`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Subpáginas de servicios
    {
      url: `${baseUrl}/servicios/automatizacion`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/servicios/desarrollo-web`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  return [...staticRoutes, ...blogEntries, ...productEntries, ...guideEntries]
}
