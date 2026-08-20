'use client';

import React, { useRef } from 'react';
import { Calendar, ChevronRight, Sparkles } from 'lucide-react';

interface DatePickerProps {
  value: string; // YYYY-MM-DD or empty
  onChange: (val: string) => void;
  minDate?: string;
  placeholder?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  placeholder = 'Seleccionar fecha de vencimiento...',
  className = ''
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const formatDisplay = (val: string) => {
    if (!val) return '';
    try {
      const parts = val.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return d.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
    } catch {
      return val;
    }
    return val;
  };

  const handleOpenPicker = () => {
    if (inputRef.current) {
      if (typeof inputRef.current.showPicker === 'function') {
        try {
          inputRef.current.showPicker();
        } catch {
          inputRef.current.focus();
        }
      } else {
        inputRef.current.focus();
      }
    }
  };

  const addDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    onChange(d.toISOString().split('T')[0]);
  };

  const addMonths = (months: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    onChange(d.toISOString().split('T')[0]);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Campo con disparador interactivo */}
      <div 
        onClick={handleOpenPicker}
        className="group relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 cursor-pointer hover:border-blue-500 transition-all shadow-2xs focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500"
      >
        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mr-2 group-hover:scale-105 transition-transform">
          <Calendar className="w-3.5 h-3.5" />
        </div>

        <div className="flex-1 min-w-0">
          {value ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white capitalize">
                {formatDisplay(value)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">({value})</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">
              {placeholder}
            </span>
          )}
        </div>

        {/* Input nativo transparente con picker */}
        <input
          ref={inputRef}
          type="date"
          min={minDate}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />

        <div className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md flex items-center gap-0.5 shrink-0 pointer-events-none group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <span>Cambiar</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>

      {/* Chips Rápidos de Selección */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[10px] text-slate-400 font-medium mr-0.5">Atajos:</span>
        <button
          type="button"
          onClick={() => addDays(7)}
          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-semibold transition-colors cursor-pointer"
        >
          +7 Días
        </button>
        <button
          type="button"
          onClick={() => addDays(14)}
          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-semibold transition-colors cursor-pointer"
        >
          +14 Días
        </button>
        <button
          type="button"
          onClick={() => addMonths(1)}
          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-semibold transition-colors cursor-pointer"
        >
          +1 Mes
        </button>
        <button
          type="button"
          onClick={() => addMonths(6)}
          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-semibold transition-colors cursor-pointer"
        >
          +6 Meses
        </button>
        <button
          type="button"
          onClick={() => addMonths(12)}
          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-semibold transition-colors cursor-pointer"
        >
          +1 Año
        </button>
        <button
          type="button"
          onClick={() => onChange('')}
          className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 rounded-md text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
        >
          <Sparkles className="w-2.5 h-2.5" />
          <span>Vitalicia</span>
        </button>
      </div>
    </div>
  );
};
