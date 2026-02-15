import { MetadataRoute } from 'next';
import { getPosts } from '@/lib/blog';
import { getAllGuides } from '@/lib/guides';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tecnonets.com';

  // Páginas estáticas principales
  const staticRoutes = [
    '',
    '/blog',
    '/tienda',
    '/guias',
    '/contacto',
    '/terminos',
    '/privacidad',
    '/servicios/automatizacion',
    '/servicios/desarrollo-web',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Obtener posts del blog dinámicamente
  const posts = await getPosts();
  const blogRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date || new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Obtener guías dinámicamente
  const guides = await getAllGuides();
  const guideRoutes = guides.map((guide) => ({
    url: `${baseUrl}/guias/${guide.slug}`,
    lastModified: new Date(guide.date || new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogRoutes, ...guideRoutes];
}
