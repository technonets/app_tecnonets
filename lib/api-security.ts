import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// In-Memory sliding-window rate limiter per IP
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;
  for (const [ip, record] of rateLimitMap.entries()) {
    record.timestamps = record.timestamps.filter(t => t > oneMinuteAgo);
    if (record.timestamps.length === 0) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

/**
 * Aplica Rate Limiting estricto por IP (Anti-Fuerza Bruta & Anti-DDoS)
 * @param req NextRequest
 * @param maxRequestsPerMinute Máximo de peticiones permitidas por minuto (default: 30)
 */
export function checkRateLimit(req: NextRequest, maxRequestsPerMinute: number = 30): {
  allowed: boolean;
  remaining: number;
  ip: string;
  response?: NextResponse;
} {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '127.0.0.1';
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;

  let record = rateLimitMap.get(ip);
  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(ip, record);
  }

  // Filtrar peticiones del último minuto
  record.timestamps = record.timestamps.filter(t => t > oneMinuteAgo);

  if (record.timestamps.length >= maxRequestsPerMinute) {
    const oldestTimestamp = record.timestamps[0];
    const retryAfter = Math.ceil((oldestTimestamp + 60 * 1000 - now) / 1000);

    return {
      allowed: false,
      remaining: 0,
      ip,
      response: NextResponse.json({
        valid: false,
        status: 'rate_limited',
        message: `Límite de peticiones excedido. Intenta nuevamente en ${Math.max(1, retryAfter)} segundos.`
      }, {
        status: 429,
        headers: {
          'Retry-After': String(Math.max(1, retryAfter)),
          'X-RateLimit-Limit': String(maxRequestsPerMinute),
          'X-RateLimit-Remaining': '0',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'X-Content-Type-Options': 'nosniff'
        }
      })
    };
  }

  record.timestamps.push(now);

  return {
    allowed: true,
    remaining: maxRequestsPerMinute - record.timestamps.length,
    ip
  };
}

/**
 * Valida el formato estricto de una clave de licencia (Anti-Inyección / Anti-Query Bombing)
 * Formato esperado: TEC-XXXX-XXXX-XXXX
 */
export function isValidLicenseKeyFormat(key: any): boolean {
  if (typeof key !== 'string') return false;
  const cleanKey = key.trim().toUpperCase();
  // Validar longitud y patrón alfanumérico
  return /^TEC-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(cleanKey);
}

/**
 * Sanitiza campos de texto de entrada para prevenir inyecciones y caracteres de control
 */
export function sanitizeInput(input: any, maxLength: number = 255): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // Eliminar caracteres de control ASCII
    .slice(0, maxLength);
}

/**
 * Encabezados de seguridad estándar para respuestas de API
 */
export const SECURITY_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
