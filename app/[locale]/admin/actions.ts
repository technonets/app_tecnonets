'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminOrStaff } from '@/lib/auth';
import { generateLicenseKey } from '@/lib/licenses';
import { sendOtpEmail } from '@/lib/email/resend';

/**
 * Carga Global Consolidada del Espacio de Administración (1 sola llamada de red a la BD)
 */
export async function getAdminFullWorkspaceBundle() {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  const [
    licsRes,
    ordersRes,
    profilesRes,
    rolesRes,
    agreementsRes,
    commissionsRes,
    productsRes,
    postsRes,
    settingsRes
  ] = await Promise.all([
    supabase.from('licenses').select(`
      id,
      license_key,
      status,
      is_trial,
      trial_days,
      trial_ends_at,
      expires_at,
      max_activations,
      current_activations,
      allowed_origins,
      billing_cycle,
      metadata,
      created_at,
      product:products (id, title, delivery_type),
      customer:profiles!licenses_customer_id_fkey (id, email, full_name, phone),
      seller:profiles!licenses_seller_id_fkey (id, email, full_name)
    `).order('created_at', { ascending: false }),

    supabase.from('orders').select(`
      id,
      order_number,
      total_amount,
      currency,
      status,
      payment_gateway,
      payment_id,
      referral_code,
      created_at,
      customer:profiles!orders_customer_id_fkey (id, email, full_name, phone),
      seller:profiles!orders_seller_id_fkey (id, email, full_name),
      items:order_items (
        id,
        price,
        product:products (id, title, delivery_type),
        license:licenses (id, license_key, status)
      )
    `).order('created_at', { ascending: false }),

    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('user_roles').select('*'),

    supabase.from('partner_agreements').select(`
      id,
      referral_code,
      commission_percentage,
      fixed_commission_amount,
      payout_method,
      payout_details,
      parent_seller_id,
      tier_2_commission_percentage,
      is_active,
      created_at,
      seller:profiles!partner_agreements_seller_id_fkey (id, email, full_name),
      parent_seller:profiles!partner_agreements_parent_seller_id_fkey (id, email, full_name)
    `),

    supabase.from('commissions').select(`
      id,
      amount,
      currency,
      status,
      tier_level,
      payout_method,
      created_at,
      paid_at,
      seller:profiles!commissions_seller_id_fkey (id, email, full_name),
      order:orders (id, order_number, total_amount)
    `).order('created_at', { ascending: false }),

    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('posts').select('*').order('created_at', { ascending: false }),
    supabase.from('app_settings').select('value').eq('key', 'workspace_visibility').single()
  ]);

  const licenses = licsRes.data || [];
  const orders = ordersRes.data || [];
  const profiles = profilesRes.data || [];
  const roles = rolesRes.data || [];
  const agreements = agreementsRes.data || [];
  const commissions = commissionsRes.data || [];
  const products = productsRes.data || [];
  const posts = postsRes.data || [];

  // Mapear usuarios con sus estadísticas calculadas
  const usersList = profiles.map(profile => {
    const userRole = roles.find(r => r.user_id === profile.id)?.role || 'customer';
    const userLicenses = licenses.filter(l => (l.customer as any)?.id === profile.id || (l as any).customer_id === profile.id);
    const userOrders = orders.filter(o => (o.customer as any)?.id === profile.id || (o as any).customer_id === profile.id);
    const totalSpent = userOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    return {
      ...profile,
      role: userRole,
      licensesCount: userLicenses.length,
      activeLicensesCount: userLicenses.filter(l => l.status === 'active' || l.status === 'trial').length,
      ordersCount: userOrders.length,
      totalSpent
    };
  });

  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  const pendingCommissions = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + Number(c.amount || 0), 0);

  const activeLicenses = licenses.filter(l => l.status === 'active').length;
  const trialLicenses = licenses.filter(l => l.status === 'trial').length;

  const defaults = {
    show_tools_tab: true,
    show_courses_tab: true,
    show_resources_tab: true,
    show_store_button: true,
    custom_workspace_name: 'Mi Espacio Tecnonets'
  };

  const settings = settingsRes.data?.value ? { ...defaults, ...settingsRes.data.value } : defaults;

  return {
    licenses,
    orders,
    usersList,
    partners: {
      agreements,
      commissions
    },
    products,
    posts,
    settings,
    stats: {
      totalRevenue,
      pendingCommissions,
      activeLicenses,
      trialLicenses,
      totalProducts: products.length,
      totalCustomers: profiles.length,
      totalOrders: orders.length,
      totalPosts: posts.length
    }
  };
}

/**
 * Carga inicial consolidada ultra-rápida (compatibilidad)
 */
export async function getAdminDashboardInitData() {
  return await getAdminFullWorkspaceBundle();
}

/**
 * Obtiene métricas y KPIs generales del negocio
 */
