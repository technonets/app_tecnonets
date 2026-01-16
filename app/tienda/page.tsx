import { Section } from "@/components/ui/Section";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StoreGrid } from "@/components/store/StoreGrid";
import { getProducts } from "@/lib/products";
import { AdBanner } from "@/components/ui/AdBanner";

// This is a Server Component (no 'use client')
export default async function StorePage() {
  // Fetch data on the server
  const products = await getProducts();

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-32">
        <Section className="bg-background">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
            {/* Main Content: 9 columns (Product List) */}
            <div className="lg:col-span-9">
              {/* Top Banner - Subtle */}
              <div className="mb-12">
                 <AdBanner slot="store_top_banner" />
              </div>

              <StoreGrid initialProducts={products} />
              
              {/* Bottom horizontal banner */}
              <div className="mt-16">
                <AdBanner slot="store_bottom_banner" />
              </div>
            </div>

            {/* Sidebar Column: 3 columns (Monetization) */}
            <aside className="lg:col-span-3 space-y-8">
               <div className="lg:sticky lg:top-32 space-y-8">
                  <div className="p-6 bg-card border border-white/5 rounded-2xl">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Patrocinado</h3>
                     </div>
                     <AdBanner slot="sidebar_fixed_1" format="rectangle" style={{ minHeight: '300px' }} />
                  </div>
                  
                  <div className="hidden lg:block p-6 bg-card border border-white/5 rounded-2xl">
                     <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Recomendado</h3>
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
