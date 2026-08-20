/**
 * Plantillas HTML Responsive y de Alto Nivel para Correos de Tecnonets
 */

const baseWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tecnonets</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          
          <!-- Encabezado de Marca -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: center; background: linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%); border-bottom: 1px solid #f1f5f9;">
              <div style="display: inline-block; background-color: #ffffff; padding: 8px 16px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 12px;">
                <span style="font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">Tecnonets</span>
              </div>
              <p style="margin: 0; font-size: 13px; color: #64748b; font-weight: 500;">Automatización y Software Profesional</p>
            </td>
          </tr>

          <!-- Contenido Principal -->
          <tr>
            <td style="padding: 32px;">
              ${content}
            </td>
          </tr>

          <!-- Pie de Página -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #94a3b8;">
                © 2026 Tecnonets Soluciones Digitales. Todos los derechos reservados.
              </p>
              <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
                Si no solicitaste este correo, puedes ignorarlo de forma segura.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * 1. Plantilla de Código OTP de 6 Dígitos / Magic Link
 */
export function getOtpEmailTemplate(params: { pinCode: string; magicLink?: string }) {
  const { pinCode, magicLink } = params;

  const content = `
    <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 800; color: #0f172a; text-align: center; letter-spacing: -0.5px;">
      Tu Código de Acceso
    </h1>
    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.5; color: #64748b; text-align: center;">
      Usa este código de 6 dígitos para ingresar a tu cuenta de Tecnonets de forma rápida y segura:
    </p>

    <!-- Caja del Código PIN de 6 Dígitos -->
    <div style="background-color: #eff6ff; border: 2px dashed #93c5fd; border-radius: 16px; padding: 24px 16px; text-align: center; margin: 24px 0;">
      <span style="font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 38px; font-weight: 900; letter-spacing: 14px; color: #1d4ed8; display: inline-block; padding-left: 14px;">
        ${pinCode}
      </span>
      <p style="margin: 8px 0 0 0; font-size: 12px; font-weight: 600; color: #3b82f6;">
        ⏱️ Válido por 1 hora
      </p>
    </div>

    ${magicLink ? `
      <div style="text-align: center; margin: 28px 0 16px 0;">
        <p style="margin: 0 0 12px 0; font-size: 13px; color: #64748b;">
          O si prefieres, entra directamente sin escribir el código:
        </p>
        <a href="${magicLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; font-size: 14px; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
          Ingresar con 1 Clic Directo ➔
        </a>
      </div>
    ` : ''}

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #94a3b8;">
        🔒 Nunca compartas este código con personas no autorizadas.
      </p>
    </div>
  `;

  return baseWrapper(content);
}

/**
 * 2. Plantilla de Entrega de Licencia y Compra Exitosa
 */
export function getLicenseDeliveryTemplate(params: {
  customerName?: string;
  productName: string;
  licenseKey: string;
  orderNumber: string;
  portalUrl: string;
  spreadsheetUrl?: string;
  tutorialUrl?: string;
}) {
  const { customerName, productName, licenseKey, orderNumber, portalUrl, spreadsheetUrl, tutorialUrl } = params;

  const content = `
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="display: inline-block; background-color: #ecfdf5; color: #059669; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; border: 1px solid #a7f3d0;">
        ✓ ¡Compra Confirmada!
      </div>
    </div>

    <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 800; color: #0f172a; text-align: center;">
      ¡Gracias por tu compra${customerName ? `, ${customerName}` : ''}!
    </h1>
    <p style="margin: 0 0 20px 0; font-size: 14px; color: #64748b; text-align: center;">
      Tu orden <strong style="color: #0f172a;">#${orderNumber}</strong> ha sido procesada con éxito.
    </p>

    <!-- Caja de la Clave de Licencia -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin: 24px 0;">
      <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; display: block; margin-bottom: 6px;">
        Producto: ${productName}
      </span>
      <span style="font-size: 12px; color: #0f172a; font-weight: 600; display: block; margin-bottom: 12px;">
        Tu Clave de Licencia Oficial:
      </span>
      
      <div style="background-color: #ffffff; border: 2px solid #2563eb; border-radius: 10px; padding: 12px; text-align: center;">
        <span style="font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #1e293b;">
          ${licenseKey}
        </span>
      </div>
    </div>

    <!-- Botones de Acción -->
    <div style="text-align: center; margin: 28px 0 16px 0;">
      <a href="${portalUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: 700; border-radius: 10px; margin: 4px;">
        Abrir mi Portal de Licencias ➔
      </a>

      ${spreadsheetUrl ? `
        <a href="${spreadsheetUrl}" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: 700; border-radius: 10px; margin: 4px;">
          📊 Crear Copia en Google Sheets
        </a>
      ` : ''}
    </div>

    ${tutorialUrl ? `
      <p style="text-align: center; margin-top: 16px; font-size: 13px;">
        <a href="${tutorialUrl}" style="color: #2563eb; font-weight: 600; text-decoration: underline;">
          📺 Ver Video Tutorial Paso a Paso
        </a>
      </p>
    ` : ''}
  `;

  return baseWrapper(content);
}

/**
 * 3. Plantilla de Alerta de Seguridad y Renovación Automática de Clave
 */
export function getSecurityAlertEmailTemplate(params: {
  customerName?: string;
  productName: string;
  oldKey: string;
  newKey: string;
  portalUrl: string;
}) {
  const { customerName, productName, oldKey, newKey, portalUrl } = params;

  const content = `
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="display: inline-block; background-color: #fef2f2; color: #dc2626; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; border: 1px solid #fecaca;">
        🛡️ Aviso de Seguridad Automático
      </div>
    </div>

    <h1 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 800; color: #0f172a; text-align: center;">
      Tu clave ha sido renovada por seguridad
    </h1>
    <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.5; color: #64748b; text-align: center;">
      Hola ${customerName || 'Cliente'}, nuestro sistema de protección detectó múltiples accesos no autorizados a tu clave de <strong>${productName}</strong>.
    </p>

    <!-- Resumen de Claves -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin: 20px 0; font-size: 13px;">
      <p style="margin: 0 0 10px 0; color: #dc2626; font-weight: 700;">
        ⛔ Clave anterior cancelada: <span style="font-family: monospace; text-decoration: line-through;">${oldKey}</span>
      </p>
      <p style="margin: 0; color: #16a34a; font-weight: 700;">
        ✅ Tu NUEVA clave exclusiva: <span style="font-family: monospace; font-size: 15px; background: #dcfce7; color: #15803d; padding: 3px 8px; border-radius: 6px;">${newKey}</span>
      </p>
    </div>

    <p style="font-size: 12px; color: #64748b; line-height: 1.5; text-align: center;">
      Para seguir utilizando tu plantilla o software sin interrupciones, simplemente ingresa tu nueva clave en tu hoja o entra a tu espacio personal:
    </p>

    <div style="text-align: center; margin: 24px 0 16px 0;">
      <a href="${portalUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 28px; font-size: 13px; font-weight: 700; border-radius: 10px;">
        Acceder a Mi Espacio Tecnonets ➔
      </a>
    </div>
  `;

  return baseWrapper(content);
}
