import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AdBanner } from "@/components/ui/AdBanner";
import { getProducts } from "@/lib/products";
import { Hero } from "@/components/home/Hero";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { LatestProducts } from "@/components/home/LatestProducts";
import { Partners } from "@/components/home/Partners";

export const metadata: Metadata = {
  title: "Diseño de Páginas Web y Crear Página Web Profesional | Tecnonets",
  description: "Expertos en crear páginas web profesionales, landing pages de alta conversión y soluciones de diseño web en Colombia. ¡Transforma tu presencia digital!",
  keywords: "crear página web, diseño de páginas web, páginas web profesionales, desarrollo web colombia, landing pages profesionales",
};

// JSON-LD Organization + WebSite + LocalBusiness para el Homepage
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://tecnonets.com/#organization",
      "name": "Tecnonets",
      "url": "https://tecnonets.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://tecnonets.com/logo.png"
      },
      "description": "Expertos en diseño de páginas web profesionales y automatización de procesos con Google Workspace en Colombia.",
      "sameAs": [
        "https://wa.me/573244916040",
        "https://youtube.com/@technonets",
        "https://www.tiktok.com/@technonets"
      ]
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://tecnonets.com/#localbusiness",
      "name": "Tecnonets",
      "image": "https://tecnonets.com/logo.png",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Bogotá",
        "addressCountry": "CO"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 4.6097,
        "longitude": -74.0817
      },
      "url": "https://tecnonets.com",
      "telephone": "+573244916040",
      "priceRange": "$$"
    },
    {
      "@type": "Service",
      "name": "Diseño de Páginas Web Profesionales",
      "provider": { "@id": "https://tecnonets.com/#organization" },
      "areaServed": { "@type": "Country", "name": "Colombia" },
      "description": "Desarrollo de landing pages de alta conversión y sitios web empresariales de alto rendimiento."
    },
    {
      "@type": "Service",
      "name": "Automatización con Google Apps Script",
      "provider": { "@id": "https://tecnonets.com/#organization" },
      "areaServed": "Global",
      "description": "Optimización de flujos de trabajo mediante la integración de Google Sheets, Drive y APIs externas."
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
        
        <Hero />

        {/* AdSense: Hero Bottom Banner */}
        <div className="max-w-7xl mx-auto px-4 -mt-10 mb-10">
           <AdBanner slot="home_hero_bottom" />
        </div>

        <ServicesGrid />

        {/* AdSense: Mid-Page Horizontal */}
        <div className="max-w-7xl mx-auto px-4 my-12">
            <AdBanner slot="home_mid_page" format="fluid" />
        </div>

        <LatestProducts products={latestProducts} />

        <Partners />

        {/* AdSense: Home Footer Banner */}
        <div className="max-w-7xl mx-auto px-4 mb-20">
           <AdBanner slot="home_footer_banner" />
        </div>
      </main>
      <Footer />
    </>
  );
}
