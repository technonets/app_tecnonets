'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname, routing } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { Globe } from 'lucide-react';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const toggleLocale = () => {
    const nextLocale = locale === 'es' ? 'en' : 'es';
    router.replace(
      // @ts-expect-error -- TypeScript doesn't know that params is compatible
      {pathname, params},
      {locale: nextLocale}
    );
  };

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-foreground/5 border border-border/50 hover:bg-foreground/10 transition-colors text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
      aria-label="Switch language"
    >
      <Globe className="w-3.5 h-3.5 text-primary" />
      <span>{locale === 'es' ? 'EN' : 'ES'}</span>
    </button>
  );
}
