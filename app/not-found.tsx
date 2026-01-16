'use client';
import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-lg mx-auto">
        <h1 className="text-9xl font-bold font-heading text-primary/20 select-none">404</h1>
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-white">Página no encontrada</h2>
          <p className="text-gray-400 text-lg">
            Parece que te has perdido en el código. La página que buscas no existe o ha sido movida.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link href="/">
             <Button variant="primary" className="gap-2">
               <Home className="w-4 h-4" /> Ir al Inicio
             </Button>
          </Link>
          <Button variant="ghost" onClick={() => window.history.back()} className="gap-2 text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Volver atrás
          </Button>
        </div>
      </div>
    </div>
  );
}
