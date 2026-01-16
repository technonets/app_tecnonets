import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Section } from "@/components/ui/Section";
import { FileText, AlertTriangle, CreditCard, RefreshCw, Code, Ban } from "lucide-react";

export const metadata = {
  title: "Términos y Condiciones | Tecnonets",
  description: "Términos y condiciones de uso de los servicios de Tecnonets",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24 pb-20">
        <Section>
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-4">
                Términos y Condiciones
              </h1>
              <p className="text-gray-400">
                Última actualización: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-invert prose-lg max-w-none space-y-12">
              
              {/* Aceptación */}
              <div className="bg-card border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Aceptación de Términos</h2>
                <p className="text-gray-300 leading-relaxed">
                  Al acceder y utilizar los servicios de <span className="text-primary font-semibold">Tecnonets</span>, aceptas estar sujeto a estos términos y condiciones. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestros servicios.
                </p>
              </div>

              {/* Servicios Ofrecidos */}
              <div className="bg-card border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Servicios Ofrecidos</h2>
                <div className="space-y-4 text-gray-300">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">1. Website as a Service (WaaS)</h3>
                    <p className="leading-relaxed">Desarrollo y mantenimiento de sitios web y landing pages bajo modelo de suscripción mensual. Incluye hosting, SSL, dominio, soporte técnico y actualizaciones de contenido según el plan contratado.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">2. Automatización Google Workspace</h3>
                    <p className="leading-relaxed">Desarrollo de scripts personalizados, integraciones entre Google Sheets, Forms, Calendar y Gmail para optimizar procesos empresariales.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">3. Productos Digitales</h3>
                    <p className="leading-relaxed">Venta de plantillas, scripts y recursos digitales listos para usar. Algunos productos son gratuitos y otros requieren pago único.</p>
                  </div>
                </div>
              </div>

              {/* Modelo de Suscripción WaaS */}
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-primary" />
                  Términos del Servicio WaaS (Website as a Service) - Importante
                </h2>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1 text-xl">•</span>
                    <div>
                      <strong className="text-white">Modelo de Suscripción (WaaS):</strong> El servicio funciona bajo un modelo de suscripción o "arrendamiento". El sitio web está online y operativo únicamente mientras la mensualidad esté activa y al día.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1 text-xl">•</span>
                    <div>
                      <strong className="text-white">Propiedad del Código:</strong> Tecnonets mantiene la propiedad intelectual y técnica del código fuente, infraestructura e implementación. El cliente tiene el derecho de uso y explotación comercial del sitio durante la vigencia del plan.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1 text-xl">•</span>
                    <div>
                      <strong className="text-white">Soporte y Mantenimiento:</strong> Incluye monitoreo de uptime, parches de seguridad y soporte técnico ante fallos o caídas del servidor para garantizar la estabilidad del sitio.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1 text-xl">•</span>
                    <div>
                      <strong className="text-white">Política de Cambios Mensuales:</strong> 
                      <p className="mt-1">
                        - <span className="text-white font-medium">Landing Pages:</span> 1 cambio menor mensual (texto o imagen, no rediseños).<br/>
                        - <span className="text-white font-medium">Sitio Corporativo:</span> 2 cambios menores mensuales (texto o imagen, no nuevas secciones ni rediseños).
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1 text-xl">•</span>
                    <div>
                      <strong className="text-white">Blog y Contenido:</strong> En planes corporativos, se entrega la estructura técnica de blog, pero <span className="italic text-primary">no se incluye la redacción de artículos ni la creación de contenidos</span>.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1 text-xl">•</span>
                    <div>
                      <strong className="text-white">Compra de Código (Buyout):</strong> Si el cliente desea migrar y poseer el código fuente de forma independiente, podrá solicitar un presupuesto de liberación (fee de compra de código) variable según el proyecto.
                    </div>
                  </li>
                </ul>
              </div>

              {/* Pagos y Facturación */}
              <div className="bg-card border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-primary" />
                  Pagos y Facturación
                </h2>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Los pagos se procesan a través de plataformas seguras de terceros</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Las suscripciones se renuevan automáticamente cada mes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Los precios están sujetos a cambios con aviso previo de 30 días</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>No se ofrecen reembolsos del Setup Fee una vez iniciado el desarrollo</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Puedes cancelar tu suscripción en cualquier momento sin penalización</span>
                  </li>
                </ul>
              </div>

              {/* Cancelación y Reembolsos */}
              <div className="bg-card border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <RefreshCw className="w-6 h-6 text-primary" />
                  Cancelación y Reembolsos
                </h2>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">
                    <strong className="text-white">Servicios WaaS:</strong> Puedes cancelar tu suscripción en cualquier momento. El servicio permanecerá activo hasta el final del período de facturación actual más 7 días de gracia. No se ofrecen reembolsos prorrateados.
                  </p>
                  <p className="leading-relaxed">
                    <strong className="text-white">Productos Digitales:</strong> Debido a la naturaleza digital de nuestros productos, no se aceptan devoluciones una vez descargado el archivo. Garantizamos la calidad y funcionalidad de todos nuestros productos.
                  </p>
                </div>
              </div>

              {/* Propiedad Intelectual */}
              <div className="bg-card border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Code className="w-6 h-6 text-primary" />
                  Propiedad Intelectual
                </h2>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Todo el código, diseños y contenido creado por Tecnonets son propiedad exclusiva de la empresa</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Los clientes reciben una licencia de uso limitada durante la vigencia de su suscripción</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>El contenido proporcionado por el cliente (textos, imágenes, logos) sigue siendo propiedad del cliente</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Productos digitales adquiridos otorgan licencia de uso personal o comercial según se especifique</span>
                  </li>
                </ul>
              </div>

              {/* Limitación de Responsabilidad */}
              <div className="bg-card border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Ban className="w-6 h-6 text-primary" />
                  Limitación de Responsabilidad
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Tecnonets no se hace responsable de:
                </p>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Pérdida de datos debido a fallas de terceros (Google, proveedores de hosting)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Interrupciones del servicio por mantenimiento programado o emergencias</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Daños indirectos, incidentales o consecuentes derivados del uso de nuestros servicios</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Contenido ilegal o inapropiado proporcionado por el cliente</span>
                  </li>
                </ul>
              </div>

              {/* Modificaciones */}
              <div className="bg-card border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Modificaciones a los Términos</h2>
                <p className="text-gray-300 leading-relaxed">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios significativos serán notificados por correo electrónico con 30 días de anticipación. El uso continuado de nuestros servicios después de la notificación constituye la aceptación de los nuevos términos.
                </p>
              </div>

              {/* Contacto */}
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Contacto</h2>
                <p className="text-gray-300 leading-relaxed">
                  Para consultas sobre estos términos y condiciones, contáctanos a través de WhatsApp o nuestro formulario en{" "}
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
