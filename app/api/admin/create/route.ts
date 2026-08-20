import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { SECURITY_HEADERS } from '@/lib/api-security';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado. Se requiere rol de administrador.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const body = await req.json();
    const API_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL;
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_KEY;

    if (!API_URL || !API_KEY) {
      return NextResponse.json(
        { success: false, message: 'Configuration Error' },
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    const url = `${API_URL}?action=createProduct&key=${API_KEY}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.error || 'Error en el servidor de Google',
          debug: data,
        },
        { status: res.status, headers: SECURITY_HEADERS }
      );
    }

    try {
      revalidatePath('/tienda');
      revalidatePath('/tienda', 'layout');
    } catch (e) {
      console.error('Revalidation error:', e);
    }

    return NextResponse.json(data, { headers: SECURITY_HEADERS });
  } catch (error: any) {
    console.error('Create Product Proxy Error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.message === 'Payload Too Large'
            ? 'Las imágenes son demasiado pesadas. Prueba con menos o más pequeñas.'
            : 'Error interno de servidor',
      },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
