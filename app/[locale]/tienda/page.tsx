import { Section } from "@/components/ui/Section";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StoreGrid } from "@/components/store/StoreGrid";
import { getProducts } from "@/lib/products";
import { AdBanner } from "@/components/ui/AdBanner";
import { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Index");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function StorePage() {
  const locale = await getLocale();
  const products = await getProducts();
  const t = await getTranslations("Navbar");
  const t_store = await getTranslations("Store");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": t("home"),
        "item": `https://tecnonets.com/${locale}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": t("store"),
        "item": `https://tecnonets.com/${locale}/tienda`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-grow pt-32">
        <Section className="bg-background">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
            <div className="lg:col-span-9">
              <div className="mb-12">
                 <AdBanner slot="store_top_banner" />
              </div>

              <StoreGrid initialProducts={products} />
              
              <div className="mt-16">
                <AdBanner slot="store_bottom_banner" />
              </div>
            </div>

            <aside className="lg:col-span-3 space-y-8">
               <div className="lg:sticky lg:top-32 space-y-8">
                  <div className="p-6 bg-card border border-card-border rounded-2xl shadow-sm">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t_store('sponsored')}</h3>
                     </div>
                     <AdBanner slot="sidebar_fixed_1" format="rectangle" style={{ minHeight: '300px' }} />
                  </div>
                  
                  <div className="hidden lg:block p-6 bg-card border border-card-border rounded-2xl shadow-sm">
                     <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">{t_store('recommended')}</h3>
                     <AdBanner slot="sidebar_fixed_2" format="rectangle" style={{ minHeight: '600px' }} />
                  </div>
               </div>
            </aside>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