export async function getAdminStats() {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  const [
    { count: totalCustomers },
    { count: activeLicenses },
    { count: trialLicenses },
    { count: totalProducts },
    { count: totalOrders },
    { count: totalPosts },
    { data: ordersData },
    { data: pendingCommissionsData }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('licenses').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('licenses').select('*', { count: 'exact', head: true }).eq('status', 'trial'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('total_amount').eq('status', 'completed'),
    supabase.from('commissions').select('amount').eq('status', 'pending')
  ]);

  const totalRevenue = ordersData?.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0) || 0;
  const pendingCommissions = pendingCommissionsData?.reduce((acc, curr) => acc + Number(curr.amount || 0), 0) || 0;

  return {
    totalRevenue,
    pendingCommissions,
    activeLicenses: activeLicenses || 0,
    trialLicenses: trialLicenses || 0,
    totalProducts: totalProducts || 0,
    totalCustomers: totalCustomers || 0,
    totalOrders: totalOrders || 0,
    totalPosts: totalPosts || 0
  };
}

/**
 * Lista de licencias con buscador y filtros
 */
export async function getAdminLicenses(search?: string, statusFilter?: string) {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  let query = supabase
    .from('licenses')
    .select(`
      id,
      license_key,
      status,
      is_trial,
      trial_days,
      trial_ends_at,
      expires_at,
      max_activations,
      current_activations,
      allowed_origins,
      created_at,
      product:products (id, title, category, delivery_type),
      customer:profiles!licenses_customer_id_fkey (id, email, full_name, phone, company_name),
      seller:profiles!licenses_seller_id_fkey (id, email, full_name)
    `)
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;
  if (error) throw error;

  if (search && search.trim() !== '') {
    const term = search.toLowerCase();
    return (data || []).filter((lic: any) => 
      lic.license_key.toLowerCase().includes(term) ||
      lic.customer?.email?.toLowerCase().includes(term) ||
      lic.customer?.full_name?.toLowerCase().includes(term) ||
      lic.product?.title?.toLowerCase().includes(term)
    );
  }

  return data || [];
}

/**
 * Crear una licencia manual profesional (Soporta Trial, Suscripción temporal, Vitalicia y asignación Admin)
 */
