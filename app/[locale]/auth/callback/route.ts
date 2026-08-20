import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const rawNext = searchParams.get('next');

  if (token_hash && type) {
    const supabase = await createClient();

    const { data: authData, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error && authData?.user) {
      let destination = rawNext;

      // Si no hay destino explícito o es el portal por defecto, consultar el rol real del usuario
      if (!destination || destination === '/portal' || destination === `/${locale}/portal`) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authData.user.id)
          .single();

        const role = roleData?.role || 'customer';
        if (role === 'admin' || role === 'staff') {
          destination = '/admin';
        } else if (role === 'partner') {
          destination = '/partner';
        } else {
          destination = '/portal';
        }
      }

      const cleanNext = destination.startsWith('/') ? destination : `/${destination}`;
      const targetPath = cleanNext.startsWith(`/${locale}`) ? cleanNext : `/${locale}${cleanNext}`;

      const redirectTo = request.nextUrl.clone();
      redirectTo.pathname = targetPath;
      redirectTo.searchParams.delete('token_hash');
      redirectTo.searchParams.delete('type');
      redirectTo.searchParams.delete('next');

      return NextResponse.redirect(redirectTo);
    } else if (error) {
      console.error('Error al verificar OTP en callback:', error.message);
    }
  }

  // Si falló la verificación, redirigir a login
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = `/${locale}/login`;
  return NextResponse.redirect(redirectTo);
}
