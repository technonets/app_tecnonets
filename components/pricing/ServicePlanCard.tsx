'use client';
import { Check, HelpCircle, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useCurrency } from "@/context/CurrencyContext";

interface Price {
  COP: string;
  USD: string;
}

interface ServicePlanCardProps {
  title?: string;
  description: string;
  setupFee?: string; // Legacy
  monthlyFee?: string; // Legacy
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
  
  const currentSetup = prices.setup[currency];
  const currentMonthly = prices.monthly[currency];
  const currencyLabel = currency === 'USD' ? 'USD' : 'COP';
  return (
    <div className={`
      relative flex flex-col p-8 rounded-3xl border transition-all duration-300 h-full
      ${isPopular 
        ? 'bg-card border-primary shadow-[0_0_50px_rgba(139,92,246,0.15)] z-10 ring-1 ring-primary' 
        : 'bg-white/5 border-white/10 hover:bg-white/10'}
    `}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
          Más Popular
        </div>
      )}

      <div className="mb-8 text-center md:text-left">
        {title && <h3 className="text-2xl font-bold font-heading text-white mb-2">{title}</h3>}
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>

      {/* Pricing Block */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Setup Fee */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Setup (Pago Único)</p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-white">{currentSetup}</span>
            <span className="text-gray-500 text-[10px]">{currencyLabel}</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Diseño & Configuración</p>
        </div>

        {/* Monthly Fee */}
        <div className={`rounded-xl p-4 border ${isPopular ? 'bg-primary/10 border-primary/20' : 'bg-white/5 border-white/5'}`}>
          <p className={`${isPopular ? 'text-primary' : 'text-gray-400'} text-[10px] font-bold uppercase tracking-wider mb-1`}>Mensualidad</p>
          <div className="flex items-baseline gap-1">
             <span className="text-xl font-bold text-white">{currentMonthly}</span>
             <span className="text-gray-500 text-[10px]">{currencyLabel}/mes</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Mantenimiento & Soporte</p>
        </div>
      </div>
      
      {/* Features Sections */}
      <div className="space-y-8 mb-8 flex-grow">
        {/* Legacy Features (if provided) */}
        {features && !setupFeatures && (
          <div>
            <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Qué incluye:
            </p>
            <ul className="space-y-3">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
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
            <p className="text-xs font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(139,92,246,0.5)]"></span>
              Qué incluye el Setup
            </p>
            <ul className="space-y-3">
              {setupFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
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
            <p className="text-xs font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
              Qué incluye la Mensualidad
            </p>
            <ul className="space-y-3">
              {monthlyFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* NEW Not Included */}
        {notIncluded && (
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest">No incluye</p>
            <ul className="space-y-2">
              {notIncluded.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs text-gray-500">
                  <span className="w-1 h-1 rounded-full bg-gray-600 shrink-0 mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* NEW Expected Outcome */}
        {expectedOutcome && (
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 mt-6">
            <p className="text-xs font-bold text-primary mb-2 uppercase tracking-widest">Resultado Esperado</p>
            <p className="text-sm text-gray-300 italic">"{expectedOutcome}"</p>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="pt-6 border-t border-white/10 mt-auto">
        <Link href={ctaLink} className="w-full block">
          <Button 
            variant="primary" 
            className={`w-full h-14 text-lg shadow-lg group relative overflow-hidden ${isPopular ? 'animate-pulse' : ''}`}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative flex items-center justify-center gap-2">
              <MessageSquare className="w-5 h-5" /> 
              Comenzar Proyecto
            </span>
          </Button>
        </Link>
        <p className="text-[10px] text-center text-gray-500 mt-4 uppercase tracking-widest">
           Asesoría personalizada vía WhatsApp
        </p>
      </div>
    </div>
  );
}
