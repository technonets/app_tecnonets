import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { getAllGuides } from "@/lib/guides";
import { ArrowRight, BookOpen } from "lucide-react";
import { AdBanner } from "@/components/ui/AdBanner";

export const metadata = {
  title: "Guías Técnicas | Tecnonets",
  description: "Aprende con nuestras guías completas sobre desarrollo web, PWA, SEO y más.",
};

export default async function GuidesPage() {
  const guides = await getAllGuides();

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20">
        <Section>
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <Badge variant="primary" className="px-4 py-1">Contenido de Valor</Badge>
              <h1 className="text-4xl md:text-6xl font-bold font-heading text-foreground">
                Guías <span className="text-primary italic">Pro</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
                Tutoriales detallados paso a paso para dominar las tecnologías que impulsan el futuro de la web.
              </p>
            </div>

            <div className="mb-12">
              <AdBanner slot="guides_list_top" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {guides.map((guide) => (
                <Link key={guide.slug} href={`/guias/${guide.slug}`}>
                  <article className="group bg-card border border-card-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 h-full flex flex-col shadow-sm hover:shadow-xl">
                    <div className="relative aspect-video">
                      <Image
                        src={guide.image}
                        alt={guide.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground backdrop-blur-sm shadow-lg">
                        {guide.category}
                      </Badge>
                    </div>
                    <div className="p-6 space-y-4 flex-grow flex flex-col">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-bold uppercase tracking-tight">
                        <BookOpen className="w-4 h-4" />
                        <span>{guide.author}</span>
                        <span>•</span>
                        <span>{guide.displayDate}</span>
                      </div>
                      <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                        {guide.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 flex-grow font-medium">
                        {guide.description}
                      </p>
                      <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent group-hover:text-primary transition-all font-bold uppercase tracking-widest text-[10px]">
                        Leer Guía <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
