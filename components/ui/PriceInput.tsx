'use client';

import React from 'react';
import { DollarSign, Percent } from 'lucide-react';

interface PriceInputProps {
  value: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  currency?: string;
  icon?: 'dollar' | 'percent' | 'none';
  className?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export const PriceInput: React.FC<PriceInputProps> = ({
  value,
  onChange,
  placeholder = '0.00',
  currency = 'USD',
  icon = 'dollar',
  className = '',
  disabled = false
}) => {
  const displayValue = value === undefined || value === null ? '' : String(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;
    // Normalizar coma por punto para consistencia interna si el usuario escribe coma
    raw = raw.replace(',', '.');
    // Solo permitir números y máximo un punto decimal
    if (/^[0-9]*\.?[0-9]*$/.test(raw)) {
      onChange(raw);
    }
  };

  return (
    <div className={`relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 shadow-2xs ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
      {icon === 'dollar' && (
        <div className="pl-3 pr-1 text-slate-400 font-semibold text-xs flex items-center gap-0.5 select-none pointer-events-none">
          <DollarSign className="w-3.5 h-3.5 text-slate-500" />
        </div>
      )}
      {icon === 'percent' && (
        <div className="pl-3 pr-1 text-slate-400 font-semibold text-xs flex items-center gap-0.5 select-none pointer-events-none">
          <Percent className="w-3.5 h-3.5 text-purple-500" />
        </div>
      )}

      <input
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        disabled={disabled}
        className={`w-full py-2 ${currency ? 'pr-12' : 'pr-3'} ${icon === 'none' ? 'pl-3' : ''} bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none placeholder:text-slate-400`}
      />

      {currency && (
        <div className="absolute right-2.5 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono font-bold text-slate-500 select-none pointer-events-none">
          {currency}
        </div>
      )}
    </div>
  );
};
