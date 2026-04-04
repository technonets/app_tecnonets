import { Metadata } from 'next';
import { getTranslations, getLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Section } from "@/components/ui/Section";
import { FileText, AlertTriangle, CreditCard, RefreshCw, Code, Ban } from "lucide-react";
import { Link } from "@/i18n/routing";

// SEO Metadata
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Terms");
  
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default async function TermsPage() {
  const t = await getTranslations("Terms");
  const locale = await getLocale();

  const richTextConfig = {
    primary: (chunks: React.ReactNode) => <span className="text-primary italic">{chunks}</span>,
    bold: (chunks: React.ReactNode) => <span className="text-primary font-bold">{chunks}</span>,
    link: (chunks: React.ReactNode) => (
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
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-heading text-foreground mb-4">
                {t.rich("title", richTextConfig)}
              </h1>
              <p className="text-muted-foreground font-bold">
                {t("update", { date: new Date().toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) })}
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-slate dark:prose-invert prose-lg max-w-none space-y-12">
              
              {/* Acceptance */}
              <div className="bg-card border border-card-border rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-card-foreground mb-4">{t("accept_title")}</h2>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  {t.rich("accept_text", richTextConfig)}
                </p>
              </div>

              {/* Services */}
              <div className="bg-card border border-card-border rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-card-foreground mb-4">{t("services_title")}</h2>
                <div className="space-y-4 text-muted-foreground font-medium">
                  <div>
                    <h3 className="text-lg font-bold text-card-foreground mb-2">{t("services_waas_title")}</h3>
                    <p className="leading-relaxed">{t("services_waas_desc")}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-card-foreground mb-2">{t("services_auto_title")}</h3>
                    <p className="leading-relaxed">{t("services_auto_desc")}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-card-foreground mb-2">{t("services_prod_title")}</h3>
                    <p className="leading-relaxed">{t("services_prod_desc")}</p>
                  </div>
                </div>
              </div>

              {/* WaaS Specific Terms */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-primary" />
                  {t("waas_terms_title")}
                </h2>
                <ul className="space-y-4 text-muted-foreground font-medium">
                  {(t.raw("waas_terms_items") as any[]).map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-primary mt-1 text-xl font-bold">•</span>
                      <div>
                        <strong className="text-foreground">{item.title}</strong> {item.desc}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Payments */}
              <div className="bg-card border border-card-border rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-card-foreground mb-4 flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-primary" />
                  {t("payments_title")}
                </h2>
                <ul className="space-y-3 text-muted-foreground font-medium">
                  {(t.raw("payments_items") as string[]).map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-primary mt-1 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cancellation */}
              <div className="bg-card border border-card-border rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-card-foreground mb-4 flex items-center gap-3">
                  <RefreshCw className="w-6 h-6 text-primary" />
                  {t("cancel_title")}
                </h2>
                <div className="space-y-4 text-muted-foreground font-medium">
                  <p className="leading-relaxed">
                    <strong className="text-card-foreground">{t("cancel_waas_title")}</strong> {t("cancel_waas_desc")}
                  </p>
                  <p className="leading-relaxed">
                    <strong className="text-card-foreground">{t("cancel_prod_title")}</strong> {t("cancel_prod_desc")}
                  </p>
                </div>
              </div>

              {/* Intellectual Property */}
              <div className="bg-card border border-card-border rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-card-foreground mb-4 flex items-center gap-3">
                  <Code className="w-6 h-6 text-primary" />
                  {t("intel_title")}
                </h2>
                <ul className="space-y-3 text-muted-foreground font-medium">
                  {(t.raw("intel_items") as string[]).map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-primary mt-1 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Liability */}
              <div className="bg-card border border-card-border rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-card-foreground mb-4 flex items-center gap-3">
                  <Ban className="w-6 h-6 text-primary" />
                  {t("limit_title")}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4 font-medium">
                  {t("limit_intro")}
                </p>
                <ul className="space-y-3 text-muted-foreground font-medium">
                   {(t.raw("limit_items") as string[]).map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-primary mt-1 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Advertising */}
              <div className="bg-card border border-card-border rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-card-foreground mb-4 flex items-center gap-3">
                  <span className="text-primary text-2xl">📢</span>
                  {t("ads_title")}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4 font-medium">
                  {t("ads_text")}
                </p>
                <ul className="space-y-3 text-muted-foreground font-medium">
                  {(t.raw("ads_items") as any[]).map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-primary mt-1 font-bold">•</span>
                      <span><strong className="text-card-foreground">{item.title}</strong> {item.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Modifications */}
              <div className="bg-card border border-card-border rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-card-foreground mb-4">{t("mod_title")}</h2>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  {t("mod_text")}
                </p>
              </div>

              {/* Contact */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-foreground mb-4">{t("contact_title")}</h2>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  {t.rich("contact_text", richTextConfig)}
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