export async function createManualLicense(formData: {
  productId: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  licenseType: 'trial' | 'subscription' | 'lifetime';
  trialDays?: number;
  durationMonths?: number;
  expiresAtCustom?: string | null;
  sellerId?: string;
  allowedOrigins?: string[];
  maxActivations?: number;
  internalNotes?: string;
  sendEmailNotification?: boolean;
}) {
  const adminUser = await requireAdminOrStaff();
  const supabase = createAdminClient();

  let customerId = adminUser.id;
  const rawEmail = (formData.customerEmail || '').trim().toLowerCase();
  const clientName = (formData.customerName || '').trim();
  const clientPhone = (formData.customerPhone || '').trim();

  // 1. Si se especificó correo, buscar o registrar al cliente
  if (rawEmail) {
    let { data: customer } = await supabase
      .from('profiles')
      .select('id, full_name, phone')
      .eq('email', rawEmail)
      .single();

    if (customer?.id) {
      customerId = customer.id;
      if (clientName || clientPhone) {
        await supabase
          .from('profiles')
          .update({
            ...(clientName ? { full_name: clientName } : {}),
            ...(clientPhone ? { phone: clientPhone } : {})
          })
          .eq('id', customer.id);
      }
    } else {
      // Crear usuario cliente en auth
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: rawEmail,
        email_confirm: true,
        user_metadata: {
          full_name: clientName || rawEmail,
          phone: clientPhone || ''
        }
      });

      if (createError || !newUser.user) {
        throw new Error(`Error al registrar cliente: ${createError?.message}`);
      }

      customerId = newUser.user.id;
    }
  }

  // 2. Calcular vigencia y estado según el tipo seleccionado
  const licenseKey = generateLicenseKey();
  const now = new Date();
  let status: 'trial' | 'active' = 'active';
  let isTrial = false;
  let trialDays = 14;
  let trialEndsAt: string | null = null;
  let expiresAt: string | null = null;
  let billingCycle = 'lifetime';

  if (formData.licenseType === 'trial') {
    isTrial = true;
    status = 'trial';
    if (formData.expiresAtCustom) {
      trialEndsAt = new Date(formData.expiresAtCustom).toISOString();
      trialDays = Math.max(1, Math.ceil((new Date(formData.expiresAtCustom).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
    } else {
      trialDays = formData.trialDays || 14;
      trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000).toISOString();
    }
    billingCycle = 'trial';
  } else if (formData.licenseType === 'subscription') {
    isTrial = false;
    status = 'active';
    if (formData.expiresAtCustom) {
      expiresAt = new Date(formData.expiresAtCustom).toISOString();
    } else {
      const months = formData.durationMonths || 12;
      expiresAt = new Date(now.getTime() + months * 30 * 24 * 60 * 60 * 1000).toISOString();
      billingCycle = months === 1 ? 'monthly' : (months === 12 ? 'annual' : `${months}_months`);
    }
  } else {
    // Lifetime / Vitalicia
    isTrial = false;
    status = 'active';
    expiresAt = null;
    billingCycle = 'lifetime';
  }

  // 3. Obtener info del producto
  const { data: product } = await supabase
    .from('products')
    .select('id, title, template_url')
    .eq('id', formData.productId)
    .single();

  // 4. Insertar licencia en la base de datos
  const { data: newLicense, error: licError } = await supabase
    .from('licenses')
    .insert({
      license_key: licenseKey,
      product_id: formData.productId,
      customer_id: customerId,
      seller_id: formData.sellerId || null,
      status: status,
      is_trial: isTrial,
      trial_days: trialDays,
      trial_ends_at: trialEndsAt,
      expires_at: expiresAt,
      billing_cycle: billingCycle,
      max_activations: formData.maxActivations || 1,
      allowed_origins: formData.allowedOrigins || [],
      metadata: {
        notes: formData.internalNotes || '',
        created_by: adminUser.email,
        license_type: formData.licenseType,
        client_name: clientName || null,
        client_phone: clientPhone || null,
        client_email: rawEmail || null,
        is_manual: true
      }
    })
    .select()
    .single();

  if (licError) throw licError;

  // 5. Enviar notificación por correo si se solicitó y hay correo
  if (formData.sendEmailNotification && rawEmail && product) {
    try {
      const { sendLicenseDeliveryEmail } = await import('@/lib/email/resend');
      await sendLicenseDeliveryEmail({
        to: rawEmail,
        customerName: formData.customerName || 'Cliente',
        productName: product.title,
        licenseKey: licenseKey,
        orderNumber: `MANUAL-${licenseKey.slice(4, 8)}`,
        portalUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tecnonets.com'}/portal`,
        spreadsheetUrl: product.template_url || undefined
      });
    } catch (emailErr) {
      console.error('Error al enviar correo de entrega de licencia:', emailErr);
    }
  }

  revalidatePath('/admin');
  return { success: true, license: newLicense };
}

/**
 * Actualizar o editar integralmente una licencia (Soporte Técnico)
 */
export async function updateLicenseAction(licenseId: string, updates: {
  status?: string;
  billingCycle?: string;
  productId?: string;
  trialEndsAt?: string | null;
  expiresAt?: string | null;
  maxActivations?: number;
  allowedOrigins?: string[];
  addOrigin?: string;
  resetActivations?: boolean;
  addTrialDays?: number;
  customerId?: string;
  sellerId?: string | null;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  internalNotes?: string;
}) {
  const adminUser = await requireAdminOrStaff();
  const supabase = createAdminClient();

  const { data: currentLic, error: fetchErr } = await supabase
    .from('licenses')
    .select('*')
    .eq('id', licenseId)
    .single();

  if (fetchErr || !currentLic) throw new Error('Licencia no encontrada');

  const payload: any = {};

  if (updates.sellerId !== undefined) {
    payload.seller_id = updates.sellerId || null;
  }

  if (updates.addTrialDays && updates.addTrialDays > 0) {
    const baseDate = currentLic.trial_ends_at ? new Date(currentLic.trial_ends_at) : new Date();
    const newEnd = new Date(Math.max(baseDate.getTime(), Date.now()) + updates.addTrialDays * 24 * 60 * 60 * 1000);
    payload.trial_ends_at = newEnd.toISOString();
    payload.status = 'trial';
    payload.is_trial = true;
  }

  if (updates.status) {
    payload.status = updates.status;
    if (updates.status === 'active') {
      payload.is_trial = false;
    } else if (updates.status === 'trial') {
      payload.is_trial = true;
    }
  }

  if (updates.billingCycle) {
    payload.billing_cycle = updates.billingCycle;
    if (updates.billingCycle === 'lifetime') {
      payload.expires_at = null;
      payload.is_trial = false;
      payload.status = 'active';
    }
  }

  if (updates.productId) {
    payload.product_id = updates.productId;
  }

  if (updates.trialEndsAt !== undefined) {
    payload.trial_ends_at = updates.trialEndsAt;
  }

  if (updates.expiresAt !== undefined) {
    payload.expires_at = updates.expiresAt;
  }

  if (updates.maxActivations !== undefined) {
    payload.max_activations = updates.maxActivations;
  }

  if (updates.customerId) {
    payload.customer_id = updates.customerId;
  }

  if (updates.resetActivations) {
    payload.allowed_origins = [];
    payload.current_activations = 0;
  } else if (updates.allowedOrigins !== undefined) {
    payload.allowed_origins = updates.allowedOrigins;
    payload.current_activations = updates.allowedOrigins.length;
  } else if (updates.addOrigin && updates.addOrigin.trim() !== '') {
    const nextOrigins = [...(currentLic.allowed_origins || []), updates.addOrigin.trim()];
    payload.allowed_origins = nextOrigins;
    payload.current_activations = nextOrigins.length;
  }

  // Actualizar metadatos de cliente y notas
  const currentMeta = currentLic.metadata || {};
  let metaChanged = false;
  const nextMeta = { ...currentMeta };

  if (updates.customerName !== undefined) {
    nextMeta.client_name = updates.customerName.trim() || null;
    metaChanged = true;
  }
  if (updates.customerPhone !== undefined) {
    nextMeta.client_phone = updates.customerPhone.trim() || null;
    metaChanged = true;
  }
  if (updates.internalNotes !== undefined) {
    nextMeta.notes = updates.internalNotes;
    metaChanged = true;
  }

  // Gestión inteligente del correo electrónico del cliente (cambiar, asociar o eliminar)
  if (updates.customerEmail !== undefined) {
    const rawEmail = updates.customerEmail.trim().toLowerCase();
    metaChanged = true;

    if (!rawEmail) {
      // Se quitó el correo: desvincular de usuario registrado y dejar en admin/directo
      nextMeta.client_email = null;
      payload.customer_id = adminUser.id;
    } else {
      // Se ingresó o cambió el correo: buscar o crear perfil
      nextMeta.client_email = rawEmail;

      const { data: foundCust } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', rawEmail)
        .single();

      if (foundCust?.id) {
        payload.customer_id = foundCust.id;
        if (updates.customerName || updates.customerPhone) {
          await supabase
            .from('profiles')
            .update({
              ...(updates.customerName ? { full_name: updates.customerName.trim() } : {}),
              ...(updates.customerPhone ? { phone: updates.customerPhone.trim() } : {})
            })
            .eq('id', foundCust.id);
        }
      } else {
        const { data: newUser } = await supabase.auth.admin.createUser({
          email: rawEmail,
          email_confirm: true,
          user_metadata: {
            full_name: updates.customerName?.trim() || rawEmail,
            phone: updates.customerPhone?.trim() || ''
          }
        });
        if (newUser?.user?.id) {
          payload.customer_id = newUser.user.id;
        }
      }
    }
  } else {
    // Si no cambió el email pero sí nombre/teléfono y no es adminUser, actualizar perfil existente
    const targetCustId = updates.customerId || currentLic.customer_id;
    if (targetCustId && targetCustId !== adminUser.id && (updates.customerName || updates.customerPhone)) {
      try {
        await supabase
          .from('profiles')
          .update({
            ...(updates.customerName ? { full_name: updates.customerName.trim() } : {}),
            ...(updates.customerPhone ? { phone: updates.customerPhone.trim() } : {})
          })
          .eq('id', targetCustId);
      } catch (e) {
        console.warn('Could not update profile:', e);
      }
    }
  }

  if (metaChanged) {
    payload.metadata = nextMeta;
  }

  const { error } = await supabase
    .from('licenses')
    .update(payload)
    .eq('id', licenseId);

  if (error) throw error;

  revalidatePath('/admin');
  return { success: true };
}

/**
 * Re-emitir / Regenerar una clave de licencia por error o soporte técnico
 * (Genera una nueva clave única, invalida la anterior, libera activaciones y conserva el producto/cliente/tiempo)
 */
export async function reissueLicenseKeyAction(licenseId: string, reason?: string) {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  const { data: lic, error: fetchErr } = await supabase
    .from('licenses')
    .select('*')
    .eq('id', licenseId)
    .single();

  if (fetchErr || !lic) throw new Error('Licencia no encontrada');

  const oldKey = lic.license_key;
  const newKey = generateLicenseKey();

  // Actualizar la licencia con la nueva clave y limpiar activaciones
  const { error: updateErr } = await supabase
    .from('licenses')
    .update({
      license_key: newKey,
      allowed_origins: [],
      current_activations: 0,
      status: lic.status === 'suspended' ? 'active' : lic.status
    })
    .eq('id', licenseId);

  if (updateErr) throw updateErr;

  // Registrar en telemetría / logs de soporte
  await supabase.from('license_logs').insert({
    license_id: licenseId,
    origin_identifier: `SOPORTE: Clave re-emitida (${reason || 'Reemplazo técnico'}). Clave anterior: ${oldKey}`,
    is_valid: true,
    ip_address: '127.0.0.1 (Admin Dashboard)'
  });

  revalidatePath('/admin');
  revalidatePath('/portal');
  return { success: true, newKey, oldKey };
}

/**
 * Transferir o reasignar una licencia a otro cliente por soporte
 */
export async function transferLicenseAction(licenseId: string, newCustomerEmail: string) {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  const email = newCustomerEmail.trim().toLowerCase();

  // Buscar o crear usuario
  let { data: user } = await supabase.from('profiles').select('id').eq('email', email).single();
  let customerId = user?.id;

  if (!customerId) {
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password: 'ClienteTecnonets2026!',
      email_confirm: true,
      user_metadata: { full_name: email }
    });
    if (createErr || !newUser.user) throw new Error('Error al registrar nuevo cliente');
    customerId = newUser.user.id;
  }

  const { error } = await supabase
    .from('licenses')
    .update({ customer_id: customerId })
    .eq('id', licenseId);

  if (error) throw error;

  revalidatePath('/admin');
  revalidatePath('/portal');
  return { success: true };
}

