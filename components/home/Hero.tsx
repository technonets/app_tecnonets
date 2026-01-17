
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";

export function Hero() {
  return (
    <Section className="min-h-[85vh] flex items-center justify-center">
      {/* Ambient Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-[100px]" />
      </div>

      <div className="text-center relative z-10 max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-fade-in-up">
          <Badge variant="secondary">Soluciones Digitales</Badge>
          <span className="text-sm text-gray-300">Presencia Web y Automatización</span>
        </div>
        
        <h1 className="text-4xl md:text-7xl font-bold font-heading tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-200 to-gray-500">
          Diseño de Páginas Web <br className="hidden sm:block" />
          y Sitios Profesionales
        </h1>
        
        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Optimizamos flujos de trabajo mediante automatización avanzada con Google Workspace y desarrollamos infraestructura web de alto rendimiento.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button href="/servicios/automatizacion" size="lg" className="w-full sm:w-auto gap-2">
            Consultar Servicios <ArrowRight className="w-5 h-5" />
          </Button>
          <Button href="/tienda" variant="outline" size="lg" className="w-full sm:w-auto">
            Ver Catálogo de Recursos
          </Button>
        </div>
      </div>
    </Section>
  );
}
