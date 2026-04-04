import Link from "next/link";
import { Check, Calendar, FileSpreadsheet, Mail, Database } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { AdBanner } from "@/components/ui/AdBanner";
import { Metadata } from "next";

// SEO Metadata
export const metadata: Metadata = {
  title: "Automatización con Google Apps Script y Eficiencia Operativa | Tecnonets",
  description: "Especialistas en automatización de procesos empresariales con Google Apps Script, Sheets y Gmail. Ahorra tiempo y optimiza tu negocio.",
  keywords: "Google Apps Script, automatización de procesos, Google Sheets automatización, optimizar negocio, eficiencia operativa",
  openGraph: {
    title: "Automatización con Google Apps Script | Tecnonets",
    description: "Automatización de procesos empresariales con Google Workspace.",
    type: "website",
    siteName: "Tecnonets",
  }
};

// JSON-LD Service Schema
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Automatización de Procesos con Google Workspace",
  "description": "Servicios de automatización empresarial utilizando Google Apps Script, Sheets, Gmail y Calendar",
  "provider": {
    "@type": "Organization",
    "name": "Tecnonets",
    "url": "https://tecnonets.com"
  },
  "areaServed": "Colombia",
  "serviceType": "Automatización de Procesos"
};

export default function AutomationPage() {
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
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <Badge variant="secondary" className="mb-4">Experiencia en Google Apps Script</Badge>
              <h1 className="text-4xl md:text-6xl font-bold font-heading text-foreground leading-tight">
                Eficiencia Operativa con <span className="text-green-500">Google Workspace</span>
              </h1>
              <p className="text-lg text-foreground/70 font-medium leading-relaxed">
                Maximizamos la productividad empresarial mediante la automatización de procesos. Integramos hojas de cálculo, gestión de correos y calendarios en un ecosistema unificado.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/contacto?servicio=Consultoría" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 shadow-green-900/20 gap-2">
                        <Calendar className="w-5 h-5" /> Agendar Consultoría
                    </Button>
                </Link>
                <Link href="#casos-de-uso" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full">Ver Ejemplos</Button>
                </Link>
              </div>
            </div>
            
            <div className="flex-1 relative">
              {/* Visual representation of automation */}
              <div className="relative z-10 grid grid-cols-2 gap-4">
                <div className="p-6 bg-card border border-border/50 rounded-2xl backdrop-blur-xl translate-y-8">
                  <FileSpreadsheet className="w-10 h-10 text-green-500 mb-4" />
                  <h3 className="font-bold text-foreground mb-2">Google Sheets</h3>
                  <p className="text-sm text-foreground/60 font-medium">Dashboards y gestión de datos automatizada.</p>
                </div>
                <div className="p-6 bg-card border border-border/50 rounded-2xl backdrop-blur-xl">
                  <Mail className="w-10 h-10 text-red-500 mb-4" />
                  <h3 className="font-bold text-foreground mb-2">Gmail</h3>
                  <p className="text-sm text-foreground/60 font-medium">Envío masivo y filtrado inteligente de correos.</p>
                </div>
                <div className="p-6 bg-card border border-border/50 rounded-2xl backdrop-blur-xl translate-y-8">
                  <Calendar className="w-10 h-10 text-blue-500 mb-4" />
                  <h3 className="font-bold text-foreground mb-2">Calendar</h3>
                  <p className="text-sm text-foreground/60 font-medium">Gestión de eventos y recordatorios automáticos.</p>
                </div>
                <div className="p-6 bg-card border border-border/50 rounded-2xl backdrop-blur-xl">
                  <Database className="w-10 h-10 text-yellow-500 mb-4" />
                  <h3 className="font-bold text-foreground mb-2">Base de Datos (Sheets)</h3>
                  <p className="text-sm text-foreground/60 font-medium">Google Sheets como motor de datos centralizado y accesible.</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-green-500/20 blur-[120px] rounded-full z-0" />
            </div>
          </div>
        </Section>

        {/* AdSense: Header Bottom */}
        <div className="max-w-7xl mx-auto px-4 -mt-10 mb-10">
           <AdBanner slot="services_auto_header_bottom" />
        </div>

        {/* Examples Section */}
        <Section id="casos-de-uso" className="bg-foreground/[0.02]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold font-heading text-foreground mb-4">Ejemplos de Automatización</h2>
              <p className="text-foreground/60 font-medium">Soluciones reales que implementamos para optimizar tu negocio.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Correos Automáticos",
                  description: "Envío programado y masivo de correos personalizados directamente desde tus hojas de datos.",
                  icon: "📧"
                },
                {
                  title: "Respuestas de Formularios",
                  description: "Automatiza acciones inmediatas (emails, alertas, registros) en cuanto un cliente llena tu formulario.",
                  icon: "📝"
                },
                {
                  title: "Gestión de Calendario",
                  description: "Creación automática de eventos y recordatorios sincronizados con tu flujo de trabajo de Google.",
                  icon: "📅"
                },
                {
                  title: "Plantillas HTML Premium",
                  description: "Correos con diseño profesional y personalizado (HTML) para una imagen de marca impecable.",
                  icon: "🎨"
                },
                {
                  title: "Web Apps con AppScript",
                  description: "Micro-aplicaciones web funcionales integradas totalmente con tu ecosistema de Google Sheets.",
                  icon: "🚀"
                },
                {
                  title: "Landing Pages de Venta",
                  description: "Páginas de aterrizaje optimizadas para convertir visitantes en clientes de manera efectiva.",
                  icon: "🎯"
                }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-card border border-border/50 rounded-2xl hover:border-primary/30 transition-all hover:-translate-y-1">
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-foreground/60 font-medium leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* AdSense: Bottom Services */}
        <div className="max-w-3xl mx-auto px-4 mb-20">
           <AdBanner slot="services_auto_footer" format="fluid" />
        </div>
      </main>
      <Footer />
    </>
  );
}
