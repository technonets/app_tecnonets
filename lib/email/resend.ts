import { getOtpEmailTemplate, getLicenseDeliveryTemplate, getSecurityAlertEmailTemplate } from './templates';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.EMAIL_FROM || 'Tecnonets <onboarding@resend.dev>';

/**
 * Enviar correo mediante la API REST directa de Resend
 */
async function sendResendEmail(payload: {
  to: string[];
  subject: string;
  html: string;
}) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: payload.to,
        subject: payload.subject,
        html: payload.html
      })
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Error de Resend:', res.status, data);
      return { success: false, error: data };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Excepción enviando correo con Resend:', err);
    return { success: false, error: err };
  }
}

/**
 * Enviar Código de Acceso OTP / PIN por correo electrónico mediante Resend
 */
export async function sendOtpEmail(params: {
  to: string;
  pinCode: string;
  magicLink?: string;
}) {
  const { to, pinCode, magicLink } = params;
  const html = getOtpEmailTemplate({ pinCode, magicLink });

  return sendResendEmail({
    to: [to],
    subject: `Tu código de acceso a Tecnonets: ${pinCode}`,
    html: html
  });
}

/**
 * Enviar Licencia y Confirmación de Compra mediante Resend
 */
export async function sendLicenseDeliveryEmail(params: {
  to: string;
  customerName?: string;
  productName: string;
  licenseKey: string;
  orderNumber: string;
  portalUrl: string;
  spreadsheetUrl?: string;
  tutorialUrl?: string;
}) {
  const html = getLicenseDeliveryTemplate(params);

  return sendResendEmail({
    to: [params.to],
    subject: `¡Tu licencia de ${params.productName} está lista! 📦`,
    html: html
  });
}

/**
 * Enviar Notificación de Renovación Automática por Seguridad (Anti-Abuso)
 */
export async function sendSecurityAlertEmail(params: {
  to: string;
  customerName?: string;
  productName: string;
  oldKey: string;
  newKey: string;
  portalUrl: string;
}) {
  const html = getSecurityAlertEmailTemplate(params);

  return sendResendEmail({
    to: [params.to],
    subject: `🛡️ Aviso de Seguridad: Tu clave de ${params.productName} ha sido renovada`,
    html: html
  });
}
