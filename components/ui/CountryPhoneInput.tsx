'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { LATAM_COUNTRY_CODES, CountryCodeItem, parsePhoneAndCountry } from '@/lib/countries';

interface CountryPhoneInputProps {
  countryCode: string;
  localPhone: string;
  onCountryChange: (code: string) => void;
  onPhoneChange: (phone: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CountryPhoneInput({
  countryCode,
  localPhone,
  onCountryChange,
  onPhoneChange,
  placeholder = '321 588 2400',
  className = '',
  disabled = false
}: CountryPhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Encontrar el país actual
  const currentCountry = LATAM_COUNTRY_CODES.find(c => c.dialCode === countryCode) || LATAM_COUNTRY_CODES[0];

  // Filtrar países según búsqueda
  const filteredCountries = LATAM_COUNTRY_CODES.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dialCode.includes(search) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Detección automática al pegar o escribir indicativo completo
    const parsed = parsePhoneAndCountry(val);
    if (val.startsWith('+') && parsed.localPhone !== val) {
      onCountryChange(parsed.countryDialCode);
      onPhoneChange(parsed.localPhone);
    } else {
      onPhoneChange(val);
    }
  };

  return (
    <div className={`relative flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all ${className}`} ref={dropdownRef}>
      {/* Botón Selector de País con Bandera */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch('');
        }}
        className="flex items-center gap-1.5 px-3 py-2 border-r border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-l-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shrink-0 transition-colors cursor-pointer disabled:opacity-50"
        title={`${currentCountry.name} (${currentCountry.dialCode})`}
      >
        <span className="text-base leading-none">{currentCountry.flag}</span>
        <span className="font-mono text-xs">{currentCountry.dialCode}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Input del Número de Teléfono Local */}
      <input
        type="tel"
        disabled={disabled}
        value={localPhone}
        onChange={handlePhoneInputChange}
        placeholder={currentCountry.placeholder || placeholder}
        className="w-full px-3 py-2 bg-transparent text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
      />

      {/* Menú Desplegable Personalizado Flotante */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-72 max-h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-100">
          {/* Buscador de países */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 bg-slate-50/50 dark:bg-slate-950/50">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar país o indicativo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>

          {/* Lista de países */}
          <div className="overflow-y-auto p-1 max-h-48 divide-y divide-slate-100/50 dark:divide-slate-800/50">
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">No se encontraron países</div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.dialCode === currentCountry.dialCode && c.code === currentCountry.code;
                return (
                  <button
                    key={`${c.code}-${c.dialCode}`}
                    type="button"
                    onClick={() => {
                      onCountryChange(c.dialCode);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base shrink-0">{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="font-mono text-[11px] text-slate-400 font-semibold">{c.dialCode}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
