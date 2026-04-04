import Link from "next/link";
import { Layout, Smartphone, Search, Zap, Info, ShieldAlert, Code } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { AdBanner } from "@/components/ui/AdBanner";
import { ServicePlanCard } from "@/components/pricing/ServicePlanCard";
import { Metadata } from "next";

// SEO Metadata
export const metadata: Metadata = {
  title: "Diseño de Páginas Web Profesionales y Crear Página Web | Tecnonets",
  description: "Especialistas en crear páginas web profesionales: Landing Pages, sitios corporativos y tiendas virtuales. Diseño web en Colombia con todo incluido.",
  keywords: "crear página web, diseño de páginas web, páginas web profesionales, diseño web colombia, landing pages de alta conversión",
  openGraph: {
    title: "Diseño de Páginas Web Profesionales y Crear Página Web | Tecnonets",
    description: "Expertos en crear páginas web profesionales: Landing Pages y sitios corporativos todo incluido.",
    type: "website",
    siteName: "Tecnonets",
  }
};

import { CurrencySwitcher } from "@/components/ui/CurrencySwitcher";

// JSON-LD Service Schema
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Diseño de Páginas Web y Crear Página Web Profesional",
  "description": "Servicios expertos para crear páginas web profesionales con Next.js incluyendo hosting, dominio y soporte técnico",
  "provider": {
    "@type": "Organization",
    "name": "Tecnonets",
    "url": "https://tecnonets.com"
  },
  "areaServed": "Colombia",
  "serviceType": "Desarrollo Web",
  "offers": [
    {
      "@type": "Offer",
      "name": "Landing Page Pro",
      "price": "390000",
      "priceCurrency": "COP",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "390000",
        "priceCurrency": "COP",
        "billingDuration": "P1M"
      }
    },
    {
       "@type": "Offer",
       "name": "Landing Page Pro (International)",
       "price": "149",
       "priceCurrency": "USD"
    },
    {
      "@type": "Offer",
      "name": "Sitio Corporativo Plus",
      "price": "790000",
      "priceCurrency": "COP",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "790000",
        "priceCurrency": "COP",
        "billingDuration": "P1M"
      }
    },
    {
       "@type": "Offer",
       "name": "Sitio Corporativo Plus (International)",
       "price": "249",
       "priceCurrency": "USD"
    }
  ]
};

