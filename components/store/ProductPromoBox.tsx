'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Timer, Check, Percent, Sparkles, Flame, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ProductPromoBoxProps {
  productId: string;
  price: number;
  originalPrice?: number;
  offerEndDate?: string;
  freeUntilDate?: string;
  promotionBadge?: string;
  checkoutUrl: string;
  freeLabel?: string;
}

export function ProductPromoBox({
  productId,
  price,
  originalPrice,
  offerEndDate,
  freeUntilDate,
  promotionBadge,
  checkoutUrl,
  freeLabel = 'GRATIS'
}: ProductPromoBoxProps) {
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponResult, setCouponResult] = useState<{
    valid: boolean;
    discountAmount?: number;
    finalPrice?: number;
    message: string;
  } | null>(null);

  // Time remaining state
  const targetDate = offerEndDate || freeUntilDate;
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!targetDate) return;

    function calculateTime() {
      const difference = new Date(targetDate!).getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft(null);
      }
    }

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    try {
      const res = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          price: price,
          productId
        })
      });
      const data = await res.json();
      setCouponResult(data);
    } catch (err: any) {
      setCouponResult({ valid: false, message: 'Error al verificar el cupón' });
    } finally {
      setCouponLoading(false);
    }
  };

  const currentPrice = couponResult?.valid && couponResult.finalPrice !== undefined
    ? couponResult.finalPrice
    : price;

  const isFree = currentPrice === 0;

  return (
    <div className="space-y-4">
      {/* Banner de Urgencia / Cuenta Regresiva */}
      {timeLeft && (
        <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-red-500/15 border border-orange-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
              <Timer className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-white flex items-center gap-1.5">
                <span>{freeUntilDate ? '🎁 ¡Gratis por Tiempo Limitado!' : '⚡ Oferta de Lanzamiento'}</span>
              </p>
              <p className="text-[11px] text-gray-400">
                {freeUntilDate ? 'Asegura tu acceso antes de que sea de pago' : 'El precio aumentará al finalizar el contador'}
              </p>
            </div>
          </div>

          {/* Reloj Contador */}
          <div className="flex items-center gap-1.5 font-mono font-black text-center shrink-0">
            <div className="px-2 py-1 bg-black/40 rounded-lg border border-white/10">
              <span className="text-sm text-white block">{timeLeft.days}</span>
              <span className="text-[9px] text-gray-400 font-sans font-medium">días</span>
            </div>
            <span className="text-orange-500 font-bold">:</span>
            <div className="px-2 py-1 bg-black/40 rounded-lg border border-white/10">
              <span className="text-sm text-white block">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-[9px] text-gray-400 font-sans font-medium">horas</span>
            </div>
            <span className="text-orange-500 font-bold">:</span>
            <div className="px-2 py-1 bg-black/40 rounded-lg border border-white/10">
              <span className="text-sm text-white block">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-[9px] text-gray-400 font-sans font-medium">min</span>
            </div>
            <span className="text-orange-500 font-bold">:</span>
            <div className="px-2 py-1 bg-black/40 rounded-lg border border-white/10">
              <span className="text-sm text-orange-400 block">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-[9px] text-gray-400 font-sans font-medium">seg</span>
            </div>
          </div>
        </div>
      )}

      {/* Bloque Principal de Precio */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pb-6 border-b border-white/10">
        <div className="text-center sm:text-left">
          <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
            <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Precio</span>
            {promotionBadge && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xs">
                {promotionBadge}
              </span>
            )}
            {originalPrice && originalPrice > price && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                -{Math.round((1 - price / originalPrice) * 100)}% OFF
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2.5 justify-center sm:justify-start">
            {originalPrice && originalPrice > price && (
              <span className="text-2xl text-gray-500 line-through font-bold">
                ${originalPrice}
              </span>
            )}
            <span className="text-5xl font-black text-white">
              {isFree ? (
                <span className="text-emerald-400">{freeLabel}</span>
              ) : (
                `$${currentPrice.toFixed(2)}`
              )}
            </span>
            {!isFree && <span className="text-xs text-gray-400 font-semibold">USD</span>}
          </div>
        </div>

        <a
          href={checkoutUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto"
        >
          <Button size="lg" className="h-16 px-10 text-lg w-full sm:w-auto shadow-[0_0_30px_rgba(139,92,246,0.25)] gap-2 font-bold cursor-pointer">
            {isFree ? '⬇️ Descargar Gratis' : 'Comprar Ahora'}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </a>
      </div>

      {/* Aplicar Cupón de Descuento */}
      {!isFree && (
        <form onSubmit={handleApplyCoupon} className="pt-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="¿Tienes un cupón de descuento?"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 uppercase font-mono font-bold tracking-wider outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={couponLoading || !couponCode.trim()}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer"
            >
              {couponLoading ? '...' : 'Aplicar'}
            </button>
          </div>

          {couponResult && (
            <p className={`text-xs font-semibold mt-2 flex items-center gap-1.5 ${
              couponResult.valid ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {couponResult.valid ? <Check className="w-3.5 h-3.5 shrink-0" /> : '✕'}
              <span>{couponResult.message}</span>
            </p>
          )}
        </form>
      )}
    </div>
  );
}
