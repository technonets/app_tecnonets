import { Link } from "@/i18n/routing";
import { Layout, Smartphone, Search, Zap, Info, ShieldAlert, Code } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { AdBanner } from "@/components/ui/AdBanner";
import { ServicePlanCard } from "@/components/pricing/ServicePlanCard";
import { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { CurrencySwitcher } from "@/components/ui/CurrencySwitcher";

// SEO Metadata
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("WebDev");
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
      url: `https://tecnonets.com/${locale}/servicios/desarrollo-web`
    }
  };
}

export default async function WebDevPage() {
  const t = await getTranslations("WebDev");
  const s = await getTranslations("Store");
  const locale = await getLocale();

  // JSON-LD Service Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": t("title").replace(/<[^>]*>?/gm, ''),
    "description": t("meta_description"),
    "provider": {
      "@type": "Organization",
      "name": "Tecnonets",
      "url": "https://tecnonets.com"
    },
    "areaServed": "Colombia",
    "serviceType": "Web Development",
    "offers": [
      {
        "@type": "Offer",
        "name": "Landing Page Pro",
        "price": "390000",
        "priceCurrency": "COP"
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
        "priceCurrency": "COP"
      },
      {
         "@type": "Offer",
         "name": "Sitio Corporativo Plus (International)",
         "price": "249",
         "priceCurrency": "USD"
      }
    ]
  };

  const infoItems = t.raw("info_items");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-grow pt-20">
        {/* Main Header */}
        <Section className="bg-gradient-to-b from-primary/5 to-background text-center">
          <div className="max-w-4xl mx-auto space-y-6 text-balance">
            <Badge variant="primary">{t("badge")}</Badge>
            <h1 className="text-4xl md:text-6xl font-bold font-heading text-foreground leading-tight">
              {t.rich("title", {
                br: () => <br />,
                primary: (chunks) => <span className="text-primary">{chunks}</span>
              })}
            </h1>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto font-medium">
              {t("subtitle")}
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
              <h3 className="font-bold text-xl text-foreground mb-2">{t("feature_1_title")}</h3>
              <p className="text-foreground/60 text-sm font-medium">{t("feature_1_desc")}</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-foreground/5 border border-border/50 hover:bg-foreground/10 transition-colors">
              <Zap className="w-10 h-10 text-yellow-500 mb-4" />
              <h3 className="font-bold text-xl text-foreground mb-2">{t("feature_2_title")}</h3>
              <p className="text-foreground/60 text-sm font-medium">{t("feature_2_desc")}</p>
            </div>

            <div className="p-6 rounded-2xl bg-foreground/5 border border-border/50 hover:bg-foreground/10 transition-colors">
              <Layout className="w-10 h-10 text-pink-500 mb-4" />
              <h3 className="font-bold text-xl text-foreground mb-2">{t("feature_3_title")}</h3>
              <p className="text-foreground/60 text-sm font-medium">{t("feature_3_desc")}</p>
            </div>

            <div className="p-6 rounded-2xl bg-foreground/5 border border-border/50 hover:bg-foreground/10 transition-colors">
              <Search className="w-10 h-10 text-blue-500 mb-4" />
              <h3 className="font-bold text-xl text-foreground mb-2">{t("feature_4_title")}</h3>
              <p className="text-foreground/60 text-sm font-medium">{t("feature_4_desc")}</p>
            </div>
          </div>
        </Section>

        {/* Pricing / Packages */}
        <Section className="bg-foreground/[0.02]">
          <div className="flex flex-col items-center justify-center mb-16 text-center">
            <h2 className="text-3xl font-bold font-heading text-foreground mb-4">{t("pricing_title")}</h2>
            <p className="text-foreground/60 font-medium mb-8">{t("pricing_subtitle")}</p>
            
            {/* Currency Switcher */}
            <div className="relative">
              <CurrencySwitcher />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Landing Page */}
            <ServicePlanCard 
              title={t("plans.landing.title")}
              description={t("plans.landing.desc")}
              prices={{
                setup: { COP: "$390.000", USD: "$149" },
                monthly: { COP: "$99.000", USD: "$39" }
              }}
              ctaLink="/contacto?servicio=Plan%20Landing%20Page"
              setupFeatures={t.raw("plans.landing.setup_features")}
              monthlyFeatures={t.raw("plans.landing.monthly_features")}
              notIncluded={t.raw("plans.landing.not_included")}
              expectedOutcome={t("plans.landing.outcome")}
            />

            {/* Corporate Site */}
            <ServicePlanCard 
              isPopular={true}
              title={t("plans.corporate.title")}
              description={t("plans.corporate.desc")}
              prices={{
                setup: { COP: "$790.000", USD: "$249" },
                monthly: { COP: "$169.000", USD: "$59" }
              }}
              ctaLink="/contacto?servicio=Plan%20Corporativo"
              setupFeatures={t.raw("plans.corporate.setup_features")}
              monthlyFeatures={t.raw("plans.corporate.monthly_features")}
              notIncluded={t.raw("plans.corporate.not_included")}
              expectedOutcome={t("plans.corporate.outcome")}
            />

          </div>

          <div className="mt-16 text-center max-w-2xl mx-auto">
             <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 backdrop-blur-sm">
                <Code className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-3">{t("buyout_title")}</h3>
                <p className="text-foreground/70 text-sm leading-relaxed mb-6 font-medium">
                   {t.rich("buyout_desc", {
                     bold: (chunks) => <strong>{chunks}</strong>
                   })}
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 border border-border/50 text-xs text-foreground/70">
                   <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                   {t("buyout_note")}
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
                 <Info className="w-6 h-6 text-primary" /> {t("info_title")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-foreground/70 font-medium relative z-10">
                 <ul className="space-y-4">
                    {infoItems.slice(0, 3).map((item: any, i: number) => (
                      <li key={i} className="flex gap-3">
                        <span className={`w-1.5 h-1.5 rounded-full ${i < 2 ? 'bg-red-400' : 'bg-primary'} mt-2 shrink-0`}></span>
                        <span>
                          <strong>{item.title}:</strong> {item.desc}
                        </span>
                      </li>
                    ))}
                 </ul>

                 <ul className="space-y-4">
                    {infoItems.slice(3, 6).map((item: any, i: number) => (
                      <li key={i} className="flex gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                        <span>
                          <strong>{item.title}:</strong> {item.desc}
                        </span>
                      </li>
                    ))}
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
