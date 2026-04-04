'use client';
import { Check, HelpCircle, MessageSquare } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { useCurrency } from "@/context/CurrencyContext";
import { useTranslations } from 'next-intl';

interface Price {
  COP: string;
  USD: string;
}

interface ServicePlanCardProps {
  title?: string;
  description: string;
  setupFee?: string; 
  monthlyFee?: string; 
  prices: {
    setup: Price;
    monthly: Price;
  };
  features?: string[];
  setupFeatures?: string[];
  monthlyFeatures?: string[];
  notIncluded?: string[];
  expectedOutcome?: string;
  isPopular?: boolean;
  ctaLink: string;
}

export function ServicePlanCard({
  title,
  description,
  prices,
  features,
  setupFeatures,
  monthlyFeatures,
  notIncluded,
  expectedOutcome,
  isPopular = false,
  ctaLink
}: ServicePlanCardProps) {
  const { currency } = useCurrency();
  const t = useTranslations('Store');
  
  const currentSetup = prices.setup[currency];
  const currentMonthly = prices.monthly[currency];
  const currencyLabel = currency === 'USD' ? 'USD' : 'COP';

  return (
    <div className={`
      relative flex flex-col p-8 rounded-3xl border transition-all duration-300 h-full
      ${isPopular 
        ? 'bg-card border-primary shadow-[0_0_50px_rgba(139,92,246,0.15)] z-10 ring-1 ring-primary' 
        : 'bg-foreground/[0.03] border-border/50 hover:bg-foreground/[0.06]'}
    `}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
          {t('popular')}
        </div>
      )}

      <div className="mb-8 text-center md:text-left">
        {title && <h3 className="text-2xl font-bold font-heading text-foreground mb-2">{title}</h3>}
        <p className="text-foreground/60 text-sm leading-relaxed font-medium">{description}</p>
      </div>

      {/* Pricing Block */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Setup Fee */}
        <div className="bg-foreground/5 rounded-xl p-4 border border-border/50">
          <p className="text-foreground/60 text-[10px] font-bold uppercase tracking-wider mb-1">{t('setup_fee')} (Pago Único)</p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-foreground">{currentSetup}</span>
            <span className="text-foreground/40 text-[10px]">{currencyLabel}</span>
          </div>
          <p className="text-[10px] text-foreground/40 mt-1 uppercase font-bold tracking-tight">Diseño & Configuración</p>
        </div>

        {/* Monthly Fee */}
        <div className={`rounded-xl p-4 border ${isPopular ? 'bg-primary/10 border-primary/20' : 'bg-foreground/5 border-border/50'}`}>
          <p className={`${isPopular ? 'text-primary' : 'text-foreground/60'} text-[10px] font-bold uppercase tracking-wider mb-1`}>{t('monthly_fee')}</p>
          <div className="flex items-baseline gap-1">
             <span className="text-xl font-bold text-foreground">{currentMonthly}</span>
             <span className="text-foreground/40 text-[10px]">{currencyLabel}/{t('month')}</span>
          </div>
          <p className="text-[10px] text-foreground/40 mt-1 uppercase font-bold tracking-tight">Mantenimiento & Soporte</p>
        </div>
      </div>
      
      {/* Features Sections */}
      <div className="space-y-8 mb-8 flex-grow">
        {/* Legacy Features (if provided) */}
        {features && !setupFeatures && (
          <div>
            <p className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              {t('includes')}:
            </p>
            <ul className="space-y-3">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-foreground/70 font-medium">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="leading-snug">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* NEW Setup Features */}
        {setupFeatures && (
          <div>
            <p className="text-xs font-bold text-foreground mb-4 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(139,92,246,0.5)]"></span>
              {t('setup_includes')}
            </p>
            <ul className="space-y-3">
              {setupFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-foreground/70 font-medium">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="leading-snug">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* NEW Monthly Features */}
        {monthlyFeatures && (
          <div>
            <p className="text-xs font-bold text-foreground mb-4 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
              {t('monthly_includes')}
            </p>
            <ul className="space-y-3">
              {monthlyFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-foreground/70 font-medium">
                  <Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* NEW Not Included */}
        {notIncluded && (
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs font-bold text-foreground/40 mb-4 uppercase tracking-widest">{t('not_included')}</p>
            <ul className="space-y-2">
              {notIncluded.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs text-foreground/40 font-medium">
                  <span className="w-1 h-1 rounded-full bg-foreground/20 shrink-0 mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* NEW Expected Outcome */}
        {expectedOutcome && (
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 mt-6">
            <p className="text-xs font-bold text-primary mb-2 uppercase tracking-widest">{t('expected_outcome')}</p>
            <p className="text-sm text-foreground/70 italic font-medium">"{expectedOutcome}"</p>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="pt-6 border-t border-border/50 mt-auto">
        <Link href={ctaLink} className="w-full block">
          <Button 
            variant="primary" 
            className={`w-full h-14 text-lg shadow-lg group relative overflow-hidden ${isPopular ? 'animate-pulse' : ''}`}
          >
            <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative flex items-center justify-center gap-2">
              <MessageSquare className="w-5 h-5" /> 
              {t('start_project')}
            </span>
          </Button>
        </Link>
        <p className="text-[10px] text-center text-foreground/40 mt-4 uppercase tracking-widest font-bold">
           {t('whatsapp_advice')}
        </p>
      </div>
    </div>
  );
}
