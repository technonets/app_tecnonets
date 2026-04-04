import Link from "next/link";
import { Check, Shield, Download, Monitor, Code, MessageSquare, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { getProducts } from "@/lib/products";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/store/ProductGallery";
import { AdBanner } from "@/components/ui/AdBanner";
import { ServicePlanCard } from "@/components/pricing/ServicePlanCard";
import { Metadata } from "next";

// SEO: Generar metadatos dinámicos para cada producto
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find(p => p.id === slug);

  if (!product) {
    return {
      title: "Producto No Encontrado | Tecnonets",
      description: "El producto que buscas no está disponible."
    };
  }

  const imageUrl = product.images?.[0] || '/images/og-default.jpg';

  return {
    title: `${product.title} | Tienda Tecnonets`,
    description: product.description.slice(0, 160),
    keywords: [product.category, ...product.tags, 'Tecnonets', 'automatización', 'desarrollo web'].join(', '),
    openGraph: {
      title: product.title,
      description: product.description.slice(0, 160),
      type: 'website',
      images: imageUrl.startsWith('http') ? [{ url: imageUrl }] : [],
      siteName: 'Tecnonets',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description.slice(0, 160),
      images: imageUrl.startsWith('http') ? [imageUrl] : [],
    }
  };
}

// SEO: Generar rutas estáticas para mejor rendimiento
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({
    slug: product.id,
  }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const products = await getProducts();
  const product = products.find(p => p.id === resolvedParams.slug);

  if (!product) {
    notFound(); 
  }

  // JSON-LD Schema para Google Rich Results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images?.[0] || '',
    category: product.category,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'COP',
      availability: 'https://schema.org/InStock',
      url: `https://tecnonets.com/tienda/${product.id}`,
    },
    brand: {
      '@type': 'Brand',
      name: 'Tecnonets'
    }
  };

  return (
    <>
      {/* JSON-LD para Google Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-grow pt-24">
        <Section>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Column: 8/12 on Desktop */}
            <div className="lg:col-span-8 space-y-12">
               <div>
                  <div className="flex gap-2 mb-4">
                     <Badge variant={(product.category === 'Páginas Web' || product.category === 'Landing Pages') ? 'primary' : 'secondary'}>{product.category}</Badge>
                     <Badge variant="outline">Template</Badge>
                  </div>
                  
                  <h1 className="text-3xl md:text-5xl font-bold font-heading text-white mb-6">{product.title}</h1>
                  
                  {/* Gallery */}
                  <ProductGallery images={product.images} category={product.category} title={product.title} />
               </div>

               {/* Mobile/Tablet Ad: Below Gallery */}
               <div className="lg:hidden">
                  <AdBanner slot="product_mid_mobile" />
               </div>

               <div className="space-y-8">
                  <p className="text-xl text-gray-300 leading-relaxed">
                     {product.description}
                  </p>

                  {/* Pricing / Action Section */}
                  <div className="bg-card border border-white/10 rounded-2xl p-8">
                     {/* Si el precio es 0 (GRATIS), mostrar UI de descarga para TODOS */}
                     {(product.price === 0 || !product.monthlyPrice) ? (
                        // ==========================================
                        // LAYOUT: PRODUCTO GRATIS / DESCARGA
                        // ==========================================
                        <>
                           <div className="flex flex-col sm:flex-row justify-between items-center gap-8 mb-8 pb-8 border-b border-white/5">
                              <div className="text-center sm:text-left">
                                 <span className="block text-sm text-gray-400 mb-1 uppercase tracking-widest font-bold">Precio del Recurso</span>
                                 <span className="text-5xl font-bold text-white">
                                    {product.price === 0 ? "GRATIS" : `$${product.price}`}
                                 </span>
                              </div>
                              <a href={product.checkoutUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                                 <Button size="lg" className="h-16 px-10 text-lg w-full sm:w-auto shadow-[0_0_30px_rgba(139,92,246,0.2)] gap-2">
                                    {product.price === 0 ? <><Download className="w-5 h-5" /> Obtener Ahora</> : "Comprar Código Fuente"}
                                 </Button>
                              </a>
                           </div>

                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                 <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                                    <Check className="w-4 h-4 text-primary" /> Entrega Inmediata
                                 </h4>
                                 <p className="text-xs text-gray-400">Archivos electrónicos disponibles al instante tras la gestión.</p>
                              </div>
                              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                 <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-primary" /> Garantía de Calidad
                                 </h4>
                                 <p className="text-xs text-gray-400">Código limpio y optimizado siguiendo las mejores prácticas.</p>
                              </div>
                           </div>
                        </>
                     ) : (product.category === 'Páginas Web' || product.category === 'Landing Pages' || product.category === 'Portafolios') ? (
                        // ==========================================
                        // LAYOUT: SERVICIO DE SUSCRIPCIÓN (WaaS)
                        // ==========================================
                         <div className="max-w-md mx-auto md:max-w-none">
                            <ServicePlanCard 
                               description="Suscripción Mensual Todo Incluido"
                               prices={{
                                  setup: { 
                                     COP: `$${product.price ? product.price.toLocaleString() : '0'}`, 
                                     USD: `$${Math.round((product.price || 0) / 4000)}` 
                                  },
                                  monthly: { 
                                     COP: product.category === 'Landing Pages' ? '$150.000' : `$${product.monthlyPrice ? product.monthlyPrice.toLocaleString() : '0'}`, 
                                     USD: product.category === 'Landing Pages' ? '$39' : `$${Math.round((product.monthlyPrice || 0) / 4000)}` 
                                  }
                               }}
                               ctaLink={`https://wa.me/573207093764?text=${encodeURIComponent(`Hola, me interesa el plan WaaS (Website as a Service): ${product.title}`)}`}
                               isPopular={false}
                               setupFeatures={(product.category === 'Landing Pages' || product.title.includes('Landing')) ? [
                                  "Diseño Personalizado High-Conversion",
                                  "Arquitectura Web para Crecimiento SEO",
                                  "Estructura One-Page Responsive",
                                  "Formulario de Contacto + WhatsApp",
                                  "Configuración Inicial de Pixel",
                                  "Certificado SSL y Seguridad Básica",
                                  "Implementación Técnica Completa"
                               ] : product.category === 'Portafolios' ? [
                                  "Diseño Profesional y Moderno",
                                  "Galería de Proyectos Optimizada",
                                  "Formulario de Contacto Integrado",
                                  "Configuración de Metadatos SEO"
                               ] : [
                                  "Estructura de hasta 5 secciones",
                                  "Blog / Noticias (Estructura)",
                                  "Arquitectura Web para SEO",
                                  "Configuración Analytics & Console",
                                  "Diseño Corporativo Premium"
                               ]}
                               monthlyFeatures={(product.category === 'Landing Pages' || product.title.includes('Landing')) ? [
                                  "Hosting de Alta Velocidad",
                                  "Soporte Técnico Prioritario",
                                  "Monitoreo de Funcionamiento",
                                  "1 cambio menor mensual (texto o imagen, no rediseños)"
                               ] : [
                                  "Hosting Empresarial Administrado",
                                  "Soporte Técnico Prioritario",
                                  "Monitoreo de Uptime y Estabilidad",
                                  "Actualizaciones de Seguridad",
                                  "2 cambios menores mensuales (texto o imagen, no nuevas secciones ni rediseños)"
                               ]}
                            />
                            <div className="mt-6 text-center">
                               <p className="text-[10px] text-gray-500 uppercase tracking-widest bg-white/5 py-3 px-4 rounded-xl border border-white/5 inline-block">
                                  <span className="text-primary font-bold">¿Quieres ser dueño del código?</span> <br/>
                                  Ofrecemos opción de compra definitiva. El precio varía según el proyecto.
                               </p>
                            </div>
                         </div>
                     ) : (
                        // ==========================================
                        // LAYOUT: PRODUCTO DIGITAL (Descarga)
                        // ==========================================
                        <>
                           <div className="flex flex-col sm:flex-row justify-between items-center gap-8 mb-8 pb-8 border-b border-white/5">
                              <div className="text-center sm:text-left">
                                 <span className="block text-sm text-gray-400 mb-1 uppercase tracking-widest font-bold">Precio del Recurso</span>
                                 <span className="text-5xl font-bold text-white">
                                    {product.price === 0 ? "GRATIS" : `$${product.price}`}
                                 </span>
                              </div>
                              <a href={product.checkoutUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                                 <Button size="lg" className="h-16 px-10 text-lg w-full sm:w-auto shadow-[0_0_30px_rgba(139,92,246,0.2)] gap-2">
                                    {product.price === 0 ? <><Download className="w-5 h-5" /> Obtener Ahora</> : "Comprar Código Fuente"}
                                 </Button>
                              </a>
                           </div>

                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                 <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                                    <Check className="w-4 h-4 text-primary" /> Entrega Inmediata
                                 </h4>
                                 <p className="text-xs text-gray-400">Archivos electrónicos disponibles al instante tras la gestión.</p>
                              </div>
                              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                 <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-primary" /> Garantía de Calidad
                                 </h4>
                                 <p className="text-xs text-gray-400">Código limpio y optimizado siguiendo las mejores prácticas.</p>
                              </div>
                           </div>
                        </>
                     )}
                  </div>
                  
                  {product.demoUrl && (
                     <a href={product.demoUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full h-14 border-primary/50 hover:bg-primary/5 text-lg gap-3">
                           <Monitor className="w-5 h-5" /> Ver Ejemplo en Funcionamiento
                        </Button>
                     </a>
                  )}

                  {/* Tutorial Section - Only shows if tutorialUrl exists */}
                  {product.tutorialUrl && (
                     <div className="bg-card border border-white/10 rounded-2xl p-6 mt-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                           <PlayCircle className="w-6 h-6 text-primary" />
                           Tutorial
                        </h3>
                        <div className="aspect-video rounded-xl overflow-hidden bg-black/50">
                           {/* YouTube embed */}
                           {(product.tutorialUrl.includes('youtube.com') || product.tutorialUrl.includes('youtu.be')) && (
                              <iframe
                                 className="w-full h-full"
                                 src={`https://www.youtube.com/embed/${
                                    product.tutorialUrl.includes('youtu.be') 
                                       ? product.tutorialUrl.split('youtu.be/')[1]?.split('?')[0]
                                       : product.tutorialUrl.split('v=')[1]?.split('&')[0]
                                 }`}
                                 title="Tutorial del producto"
                                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                 allowFullScreen
                              />
                           )}
                           {/* Vimeo embed */}
                           {product.tutorialUrl.includes('vimeo.com') && (
                              <iframe
                                 className="w-full h-full"
                                 src={`https://player.vimeo.com/video/${product.tutorialUrl.split('vimeo.com/')[1]?.split('?')[0]}`}
                                 title="Tutorial del producto"
                                 allow="autoplay; fullscreen; picture-in-picture"
                                 allowFullScreen
                              />
                           )}
                           {/* Direct link fallback for other URLs */}
                           {!product.tutorialUrl.includes('youtube.com') && !product.tutorialUrl.includes('youtu.be') && !product.tutorialUrl.includes('vimeo.com') && (
                              <a 
                                 href={product.tutorialUrl} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="w-full h-full flex items-center justify-center text-primary hover:text-white transition-colors"
                              >
                                 <PlayCircle className="w-16 h-16" />
                              </a>
                           )}
                        </div>
                     </div>
                  )}
               </div>
            </div>

            {/* Sidebar Column: 4/12 on Desktop - DEDICATED TO MONETIZATION */}
            <aside className="lg:col-span-4 space-y-8">
               <div className="lg:sticky lg:top-28 space-y-6">
                  {/* Sidebar Vertical Ad 1 */}
                  <div className="p-5 bg-card border border-white/10 rounded-2xl">
                     <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Publicidad</h3>
                     <AdBanner slot="product_sidebar_top" format="rectangle" style={{ minHeight: '300px' }} />
                  </div>

                  {/* Trust Badges or Links */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                     <h3 className="font-bold text-white mb-4">¿Por qué elegir Tecnonets?</h3>
                     <ul className="space-y-3">
                        <li className="flex gap-2 text-sm text-gray-300"><Check className="w-4 h-4 text-primary" /> Experiencia real en AppScript</li>
                        <li className="flex gap-2 text-sm text-gray-300"><Check className="w-4 h-4 text-primary" /> Soporte técnico especializado</li>
                        <li className="flex gap-2 text-sm text-gray-300"><Check className="w-4 h-4 text-primary" /> Actualizaciones garantizadas</li>
                     </ul>
                  </div>

                  {/* Sidebar Vertical Ad 2 */}
                  <div className="p-5 bg-card border border-white/10 rounded-2xl hidden lg:block">
                     <AdBanner slot="product_sidebar_bottom" format="rectangle" style={{ minHeight: '600px' }} />
                  </div>
               </div>
            </aside>
          </div>

          {/* AdSense: Bottom Horizontal Banner */}
          <div className="mt-20 pt-16 border-t border-white/5">
            <AdBanner slot="product_footer_banner" className="max-w-4xl mx-auto" />
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