/**
 * Reenviar acceso directo al cliente: Genera Código PIN de 6 dígitos y Magic Link de 1-clic
 */
export async function resendCustomerAccessAction(customerEmail: string) {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  const email = customerEmail.trim().toLowerCase();

  // 1. Generar PIN de 6 dígitos aleatorio
  const pinCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hora de validez

  // 2. Buscar usuario y guardar PIN en metadata
  const { data: userProfile } = await supabase.from('profiles').select('id').eq('email', email).single();
  if (userProfile?.id) {
    await supabase.auth.admin.updateUserById(userProfile.id, {
      user_metadata: {
        temp_otp_pin: pinCode,
        temp_otp_expires_at: expiresAt
      }
    });
  }

  // 3. Generar enlace seguro de acceso directo (Magic Link) de Supabase Auth
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: email
  });

  if (error) throw error;

  const hashedToken = data?.properties?.hashed_token;
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  
  // Construir URL limpia y profesional de marca propia
  const cleanMagicLink = hashedToken 
    ? `${appBaseUrl}/auth/callback?token_hash=${hashedToken}&type=magiclink&next=/portal`
    : data?.properties?.action_link || undefined;

  // Enviar correo instantáneo al cliente vía Resend
  await sendOtpEmail({
    to: email,
    pinCode: pinCode,
    magicLink: cleanMagicLink
  });

  return {
    success: true,
    email,
    pinCode,
    magicLink: cleanMagicLink || null
  };
}

