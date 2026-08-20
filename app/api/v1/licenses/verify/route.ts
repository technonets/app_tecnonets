import { NextRequest, NextResponse } from 'next/server';
import { verifyLicenseKey } from '@/lib/licenses';
import { checkRateLimit, isValidLicenseKeyFormat, sanitizeInput, SECURITY_HEADERS } from '@/lib/api-security';

export async function POST(req: NextRequest) {
  // 1. Rate Limiting
  const rateLimit = checkRateLimit(req, 60);
  if (!rateLimit.allowed && rateLimit.response) {
    return rateLimit.response;
  }

  try {
    const body = await req.json().catch(() => ({}));
    const rawKey = body.license_key;
    const rawOrigin = body.origin_identifier;

    if (!rawKey || typeof rawKey !== 'string') {
      return NextResponse.json({
        valid: false,
        status: 'error',
        message: 'El parámetro license_key es requerido.'
      }, { status: 400, headers: SECURITY_HEADERS });
    }

    if (!isValidLicenseKeyFormat(rawKey)) {
      return NextResponse.json({
        valid: false,
        status: 'invalid_format',
        message: 'Formato de clave no válido (Formato esperado: TEC-XXXX-XXXX-XXXX).'
      }, { status: 400, headers: SECURITY_HEADERS });
    }

    const licenseKey = sanitizeInput(rawKey, 30).toUpperCase();
    const originIdentifier = rawOrigin ? sanitizeInput(rawOrigin, 255) : undefined;
    const ipAddress = rateLimit.ip;
    const userAgent = sanitizeInput(req.headers.get('user-agent') || 'unknown', 255);

    const result = await verifyLicenseKey(
      licenseKey,
      originIdentifier,
      ipAddress,
      userAgent
    );

    const statusCode = result.valid ? 200 : (result.status === 'not_found' ? 404 : 403);

    return NextResponse.json(result, { 
      status: statusCode,
      headers: {
        ...SECURITY_HEADERS,
        'X-RateLimit-Remaining': String(rateLimit.remaining)
      }
    });
  } catch (error: any) {
    console.error('License Verification API Error:', error);
    return NextResponse.json({
      valid: false,
      status: 'server_error',
      message: 'Error interno en la verificación de licencia.'
    }, { status: 500, headers: SECURITY_HEADERS });
  }
}

// Soporte CORS pre-flight para consultas desde navegadores / scripts externos
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: SECURITY_HEADERS
  });
}
