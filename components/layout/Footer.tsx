'use client';
import Link from 'next/link';
import { Youtube, Mail, Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-4 inline-block">
              Tecnonets
            </Link>
            <p className="text-gray-400 max-w-sm">
              Especialistas en <strong>diseño de páginas web</strong> y <strong>crear página web profesional</strong>. Automatización avanzada con Google Apps Script.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="https://youtube.com/@technonets" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition-colors">
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 text-white">Servicios</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/servicios/automatizacion" 
                  className="text-gray-400 hover:text-primary transition-colors"
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
                  className="text-gray-400 hover:text-primary transition-colors"
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
            <h3 className="font-heading font-semibold text-lg mb-4 text-white">Recursos</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/tienda" 
                  className="text-gray-400 hover:text-primary transition-colors"
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
                  className="text-gray-400 hover:text-primary transition-colors"
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
                  className="text-gray-400 hover:text-primary transition-colors"
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
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500" suppressHydrationWarning>
            © {new Date().getFullYear()} Tecnonets. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
            <Link href="/terminos" className="hover:text-white transition-colors">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
