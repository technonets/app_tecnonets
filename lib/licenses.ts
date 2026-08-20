import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

const LEASE_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || 'tecnonets-secure-license-secret-2026';

/**
 * Genera una clave de licencia formateada: TEC-XXXX-XXXX-XXXX
 */
export function generateLicenseKey(): string {
  const segment1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const segment2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const segment3 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `TEC-${segment1}-${segment2}-${segment3}`;
}

/**
 * Genera un Lease Token firmado criptográficamente (HMAC-SHA256) para validación offline
 */
export function generateLeaseToken(payload: {
  licenseId: string;
  licenseKey: string;
  originIdentifier: string;
  status: string;
  expiresAt: string; // ISO String
}): string {
  const dataString = `${payload.licenseId}:${payload.licenseKey}:${payload.originIdentifier}:${payload.status}:${payload.expiresAt}`;
  const signature = crypto.createHmac('sha256', LEASE_SECRET).update(dataString).digest('hex');
  const tokenPayload = Buffer.from(JSON.stringify({ ...payload, signature })).toString('base64');
  return tokenPayload;
}

/**
 * Verifica la firma criptográfica de un Lease Token offline
 */
export function verifyLeaseToken(token: string): { valid: boolean; payload?: any; message: string } {
  try {
    const jsonString = Buffer.from(token, 'base64').toString('utf-8');
    const parsed = JSON.parse(jsonString);
    const { signature, ...data } = parsed;

    const dataString = `${data.licenseId}:${data.licenseKey}:${data.originIdentifier}:${data.status}:${data.expiresAt}`;
    const expectedSig = crypto.createHmac('sha256', LEASE_SECRET).update(dataString).digest('hex');

    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expectedSig, 'hex');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false, message: 'Firma de Lease Token inválida o manipulada.' };
    }

    const expiryDate = new Date(data.expiresAt);
    if (expiryDate.getTime() < Date.now()) {
      return { valid: false, message: 'El Lease Token offline ha expirado. Requiere sincronización en línea.' };
    }

    return { valid: true, payload: data, message: 'Lease Token válido y vigente.' };
  } catch (err: any) {
    return { valid: false, message: 'Formato de Lease Token corrupto.' };
  }
}

export interface VerificationResult {
  valid: boolean;
  status: 'trial' | 'active' | 'expired' | 'suspended' | 'cancelled' | 'not_found';
  message: string;
  isTrial?: boolean;
  daysRemaining?: number;
  productName?: string;
  allowedOrigins?: string[];
  maxActivations?: number;
  currentActivations?: number;
  leaseToken?: string;
  isSuspiciousShared?: boolean;
}

/**
 * Valida una clave de licencia y registra telemetría de uso
 */
