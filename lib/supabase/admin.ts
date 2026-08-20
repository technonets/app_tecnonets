import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Cliente administrativo con permisos completos (bypasses RLS) para uso exclusivo en Server Endpoints / Webhooks seguros
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase Service Role Key o URL no configurada.');
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
