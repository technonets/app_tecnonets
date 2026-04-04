'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { Globe, Loader2 } from 'lucide-react';
import { useTransition } from 'react';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const toggleLocale = () => {
    const nextLocale = locale === 'es' ? 'en' : 'es';
    
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript doesn't know that params is compatible
        {pathname, params},
        {locale: nextLocale}
      );
    });
  };

  return (
    <button
      onClick={toggleLocale}
      disabled={isPending}
      className={`relative h-11 flex items-center gap-3 px-5 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-foreground/5 hover:border-primary/50 transition-all text-[14px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground active:scale-95 group shadow-sm ${isPending ? 'opacity-70 cursor-wait' : ''}`}
      aria-label="Switch language"
    >
      <div className="flex items-center justify-center">
        {isPending ? (
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        ) : (
          <Globe className="w-5 h-5 text-primary transition-transform duration-500 group-hover:rotate-45" />
        )}
      </div>
      <span className="relative">
        {locale === 'es' ? 'EN' : 'ES'}
      </span>
    </button>
  );
}
