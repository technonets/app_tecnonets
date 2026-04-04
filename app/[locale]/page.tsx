import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AdBanner } from "@/components/ui/AdBanner";
import { getProducts } from "@/lib/products";
import { Hero } from "@/components/home/Hero";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { LatestProducts } from "@/components/home/LatestProducts";
import { Partners } from "@/components/home/Partners";

import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Index' });

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Index' });

  // JSON-LD Organization + WebSite + LocalBusiness para el Homepage
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://tecnonets.com/#organization",
        "name": "Tecnonets",
        "url": `https://tecnonets.com/${locale}`,
        "logo": {
          "@type": "ImageObject",
          "url": "https://tecnonets.com/logo.png"
        },
        "description": t('description'),
        "sameAs": [
          "https://wa.me/573207093764",
          "https://youtube.com/@technonets",
          "https://www.tiktok.com/@technonets"
        ]
      },
      // ... rest of graph
      {
        "@type": "WebSite",
        "@id": "https://tecnonets.com/#website",
        "url": `https://tecnonets.com/${locale}`,
        "name": "Tecnonets",
        "publisher": { "@id": "https://tecnonets.com/#organization" },
        "inLanguage": locale
      }
    ]
  };
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
