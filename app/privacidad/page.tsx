import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Section } from "@/components/ui/Section";
import { Shield, Lock, Eye, Database, UserCheck, Mail } from "lucide-react";

export const metadata = {
  title: "Política de Privacidad | Tecnonets",
  description: "Política de privacidad y protección de datos de Tecnonets",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24 pb-20">
        <Section>
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-4">
                Política de Privacidad
              </h1>
              <p className="text-gray-400">
                Última actualización: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-invert prose-lg max-w-none space-y-12">
              
              {/* Introducción */}
              <div className="bg-card border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Eye className="w-6 h-6 text-primary" />
                  Introducción
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  En <span className="text-primary font-semibold">Tecnonets</span>, nos comprometemos a proteger tu privacidad y garantizar la seguridad de tus datos personales. Esta política describe cómo recopilamos, usamos y protegemos tu información cuando utilizas nuestros servicios de automatización, desarrollo web y productos digitales.
                </p>
              </div>

              {/* Información que Recopilamos */}
              <div className="bg-card border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Database className="w-6 h-6 text-primary" />
                  Información que Recopilamos
                </h2>
                <div className="space-y-4 text-gray-300">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Información de Contacto</h3>
                    <p className="leading-relaxed">Nombre, correo electrónico, número de teléfono y empresa cuando solicitas nuestros servicios o te suscribes a nuestro contenido.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Información de Pago</h3>
                    <p className="leading-relaxed">Procesamos pagos a través de plataformas seguras de terceros. No almacenamos información de tarjetas de crédito en nuestros servidores.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Datos de Uso</h3>
                    <p className="leading-relaxed">Información sobre cómo interactúas con nuestro sitio web mediante Google Analytics y Facebook Pixel para mejorar la experiencia del usuario.</p>
                  </div>
                </div>
              </div>

              {/* Cómo Usamos tu Información */}
              <div className="bg-card border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <UserCheck className="w-6 h-6 text-primary" />
                  Cómo Usamos tu Información
                </h2>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Proveer y mantener nuestros servicios de suscripción (WaaS - Website as a Service)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Procesar pagos y gestionar tu cuenta de cliente</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Enviar actualizaciones sobre tu servicio, cambios técnicos y soporte</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Mejorar nuestros productos y servicios mediante análisis de uso</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Cumplir con obligaciones legales y fiscales</span>
                  </li>
                </ul>
              </div>

              {/* Protección de Datos */}
              <div className="bg-card border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Lock className="w-6 h-6 text-primary" />
                  Protección de Datos
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos:
                </p>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Certificados SSL en todos nuestros sitios web</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Almacenamiento seguro en Google Drive con permisos restringidos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Acceso limitado solo a personal autorizado</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Backups regulares de datos críticos</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Cookies y Publicidad (Google AdSense)</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Este sitio utiliza cookies para mejorar la experiencia del usuario y mostrar publicidad relevante. Específicamente respecto a Google AdSense:
                </p>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Proveedores externos, incluido Google, utilizan cookies para mostrar anuncios basados en las visitas anteriores del usuario a su sitio web o a otros sitios web.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>El uso de cookies publicitarias permite a Google y a sus socios mostrar anuncios a los usuarios basados en sus visitas a sus sitios y/o a otros sitios de Internet.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      Los usuarios pueden inhabilitar la publicidad personalizada visitando <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Configuración de Anuncios</a>. 
                      Alternativamente, pueden inhabilitar el uso de cookies de proveedores externos para publicidad personalizada visitando <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.aboutads.info</a>.
                    </span>
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-400">
                    Además utilizamos <strong>Google Analytics</strong> para análisis de tráfico y <strong>Facebook Pixel</strong> para medición de conversiones.
                  </p>
                </div>
              </div>

              {/* Tus Derechos */}
              <div className="bg-card border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Tus Derechos</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Tienes derecho a:
                </p>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Acceder a tus datos personales</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Rectificar información incorrecta</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Solicitar la eliminación de tus datos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Oponerte al procesamiento de tus datos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Portabilidad de datos</span>
                  </li>
                </ul>
              </div>

              {/* Contacto */}
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Mail className="w-6 h-6 text-primary" />
                  Contacto
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Para ejercer tus derechos o realizar consultas sobre esta política de privacidad, contáctanos a través de WhatsApp o nuestro formulario de contacto en{" "}
                  <a href="/contacto" className="text-primary hover:underline">tecnonets.com/contacto</a>
                </p>
              </div>

            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
