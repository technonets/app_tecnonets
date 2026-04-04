import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { getGuideData, getAllGuides } from "@/lib/guides";
import { ArrowLeft, Calendar, User, BookOpen } from "lucide-react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { AdBanner } from "@/components/ui/AdBanner";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const guide = await getGuideData(slug);
    return {
      title: `${guide.title} | Guías Tecnonets`,
      description: guide.description,
      openGraph: {
        title: guide.title,
        description: guide.description,
        type: 'article',
        publishedTime: guide.date,
        authors: [guide.author],
        images: guide.image ? [{ url: guide.image }] : [],
      },
    };
  } catch (e) {
    return { title: "Guía No Encontrada" };
  }
}

export default async function GuidePostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let guide;
  try {
    guide = await getGuideData(slug);
  } catch (e) {
    notFound();
  }

  // JSON-LD for Technical Article and Breadcrumbs
  const baseUrl = "https://tecnonets.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "headline": guide.title,
        "description": guide.description,
        "image": guide.image ? [guide.image] : [],
        "datePublished": guide.date,
        "dateModified": guide.date,
        "author": [{
          "@type": "Person",
          "name": guide.author,
          "url": baseUrl
        }],
        "publisher": {
          "@type": "Organization",
          "name": "Tecnonets",
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/favicon.ico`
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `${baseUrl}/guias/${slug}`
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Inicio",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Guías",
            "item": `${baseUrl}/guias`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": guide.title,
            "item": `${baseUrl}/guias/${slug}`
          }
        ]
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
      <main className="pt-32 pb-20">
        <Section>
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-12">
              {/* Header */}
              <div className="space-y-8">
                <Link href="/guias">
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary -ml-2 font-bold uppercase tracking-widest text-[10px]">
                    <ArrowLeft className="w-4 h-4" /> Volver a Guías
                  </Button>
                </Link>
                
                <div className="space-y-4">
                  <Badge variant="primary">{guide.category}</Badge>
                  <h1 className="text-4xl md:text-6xl font-bold font-heading text-foreground leading-tight">
                    {guide.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm font-bold uppercase tracking-tight">
                    <span className="flex items-center gap-2 text-primary">
                      <BookOpen className="w-4 h-4" /> {guide.author}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> {guide.displayDate}
                    </span>
                  </div>
                </div>

                <div className="w-full aspect-video rounded-3xl overflow-hidden border border-card-border bg-foreground/5 relative shadow-2xl">
                  <Image 
                    src={guide.image} 
                    alt={guide.title} 
                    fill
                    className="object-cover" 
                    priority
                  />
                </div>
              </div>

              {/* Ad After Header */}
              <AdBanner slot="guide_top" />

              {/* Content Rendering */}
              <div className="prose prose-slate dark:prose-invert max-w-none text-foreground/80 text-lg leading-relaxed font-medium">
                <div 
                  className="guide-content"
                  dangerouslySetInnerHTML={{ __html: guide.contentHtml }} 
                />
              </div>

              {/* Ad Before Footer CTA */}
              <AdBanner slot="guide_bottom" />

              {/* Footer / CTA */}
              <div className="pt-12 border-t border-card-border">
                <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left shadow-xl">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground">¿Te ha servido esta guía?</h3>
                    <p className="text-muted-foreground font-medium">Si necesitas ayuda implementando estas tecnologías en tu negocio, ¡contáctanos!</p>
                  </div>
                  <Link href="/contacto">
                    <Button className="px-8 font-bold">Contactar Soporte</Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar for Desktop Ads & Info */}
            <aside className="lg:col-span-4 space-y-8">
              <div className="lg:sticky lg:top-32 space-y-8">
                <div className="p-6 bg-card border border-card-border rounded-2xl shadow-sm">
                  <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Publicidad</h3>
                  <AdBanner slot="guide_sidebar" format="rectangle" style={{ minHeight: '400px' }} />
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 shadow-xl">
                  <h4 className="font-bold text-foreground mb-2">Más Guías Técnicas</h4>
                  <p className="text-sm text-muted-foreground mb-6 font-medium">Explora otros tutoriales para potenciar tu presencia digital.</p>
                  <Link href="/guias">
                    <Button variant="outline" className="w-full font-bold">Ver Catálogo</Button>
                  </Link>
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

export async function generateStaticParams() {
  const guides = await getAllGuides();
  return guides.map((guide) => ({
    slug: guide.slug,
  }));
}
