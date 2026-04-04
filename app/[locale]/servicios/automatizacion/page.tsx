import { Link } from "@/i18n/routing";
import { Check, Calendar, FileSpreadsheet, Mail, Database } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { AdBanner } from "@/components/ui/AdBanner";
import { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";

// SEO Metadata
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Automation");
  const locale = await getLocale();
  
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    keywords: t("meta_keywords"),
    openGraph: {
      title: t("meta_title"),
      description: t("meta_description"),
      type: "website",
      siteName: "Tecnonets",
      url: `https://tecnonets.com/${locale}/servicios/automatizacion`
    }
  };
}

export default async function AutomationPage() {
  const t = await getTranslations("Automation");
  const locale = await getLocale();

  // JSON-LD Service Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": t("title").replace(/<[^>]*>?/gm, ''), // Stripping tags for JSON
    "description": t("meta_description"),
    "provider": {
      "@type": "Organization",
      "name": "Tecnonets",
      "url": "https://tecnonets.com"
    },
    "areaServed": "Colombia",
    "serviceType": "Process Automation"
  };

  const cases = t.raw("cases");

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
              <Badge variant="secondary" className="mb-4">{t("badge")}</Badge>
              <h1 className="text-4xl md:text-6xl font-bold font-heading text-foreground leading-tight">
                {t.rich("title", {
                  green: (chunks) => <span className="text-green-500">{chunks}</span>
                })}
              </h1>
              <p className="text-lg text-foreground/70 font-medium leading-relaxed">
                {t("subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/contacto?servicio=Consultoría" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 shadow-green-900/20 gap-2">
                        <Calendar className="w-5 h-5" /> {t("cta_consult")}
                    </Button>
                </Link>
                <Link href="#casos-de-uso" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full">{t("cta_examples")}</Button>
                </Link>
              </div>
            </div>
            
            <div className="flex-1 relative">
              {/* Visual representation of automation */}
              <div className="relative z-10 grid grid-cols-2 gap-4">
                <div className="p-6 bg-card border border-border/50 rounded-2xl backdrop-blur-xl translate-y-8">
                  <FileSpreadsheet className="w-10 h-10 text-green-500 mb-4" />
                  <h3 className="font-bold text-foreground mb-2">{t("sheets_title")}</h3>
                  <p className="text-sm text-foreground/60 font-medium">{t("sheets_desc")}</p>
                </div>
                <div className="p-6 bg-card border border-border/50 rounded-2xl backdrop-blur-xl">
                  <Mail className="w-10 h-10 text-red-500 mb-4" />
                  <h3 className="font-bold text-foreground mb-2">{t("gmail_title")}</h3>
                  <p className="text-sm text-foreground/60 font-medium">{t("gmail_desc")}</p>
                </div>
                <div className="p-6 bg-card border border-border/50 rounded-2xl backdrop-blur-xl translate-y-8">
                  <Calendar className="w-10 h-10 text-blue-500 mb-4" />
                  <h3 className="font-bold text-foreground mb-2">{t("calendar_title")}</h3>
                  <p className="text-sm text-foreground/60 font-medium">{t("calendar_desc")}</p>
                </div>
                <div className="p-6 bg-card border border-border/50 rounded-2xl backdrop-blur-xl">
                  <Database className="w-10 h-10 text-yellow-500 mb-4" />
                  <h3 className="font-bold text-foreground mb-2">{t("db_title")}</h3>
                  <p className="text-sm text-foreground/60 font-medium">{t("db_desc")}</p>
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
              <h2 className="text-3xl font-bold font-heading text-foreground mb-4">{t("examples_title")}</h2>
              <p className="text-foreground/60 font-medium">{t("examples_subtitle")}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cases.map((item: any, i: number) => (
                <div key={i} className="p-6 bg-card border border-border/50 rounded-2xl hover:border-primary/30 transition-all hover:-translate-y-1">
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-foreground/60 font-medium leading-relaxed">{item.desc}</p>
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
