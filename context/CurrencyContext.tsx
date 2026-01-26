'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = 'USD' | 'COP';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  isAutoDetected: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isAutoDetected, setIsAutoDetected] = useState(false);

  useEffect(() => {
    // 1. Check for stored preference
    const stored = localStorage.getItem('preferred-currency') as Currency;
    if (stored === 'USD' || stored === 'COP') {
      setCurrency(stored);
      return;
    }

    // 2. Auto-detection based on timezone
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timeZone === 'America/Bogota') {
        setCurrency('COP');
        setIsAutoDetected(true);
      } else {
        setCurrency('USD');
        setIsAutoDetected(true);
      }
    } catch (e) {
      console.error('Geo-detection failed:', e);
    }
  }, []);

  const handleSetCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    setIsAutoDetected(false); // Manual override
    localStorage.setItem('preferred-currency', newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, isAutoDetected }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
