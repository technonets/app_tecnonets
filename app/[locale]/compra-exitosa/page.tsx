'use client';
import Link from "next/link";
import { CheckCircle, Download, FileJson, Copy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PurchaseSuccessPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24">
        <Section>
          <div className="max-w-2xl mx-auto text-center space-y-8">
            {/* Success Animation/Icon */}
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold font-heading text-white">¡Gracias por tu compra!</h1>
              <p className="text-gray-400 text-lg">
                Tu pedido ha sido confirmado exitosamente.
              </p>
            </div>

            {/* Product Delivery Card */}
            <div className="bg-card border border-green-500/30 rounded-2xl p-8 text-left space-y-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-[50px] pointer-events-none" />
               
               <div>
                  <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-1">Estado del Pedido</h3>
                  <p className="text-xl font-bold text-white flex items-center gap-2">
                    <CheckCircle className="text-primary w-5 h-5" /> Completado
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Has adquirido productos digitales de Tecnonets.</p>
               </div>

               <div className="border-t border-white/10 my-4" />

               <div>
                 <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-3">Siguientes Pasos</h3>
                 <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                    <p className="text-white mb-2 font-medium">Hemos enviado el enlace de descarga a tu correo.</p>
                    <p className="text-sm text-gray-400">Por favor revisa tu bandeja de entrada (y spam por si acaso) para acceder a tus archivos de forma segura.</p>
                 </div>
                 
                 <div className="mt-6 flex justify-center">
                    <Link href="/tienda">
                      <Button variant="outline">Volver a la Tienda</Button>
                    </Link>
                 </div>
               </div>
            </div>

            {/* Next Steps / Upsell */}
            <div className="pt-8 text-center">
              <p className="text-gray-400 mb-4">¿Necesitas ayuda con la instalación?</p>
              <Link href="/contacto?servicio=Consultoría">
                <Button variant="ghost" className="text-primary hover:text-primary/80 gap-2">
                  Agendar soporte técnico <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
