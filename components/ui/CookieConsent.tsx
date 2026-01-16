'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Verificar si ya aceptó las cookies
    const accepted = localStorage.getItem('cookie-consent');
    if (!accepted) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-7xl mx-auto bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-sm text-gray-300">
          <p className="mb-2">
            <strong>🍪 Valoramos tu privacidad</strong>
          </p>
          <p>
            Utilizamos cookies propias y de terceros (incluyendo Google AdSense y Analytics) para mejorar tu experiencia, 
            analizar el tráfico y mostrar publicidad personalizada. Al continuar navegando, aceptas su uso.
            Puedes leer nuestra <Link href="/privacidad" className="text-primary hover:underline">Política de Privacidad</Link>.
          </p>
        </div>
        <div className="flex gap-4 shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShow(false)}
            className="text-gray-400 hover:text-white"
          >
            Cerrar
          </Button>
          <Button 
            size="sm" 
            onClick={accept}
            className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]"
          >
            Aceptar todas
          </Button>
        </div>
      </div>
    </div>
  );
}
