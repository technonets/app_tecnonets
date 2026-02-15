import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ExternalLink, ShieldCheck, Cpu, Camera, Globe } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Image from "next/image";

export function Partners() {
  return (
    <Section className="border-t border-border/50">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold font-heading text-foreground mb-6">
          Aliado Estratégico
        </h2>
        <div className="w-24 h-1 bg-primary mx-auto"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left column: Name and Description */}
        <div className="space-y-8">
          <div>
            <h3 className="text-4xl font-bold text-foreground mb-4">Sistemas Cúcuta</h3>
            <p className="text-xl text-secondary font-medium mb-6">Soluciones Informáticas & Soporte Técnico</p>
            <p className="text-foreground/70 leading-relaxed text-lg font-medium">
              Empresa colombiana especializada en impulsar negocios a través de la tecnología. Con un equipo de ingenieros expertos y excelentes reseñas en Google, ofrecen el respaldo técnico que tu empresa necesita.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-md bg-foreground/5 border border-border/50">
              <div className="p-2 rounded-sm bg-primary/10 text-primary">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-foreground font-semibold">Soporte Técnico</span>
                <span className="text-sm text-foreground/60 font-medium">Mantenimiento de computadores y redes.</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-md bg-foreground/5 border border-border/50">
              <div className="p-2 rounded-sm bg-secondary/10 text-secondary">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-foreground font-semibold">Seguridad</span>
                <span className="text-sm text-foreground/60 font-medium">Instalación de cámaras y software POS.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-md bg-foreground/5 border border-border/50">
              <div className="p-2 rounded-sm bg-accent/10 text-accent">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-foreground font-semibold">Marketing & Web</span>
                <span className="text-sm text-foreground/60 font-medium">Diseño web y marketing digital.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-md bg-foreground/5 border border-border/50">
              <div className="p-2 rounded-sm bg-primary/10 text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-foreground font-semibold">Software Original</span>
                <span className="text-sm text-foreground/60 font-medium">Licencias Microsoft y asesoría gratuita.</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              href="https://sistemascucuta.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group gap-2 text-lg px-8 py-4"
            >
              Visitar Sistemas Cúcuta
              <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Right column: Decorative Visual */}
        <div className="relative">
          <Card className="relative overflow-hidden border-border bg-card p-8 md:p-12 rounded-lg">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 rounded-md bg-white flex items-center justify-center shadow-2xl overflow-hidden relative p-2 border border-card-border">
                <Image 
                  src="/sistemas-cucuta-logo-hd-v2.png" 
                  alt="Sistemas Cúcuta Logo" 
                  width={80} 
                  height={80} 
                  className="object-contain"
                />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-bold text-card-foreground uppercase tracking-tight">Aliado Tecnológico</h4>
                <p className="text-muted-foreground font-medium">Colaboración profesional para soluciones integrales.</p>
              </div>
              
              <div className="w-full h-px bg-card-border"></div>
              
              <div className="grid grid-cols-2 gap-8 w-full">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">Cúcuta</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Ubicación</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">5.0 ⭐</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Reseñas Google</div>
                </div>
              </div>

              <div className="bg-foreground/5 rounded-sm p-4 w-full">
                <p className="text-sm text-foreground/60 italic font-medium">
                  "Soluciones informáticas profesionales con el respaldo de ingenieros expertos."
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
}
