import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { User, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AdBanner } from "@/components/ui/AdBanner";
import { getPosts } from "@/lib/blog";
import Image from "next/image";
import { Metadata } from "next";

// Generar Metadatos Dinámicos para SEO
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Blog");
  
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("Blog");
  const posts = await getPosts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": locale === 'es' ? 'Inicio' : 'Home',
        "item": `https://tecnonets.com/${locale}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": `https://tecnonets.com/${locale}/blog`
      }
    ]
  };

  // Ordenar posts por fecha (más reciente primero) si la fecha es válida
  const sortedPosts = posts.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-grow pt-24">
        <Section className="bg-background">
            <div className="text-center space-y-4 mb-16">
              <Badge variant="primary" className="px-4 py-1">{t('badge')}</Badge>
              <h1 className="text-4xl md:text-5xl font-bold font-heading text-foreground mb-4">
                {t.rich('title', {
                  italic: (chunks) => <span className="text-primary italic">{chunks}</span>
                })}
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
                {t('subtitle')}
              </p>
            </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Articles Column */}
            <div className="lg:col-span-8">
              {sortedPosts.length === 0 ? (
                 <div className="text-center py-20 bg-card/5 rounded-2xl border border-border/50">
                     <p className="text-foreground/60 text-lg">{t('empty')}</p>
                 </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {sortedPosts.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`}>
                        <article className="group bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 h-full flex flex-col shadow-sm hover:shadow-xl">
                            <div className="relative aspect-video">
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <Badge className="absolute top-4 left-4 bg-primary text-foreground backdrop-blur-sm shadow-lg">
                                    {post.category}
                                </Badge>
                            </div>
                            <div className="p-6 space-y-4 flex-grow flex flex-col">
                                <div className="flex items-center gap-2 text-sm text-foreground/50 font-bold uppercase tracking-tight">
                                    <BookOpen className="w-4 h-4" />
                                    <span>{post.author}</span>
                                    <span>•</span>
                                    <span>{post.date}</span>
                                </div>
                                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-foreground/60 text-sm line-clamp-2 flex-grow font-medium">
                                    {post.excerpt}
                                </p>
                                <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent group-hover:text-primary transition-all font-bold uppercase tracking-widest text-[10px]">
                                    {t('read_more')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </article>
                    </Link>
                    ))}
                </div>
              )}
              
              {/* Ad in middle of list */}
              <div className="mt-12">
                 <AdBanner slot="blog_list_middle" />
              </div>
            </div>

            {/* Sidebar Ads */}
            <aside className="lg:col-span-4 space-y-8">
              <div className="lg:sticky lg:top-28 space-y-6">
                <div className="p-6 bg-card border border-border/50 rounded-2xl shadow-sm">
                   <h3 className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-4">{t('sidebar_featured')}</h3>
                   <AdBanner slot="blog_sidebar_top" format="rectangle" style={{ minHeight: '300px' }} />
                </div>

                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 backdrop-blur-sm">
                  <h3 className="font-bold text-foreground mb-2">{t('sidebar_help_title')}</h3>
                  <p className="text-sm text-foreground/60 mb-4 font-medium">{t('sidebar_help_desc')}</p>
                  <Link href="/contacto">
                    <Button className="w-full">{t('sidebar_cta')}</Button>
                  </Link>
                </div>

                <div className="p-5 bg-card border border-border/50 rounded-2xl hidden xl:block">
                  <AdBanner slot="blog_sidebar_bottom" format="rectangle" style={{ minHeight: '600px' }} />
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
