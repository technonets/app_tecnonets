import { Link } from "@/i18n/routing";
import { Check, Shield, Download, Monitor, Code, MessageSquare, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { getProducts } from "@/lib/products";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/store/ProductGallery";
import { AdBanner } from "@/components/ui/AdBanner";
import { ServicePlanCard } from "@/components/pricing/ServicePlanCard";
import { ProductPromoBox } from "@/components/store/ProductPromoBox";
import { Metadata } from "next";
import { getTranslations, getLocale } from 'next-intl/server';

// SEO: Generar metadatos dinámicos para cada producto
export async function generateMetadata({ params }: { params: Promise<{ slug: string, locale: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations('Store');
  const products = await getProducts();
  const product = products.find(p => p.id === slug);

  if (!product) {
    return {
      title: "Producto No Encontrado | Tecnonets",
      description: "El producto que buscas no está disponible."
    };
  }

  const title = locale === 'en' && product.title_en ? product.title_en : product.title;
  const description = (locale === 'en' && product.description_en ? product.description_en : product.description).slice(0, 160);
  const imageUrl = product.images?.[0] || '/images/og-default.jpg';

  return {
    title: `${title} | Tienda Tecnonets`,
    description,
    keywords: [product.category, ...product.tags, 'Tecnonets', 'automatización', 'desarrollo web'].join(', '),
    openGraph: {
      title,
      description,
      type: 'website',
      images: imageUrl.startsWith('http') ? [{ url: imageUrl }] : [],
      siteName: 'Tecnonets',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl.startsWith('http') ? [imageUrl] : [],
    }
  };
}

// SEO: Generar rutas estáticas para mejor rendimiento
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({
    slug: product.id,
  }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string, locale: string }> }) {
  const resolvedParams = await params;
  const locale = await getLocale();
  const t = await getTranslations('Store');
  const products = await getProducts();
  const product = products.find(p => p.id === resolvedParams.slug);

  if (!product) {
    notFound(); 
  }

  const title = locale === 'en' && product.title_en ? product.title_en : product.title;
  const description = locale === 'en' && product.description_en ? product.description_en : product.description;

  // JSON-LD Schema para Google Rich Results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description: description,
    image: product.images?.[0] || '',
    category: product.category,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'COP',
      availability: 'https://schema.org/InStock',
      url: `https://tecnonets.com/${locale}/tienda/${product.id}`,
    },
    brand: {
      '@type': 'Brand',
      name: 'Tecnonets'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-grow pt-24">
        <Section>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Column: 8/12 on Desktop */}
            <div className="lg:col-span-8 space-y-12">
               <div>
                  <div className="flex gap-2 mb-4">
                     <Badge variant={(product.category === 'Páginas Web' || product.category === 'Landing Pages') ? 'primary' : 'secondary'}>{product.category}</Badge>
                     <Badge variant="outline">{t('template_badge')}</Badge>
                  </div>
                  
                  <h1 className="text-3xl md:text-5xl font-bold font-heading text-white mb-6">{title}</h1>
                  
                  {/* Gallery */}
                  <ProductGallery images={product.images} category={product.category} title={title} />
               </div>

               {/* Mobile/Tablet Ad: Below Gallery */}
               <div className="lg:hidden">
                  <AdBanner slot="product_mid_mobile" />
               </div>

               <div className="space-y-8">
                  <p className="text-xl text-gray-300 leading-relaxed">
                     {description}
                  </p>

                  {/* Pricing / Action Section with Live Coupon & Countdown Timer */}
                  <div className="bg-card border border-white/10 rounded-2xl p-6 sm:p-8">
                     {(product.price === 0 || !product.monthlyPrice) ? (
                        <>
                           <ProductPromoBox
                              productId={product.id}
                              price={product.price}
                              originalPrice={product.originalPrice}
                              offerEndDate={product.offerEndDate}
                              freeUntilDate={product.freeUntilDate}
                              promotionBadge={product.promotionBadge}
                              checkoutUrl={product.checkoutUrl || product.templateUrl || product.demoUrl || '#'}
                              freeLabel={t('free')}
                           />

                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
                              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                 <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                                    <Check className="w-4 h-4 text-primary" /> {t('immediate_delivery')}
                                 </h4>
                                 <p className="text-xs text-gray-400">{t('immediate_desc')}</p>
                              </div>
                              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                 <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-primary" /> {t('quality_guarantee')}
                                 </h4>
                                 <p className="text-xs text-gray-400">{t('quality_desc')}</p>
                              </div>
                           </div>
                        </>
                     ) : (product.category === 'Páginas Web' || product.category === 'Landing Pages' || product.category === 'Portafolios') ? (
                          <div className="max-w-md mx-auto md:max-w-none">
                             <ServicePlanCard 
                                description={t('waas_desc')}
                                prices={{
                                   setup: { 
                                      COP: `$${product.price ? product.price.toLocaleString() : '0'}`, 
                                      USD: `$${Math.round((product.price || 0) / 4000)}` 
                                   },
                                   monthly: { 
                                      COP: product.category === 'Landing Pages' ? '$150.000' : `$${product.monthlyPrice ? product.monthlyPrice.toLocaleString() : '0'}`, 
                                      USD: product.category === 'Landing Pages' ? '$39' : `$${Math.round((product.monthlyPrice || 0) / 4000)}` 
                                   }
                                }}
                                ctaLink={`https://wa.me/573207093764?text=${encodeURIComponent(`${t('whatsapp_cta_pre')}: ${title}`)}`}
                                isPopular={false}
                                setupFeatures={(product.category === 'Landing Pages' || product.title.includes('Landing')) ? t.raw('plans.landing.setup_features') : product.category === 'Portafolios' ? t.raw('plans.portfolio.setup_features') : t.raw('plans.corporate.setup_features')}
                                monthlyFeatures={(product.category === 'Landing Pages' || product.title.includes('Landing')) ? t.raw('plans.landing.monthly_features') : t.raw('plans.corporate.monthly_features')}
                             />
                             <div className="mt-6 text-center">
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest bg-white/5 py-3 px-4 rounded-xl border border-white/5 inline-block">
                                   <span className="text-primary font-bold">{t('owner_prompt')}</span> <br/>
                                   {t('owner_desc')}
                                </p>
                             </div>
                          </div>
                     ) : (
                        <>
                           <ProductPromoBox
                              productId={product.id}
                              price={product.price}
                              originalPrice={product.originalPrice}
                              offerEndDate={product.offerEndDate}
                              freeUntilDate={product.freeUntilDate}
                              promotionBadge={product.promotionBadge}
                              checkoutUrl={product.checkoutUrl || product.templateUrl || product.demoUrl || '#'}
                              freeLabel={t('free')}
                           />

                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
                              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                 <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                                    <Check className="w-4 h-4 text-primary" /> {t('immediate_delivery')}
                                 </h4>
                                 <p className="text-xs text-gray-400">{t('immediate_desc')}</p>
                              </div>
                              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                 <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-primary" /> {t('quality_guarantee')}
                                 </h4>
                                 <p className="text-xs text-gray-400">{t('quality_desc')}</p>
                              </div>
                           </div>
                        </>
                     )}
                  </div>
                  
                  {product.demoUrl && (
                     <a href={product.demoUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button variant="outline" className="w-full h-14 border-primary/50 hover:bg-primary/5 text-lg gap-3">
                           <Monitor className="w-5 h-5" /> {t('demo_btn')}
                        </Button>
                     </a>
                  )}

                  {product.tutorialUrl && (
                     <div className="bg-card border border-white/10 rounded-2xl p-6 mt-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                           <PlayCircle className="w-6 h-6 text-primary" />
                           {t('tutorial_title')}
                        </h3>
                        <div className="aspect-video rounded-xl overflow-hidden bg-black/50">
                           {(product.tutorialUrl.includes('youtube.com') || product.tutorialUrl.includes('youtu.be')) && (
                              <iframe
                                 className="w-full h-full"
                                 src={`https://www.youtube.com/embed/${
                                    product.tutorialUrl.includes('youtu.be') 
                                       ? product.tutorialUrl.split('youtu.be/')[1]?.split('?')[0]
                                       : product.tutorialUrl.split('v=')[1]?.split('&')[0]
                                 }`}
                                 title="Tutorial"
                                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                 allowFullScreen
                              />
                           )}
                           {product.tutorialUrl.includes('vimeo.com') && (
                              <iframe
                                 className="w-full h-full"
                                 src={`https://player.vimeo.com/video/${product.tutorialUrl.split('vimeo.com/')[1]?.split('?')[0]}`}
                                 title="Tutorial"
                                 allow="autoplay; fullscreen; picture-in-picture"
                                 allowFullScreen
                              />
                           )}
                           {!product.tutorialUrl.includes('youtube.com') && !product.tutorialUrl.includes('youtu.be') && !product.tutorialUrl.includes('vimeo.com') && (
                              <a 
                                 href={product.tutorialUrl} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="w-full h-full flex items-center justify-center text-primary hover:text-white transition-colors"
                              >
                                 <PlayCircle className="w-16 h-16" />
                              </a>
                           )}
                        </div>
                     </div>
                  )}
               </div>
            </div>

            {/* Sidebar Column */}
            <aside className="lg:col-span-4 space-y-8">
               <div className="lg:sticky lg:top-28 space-y-6">
                  <div className="p-5 bg-card border border-white/10 rounded-2xl">
                     <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{t('ad_label')}</h3>
                     <AdBanner slot="product_sidebar_top" format="rectangle" style={{ minHeight: '300px' }} />
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                     <h3 className="font-bold text-white mb-4">{t('why_us_title')}</h3>
                     <ul className="space-y-3">
                        <li className="flex gap-2 text-sm text-gray-300"><Check className="w-4 h-4 text-primary" /> {t('benefit_1')}</li>
                        <li className="flex gap-2 text-sm text-gray-300"><Check className="w-4 h-4 text-primary" /> {t('benefit_2')}</li>
                        <li className="flex gap-2 text-sm text-gray-300"><Check className="w-4 h-4 text-primary" /> {t('benefit_3')}</li>
                     </ul>
                  </div>

                  <div className="p-5 bg-card border border-white/10 rounded-2xl hidden lg:block">
                     <AdBanner slot="product_sidebar_bottom" format="rectangle" style={{ minHeight: '600px' }} />
                  </div>
               </div>
            </aside>
          </div>

          <div className="mt-20 pt-16 border-t border-white/5">
            <AdBanner slot="product_footer_banner" className="max-w-4xl mx-auto" />
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
