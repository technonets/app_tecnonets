import { Link } from "@/i18n/routing";
import { ArrowRight, Grid, Monitor, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AdBanner } from "@/components/ui/AdBanner";
import { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";

// SEO Metadata
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Services");
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
      url: `https://tecnonets.com/${locale}/servicios`
    }
  };
}

export default async function ServicesPage() {
  const t = await getTranslations("Services");
  const locale = await getLocale();

  const servicesList = [
    {
      title: t("automation_title"),
      description: t("automation_desc"),
      icon: Grid,
      href: "/servicios/automatizacion",
      color: "text-green-400",
      bg: "bg-green-500/20",
      features: t.raw("automation_features")
    },
    {
      title: t("web_title"),
      description: t("web_desc"),
      icon: Monitor,
      href: "/servicios/desarrollo-web",
      color: "text-violet-400",
      bg: "bg-violet-500/20",
      features: t.raw("web_features")
    }
  ];

  // JSON-LD para servicios
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": t("title"),
    "itemListElement": servicesList.map((service, index) => ({
      "@type": "Service",
      "position": index + 1,
      "name": service.title,
      "description": service.description,
      "provider": { "@type": "Organization", "name": "Tecnonets" },
      "url": `https://tecnonets.com/${locale}${service.href}`
    }))
  };

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
              <h1 className="text-4xl font-bold font-heading text-foreground mb-6">{t("page_title")}</h1>
              <p className="text-foreground/60 text-lg mb-8 font-medium">
                {t("page_subtitle")}
              </p>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mb-12">
             <AdBanner slot="services_main_top" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {servicesList.map((service) => (
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
                    {service.features.map((feature: string) => (
                      <li key={feature} className="flex items-center gap-3 text-foreground/70 font-medium">
                        <CheckCircle className={`w-5 h-5 ${service.color}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all font-bold">
                    {t("view_details")} <ArrowRight className="w-4 h-4 ml-2" />
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
