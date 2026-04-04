import { Metadata } from 'next';
import { getTranslations, getLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Section } from "@/components/ui/Section";
import { Shield, Lock, Eye, Database, UserCheck, Mail } from "lucide-react";
import { Link } from "@/i18n/routing";

// SEO Metadata
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Privacy");
  
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations("Privacy");
  const locale = await getLocale();
  
  const richTextConfig = {
    primary: (chunks: React.ReactNode) => <span className="text-primary italic">{chunks}</span>,
    bold: (chunks: React.ReactNode) => <span className="text-primary font-bold">{chunks}</span>,
    link: (chunks: React.ReactNode) => (
      <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">
        {chunks}
      </a>
    ),
    contact_link: (chunks: React.ReactNode) => (
      <Link href="/contacto" className="text-primary hover:underline font-bold">
        {chunks}
      </Link>
    )
  };

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24 pb-20">
        <Section>
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6 shadow-xl">
                < Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-heading text-foreground mb-4">
                {t.rich("title", {
                  primary: (chunks) => <span className="text-primary italic">{chunks}</span>
                })}
              </h1>
              <p className="text-muted-foreground font-bold">
                {t("update", { date: new Date().toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) })}
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-slate dark:prose-invert prose-lg max-w-none space-y-12">
              
              {/* Introduction */}
              <div className="bg-card border border-card-border rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-card-foreground mb-4 flex items-center gap-3">
                  <Eye className="w-6 h-6 text-primary" />
                  {t("intro_title")}
                </h2>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  {t.rich("intro_text", richTextConfig)}
                </p>
              </div>

              {/* Data Collection */}
              <div className="bg-card border border-card-border rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-card-foreground mb-4 flex items-center gap-3">
                  <Database className="w-6 h-6 text-primary" />
                  {t("coll_title")}
                </h2>
                <div className="space-y-4 text-muted-foreground font-medium">
                  <div>
                    <h3 className="text-lg font-bold text-card-foreground mb-2">{t("coll_contact_title")}</h3>
                    <p className="leading-relaxed">{t("coll_contact_desc")}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-card-foreground mb-2">{t("coll_payment_title")}</h3>
                    <p className="leading-relaxed">{t("coll_payment_desc")}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-card-foreground mb-2">{t("coll_usage_title")}</h3>
                    <p className="leading-relaxed">{t("coll_usage_desc")}</p>
                  </div>
                </div>
              </div>

              {/* How we use information */}
              <div className="bg-card border border-card-border rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-card-foreground mb-4 flex items-center gap-3">
                  <UserCheck className="w-6 h-6 text-primary" />
                  {t("usage_title")}
                </h2>
                <ul className="space-y-3 text-muted-foreground font-medium">
                  {(t.raw("usage_items") as string[]).map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-primary mt-1 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Data Protection */}
              <div className="bg-card border border-card-border rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-card-foreground mb-4 flex items-center gap-3">
                  <Lock className="w-6 h-6 text-primary" />
                  {t("prot_title")}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4 font-medium">
                  {t("prot_intro")}
                </p>
                <ul className="space-y-3 text-muted-foreground font-medium">
                   {(t.raw("prot_items") as string[]).map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-primary mt-1 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cookies & AdSense */}
              <div className="bg-card border border-card-border rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-card-foreground mb-4">{t("cookies_title")}</h2>
                <div className="text-muted-foreground leading-relaxed mb-4 font-medium space-y-4">
                  <p>{t("cookies_intro")}</p>
                  <ul className="space-y-3">
                    {(t.raw("cookies_items") as string[]).map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-primary mt-1 font-bold">•</span>
                        <span>
                          {i === 2 ? t.rich(`cookies_items.${i}`, richTextConfig) : item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 pt-4 border-t border-card-border">
                  <p className="text-sm text-muted-foreground font-bold">
                    {t.rich("cookies_extra", {
                      strong: (chunks) => <strong>{chunks}</strong>
                    })}
                  </p>
                </div>
              </div>

              {/* Rights */}
              <div className="bg-card border border-card-border rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-card-foreground mb-4">{t("rights_title")}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4 font-medium">
                  {t("rights_intro")}
                </p>
                <ul className="space-y-3 text-muted-foreground font-medium">
                  {(t.raw("rights_items") as string[]).map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-primary mt-1 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Mail className="w-6 h-6 text-primary" />
                  {t("contact_title")}
                </h2>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  {t.rich("contact_text", {
                    link: (chunks) => <Link href="/contacto" className="text-primary hover:underline font-bold">{chunks}</ Link>
                  })}
                </p>
              </div>

            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
