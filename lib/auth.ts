import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { UserRole, Profile } from '@/types/database.types';

export interface AuthSessionUser {
  id: string;
  email: string;
  role: UserRole;
  profile: Profile | null;
}

/**
 * Obtiene el usuario autenticado actual y su rol en Server Components / Actions
 */
export async function getCurrentUser(): Promise<AuthSessionUser | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    const adminSupabase = createAdminClient();

    // Obtener rol del usuario
    const { data: roleData } = await adminSupabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    // Obtener perfil
    const { data: profileData } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email || '',
      role: (roleData?.role as UserRole) || 'customer',
      profile: profileData || null
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

/**
 * Verifica si el usuario actual tiene permisos de administrador o staff
 */
export async function requireAdminOrStaff() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
    throw new Error('Acceso no autorizado.');
  }
  return user;
}
