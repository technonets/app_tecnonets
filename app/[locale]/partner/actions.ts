'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUser } from '@/lib/auth';

/**
 * Obtiene los datos del portal del vendedor (Afiliado / Líder de equipo)
 */
export async function getPartnerPortalData() {
  const user = await getCurrentUser();
  if (!user) throw new Error('No autenticado');

  const supabase = createAdminClient();

  // 1. Obtener acuerdo de afiliado
  const { data: agreement } = await supabase
    .from('partner_agreements')
    .select(`
      *,
      parent_seller:profiles!partner_agreements_parent_seller_id_fkey (id, full_name, email)
    `)
    .eq('seller_id', user.id)
    .single();

  // 2. Si es líder de equipo, obtener su grupo de sub-vendedores
  const { data: teamMembers } = await supabase
    .from('partner_agreements')
    .select(`
      id,
      referral_code,
      commission_percentage,
      created_at,
      seller:profiles!partner_agreements_seller_id_fkey (id, full_name, email, phone)
    `)
    .eq('parent_seller_id', user.id);

  // 3. Obtener comisiones ganadas por este vendedor (Directas Tier 1 y de Red Tier 2)
  const { data: commissions } = await supabase
    .from('commissions')
    .select(`
      id,
      amount,
      currency,
      status,
      tier_level,
      created_at,
      paid_at,
      order:orders (
        id,
        order_number,
        total_amount,
        customer:profiles!orders_customer_id_fkey (full_name, email)
      )
    `)
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  const totalEarned = (commissions || []).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const pendingBalance = (commissions || [])
    .filter(c => c.status === 'pending')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const paidBalance = (commissions || [])
    .filter(c => c.status === 'paid')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  return {
    user,
    agreement: agreement || null,
    teamMembers: teamMembers || [],
    commissions: commissions || [],
    stats: {
      totalEarned,
      pendingBalance,
      paidBalance,
      totalSalesCount: (commissions || []).length,
      teamSize: (teamMembers || []).length
    }
  };
}

/**
 * Actualizar método de cobro del vendedor
 */
export async function updatePartnerPayoutDetails(formData: {
  payoutMethod: string;
  payoutDetails: Record<string, any>;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('No autenticado');

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('partner_agreements')
    .update({
      payout_method: formData.payoutMethod,
      payout_details: formData.payoutDetails
    })
    .eq('seller_id', user.id);

  if (error) throw error;

  revalidatePath('/partner');
  return { success: true };
}
