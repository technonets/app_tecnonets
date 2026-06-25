import { Link } from "@/i18n/routing";
import { Film, Video, Eye, Smartphone, Tv, Sparkles, Send, Settings, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { AdBanner } from "@/components/ui/AdBanner";
import { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { TikTokEmbed } from "@/components/ui/TikTokEmbed";

// SEO Metadata
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("VideoEditing");
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
      url: `https://tecnonets.com/${locale}/servicios/edicion-video`
    }
  };
}

export default async function VideoEditingPage() {
  const t = await getTranslations("VideoEditing");
  const locale = await getLocale();

  // JSON-LD Service Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": t("title"),
    "description": t("meta_description"),
    "provider": {
      "@type": "Organization",
      "name": "Tecnonets",
      "url": "https://tecnonets.com"
    },
    "areaServed": "Colombia",
    "serviceType": "Video Editing Services"
  };

  // Enlaces de videos del portafolio
  const portfolioVideos = [
    "https://www.tiktok.com/@tecnonetsoluciones/video/7616163335620381973",
    "https://www.tiktok.com/@tecnonetsoluciones/video/7616082611328388373",
    "https://www.tiktok.com/@conscientes88/video/7618265068945394964",
    "https://www.tiktok.com/@alexascleaningservices/video/7260980825682906373",
    "https://www.tiktok.com/@alexascleaningservices/video/7258368591345569030",
    "https://www.youtube.com/shorts/IX4gAJkP7jc"
  ];



  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-grow pt-20">
        
        {/* Hero Section */}
        <Section className="bg-gradient-to-b from-primary/5 to-background overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-12 max-w-7xl mx-auto">
            <div className="flex-1 space-y-6 text-left">
              <Badge variant="secondary" className="mb-4">{t("badge")}</Badge>
              <h1 className="text-4xl md:text-6xl font-bold font-heading text-foreground leading-tight">
                {t("title")}
              </h1>
              <p className="text-lg text-foreground/70 font-medium leading-relaxed">
                {t("subtitle")}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a href="#portafolio" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-rose-600 hover:bg-rose-700 shadow-rose-900/20 gap-2">
                    <Eye className="w-5 h-5" /> {t("portfolio_title")}
                  </Button>
                </a>
              </div>
            </div>

            {/* Ilustración de Video / Grid Visual */}
            <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
              <div className="relative z-10 grid grid-cols-2 gap-4">
                <div className="p-6 bg-card border border-border/50 rounded-2xl backdrop-blur-xl translate-y-8 flex flex-col justify-between">
                  <Smartphone className="w-10 h-10 text-rose-500 mb-4" />
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{t("video_format_vertical")}</h3>
                    <p className="text-xs text-foreground/60 font-medium">{t("video_format_vertical_desc")}</p>
                  </div>
                </div>
                <div className="p-6 bg-card border border-border/50 rounded-2xl backdrop-blur-xl flex flex-col justify-between">
                  <Tv className="w-10 h-10 text-blue-500 mb-4" />
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{t("video_format_horizontal")}</h3>
                    <p className="text-xs text-foreground/60 font-medium">{t("video_format_horizontal_desc")}</p>
                  </div>
                </div>
                <div className="p-6 bg-card border border-border/50 rounded-2xl backdrop-blur-xl translate-y-8 flex flex-col justify-between">
                  <Settings className="w-10 h-10 text-purple-500 mb-4" />
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{t("software_tools")}</h3>
                    <p className="text-xs text-foreground/60 font-medium">{t("software_tools_desc")}</p>
                  </div>
                </div>
                <div className="p-6 bg-card border border-border/50 rounded-2xl backdrop-blur-xl flex flex-col justify-between">
                  <Sparkles className="w-10 h-10 text-amber-500 mb-4" />
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{t("ia_title")}</h3>
                    <p className="text-xs text-foreground/60 font-medium">{t("ia_desc")}</p>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-rose-500/10 blur-[120px] rounded-full z-0" />
            </div>
          </div>
        </Section>

        {/* AdSense: Hero Bottom Banner */}
        <div className="max-w-7xl mx-auto px-4 -mt-10 mb-10">
          <AdBanner slot="services_video_header_bottom" />
        </div>

        {/* Portafolio Section */}
        <Section id="portafolio" className="bg-foreground/[0.01] border-y border-border/20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-4">
                {t("portfolio_title")}
              </h2>
              <p className="text-foreground/60 font-medium text-lg">
                {t("portfolio_subtitle")}
              </p>
            </div>
            
            {/* Contenedor flexible de Videos (TikTokEmbed maneja su ancho máximo de forma responsiva) */}
            <div className="flex flex-wrap gap-8 justify-center">
              {portfolioVideos.map((url, index) => (
                <div key={index} className="w-full sm:w-[325px] flex justify-center">
                  <TikTokEmbed postUrl={url} />
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* AdSense: Mid-Page Banner */}
        <div className="max-w-7xl mx-auto px-4 my-10">
          <AdBanner slot="services_video_mid" />
        </div>

        {/* How It Works Section */}
        <Section className="bg-background">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold font-heading text-foreground mb-4">
                {t("how_it_works_title")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center p-6 bg-card border border-border/40 rounded-2xl">
                <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-6">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{t("step_1_title")}</h3>
                <p className="text-sm text-foreground/60 font-medium leading-relaxed">
                  {t("step_1_desc")}
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center p-6 bg-card border border-border/40 rounded-2xl">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-6">
                  <Film className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{t("step_2_title")}</h3>
                <p className="text-sm text-foreground/60 font-medium leading-relaxed">
                  {t("step_2_desc")}
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center p-6 bg-card border border-border/40 rounded-2xl">
                <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{t("step_3_title")}</h3>
                <p className="text-sm text-foreground/60 font-medium leading-relaxed">
                  {t("step_3_desc")}
                </p>
              </div>
            </div>
          </div>
        </Section>


        {/* AdSense: Bottom Page Banner */}
        <div className="max-w-3xl mx-auto px-4 mb-20">
          <AdBanner slot="services_video_footer" format="fluid" />
        </div>
      </main>
      <Footer />
    </>
  );
}
