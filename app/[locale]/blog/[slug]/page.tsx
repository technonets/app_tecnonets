import { ArrowLeft, Calendar, User, Share2, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AdBanner } from "@/components/ui/AdBanner";
import { notFound } from "next/navigation";
import { getPosts } from "@/lib/blog";
import Image from "next/image";
import { Metadata } from "next";

// Generar Metadatos Dinámicos para SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const posts = await getPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
      return {
          title: "Artículo No Encontrado | Tecnonets",
          description: "El artículo que buscas no existe."
      }
  }

  return {
    title: `${post.title} | Blog Tecnonets`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: post.image ? [{ url: post.image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.image ? [post.image] : [],
    }
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const posts = await getPosts();
  const post = posts.find((p) => p.slug === decodedSlug);

  if (!post) {
    notFound();
  }

  // Soporte básico para saltos de línea si viene como texto plano, o HTML si viene formateado
  const isHtml = post.content.includes('<') && post.content.includes('>');

  // JSON-LD para Google (Rich Results)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    image: post.image ? [post.image] : [],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: [{
        '@type': 'Person',
        name: post.author,
        url: 'https://tecnonets.com'
    }]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-grow pt-24 pb-20">
        <Section>
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <article className="lg:col-span-8 space-y-8">
                <Link href="/blog">
                   <Button variant="ghost" size="sm" className="gap-2 text-foreground/50 hover:text-primary transition-colors -ml-2 font-bold uppercase tracking-widest text-[10px]">
                      <ArrowLeft className="w-4 h-4" /> Volver al Blog
                   </Button>
                </Link>

                <div className="space-y-4">
                   <Badge variant="primary">{post.category}</Badge>
                   <h1 className="text-4xl md:text-6xl font-bold font-heading text-foreground leading-tight">
                      {post.title}
                   </h1>
                   <div className="flex items-center gap-6 text-foreground/50 text-sm font-bold uppercase tracking-tight">
                      <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {post.date}</span>
                      <span className="flex items-center gap-2"><User className="w-4 h-4" /> {post.author}</span>
                   </div>
                </div>

                <div className="w-full aspect-video rounded-3xl overflow-hidden border border-border/50 bg-foreground/5 relative shadow-2xl">
                     {post.image ? (
                          <Image 
                             src={post.image} 
                             alt={post.title} 
                             fill
                             className="object-cover" 
                             sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw"
                             priority
                         />
                     ) : (
                         <div className="w-full h-full bg-gradient-to-br from-primary/10 to-background" />
                     )}
                </div>

                <AdBanner slot="blog_post_top" />

                <div className="prose prose-slate dark:prose-invert max-w-none text-foreground/80 text-lg leading-relaxed space-y-6 font-medium">
                   {isHtml ? (
                       <div dangerouslySetInnerHTML={{ __html: post.content }} />
                   ) : (
                       post.content.split('\n').map((paragraph, idx) => (
                           <p key={idx}>{paragraph}</p>
                       ))
                   )}
                   
                   <AdBanner slot="blog_post_middle" format="rectangle" className="max-w-md mx-auto my-8" />
                </div>

                <AdBanner slot="blog_post_bottom" />

                <div className="pt-8 border-t border-border/50 flex justify-between items-center">
                   <div className="flex gap-4">
                      <Button variant="outline" size="sm" className="gap-2 font-bold">
                         <Share2 className="w-4 h-4" /> Compartir
                      </Button>
                   </div>
                </div>
            </article>

            <aside className="lg:col-span-4 space-y-8">
               <div className="lg:sticky lg:top-28 space-y-6">
                  <div className="p-5 bg-card border border-card-border rounded-2xl shadow-sm">
                     <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Publicidad</h3>
                     <AdBanner slot="blog_post_sidebar_1" format="rectangle" style={{ minHeight: '400px' }} />
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 backdrop-blur-sm shadow-xl">
                     <h3 className="font-bold text-foreground mb-3">¿Te gusta este contenido?</h3>
                     <p className="text-sm text-muted-foreground mb-6 font-medium">En nuestra tienda tenemos recursos premium listos para instalar.</p>
                     <Link href="/tienda">
                        <Button className="w-full gap-2 font-bold">Explorar Tienda</Button>
                     </Link>
                  </div>

                  <div className="p-5 bg-card border border-card-border rounded-2xl hidden lg:block shadow-sm">
                     <AdBanner slot="blog_post_sidebar_2" format="rectangle" style={{ minHeight: '600px' }} />
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

// Generar rutas estáticas para mejorar rendimiento (opcional pero recomendado)
export async function generateStaticParams() {
    const posts = await getPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}
