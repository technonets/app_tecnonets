import { NextRequest, NextResponse } from 'next/server';
import { deactivateLicenseKey } from '@/lib/licenses';
import { checkRateLimit, isValidLicenseKeyFormat, sanitizeInput, SECURITY_HEADERS } from '@/lib/api-security';

export async function POST(req: NextRequest) {
  // 1. Rate Limiting
  const rateLimit = checkRateLimit(req, 30);
  if (!rateLimit.allowed && rateLimit.response) {
    return rateLimit.response;
  }

  try {
    const body = await req.json().catch(() => ({}));
    const rawKey = body.license_key;
    const rawOrigin = body.origin_identifier;

    if (!rawKey || typeof rawKey !== 'string') {
      return NextResponse.json({
        success: false,
        message: 'El parámetro license_key es requerido.'
      }, { status: 400, headers: SECURITY_HEADERS });
    }

    if (!isValidLicenseKeyFormat(rawKey)) {
      return NextResponse.json({
        success: false,
        message: 'Formato de clave inválido (Formato esperado: TEC-XXXX-XXXX-XXXX).'
      }, { status: 400, headers: SECURITY_HEADERS });
    }

    if (!rawOrigin || typeof rawOrigin !== 'string') {
      return NextResponse.json({
        success: false,
        message: 'El parámetro origin_identifier es requerido.'
      }, { status: 400, headers: SECURITY_HEADERS });
    }

    const licenseKey = sanitizeInput(rawKey, 30).toUpperCase();
    const originIdentifier = sanitizeInput(rawOrigin, 255);
    const ipAddress = rateLimit.ip;
    const userAgent = sanitizeInput(req.headers.get('user-agent') || 'unknown', 255);

    const result = await deactivateLicenseKey(
      licenseKey,
      originIdentifier,
      ipAddress,
      userAgent
    );

    const statusCode = result.success ? 200 : 400;

    return NextResponse.json(result, {
      status: statusCode,
      headers: {
        ...SECURITY_HEADERS,
        'X-RateLimit-Remaining': String(rateLimit.remaining)
      }
    });
  } catch (error: any) {
    console.error('License Deactivation API Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno al desactivar dispositivo.'
    }, { status: 500, headers: SECURITY_HEADERS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: SECURITY_HEADERS
  });
}
