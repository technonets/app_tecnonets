import Link from "next/link";
import { ArrowRight, Grid, Monitor, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";

export function ServicesGrid() {
  return (
    <Section className="bg-white/2">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">Nuestros Servicios</h2>
          <p className="text-gray-400 max-w-xl">Soluciones a medida para potenciar tu productividad y presencia digital.</p>
        </div>
        <Button href="/servicios" variant="ghost" className="gap-2 text-primary">Ver todos <ArrowRight className="w-4 h-4" /></Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/servicios/automatizacion">
          <Card className="h-full bg-gradient-to-br from-white/5 to-transparent">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-6 text-green-400">
              <Grid className="w-6 h-6" />
            </div>
            <CardTitle>Automatización Google</CardTitle>
            <CardDescription>
              Sincronización avanzada entre Sheets, Forms, Calendar y Gmail. Scripts personalizados para ahorrar horas de trabajo manual.
            </CardDescription>
          </Card>
        </Link>

         <Link href="/servicios/desarrollo-web">
          <Card className="h-full bg-gradient-to-br from-white/5 to-transparent">
            <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center mb-6 text-violet-400">
              <Monitor className="w-6 h-6" />
            </div>
            <CardTitle>Diseño de Páginas Web</CardTitle>
            <CardDescription>
              Expertos en crear páginas web profesionales, Landing Pages de alta conversión y sitios corporativos modernos.
            </CardDescription>
          </Card>
        </Link>

         <Link href="/tienda">
          <Card className="h-full bg-gradient-to-br from-white/5 to-transparent">
            <div className="w-12 h-12 rounded-lg bg-rose-500/20 flex items-center justify-center mb-6 text-rose-400">
              <Zap className="w-6 h-6" />
            </div>
            <CardTitle>Tienda de Código</CardTitle>
            <CardDescription>
              Adquiere proyectos listos para usar. Plantillas de Sheets, Scripts y componentes web premium para acelerar tus desarrollos.
            </CardDescription>
          </Card>
        </Link>
      </div>
    </Section>
  );
}