export async function verifyLicenseKey(
  licenseKey: string,
  originIdentifier?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<VerificationResult> {
  const supabase = createAdminClient();
  const cleanKey = licenseKey.trim().toUpperCase();

  // 1. Buscar licencia con producto asociado
  const { data: license, error } = await supabase
    .from('licenses')
    .select(`
      id,
      customer_id,
      license_key,
      status,
      is_trial,
      trial_ends_at,
      expires_at,
      billing_cycle,
      grace_period_ends_at,
      max_activations,
      current_activations,
      allowed_origins,
      product:products (
        title,
        slug
      )
    `)
    .eq('license_key', cleanKey)
    .single();

  if (error || !license) {
    return {
      valid: false,
      status: 'not_found',
      message: 'Clave de licencia no encontrada o inválida.'
    };
  }

  const now = new Date();
  let isValid = false;
  let status = license.status;
  let message = '';
  let daysRemaining = 0;

  // 2. Verificar estado de suspensión / cancelación
  if (status === 'suspended' || status === 'cancelled') {
    isValid = false;
    message = 'La licencia se encuentra suspendida o cancelada.';
  } 
  // 3. Verificar si es trial y si ya expiró
  else if (license.is_trial) {
    if (license.trial_ends_at) {
      const trialEnd = new Date(license.trial_ends_at);
      const diffTime = trialEnd.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      if (diffTime > 0) {
        isValid = true;
        status = 'trial';
        message = `Licencia de prueba válida. Te quedan ${daysRemaining} día(s) de prueba.`;
      } else {
        isValid = false;
        status = 'expired';
        message = 'El periodo de prueba gratuita de 14 días ha expirado.';
        await supabase
          .from('licenses')
          .update({ status: 'expired' })
          .eq('id', license.id);
      }
    } else {
      isValid = true;
      status = 'trial';
      message = 'Licencia de prueba activa.';
    }
  } 
  // 4. Verificar si es licencia activa de pago
  else if (status === 'active') {
    if (license.expires_at) {
      const expiry = new Date(license.expires_at);
      const diffTime = expiry.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      if (diffTime > 0) {
        isValid = true;
        message = `Licencia activa. Vigente por ${daysRemaining} día(s).`;
      } else {
        const graceEnd = license.grace_period_ends_at ? new Date(license.grace_period_ends_at) : null;
        if (graceEnd && graceEnd.getTime() > now.getTime()) {
          isValid = true;
          const graceDays = Math.max(1, Math.ceil((graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
          message = `Aviso: Tu suscripción venció. Periodo de gracia de ${graceDays} día(s) antes del corte.`;
        } else {
          isValid = false;
          status = 'expired';
          message = 'Tu suscripción o licencia ha expirado. Renueva para continuar disfrutando del servicio.';
          await supabase
            .from('licenses')
            .update({ status: 'expired' })
            .eq('id', license.id);
        }
      }
    } else {
      isValid = true;
      message = 'Licencia vitalicia activa y válida (Acceso permanente).';
    }
  } else {
    isValid = false;
    message = 'Licencia no válida o suspendida.';
  }

  // 5. Validar Origen
  const allowedOrigins: string[] = license.allowed_origins || [];
  if (isValid && originIdentifier) {
    const isOriginAllowed = allowedOrigins.some((allowed: string) => 
      originIdentifier.toLowerCase().includes(allowed.toLowerCase()) ||
      allowed.toLowerCase().includes(originIdentifier.toLowerCase())
    );

    if (!isOriginAllowed) {
      if (allowedOrigins.length < (license.max_activations || 1)) {
        const updatedOrigins = [...allowedOrigins, originIdentifier];
        await supabase
          .from('licenses')
          .update({ 
            allowed_origins: updatedOrigins,
            current_activations: updatedOrigins.length,
            updated_at: new Date().toISOString()
          })
          .eq('id', license.id);
        allowedOrigins.push(originIdentifier);
      } else {
        isValid = false;
        message = `Límite máximo de activaciones alcanzado (${allowedOrigins.length}/${license.max_activations || 1}). Desvincula una hoja/dispositivo previo para activar aquí.`;
      }
    } else {
      // Registrar heartbeat
      await supabase
        .from('licenses')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', license.id);
    }
  }

  // 6. Detección y Mitigación Automática de Anomalías (Anti-Abuso / Piratería)
  let isSuspiciousShared = false;
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const { data: recentLogs } = await supabase
      .from('license_logs')
      .select('ip_address')
      .eq('license_id', license.id)
      .gte('created_at', twoHoursAgo);

    if (recentLogs && recentLogs.length > 0) {
      const distinctIPs = new Set(recentLogs.map(l => l.ip_address).filter(Boolean));
      if (ipAddress) distinctIPs.add(ipAddress);

      // Si se detectan 5 o más IPs distintas en menos de 2 horas (Uso compartido no autorizado)
      if (distinctIPs.size >= 5) {
        isSuspiciousShared = true;

        // Auto-Mitigación: Generar nueva clave limpia y anular la anterior
        const newCleanKey = generateLicenseKey();
        const primaryOrigin = originIdentifier ? [originIdentifier] : [];

        await supabase
          .from('licenses')
          .update({
            license_key: newCleanKey,
            allowed_origins: primaryOrigin,
            current_activations: primaryOrigin.length
          })
          .eq('id', license.id);

        // Obtener datos del cliente para enviarle su nueva clave por correo
        const { data: customerProfile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', license.customer_id)
          .single();

        if (customerProfile?.email) {
          const productInfo = Array.isArray(license.product) ? license.product[0] : license.product;
          const { sendSecurityAlertEmail } = await import('@/lib/email/resend');
          
          sendSecurityAlertEmail({
            to: customerProfile.email,
            customerName: customerProfile.full_name || 'Cliente',
            productName: productInfo?.title || 'Plantilla / Software Tecnonets',
            oldKey: cleanKey,
            newKey: newCleanKey,
            portalUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tecnonets.com'}/portal`
          }).catch(err => console.error('Error enviando correo de seguridad:', err));
        }

        // Registrar acción en logs
        await supabase.from('license_logs').insert({
          license_id: license.id,
          origin_identifier: originIdentifier || null,
          ip_address: ipAddress || null,
          user_agent: userAgent || null,
          is_valid: false,
          message: `AUTO-MITIGADO: Clave ${cleanKey} revocada automáticamente por uso concurrente en ${distinctIPs.size} IPs. Nueva clave generada y notificada por correo.`
        });
      }
    }
  } catch (e) {
    console.error('Error en detección de anomalías:', e);
  }

  // 7. Generar Lease Token de 7 días si la validación fue exitosa
  let leaseToken: string | undefined;
  if (isValid && originIdentifier) {
    const leaseExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    leaseToken = generateLeaseToken({
      licenseId: license.id,
      licenseKey: cleanKey,
      originIdentifier,
      status,
      expiresAt: leaseExpiry
    });
  }

  // 8. Registrar Telemetría Asíncrona
  try {
    await supabase.from('license_logs').insert({
      license_id: license.id,
      origin_identifier: originIdentifier || null,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      is_valid: isValid,
      message: message
    });
  } catch (e) {
    console.error('Error logging license verification:', e);
  }

  const productData = Array.isArray(license.product) ? license.product[0] : license.product;

  return {
    valid: isValid,
    status: status,
    message: message,
    isTrial: license.is_trial,
    daysRemaining: daysRemaining,
    productName: productData?.title,
    allowedOrigins: allowedOrigins,
    maxActivations: license.max_activations || 1,
    currentActivations: allowedOrigins.length,
    leaseToken,
    isSuspiciousShared
  };
}

/**
 * Activación explícita de un nuevo dispositivo / hoja
 */
export async function activateLicenseKey(
  licenseKey: string,
  originIdentifier: string,
  deviceName?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<VerificationResult> {
  const result = await verifyLicenseKey(
    licenseKey,
    originIdentifier,
    ipAddress,
    userAgent
  );

  if (result.valid) {
    result.message = deviceName 
      ? `Dispositivo "${deviceName}" activado exitosamente.`
      : 'Dispositivo / Hoja activada exitosamente.';
  }

  return result;
}

/**
 * Desactivación / Desvinculación de un dispositivo u hoja para liberar el slot
 */
export async function deactivateLicenseKey(
  licenseKey: string,
  originIdentifier: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; message: string; remainingActivations: number }> {
  const supabase = createAdminClient();
  const cleanKey = licenseKey.trim().toUpperCase();

  const { data: license, error } = await supabase
    .from('licenses')
    .select('id, allowed_origins, max_activations')
    .eq('license_key', cleanKey)
    .single();

  if (error || !license) {
    return {
      success: false,
      message: 'Licencia no encontrada.',
      remainingActivations: 0
    };
  }

  const allowed: string[] = license.allowed_origins || [];
  const updatedOrigins = allowed.filter(o => 
    !o.toLowerCase().includes(originIdentifier.toLowerCase()) &&
    !originIdentifier.toLowerCase().includes(o.toLowerCase())
  );

  await supabase
    .from('licenses')
    .update({
      allowed_origins: updatedOrigins,
      current_activations: updatedOrigins.length
    })
    .eq('id', license.id);

  // Registrar en telemetría
  try {
    await supabase.from('license_logs').insert({
      license_id: license.id,
      origin_identifier: originIdentifier,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      is_valid: true,
      message: `Dispositivo ${originIdentifier} desvinculado voluntariamente.`
    });
  } catch (e) {}

  return {
    success: true,
    message: `Dispositivo desvinculado con éxito. Ahora tienes ${(license.max_activations || 1) - updatedOrigins.length} cupo(s) disponible(s).`,
    remainingActivations: (license.max_activations || 1) - updatedOrigins.length
  };
}
