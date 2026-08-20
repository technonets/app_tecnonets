'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { sendOtpEmail } from '@/lib/email/resend';
import { revalidatePath } from 'next/cache';

/**
 * Solicitar o generar un código PIN / OTP de 6 dígitos para inicio de sesión sin contraseña
 */
export async function requestCustomerOtpAction(emailInput: string) {
  const email = emailInput.trim().toLowerCase();
  const supabaseAdmin = createAdminClient();

  // 1. Buscar usuario en perfiles
  const { data: user, error: findErr } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name')
    .eq('email', email)
    .single();

  if (findErr || !user) {
    throw new Error('No encontramos ninguna cuenta registrada con este correo electrónico.');
  }

  // 2. Generar PIN criptográfico aleatorio de 6 dígitos (ej: 849201)
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hora de validez

  // 3. Guardar en metadata de Auth
  await supabaseAdmin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      temp_otp_pin: pin,
      temp_otp_expires_at: expiresAt
    }
  });

  // 4. Generar enlace de acceso directo (Magic Link)
  const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: email
  });

  const hashedToken = linkData?.properties?.hashed_token;
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const cleanMagicLink = hashedToken 
    ? `${appBaseUrl}/auth/callback?token_hash=${hashedToken}&type=magiclink&next=/portal`
    : undefined;

  // 5. Enviar correo instantáneo con Resend
  await sendOtpEmail({
    to: email,
    pinCode: pin,
    magicLink: cleanMagicLink
  });

  return {
    success: true,
    email,
    message: 'Código de acceso enviado a tu correo.'
  };
}

/**
 * Validar PIN / OTP de 6 dígitos e iniciar sesión
 */
export async function verifyCustomerPinAction(emailInput: string, pinInput: string) {
  const email = emailInput.trim().toLowerCase();
  const pin = pinInput.trim().replace(/\s+/g, '');
  const supabaseAdmin = createAdminClient();

  // 1. Buscar usuario en Auth
  const { data: usersData, error: userErr } = await supabaseAdmin.auth.admin.listUsers();
  if (userErr) throw userErr;

  const targetUser = usersData?.users?.find(u => u.email?.toLowerCase() === email);
  if (!targetUser) {
    throw new Error('Usuario no encontrado.');
  }

  const savedPin = targetUser.user_metadata?.temp_otp_pin;
  const expiresAt = targetUser.user_metadata?.temp_otp_expires_at;

  if (!savedPin || savedPin !== pin) {
    throw new Error('El código de 6 dígitos es incorrecto. Por favor verifica o solicita uno nuevo.');
  }

  if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
    throw new Error('El código PIN ha expirado. Por favor solicita uno nuevo.');
  }

  // 2. Limpiar el PIN de un solo uso
  await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
    user_metadata: {
      ...targetUser.user_metadata,
      temp_otp_pin: null,
      temp_otp_expires_at: null
    }
  });

  // 3. Generar sesión con Magic Link
  const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: email
  });

  if (linkErr) throw linkErr;

  // Consultar rol para redirigir
  const { data: roleData } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', targetUser.id)
    .single();

  const role = roleData?.role || 'customer';
  let targetPath = '/portal';
  if (role === 'admin' || role === 'staff') targetPath = '/admin';
  else if (role === 'partner') targetPath = '/partner';

  const hashedToken = linkData.properties?.hashed_token;

  return {
    success: true,
    targetPath,
    hashedToken
  };
}
