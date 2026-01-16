import Link from "next/link";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AdBanner } from "@/components/ui/AdBanner";
import { getPosts } from "@/lib/blog";
import Image from "next/image";

export default async function BlogPage() {
  const posts = await getPosts();

  // Ordenar posts por fecha (más reciente primero) si la fecha es válida
  const sortedPosts = posts.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24">
        <Section className="bg-background">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-6">Blog & Tutoriales</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Recursos educativos para dominar la automatización y el desarrollo web.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Articles Column */}
            <div className="lg:col-span-8">
              {sortedPosts.length === 0 ? (
                 <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                     <p className="text-gray-400 text-lg">No hay artículos publicados aún.</p>
                 </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {sortedPosts.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`}>
                        <Card className="h-full group hover:border-primary/50 transition-all cursor-pointer">
                        <div className="aspect-video rounded-lg mb-6 overflow-hidden relative bg-gray-800">
                             {post.image ? (
                                <Image 
                                    src={post.image} 
                                    alt={post.title} 
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-900/20" />
                            )}
                            <div className="absolute top-4 left-4 z-10">
                            <Badge variant="primary">{post.category}</Badge>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {post.date}</span>
                            <span className="flex items-center gap-1"><User className="w-4 h-4" /> {post.author}</span>
                        </div>

                        <h2 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                            {post.title}
                        </h2>
                        <p className="text-gray-400 mb-6 line-clamp-3">
                            {post.excerpt}
                        </p>

                        <div className="mt-auto flex items-center text-primary font-medium hover:text-primary/80 transition-colors">
                            Leer Artículo <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                        </Card>
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
                <div className="p-5 bg-card border border-white/10 rounded-2xl">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Destacado</h3>
                  <AdBanner slot="blog_sidebar_top" format="rectangle" style={{ minHeight: '300px' }} />
                </div>
                
                <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20">
                  <h3 className="font-bold text-white mb-2">¿Buscas algo específico?</h3>
                  <p className="text-sm text-gray-400 mb-4">Automatizamos tus procesos con Google Sheets y AppScript.</p>
                  <Link href="/contacto">
                    <Button className="w-full">Pedir Presupuesto</Button>
                  </Link>
                </div>

                <div className="p-5 bg-card border border-white/10 rounded-2xl hidden xl:block">
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
