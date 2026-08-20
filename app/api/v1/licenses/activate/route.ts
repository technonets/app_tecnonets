import { NextRequest, NextResponse } from 'next/server';
import { activateLicenseKey } from '@/lib/licenses';
import { checkRateLimit, isValidLicenseKeyFormat, sanitizeInput, SECURITY_HEADERS } from '@/lib/api-security';

export async function POST(req: NextRequest) {
  // 1. Aplicar Rate Limiting (Máx 30 req/min por IP)
  const rateLimit = checkRateLimit(req, 30);
  if (!rateLimit.allowed && rateLimit.response) {
    return rateLimit.response;
  }

  try {
    const body = await req.json().catch(() => ({}));
    const rawKey = body.license_key;
    const rawOrigin = body.origin_identifier;
    const rawDevice = body.device_name;

    // 2. Validación de Entrada y Formato
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
        message: 'El formato de la clave de licencia no es válido (Formato esperado: TEC-XXXX-XXXX-XXXX).'
      }, { status: 400, headers: SECURITY_HEADERS });
    }

    if (!rawOrigin || typeof rawOrigin !== 'string') {
      return NextResponse.json({
        valid: false,
        status: 'error',
        message: 'El parámetro origin_identifier (ID de Google Sheet o ID de equipo) es requerido.'
      }, { status: 400, headers: SECURITY_HEADERS });
    }

    // 3. Sanitización de Campos
    const licenseKey = sanitizeInput(rawKey, 30).toUpperCase();
    const originIdentifier = sanitizeInput(rawOrigin, 255);
    const deviceName = rawDevice ? sanitizeInput(rawDevice, 100) : undefined;

    const ipAddress = rateLimit.ip;
    const userAgent = sanitizeInput(req.headers.get('user-agent') || 'unknown', 255);

    // 4. Ejecución del Core de Licenciamiento
    const result = await activateLicenseKey(
      licenseKey,
      originIdentifier,
      deviceName,
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
    console.error('License Activation API Error:', error);
    return NextResponse.json({
      valid: false,
      status: 'server_error',
      message: 'Error interno al procesar la activación de licencia.'
    }, { status: 500, headers: SECURITY_HEADERS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: SECURITY_HEADERS
  });
}
