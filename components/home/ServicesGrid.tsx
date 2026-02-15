import Link from "next/link";
import { ArrowRight, Grid, Monitor, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";

export function ServicesGrid() {
  return (
    <Section className="border-t border-border/50">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-4 uppercase tracking-tighter">Nuestros Servicios</h2>
          <p className="text-muted-foreground font-medium max-w-xl">Soluciones a medida para potenciar tu productividad y presencia digital.</p>
        </div>
        <Link href="/servicios" className="text-primary font-bold inline-flex items-center gap-2 hover:brightness-110 transition-all">Ver todos <ArrowRight className="w-4 h-4" /></Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/servicios/automatizacion">
          <Card className="h-full border-border/50 hover:border-primary/50 transition-all shadow-sm hover:shadow-xl">
            <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-6 text-primary">
              <Grid className="w-6 h-6" />
            </div>
            <CardTitle className="uppercase tracking-tight">Automatización Google</CardTitle>
            <CardDescription className="text-foreground/60 font-medium">
              Sincronización avanzada entre Sheets, Forms, Calendar y Gmail. Scripts personalizados para ahorrar horas de trabajo manual.
            </CardDescription>
          </Card>
        </Link>

         <Link href="/servicios/desarrollo-web">
          <Card className="h-full border-border/50 hover:border-secondary/50 transition-all shadow-sm hover:shadow-xl">
            <div className="w-12 h-12 rounded-md bg-secondary/10 flex items-center justify-center mb-6 text-secondary">
              <Monitor className="w-6 h-6" />
            </div>
            <CardTitle className="uppercase tracking-tight">Diseño de Páginas Web</CardTitle>
            <CardDescription className="text-foreground/60 font-medium">
              Expertos en crear páginas web profesionales, Landing Pages de alta conversión y sitios corporativos modernos.
            </CardDescription>
          </Card>
        </Link>

         <Link href="/tienda">
          <Card className="h-full border-border/50 hover:border-accent/50 transition-all shadow-sm hover:shadow-xl">
            <div className="w-12 h-12 rounded-md bg-accent/10 flex items-center justify-center mb-6 text-accent">
              <Zap className="w-6 h-6" />
            </div>
            <CardTitle className="uppercase tracking-tight">Tienda de Código</CardTitle>
            <CardDescription className="text-foreground/60 font-medium">
              Adquiere proyectos listos para usar. Plantillas de Sheets, Scripts y componentes web premium para acelerar tus desarrollos.
            </CardDescription>
          </Card>
        </Link>
      </div>
    </Section>
  );
}
