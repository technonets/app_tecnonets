'use client';

import React from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { Globe } from 'lucide-react';

export function CurrencySwitcher() {
  const { currency, setCurrency, isAutoDetected } = useCurrency();

  return (
    <div className="flex items-center gap-3 p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
      <div className="hidden sm:flex items-center gap-2 pl-3 pr-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-r border-white/10">
        <Globe className="w-3 h-3" />
        <span>Moneda</span>
      </div>
      
      <div className="flex gap-1">
        <button
          onClick={() => setCurrency('COP')}
          className={`
            px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300
            ${currency === 'COP' 
              ? 'bg-primary text-white shadow-lg' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'}
          `}
        >
          COP
        </button>
        <button
          onClick={() => setCurrency('USD')}
          className={`
            px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300
            ${currency === 'USD' 
              ? 'bg-secondary text-white shadow-lg' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'}
          `}
        >
          USD
        </button>
      </div>

      {isAutoDetected && (
        <span className="hidden md:block absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/10 text-white text-[10px] px-2 py-1 rounded border border-white/10 animate-fade-in pointer-events-none">
          Detectado: {currency}
        </span>
      )}
    </div>
  );
}
