'use client';
import { Link } from "@/i18n/routing";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('Navbar'); // Reusing Navbar translations for simple UI if not-found specific is not needed

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-lg mx-auto">
        <h1 className="text-9xl font-bold font-heading text-primary/20 select-none">404</h1>
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-foreground">Página no encontrada</h2>
          <p className="text-foreground/60 text-lg font-medium">
            Parece que te has perdido en el código. La página que buscas no existe o ha sido movida.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link href="/">
             <Button variant="primary" className="gap-2 font-bold">
               <Home className="w-4 h-4" /> {t('home')}
             </Button>
          </Link>
          <Button variant="ghost" onClick={() => window.history.back()} className="gap-2 text-foreground/50 hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px]">
            <ArrowLeft className="w-4 h-4" /> Volver atrás
          </Button>
        </div>
      </div>
    </div>
  );
}