export default function WebDevPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-grow pt-20">
        {/* Main Header */}
        <Section className="bg-gradient-to-b from-primary/5 to-background">
          <div className="text-center max-w-4xl mx-auto space-y-6 text-balance">
            <Badge variant="primary">Website as a Service (WaaS)</Badge>
            <h1 className="text-4xl md:text-6xl font-bold font-heading text-foreground leading-tight">
              Diseño de Páginas Web <br/>
              <span className="text-primary">& Crear Sitios Profesionales</span>
            </h1>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto font-medium">
              Obtén una presencia web premium con todo incluido: diseño, hosting, dominio y soporte, por una cómoda mensualidad.
            </p>
          </div>
        </Section>

        {/* AdSense: Header Bottom */}
        <div className="max-w-7xl mx-auto px-4 -mt-10 mb-10 text-center">
           <AdBanner slot="services_web_header_bottom" />
        </div>

        {/* Features Grid */}
        <Section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-foreground/5 border border-border/50 hover:bg-foreground/10 transition-colors">
              <Smartphone className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-bold text-xl text-foreground mb-2">Mobile First</h3>
              <p className="text-foreground/60 text-sm font-medium">Diseñado pensando primero en la experiencia móvil, asegurando que se vea perfecto en cualquier dispositivo.</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-foreground/5 border border-border/50 hover:bg-foreground/10 transition-colors">
              <Zap className="w-10 h-10 text-yellow-500 mb-4" />
              <h3 className="font-bold text-xl text-foreground mb-2">Velocidad Extrema</h3>
              <p className="text-foreground/60 text-sm font-medium">Construido con Next.js para cargas instantáneas y una experiencia de usuario fluida.</p>
            </div>

            <div className="p-6 rounded-2xl bg-foreground/5 border border-border/50 hover:bg-foreground/10 transition-colors">
              <Layout className="w-10 h-10 text-pink-500 mb-4" />
              <h3 className="font-bold text-xl text-foreground mb-2">Diseño Premium</h3>
              <p className="text-foreground/60 text-sm font-medium">Estética moderna, animaciones suaves y una interfaz que transmite profesionalismo.</p>
            </div>

            <div className="p-6 rounded-2xl bg-foreground/5 border border-border/50 hover:bg-foreground/10 transition-colors">
              <Search className="w-10 h-10 text-blue-500 mb-4" />
              <h3 className="font-bold text-xl text-foreground mb-2">SEO Optimizado</h3>
              <p className="text-foreground/60 text-sm font-medium">Estructura semántica, metadatos y optimización técnica para posicionar en Google.</p>
            </div>
          </div>
        </Section>

        {/* Pricing / Packages */}
        <Section className="bg-foreground/[0.02]">
          <div className="flex flex-col items-center justify-center mb-16 text-center">
            <h2 className="text-3xl font-bold font-heading text-foreground mb-4">Planes Todo Incluido</h2>
            <p className="text-foreground/60 font-medium mb-8">Elige el plan que mejor se adapte a tu etapa de crecimiento.</p>
            
            {/* Currency Switcher */}
            <div className="relative">
              <CurrencySwitcher />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Landing Page */}
            <ServicePlanCard 
              title="Landing Page One-Page"
              description="Ideal para campañas publicitarias, lanzamientos de productos o captación de leads específica."
              prices={{
                setup: { COP: "$390.000", USD: "$149" },
                monthly: { COP: "$99.000", USD: "$39" }
              }}
              ctaLink="/contacto?servicio=Plan%20Landing%20Page"
              setupFeatures={[
                "Diseño personalizado (High-Conversion)",
                "Arquitectura web pensada para crecimiento SEO",
                "Estructura optimizada para anuncios",
                "Landing page one-page (Responsive)",
                "Formulario integrado + WhatsApp",
                "Configuración de Google Analytics",
                "Configuración de Google Search Console",
                "Certificado SSL y seguridad",
                "Implementación técnica completa"
              ]}
              monthlyFeatures={[
                "Hosting administrado alta velocidad",
                "Soporte técnico prioritario",
                "Soporte ante caídas o errores",
                "Monitoreo de uptime (Estabilidad)",
                "1 cambio menor mensual (texto o imagen, no rediseños)",
                "Mantenimiento técnico general"
              ]}
              notIncluded={[
                "Gestión de campañas publicitarias",
                "Rediseños completos",
                "Cambios ilimitados",
                "Creación de contenido o copies",
                "SEO avanzado"
              ]}
              expectedOutcome="Una landing rápida, estable y optimizada para convertir tráfico en contactos o ventas, sin que te preocupes por lo técnico."
            />

            {/* Corporate Site */}
            <ServicePlanCard 
              isPopular={true}
              title="Sitio Corporativo Plus"
              description="Presencia digital profesional para empresas que buscan autoridad, confianza y base SEO sólida."
              prices={{
                setup: { COP: "$790.000", USD: "$249" },
                monthly: { COP: "$169.000", USD: "$59" }
              }}
              ctaLink="/contacto?servicio=Plan%20Corporativo"
              setupFeatures={[
                "Estructura corporativa de hasta 5 secciones",
                "Diseño corporativo premium (Responsive)",
                "Blog / Noticias (Estructura de blog)",
                "Arquitectura web pensada para crecimiento SEO",
                "Configuración de Google Analytics",
                "Configuración de Google Search Console",
                "Optimización SEO",
                "Certificado SSL y seguridad"
              ]}
              monthlyFeatures={[
                "Hosting empresarial administrado",
                "Soporte técnico prioritario",
                "Soporte ante caídas o errores",
                "Monitoreo de uptime (Estabilidad)",
                "Actualizaciones de seguridad",
                "2 cambios menores mensuales (texto o imagen, no nuevas secciones ni rediseños)"
              ]}
              notIncluded={[
                "Redacción de artículos de blog",
                "Fotografía o video profesional",
                "E-commerce avanzado",
                "Integraciones API complejas",
                "Estrategia SEO o link building"
              ]}
              expectedOutcome="Un sitio web corporativo sólido que proyecta confianza, organiza la información de tu empresa y sirve como base técnica para tu estrategia de posicionamiento orgánico."
            />

          </div>

          <div className="mt-16 text-center max-w-2xl mx-auto">
             <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 backdrop-blur-sm">
                <Code className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-3">¿Prefieres ser dueño total del código?</h3>
                <p className="text-foreground/70 text-sm leading-relaxed mb-6 font-medium">
                   Aunque nuestro modelo WaaS es de suscripción, ofrecemos la posibilidad de <strong>comprar el código fuente</strong> si en el futuro decides tener control total y migrar a tu propio servidor.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 border border-border/50 text-xs text-foreground/70">
                   <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                   El precio se cotiza de acuerdo al tipo de sitio solicitado.
                </div>
             </div>
          </div>
        </Section>


        {/* Important Information Terms */}
        <Section className="py-12">
           <div className="max-w-4xl mx-auto bg-card border border-primary/20 rounded-2xl p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <ShieldAlert className="w-64 h-64" />
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                 <Info className="w-6 h-6 text-primary" /> Información Importante del Servicio
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-foreground/70 font-medium relative z-10">
                 <ul className="space-y-4">
                    <li className="flex gap-3">
                       <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span>
                       <span>
                         <strong>Servicio de Suscripción:</strong> 
                         El sitio web funciona y está online únicamente mientras el plan mensual esté activo y al día.
                       </span>
                    </li>
                    <li className="flex gap-3">
                       <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span>
                       <span>
                         <strong>Propiedad del Código:</strong> 
                         No entregamos código fuente bajo este modelo. La infraestructura técnica pertenece a Tecnonets, tú pagas por el derecho de uso.
                       </span>
                    </li>
                    <li className="flex gap-3">
                       <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                       <span>
                         <strong>Compra del Código (Buyout):</strong> 
                         Si en el futuro deseas migrar a tu propio hosting y tener control total, podrás pagar un fee de liberación que se cotizará según la complejidad de tu sitio.
                       </span>
                    </li>
                 </ul>

                 <ul className="space-y-4">
                    <li className="flex gap-3">
                       <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                       <span>
                         <strong>Dominio Incluido:</strong> 
                         La renovación anual del dominio (.com) está incluida siempre que mantengas tu suscripción mensual activa.
                       </span>
                    </li>
                    <li className="flex gap-3">
                       <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                       <span>
                         <strong>Cambios Mensuales:</strong> 
                         Incluye cambios menores (textos, imágenes, o precios). No incluye desarrollo de nuevas funcionalidades o rediseños estructurales (se cotizan aparte).
                       </span>
                    </li>
                    <li className="flex gap-3">
                       <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                       <span>
                         <strong>Soporte Técnico:</strong> 
                         Garantizamos que tu sitio esté siempre 100% operativo, seguro y rápido ante cualquier falla del servidor.
                       </span>
                    </li>
                 </ul>
              </div>
           </div>
        </Section>


        {/* AdSense: Bottom Services */}
        <div className="max-w-3xl mx-auto px-4 mt-8 mb-20">
           <AdBanner slot="services_web_footer" format="fluid" />
        </div>
      </main>
      <Footer />
    </>
  );
}