/**
 * Telemetría / Logs de una licencia
 */
export async function getLicenseLogs(licenseId: string) {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('license_logs')
    .select('*')
    .eq('license_id', licenseId)
    .order('checked_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
}

/**
 * Lista de Vendedores / Afiliados y sus comisiones
 */
export async function getAdminPartners() {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  const [agreementsRes, commissionsRes] = await Promise.all([
    supabase.from('partner_agreements').select(`
      id,
      referral_code,
      commission_percentage,
      fixed_commission_amount,
      payout_method,
      payout_details,
      parent_seller_id,
      tier_2_commission_percentage,
      is_active,
      created_at,
      seller:profiles!partner_agreements_seller_id_fkey (id, email, full_name, phone),
      parent_seller:profiles!partner_agreements_parent_seller_id_fkey (id, email, full_name)
    `),
    supabase.from('commissions').select(`
      id,
      amount,
      currency,
      status,
      tier_level,
      payout_method,
      created_at,
      paid_at,
      seller:profiles!commissions_seller_id_fkey (id, email, full_name),
      order:orders (id, order_number, total_amount)
    `).order('created_at', { ascending: false })
  ]);

  return {
    agreements: agreementsRes.data || [],
    commissions: commissionsRes.data || []
  };
}

/**
 * Crear un nuevo acuerdo de vendedor / afiliado con soporte para Líder de Equipo (Tier 2)
 */
export async function createPartnerAgreement(formData: {
  sellerEmail: string;
  sellerName?: string;
  sellerPhone?: string;
  referralCode: string;
  commissionPercentage: number | string;
  fixedAmount?: number | string;
  parentSellerId?: string | null;
  payoutMethod?: string;
  payoutDetails?: Record<string, any>;
}) {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  const email = formData.sellerEmail.trim().toLowerCase();
  const referralCode = formData.referralCode.trim().toUpperCase();

  const commissionPercentage = typeof formData.commissionPercentage === 'string'
    ? (parseFloat(formData.commissionPercentage.replace(',', '.')) || 0)
    : formData.commissionPercentage;

  const fixedAmount = typeof formData.fixedAmount === 'string'
    ? (parseFloat(formData.fixedAmount.replace(',', '.')) || 0)
    : (formData.fixedAmount || 0);

  // Buscar o crear usuario
  let { data: user } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  let sellerId = user?.id;

  if (!sellerId) {
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      email_confirm: true,
      user_metadata: {
        full_name: formData.sellerName || email,
        phone: formData.sellerPhone || ''
      }
    });

    if (createError || !newUser.user) {
      throw new Error(`Error al crear vendedor: ${createError?.message}`);
    }
    sellerId = newUser.user.id;
  }

  // Asignar rol de partner
  await supabase
    .from('user_roles')
    .upsert({ user_id: sellerId, role: 'partner' }, { onConflict: 'user_id,role' });

  // Crear acuerdo
  const { data: agreement, error } = await supabase
    .from('partner_agreements')
    .insert({
      seller_id: sellerId,
      referral_code: referralCode,
      commission_percentage: commissionPercentage,
      fixed_commission_amount: fixedAmount,
      parent_seller_id: formData.parentSellerId || null,
      payout_method: formData.payoutMethod || 'nequi',
      payout_details: formData.payoutDetails || {},
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/admin');
  return { success: true, agreement };
}

/**
 * Liquidar / Pagar una comisión a un vendedor
 */
export async function settleCommission(commissionId: string, notes?: string) {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('commissions')
    .update({
      status: 'paid',
      notes: notes || 'Liquidación confirmada',
      paid_at: new Date().toISOString()
    })
    .eq('id', commissionId);

  if (error) throw error;

  revalidatePath('/admin');
  return { success: true };
}

/**
 * Gestión de Productos en Supabase
 */
export async function getAdminProductsList() {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function saveProductAction(productData: any) {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('products')
    .upsert(productData, { onConflict: 'slug' });

  if (error) throw error;

  revalidatePath('/admin');
  revalidatePath('/tienda');
  revalidatePath('/', 'layout');

  return { success: true };
}

/**
 * Eliminar producto del catálogo
 */
export async function deleteProductAction(productId: string) {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) throw error;

  revalidatePath('/admin');
  revalidatePath('/tienda');
  return { success: true };
}

/**
 * Activar / Desactivar visibilidad de un producto o curso individual
 */
export async function toggleProductActiveAction(productId: string, isActive: boolean) {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('products')
    .update({ is_active: isActive })
    .eq('id', productId);

  if (error) throw error;

  revalidatePath('/admin');
  revalidatePath('/tienda');
  revalidatePath('/portal');
  return { success: true };
}

/**
 * Obtener configuración global de visibilidad de pestañas del espacio de usuario
 */
export async function getWorkspaceVisibilitySettings() {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'workspace_visibility')
    .single();

  const defaults = {
    show_tools_tab: true,
    show_courses_tab: true,
    show_resources_tab: true,
    show_store_button: true,
    custom_workspace_name: 'Mi Espacio Tecnonets'
  };

  return data?.value ? { ...defaults, ...data.value } : defaults;
}

