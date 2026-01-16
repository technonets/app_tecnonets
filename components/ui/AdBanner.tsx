'use client';

import { useEffect } from 'react';

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: 'true' | 'false';
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdBanner({ 
  slot, 
  format = 'auto', 
  responsive = 'true', 
  className = "",
  style = {}
}: AdBannerProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err: any) {
      if (process.env.NODE_ENV !== 'production') {
        // Silenciar errores comunes de AdSense en desarrollo
        const errorMessage = err?.message || '';
        if (
          errorMessage.includes('No slot size') ||
          errorMessage.includes('at least 250px wide') ||
          errorMessage.includes('availableWidth=0')
        ) {
          return; // Ignorar estos errores en desarrollo
        }
        console.error("AdSense error:", err);
      }
    }
  }, []);

  // Determinar si es un anuncio lateral (vertical)
  const isVertical = format === 'rectangle' || className.includes('w-') && className.includes('h-');

  return (
    <div 
      className={`ad-container w-full overflow-hidden my-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center relative ${className}`} 
      style={{ minHeight: isVertical ? '400px' : '150px', ...style }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-white/[0.02]">
        <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-gray-500 mb-1">Publicidad</span>
        <span className="text-[8px] font-mono text-gray-700 italic">Slot: {slot}</span>
      </div>
      
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style, position: 'relative', zIndex: 1 }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
