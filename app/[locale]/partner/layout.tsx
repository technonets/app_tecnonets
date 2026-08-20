import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function PartnerLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Si es un cliente normal sin rol de vendedor/admin, redirigir a su portal
  if (user.role !== 'partner' && user.role !== 'admin' && user.role !== 'staff') {
    redirect(`/${locale}/portal`);
  }

  return <>{children}</>;
}