/**
 * Actualizar configuración global de visibilidad de pestañas del espacio de usuario
 */
export async function updateWorkspaceVisibilitySettings(settings: {
  show_tools_tab: boolean;
  show_courses_tab: boolean;
  show_resources_tab: boolean;
  show_store_button: boolean;
  custom_workspace_name: string;
}) {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('app_settings')
    .upsert({
      key: 'workspace_visibility',
      value: settings,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });

  if (error) throw error;

  revalidatePath('/admin');
  revalidatePath('/portal');
  revalidatePath('/', 'layout');

  return { success: true, settings };
}

/**
 * Eliminar una licencia
 */
export async function deleteLicenseAction(licenseId: string) {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('licenses')
    .delete()
    .eq('id', licenseId);

  if (error) throw error;

  revalidatePath('/admin');
  return { success: true };
}

/**
 * Desvincular un computador / dispositivo / dominio específico de una licencia
 */
export async function removeOriginAction(licenseId: string, originToRemove: string) {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  const { data: license, error: fetchErr } = await supabase
    .from('licenses')
    .select('allowed_origins')
    .eq('id', licenseId)
    .single();

  if (fetchErr || !license) throw new Error('Licencia no encontrada');

  const updatedOrigins = (license.allowed_origins || []).filter((o: string) => o !== originToRemove);

  const { error } = await supabase
    .from('licenses')
    .update({ 
      allowed_origins: updatedOrigins,
      current_activations: updatedOrigins.length 
    })
    .eq('id', licenseId);

  if (error) throw error;

  revalidatePath('/admin');
  return { success: true, updatedOrigins };
}

/**
 * Eliminar acuerdo de vendedor
 */
export async function deletePartnerAgreementAction(agreementId: string) {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('partner_agreements')
    .delete()
    .eq('id', agreementId);

  if (error) throw error;

  revalidatePath('/admin');
  return { success: true };
}

/**
 * =========================================================
 * GESTIÓN COMPLETA DE USUARIOS, CLIENTES Y PERFILES
 * =========================================================
 */

export async function getAdminUsersList() {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  const [profilesRes, rolesRes, licensesRes, ordersRes] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('user_roles').select('*'),
    supabase.from('licenses').select('id, customer_id, status'),
    supabase.from('orders').select('id, customer_id, total_amount, status')
  ]);

  const profiles = profilesRes.data || [];
  const roles = rolesRes.data || [];
  const licenses = licensesRes.data || [];
  const orders = ordersRes.data || [];

  return profiles.map(profile => {
    const userRole = roles.find(r => r.user_id === profile.id)?.role || 'customer';
    const userLicenses = licenses.filter(l => l.customer_id === profile.id);
    const userOrders = orders.filter(o => o.customer_id === profile.id);
    const totalSpent = userOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    return {
      ...profile,
      role: userRole,
      licensesCount: userLicenses.length,
      activeLicensesCount: userLicenses.filter(l => l.status === 'active' || l.status === 'trial').length,
      ordersCount: userOrders.length,
      totalSpent
    };
  });
}

