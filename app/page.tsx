import Link from "next/link";
import { ArrowRight, Grid, Monitor, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { AdBanner } from "@/components/ui/AdBanner";
import { getProducts } from "@/lib/products";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diseño de Páginas Web y Crear Página Web Profesional | Tecnonets",
  description: "Expertos en crear páginas web profesionales, landing pages de alta conversión y soluciones de diseño web en Colombia. ¡Transforma tu presencia digital!",
  keywords: "crear página web, diseño de páginas web, páginas web profesionales, desarrollo web colombia, landing pages profesionales",
};

// JSON-LD Organization + WebSite para el Homepage
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://tecnonets.com/#organization",
      "name": "Tecnonets",
      "url": "https://tecnonets.com",
      "description": "Expertos en diseño de páginas web, crear página web profesional y automatización de procesos en Colombia",
      "areaServed": "Colombia",
      "sameAs": [
        "https://wa.me/573000000000"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": ["Spanish"]
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://tecnonets.com/#website",
      "url": "https://tecnonets.com",
      "name": "Tecnonets",
      "publisher": { "@id": "https://tecnonets.com/#organization" },
      "inLanguage": "es"
    }
  ]
};

export default async function Home() {
  // Obtener productos y ordenar por fecha (más recientes primero)
  const allProducts = await getProducts();
  const latestProducts = allProducts
    .sort((a, b) => {
      const dateA = new Date(a.createdDate || 0).getTime();
      const dateB = new Date(b.createdDate || 0).getTime();
      return dateB - dateA; // Descendente (más reciente primero)
    })
    .slice(0, 4);

  return (
    <>
      {/* JSON-LD para Google Knowledge Graph y AI */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-grow pt-20">
        {/* Main Introduction */}
        <Section className="min-h-[85vh] flex items-center justify-center">
          {/* Ambient Background Effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-[100px]" />
          </div>

          <div className="text-center relative z-10 max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-fade-in-up">
              <Badge variant="secondary">Soluciones Digitales</Badge>
              <span className="text-sm text-gray-300">Presencia Web y Automatización</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-bold font-heading tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-200 to-gray-500">
              Diseño de Páginas Web <br className="hidden sm:block" />
              y Sitios Profesionales
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Optimizamos flujos de trabajo mediante automatización avanzada con Google Workspace y desarrollamos infraestructura web de alto rendimiento.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/servicios/automatizacion">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  Consultar Servicios <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/tienda">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Ver Catálogo de Recursos
                </Button>
              </Link>
            </div>
          </div>
        </Section>

        {/* AdSense: Hero Bottom Banner */}
        <div className="max-w-7xl mx-auto px-4 -mt-10 mb-10">
           <AdBanner slot="home_hero_bottom" />
        </div>

        {/* Services Overview */}
        <Section className="bg-white/2">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">Nuestros Servicios</h2>
              <p className="text-gray-400 max-w-xl">Soluciones a medida para potenciar tu productividad y presencia digital.</p>
            </div>
            <Link href="/servicios">
              <Button variant="ghost" className="gap-2 text-primary">Ver todos <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/servicios/automatizacion">
              <Card className="h-full bg-gradient-to-br from-white/5 to-transparent">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-6 text-green-400">
                  <Grid className="w-6 h-6" />
                </div>
                <CardTitle>Automatización Google</CardTitle>
                <CardDescription>
                  Sincronización avanzada entre Sheets, Forms, Calendar y Gmail. Scripts personalizados para ahorrar horas de trabajo manual.
                </CardDescription>
              </Card>
            </Link>

             <Link href="/servicios/desarrollo-web">
              <Card className="h-full bg-gradient-to-br from-white/5 to-transparent">
                <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center mb-6 text-violet-400">
                  <Monitor className="w-6 h-6" />
                </div>
                <CardTitle>Diseño de Páginas Web</CardTitle>
                <CardDescription>
                  Expertos en crear páginas web profesionales, Landing Pages de alta conversión y sitios corporativos modernos.
                </CardDescription>
              </Card>
            </Link>

             <Link href="/tienda">
              <Card className="h-full bg-gradient-to-br from-white/5 to-transparent">
                <div className="w-12 h-12 rounded-lg bg-rose-500/20 flex items-center justify-center mb-6 text-rose-400">
                  <Zap className="w-6 h-6" />
                </div>
                <CardTitle>Tienda de Código</CardTitle>
                <CardDescription>
                  Adquiere proyectos listos para usar. Plantillas de Sheets, Scripts y componentes web premium para acelerar tus desarrollos.
                </CardDescription>
              </Card>
            </Link>
          </div>
        </Section>

        {/* AdSense: Mid-Page Horizontal */}
        <div className="max-w-7xl mx-auto px-4 my-12">
            <AdBanner slot="home_mid_page" format="fluid" />
        </div>

        {/* Latest Products */}
        <Section>
           <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">Últimos Recursos</h2>
            <p className="text-gray-400">Descubre nuestros productos y servicios más recientes.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestProducts.map((product) => (
              <Link key={product.id} href={`/tienda/${product.id}`}>
                <Card className="group cursor-pointer h-full">
                  <div className="aspect-video rounded-lg bg-gray-800 mb-4 overflow-hidden relative">
                    {product.images && product.images.length > 0 ? (
                      <Image 
                        src={product.images[0]} 
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
                        <Monitor className="w-12 h-12 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3" suppressHydrationWarning>
                      <Badge variant={product.price === 0 ? "secondary" : "primary"}>
                        {product.price === 0 ? "GRATIS" : product.category}
                      </Badge>
                    </div>
                  </div>
                  <h3 className="text-white font-medium group-hover:text-primary transition-colors mb-2 line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {product.price === 0 ? "Descarga Gratuita" : `Desde $${product.price.toLocaleString()} COP`}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </Section>

        {/* AdSense: Home Footer Banner */}
        <div className="max-w-7xl mx-auto px-4 mb-20">
           <AdBanner slot="home_footer_banner" />
        </div>
      </main>
      <Footer />
    </>
  );
}
