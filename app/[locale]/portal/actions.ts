'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUser } from '@/lib/auth';

/**
 * Permite al cliente autenticado desvincular una de sus hojas/dispositivos por sí mismo
 */
export async function customerRemoveOriginAction(licenseId: string, originToRemove: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('No autorizado');
  }

  const supabase = createAdminClient();

  // 1. Verificar que la licencia pertenezca al usuario (o que sea admin)
  const { data: license, error: licErr } = await supabase
    .from('licenses')
    .select('id, customer_id, allowed_origins, max_activations')
    .eq('id', licenseId)
    .single();

  if (licErr || !license) {
    throw new Error('Licencia no encontrada');
  }

  // Verificar propiedad
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  const isAdmin = userRole?.role === 'admin' || userRole?.role === 'staff';
  if (license.customer_id !== user.id && !isAdmin) {
    throw new Error('No tienes permiso para modificar esta licencia.');
  }

  // 2. Filtrar origen
  const allowed = license.allowed_origins || [];
  const updatedOrigins = allowed.filter((o: string) => o !== originToRemove);

  const { error } = await supabase
    .from('licenses')
    .update({
      allowed_origins: updatedOrigins,
      current_activations: updatedOrigins.length
    })
    .eq('id', licenseId);

  if (error) throw error;

  // Registrar en telemetría
  try {
    await supabase.from('license_logs').insert({
      license_id: license.id,
      origin_identifier: originToRemove,
      is_valid: true,
      message: `Desvinculación autogestionada por el cliente desde el portal.`
    });
  } catch (e) {}

  revalidatePath('/portal');
  return { success: true, updatedOrigins };
}
