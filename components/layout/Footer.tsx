'use client';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Youtube, Mail, Github, Twitter } from 'lucide-react';
import { SiTiktok } from 'react-icons/si';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('Footer');
  const n = useTranslations('Navbar');

  return (
    <footer className="border-t border-border/50 bg-background pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10 rounded-sm overflow-hidden flex-shrink-0 border border-border">
                <Image 
                  src="/logo.png" 
                  alt="Tecnonets Logo" 
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-2xl font-bold font-heading text-foreground tracking-tight">
                Tecnonets
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm font-medium">
              {t.rich('description', {
                bold: (chunks) => <strong>{chunks}</strong>
              })}
            </p>
            <div className="flex gap-4 mt-6">
              <a 
                href="https://youtube.com/@technonets" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-red-500 transition-colors"
                aria-label={t('youtube_aria')}
              >
                <Youtube className="w-6 h-6" />
              </a>
              <a 
                href="https://www.tiktok.com/@technonets" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={t('tiktok_aria')}
              >
                <SiTiktok className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 text-foreground uppercase tracking-tight">{t('services')}</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/servicios/automatizacion" 
                  className="text-muted-foreground hover:text-primary transition-colors font-bold"
                >
                  {n('services')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/servicios/desarrollo-web" 
                  className="text-muted-foreground hover:text-primary transition-colors font-bold"
                >
                  {t('web_design')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 text-foreground uppercase tracking-tight">{t('resources')}</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/tienda" 
                  className="text-muted-foreground hover:text-primary transition-colors font-bold"
                >
                  {n('store')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog" 
                  className="text-muted-foreground hover:text-primary transition-colors font-bold"
                >
                  {n('blog')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/contacto" 
                  className="text-muted-foreground hover:text-primary transition-colors font-bold"
                >
                  {n('contact')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 text-foreground uppercase tracking-tight">{t('allies')}</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://sistemascucuta.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-muted-foreground hover:text-primary transition-colors font-bold"
                >
                  Sistemas Cúcuta
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground font-bold" suppressHydrationWarning>
            © {new Date().getFullYear()} Tecnonets. {t('rights')}
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground font-bold">
            <Link href="/privacidad" className="hover:text-primary transition-colors">{t('privacy')}</Link>
            <Link href="/terminos" className="hover:text-primary transition-colors">{t('terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
