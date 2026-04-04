import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { useTranslations } from 'next-intl';

export function Hero() {
  const t = useTranslations('Hero');

  return (
    <Section className="min-h-[85vh] flex items-center justify-center border-b border-border/50">
      {/* Industrial Background Grid */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0" 
           style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="text-center relative z-10 max-w-4xl mx-auto space-y-8 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-foreground/5 border border-border/50 animate-fade-in-up">
          <Badge variant="secondary">{t('badge_primary')}</Badge>
          <span className="text-sm text-foreground/60 font-medium tracking-wide uppercase">{t('badge_secondary')}</span>
        </div>
        
        <h1 className="text-4xl md:text-7xl font-bold font-heading tracking-tight leading-[1.1] text-foreground text-balance">
          {t.rich('title', {
            italic: (chunks) => <span className="text-primary italic">{chunks}</span>,
            primary: (chunks) => <span className="text-primary">{chunks}</span>,
            nl: () => <br className="hidden sm:block" />
          })}
        </h1>
        
        <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed font-medium">
          {t('subtitle')}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button href="/servicios/automatizacion" size="lg" className="w-full sm:w-auto gap-2">
            {t('cta_services')} <ArrowRight className="w-5 h-5" />
          </Button>
          <Button href="/tienda" variant="outline" size="lg" className="w-full sm:w-auto">
            {t('cta_catalog')}
          </Button>
        </div>
      </div>
    </Section>
  );
}
