import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ExternalLink, ShieldCheck, Cpu, Camera, Globe } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Image from "next/image";

export function Partners() {
  return (
    <Section className="bg-gradient-to-b from-transparent to-white/[0.02]">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold font-heading text-white mb-6">
          Aliado Estratégico
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left column: Name and Description */}
        <div className="space-y-8">
          <div>
            <h3 className="text-4xl font-bold text-white mb-4">Sistemas Cúcuta</h3>
            <p className="text-xl text-primary font-medium mb-6">Soluciones Informáticas & Soporte Técnico</p>
            <p className="text-gray-300 leading-relaxed text-lg">
              Empresa colombiana especializada en impulsar negocios a través de la tecnología. Con un equipo de ingenieros expertos y excelentes reseñas en Google, ofrecen el respaldo técnico que tu empresa necesita.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-white font-semibold">Soporte Técnico</span>
                <span className="text-sm text-gray-400">Mantenimiento de computadores y redes.</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-white font-semibold">Seguridad</span>
                <span className="text-sm text-gray-400">Instalación de cámaras y software POS.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-white font-semibold">Marketing & Web</span>
                <span className="text-sm text-gray-400">Diseño web y marketing digital.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-white font-semibold">Software Original</span>
                <span className="text-sm text-gray-400">Licencias Microsoft y asesoría gratuita.</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              href="https://sistemascucuta.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group gap-2 text-lg px-8 py-6"
            >
              Visitar Sistemas Cúcuta
              <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Right column: Decorative Visual */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse"></div>
          <Card className="relative overflow-hidden border-white/10 bg-black/40 backdrop-blur-xl p-8 md:p-12">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center shadow-2xl overflow-hidden relative p-2">
                <Image 
                  src="/sistemas-cucuta-logo-hd-v2.png" 
                  alt="Sistemas Cúcuta Logo" 
                  width={80} 
                  height={80} 
                  className="object-contain"
                />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-bold text-white">Aliado Tecnológico</h4>
                <p className="text-gray-400">Colaboración profesional para soluciones integrales.</p>
              </div>
              
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              
              <div className="grid grid-cols-2 gap-8 w-full">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">Cúcuta</div>
                  <div className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Ubicación</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">5.0 ⭐</div>
                  <div className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Reseñas Google</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 w-full">
                <p className="text-sm text-gray-400 italic">
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
