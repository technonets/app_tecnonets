import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getCurrentUser();

  // Si no está autenticado, redirigir a login
  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Si no es admin ni staff, redirigir al portal de cliente
  if (user.role !== 'admin' && user.role !== 'staff') {
    redirect(`/${locale}/portal`);
  }

  return <>{children}</>;
}