/**
 * Crear o editar usuario manualmente desde el panel
 */
export async function saveAdminUserAction(userData: {
  id?: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'admin' | 'staff' | 'partner' | 'customer';
  password?: string;
}) {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  const email = userData.email.trim().toLowerCase();

  let userId = userData.id;

  if (!userId) {
    // 1. Crear nuevo usuario en Supabase Auth
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: email,
      password: userData.password || 'ClienteTecnonets2026!',
      email_confirm: true,
      user_metadata: {
        full_name: userData.fullName,
        phone: userData.phone || ''
      }
    });

    if (createErr || !newUser.user) {
      throw new Error(`Error al crear usuario: ${createErr?.message}`);
    }
    userId = newUser.user.id;
  } else {
    // 2. Si ya existe y se envió nueva contraseña, actualizarla
    if (userData.password && userData.password.trim() !== '') {
      await supabase.auth.admin.updateUserById(userId, {
        password: userData.password
      });
    }

    // Actualizar metadata
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        full_name: userData.fullName,
        phone: userData.phone || ''
      }
    });
  }

  // 3. Actualizar perfil en tabla profiles
  await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: email,
      full_name: userData.fullName,
      phone: userData.phone || null
    }, { onConflict: 'id' });

  // 4. Actualizar rol en user_roles
  await supabase
    .from('user_roles')
    .upsert({
      user_id: userId,
      role: userData.role
    }, { onConflict: 'user_id,role' });

  revalidatePath('/admin');
  return { success: true, userId };
}

/**
 * Eliminar un usuario del sistema
 */
/**
 * Eliminar un usuario del sistema
 */
export async function deleteAdminUserAction(userId: string) {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  // Eliminar de auth.users (en cascada elimina perfiles y roles)
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) throw error;

  revalidatePath('/admin');
  return { success: true };
}

/**
 * =========================================================
 * GESTIÓN DE ÓRDENES Y VENTAS (orders, order_items)
 * =========================================================
 */

export async function getAdminOrdersList() {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      total_amount,
      currency,
      status,
      payment_gateway,
      payment_id,
      referral_code,
      created_at,
      customer:profiles!orders_customer_id_fkey (id, email, full_name, phone),
      seller:profiles!orders_seller_id_fkey (id, email, full_name),
      items:order_items (
        id,
        price,
        product:products (id, title, delivery_type),
        license:licenses (id, license_key, status)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Crear una orden manual (Venta offline / Factura directa)
 */
export async function createManualOrderAction(formData: {
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  productId: string;
  amount: number | string;
  paymentGateway?: string;
  referralCode?: string;
}) {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  const email = formData.customerEmail.trim().toLowerCase();
  const parsedAmount = typeof formData.amount === 'string'
    ? (parseFloat(formData.amount.replace(',', '.')) || 0)
    : formData.amount;

  // 1. Obtener o crear cliente
  let { data: user } = await supabase.from('profiles').select('id').eq('email', email).single();
  let customerId = user?.id;

  if (!customerId) {
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password: 'ClienteTecnonets2026!',
      email_confirm: true,
      user_metadata: { full_name: formData.customerName || email, phone: formData.customerPhone || '' }
    });
    if (createErr || !newUser.user) throw new Error('Error al registrar cliente');
    customerId = newUser.user.id;
  }

  // 2. Buscar vendedor si hay código de referido
  let sellerId: string | null = null;
  let agreement: any = null;
  if (formData.referralCode && formData.referralCode.trim() !== '') {
    const { data: agr } = await supabase
      .from('partner_agreements')
      .select('*')
      .eq('referral_code', formData.referralCode.trim().toUpperCase())
      .single();
    if (agr) {
      sellerId = agr.seller_id;
      agreement = agr;
    }
  }

  const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

  // 3. Crear orden
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_id: customerId,
      seller_id: sellerId,
      referral_code: formData.referralCode || null,
      total_amount: parsedAmount,
      currency: 'USD',
      status: 'completed',
      payment_gateway: formData.paymentGateway || 'MANUAL_TRANSFER',
      payment_id: `MANUAL-${Date.now()}`
    })
    .select()
    .single();

  if (orderErr) throw orderErr;

  // 4. Generar clave de licencia vitalicia
  const licenseKey = generateLicenseKey();
  const { data: license, error: licErr } = await supabase
    .from('licenses')
    .insert({
      license_key: licenseKey,
      product_id: formData.productId,
      customer_id: customerId,
      seller_id: sellerId,
      status: 'active',
      is_trial: false,
      billing_cycle: 'lifetime',
      trial_days: 0,
      max_activations: 1,
      allowed_origins: []
    })
    .select()
    .single();

  if (licErr) throw licErr;

  // 5. Crear order_item vinculando orden y licencia
  await supabase.from('order_items').insert({
    order_id: order.id,
    product_id: formData.productId,
    license_id: license.id,
    price: formData.amount
  });

  // 6. Liquidar comisiones si hubo referido
  if (agreement && sellerId) {
    let commAmount = 0;
    if (agreement.fixed_commission_amount > 0) {
      commAmount = agreement.fixed_commission_amount;
    } else {
      commAmount = Number(((formData.amount * agreement.commission_percentage) / 100).toFixed(2));
    }

    if (commAmount > 0) {
      await supabase.from('commissions').insert({
        seller_id: sellerId,
        order_id: order.id,
        amount: commAmount,
        currency: 'USD',
        status: 'pending',
        tier_level: 1
      });
    }

    // Si tiene líder de red (Tier 2)
    if (agreement.parent_seller_id) {
      const tier2Amount = Number(((formData.amount * (agreement.tier_2_commission_percentage || 5)) / 100).toFixed(2));
      if (tier2Amount > 0) {
        await supabase.from('commissions').insert({
          seller_id: agreement.parent_seller_id,
          order_id: order.id,
          amount: tier2Amount,
          currency: 'USD',
          status: 'pending',
          tier_level: 2
        });
      }
    }
  }

  revalidatePath('/admin');
  return { success: true, order, license };
}

