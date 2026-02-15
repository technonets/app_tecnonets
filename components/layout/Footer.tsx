'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Youtube, Mail, Github, Twitter } from 'lucide-react';
import { SiTiktok } from 'react-icons/si';

export function Footer() {
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
              Especialistas en <strong>diseño de páginas web</strong> y <strong>crear página web profesional</strong>. Automatización avanzada con Google Apps Script.
            </p>
            <div className="flex gap-4 mt-6">
              <a 
                href="https://youtube.com/@technonets" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-red-500 transition-colors"
                aria-label="Visitar nuestro canal de YouTube"
              >
                <Youtube className="w-6 h-6" />
              </a>
              <a 
                href="https://www.tiktok.com/@technonets" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Seguirnos en TikTok"
              >
                <SiTiktok className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 text-foreground uppercase tracking-tight">Servicios</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/servicios/automatizacion" 
                  className="text-muted-foreground hover:text-primary transition-colors font-bold"
                  onClick={(e) => {
                    if (window.location.pathname === '/servicios/automatizacion') {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                >
                  Automatización (Google)
                </Link>
              </li>
              <li>
                <Link 
                  href="/servicios/desarrollo-web" 
                  className="text-muted-foreground hover:text-primary transition-colors font-bold"
                  onClick={(e) => {
                    if (window.location.pathname === '/servicios/desarrollo-web') {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                >
                  Diseño de Páginas Web
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 text-foreground uppercase tracking-tight">Recursos</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/tienda" 
                  className="text-muted-foreground hover:text-primary transition-colors font-bold"
                  onClick={(e) => {
                    if (window.location.pathname === '/tienda') {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                >
                  Tienda de Código
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog" 
                  className="text-muted-foreground hover:text-primary transition-colors font-bold"
                  onClick={(e) => {
                    if (window.location.pathname === '/blog') {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                >
                  Blog & Tutoriales
                </Link>
              </li>
              <li>
                <Link 
                  href="/contacto" 
                  className="text-muted-foreground hover:text-primary transition-colors font-bold"
                  onClick={(e) => {
                    if (window.location.pathname === '/contacto') {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 text-foreground uppercase tracking-tight">Aliados</h3>
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
            © {new Date().getFullYear()} Tecnonets. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground font-bold">
            <Link href="/privacidad" className="hover:text-primary transition-colors">Privacidad</Link>
            <Link href="/terminos" className="hover:text-primary transition-colors">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
