import { Link } from "@/i18n/routing";
import { ArrowRight, Grid, Monitor, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { useTranslations } from 'next-intl';

export function ServicesGrid() {
  const t = useTranslations('Services');

  return (
    <Section className="border-t border-border/50">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-4 uppercase tracking-tighter">{t('title')}</h2>
          <p className="text-muted-foreground font-medium max-w-xl">{t('subtitle')}</p>
        </div>
        <Link href="/servicios" className="text-primary font-bold inline-flex items-center gap-2 hover:brightness-110 transition-all">
          {t('view_all')} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/servicios/automatizacion">
          <Card className="h-full border-border/50 hover:border-primary/50 transition-all shadow-sm hover:shadow-xl">
            <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-6 text-primary">
              <Grid className="w-6 h-6" />
            </div>
            <CardTitle className="uppercase tracking-tight">{t('automation_title')}</CardTitle>
            <CardDescription className="text-foreground/60 font-medium">
              {t('automation_desc')}
            </CardDescription>
          </Card>
        </Link>

         <Link href="/servicios/desarrollo-web">
          <Card className="h-full border-border/50 hover:border-secondary/50 transition-all shadow-sm hover:shadow-xl">
            <div className="w-12 h-12 rounded-md bg-secondary/10 flex items-center justify-center mb-6 text-secondary">
              <Monitor className="w-6 h-6" />
            </div>
            <CardTitle className="uppercase tracking-tight">{t('web_title')}</CardTitle>
            <CardDescription className="text-foreground/60 font-medium">
              {t('web_desc')}
            </CardDescription>
          </Card>
        </Link>

         <Link href="/tienda">
          <Card className="h-full border-border/50 hover:border-accent/50 transition-all shadow-sm hover:shadow-xl">
            <div className="w-12 h-12 rounded-md bg-accent/10 flex items-center justify-center mb-6 text-accent">
              <Zap className="w-6 h-6" />
            </div>
            <CardTitle className="uppercase tracking-tight">{t('store_title')}</CardTitle>
            <CardDescription className="text-foreground/60 font-medium">
              {t('store_desc')}
            </CardDescription>
          </Card>
        </Link>
      </div>
    </Section>
  );
}