/**
 * Actualizar estado de orden (ej: Reembolsar o Cancelar)
 */
export async function updateOrderStatusAction(orderId: string, nextStatus: 'completed' | 'refunded' | 'cancelled') {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('orders')
    .update({ status: nextStatus })
    .eq('id', orderId);

  if (error) throw error;

  // Si se cancela o reembolsa, suspender las licencias asociadas a esta orden
  if (nextStatus === 'refunded' || nextStatus === 'cancelled') {
    const { data: items } = await supabase
      .from('order_items')
      .select('license_id')
      .eq('order_id', orderId);

    if (items && items.length > 0) {
      const licenseIds = items.map(i => i.license_id).filter(Boolean);
      if (licenseIds.length > 0) {
        await supabase
          .from('licenses')
          .update({ status: 'suspended' })
          .in('id', licenseIds);
      }
    }
  }

  revalidatePath('/admin');
  return { success: true };
}

/**
 * =========================================================
 * GESTIÓN DE BLOG Y ARTÍCULOS (posts)
 * =========================================================
 */

export async function getAdminPostsList() {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      category,
      is_published,
      published_at,
      created_at,
      author:profiles!posts_author_id_fkey (full_name, email)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function savePostAction(postData: {
  id?: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category?: string;
  is_published?: boolean;
  featured_image?: string;
}) {
  const user = await requireAdminOrStaff();
  const supabase = createAdminClient();

  const payload: any = {
    title: postData.title,
    slug: postData.slug,
    excerpt: postData.excerpt || null,
    content: postData.content,
    category: postData.category || 'General',
    is_published: postData.is_published ?? true,
    featured_image: postData.featured_image || null,
    author_id: user.id,
    published_at: postData.is_published ? new Date().toISOString() : null
  };

  if (postData.id) {
    payload.id = postData.id;
  }

  const { error } = await supabase.from('posts').upsert(payload, { onConflict: 'slug' });
  if (error) throw error;

  revalidatePath('/admin');
  revalidatePath('/blog');
  return { success: true };
}

export async function deletePostAction(postId: string) {
  await requireAdminOrStaff();
  const supabase = createAdminClient();

  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) throw error;

  revalidatePath('/admin');
  revalidatePath('/blog');
  return { success: true };
}

/**
 * ----------------------------------------------------
 * GESTIÓN DE CUPONES DE DESCUENTO (Marketing & Promos)
 * ----------------------------------------------------
 */
export async function getAdminCouponsAction() {
  await requireAdminOrStaff();
  const { getCoupons } = await import('@/lib/coupons');
  return await getCoupons();
}

export async function saveCouponAction(couponData: any) {
  await requireAdminOrStaff();
  const { saveCoupon } = await import('@/lib/coupons');
  const saved = await saveCoupon(couponData);
  revalidatePath('/admin');
  revalidatePath('/tienda');
  return saved;
}

export async function deleteCouponAction(couponId: string) {
  await requireAdminOrStaff();
  const { deleteCoupon } = await import('@/lib/coupons');
  await deleteCoupon(couponId);
  revalidatePath('/admin');
  revalidatePath('/tienda');
  return { success: true };
}

export async function toggleCouponActiveAction(couponId: string, isActive: boolean) {
  await requireAdminOrStaff();
  const { saveCoupon, getCoupons } = await import('@/lib/coupons');
  const all = await getCoupons();
  const target = all.find(c => c.id === couponId);
  if (target) {
    await saveCoupon({ ...target, isActive });
  }
  revalidatePath('/admin');
  return { success: true };
}




