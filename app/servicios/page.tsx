import Link from "next/link";
import { ArrowRight, Grid, Monitor, Code, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AdBanner } from "@/components/ui/AdBanner";
import { Metadata } from "next";

// SEO Metadata
export const metadata: Metadata = {
  title: "Servicios de Desarrollo Web y Automatización | Tecnonets",
  description: "Servicios profesionales de automatización con Google Apps Script, desarrollo web con Next.js, Landing Pages y sitios corporativos. Optimiza tu negocio.",
  keywords: "automatización, Google Apps Script, desarrollo web, Next.js, landing pages, sitios web, Colombia",
  openGraph: {
    title: "Servicios de Desarrollo Web y Automatización | Tecnonets",
    description: "Servicios profesionales de automatización con Google Apps Script y desarrollo web con Next.js.",
    type: "website",
    siteName: "Tecnonets",
  }
};

const services = [
  {
    title: "Automatización de Procesos",
    description: "Conecta tus herramientas favoritas (Gmail, Sheets, Calendar) para trabajar por ti.",
    icon: Grid,
    href: "/servicios/automatizacion",
    color: "text-green-400",
    bg: "bg-green-500/20",
    features: ["Google Sheets Avanzado", "Google Apps Script", "Integraciones API", "Dashboards Automáticos"]
  },
  {
    title: "Desarrollo Web Profesional",
    description: "Sitios web rápidos, modernos y optimizados para vender.",
    icon: Monitor,
    href: "/servicios/desarrollo-web",
    color: "text-violet-400",
    bg: "bg-violet-500/20",
    features: ["Landing Pages", "Next.js Applications", "Mobile First Design", "SEO Optimizado"]
  }
];

// JSON-LD para servicios
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Servicios Tecnonets",
  "itemListElement": [
    {
      "@type": "Service",
      "position": 1,
      "name": "Automatización de Procesos",
      "description": "Automatización con Google Apps Script, Sheets, Gmail y Calendar",
      "provider": { "@type": "Organization", "name": "Tecnonets" },
      "url": "https://tecnonets.com/servicios/automatizacion"
    },
    {
      "@type": "Service",
      "position": 2,
      "name": "Desarrollo Web Profesional",
      "description": "Sitios web con Next.js, Landing Pages y sitios corporativos",
      "provider": { "@type": "Organization", "name": "Tecnonets" },
      "url": "https://tecnonets.com/servicios/desarrollo-web"
    }
  ]
};

export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-grow pt-24">
        <Section className="bg-background">
          <div className="text-center">
            <div>
              <h1 className="text-4xl font-bold font-heading text-foreground mb-6">Hablemos de tu Proyecto</h1>
              <p className="text-foreground/60 text-lg mb-8 font-medium">
                ¿Tienes una idea en mente? Cuéntanos sobre tus necesidades de automatización o desarrollo web.
              </p>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mb-12">
             <AdBanner slot="services_main_top" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {services.map((service) => (
              <Link key={service.title} href={service.href} className="group">
                <Card className="h-full hover:border-primary/50 transition-all duration-300">
                  <div className={`w-16 h-16 rounded-2xl ${service.bg} flex items-center justify-center mb-8 ${service.color} group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className="w-8 h-8" />
                  </div>
                  
                  <CardTitle className="text-2xl mb-4">{service.title}</CardTitle>
                  <CardDescription className="mb-8 text-base text-foreground/60">
                    {service.description}
                  </CardDescription>

                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-foreground/70 font-medium">
                        <CheckCircle className={`w-5 h-5 ${service.color}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all font-bold">
                    Ver Detalles <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              </Link>
            ))}
          </div>

          <div className="max-w-3xl mx-auto mt-16">
             <AdBanner slot="services_main_bottom" format="fluid" />
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
