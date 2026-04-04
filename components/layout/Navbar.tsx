'use client';
import { useState } from 'react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Menu, X, ShoppingBag, Code, Grid, Monitor, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher';
import { useTranslations } from 'next-intl';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const t = useTranslations('Navbar');

  const navLinks = [
    { name: t('services'), href: '/servicios/automatizacion', icon: Grid },
    { name: t('store'), href: '/tienda', icon: ShoppingBag },
    { name: t('blog'), href: '/blog', icon: Code },
    { name: t('guides'), href: '/guias', icon: BookOpen },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-sm overflow-hidden border border-border">
                <Image 
                  src="/logo.png" 
                  alt="Tecnonets Logo" 
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-xl font-bold font-heading tracking-tight text-foreground">
                Tecnonets
              </span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-3 py-2 rounded-md text-[15px] font-bold text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <LocaleSwitcher />
            <ThemeToggle />
            <Link href="/contacto">
                <Button variant="primary" size="sm" className="font-bold uppercase tracking-widest text-xs">
                {t('contact')}
                </Button>
            </Link>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border/50 shadow-2xl">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-4 rounded-md text-base font-bold text-muted-foreground hover:text-primary hover:bg-foreground/5 transition-all"
              >
                <link.icon className="h-5 w-5 text-primary" />
                {link.name}
              </Link>
            ))}
            <div className="pt-4 pb-2 border-t border-border/50 space-y-4">
              <div className="flex items-center justify-between px-3">
                <span className="text-xs font-bold text-muted-foreground uppercase opacity-50">{t('settings')}</span>
                <div className="flex items-center gap-3">
                  <LocaleSwitcher />
                  <ThemeToggle />
                </div>
              </div>
              <Link href="/contacto" onClick={() => setIsOpen(false)} className="block px-3">
                <Button className="w-full" variant="primary">{t('contact')}</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
