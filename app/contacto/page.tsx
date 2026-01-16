import { Suspense } from 'react';
import { MessageSquare } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "@/components/contact/ContactForm";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24">
        <Section>
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h1 className="text-4xl font-bold font-heading text-white mb-6">Hablemos de tu Proyecto</h1>
              <p className="text-gray-400 text-lg mb-8">
                ¿Tienes una idea en mente? Cuéntanos sobre tus necesidades de automatización o desarrollo web.
              </p>
              
              <div className="space-y-6">
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <span className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.418-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" /></svg>
                     </span>
                     <div>
                        <h3 className="font-bold text-white leading-none">YouTube</h3>
                        <a href="https://www.youtube.com/@technonets" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">
                           @technonets
                        </a>
                     </div>
                  </div>

                  <div className="flex items-center gap-3">
                     <span className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v10.06c0 4.39-3.38 7.64-7.56 7.66-4.16.02-7.85-3.04-8.08-7.38-.2-4.15 2.91-7.88 7.02-8.03.35-.01.7 0 1.05.01v4.04c-.16-.02-.32-.03-.49-.03-2.18.01-4 1.75-4.04 3.92-.01 2.2 1.72 4 3.91 4.01 2.21-.01 3.99-1.75 4.02-3.95V.02h-0.03z"/></svg>
                     </span>
                     <div>
                        <h3 className="font-bold text-white leading-none">TikTok</h3>
                        <a href="https://www.tiktok.com/@tecnonets" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">
                           @tecnonets
                        </a>
                     </div>
                  </div>
              </div>
              </div>
            </div>

            <div className="bg-card border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <Suspense fallback={<div className="text-white">Cargando formulario...</div>}>
                <ContactForm />
              </Suspense>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
