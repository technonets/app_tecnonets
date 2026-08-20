export interface CountryCodeItem {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  placeholder: string;
}

export const LATAM_COUNTRY_CODES: CountryCodeItem[] = [
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', dialCode: '+57', placeholder: '321 588 2400' },
  { code: 'MX', name: 'México', flag: '🇲🇽', dialCode: '+52', placeholder: '55 1234 5678' },
  { code: 'ES', name: 'España', flag: '🇪🇸', dialCode: '+34', placeholder: '612 34 56 78' },
  { code: 'US', name: 'Estados Unidos / Canadá', flag: '🇺🇸', dialCode: '+1', placeholder: '202 555 0123' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', dialCode: '+54', placeholder: '9 11 1234 5678' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', dialCode: '+56', placeholder: '9 1234 5678' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪', dialCode: '+51', placeholder: '912 345 678' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', dialCode: '+593', placeholder: '99 123 4567' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', dialCode: '+58', placeholder: '412 1234567' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹', dialCode: '+502', placeholder: '5123 4567' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', dialCode: '+506', placeholder: '8123 4567' },
  { code: 'PA', name: 'Panamá', flag: '🇵🇦', dialCode: '+507', placeholder: '6123 4567' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', dialCode: '+591', placeholder: '7123 4567' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻', dialCode: '+503', placeholder: '7123 4567' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳', dialCode: '+504', placeholder: '9123 4567' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮', dialCode: '+505', placeholder: '8123 4567' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', dialCode: '+595', placeholder: '981 123456' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', dialCode: '+598', placeholder: '99 123 456' },
  { code: 'DO', name: 'Rep. Dominicana', flag: '🇩🇴', dialCode: '+1', placeholder: '809 123 4567' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', dialCode: '+55', placeholder: '11 91234 5678' },
  { code: 'OTHER', name: 'Otro Indicativo', flag: '🌍', dialCode: '+', placeholder: 'Número completo' }
];

/**
 * Parsea un teléfono crudo y extrae el indicativo del país y el número local
 */
export function parsePhoneAndCountry(rawPhone: string = '') {
  const clean = (rawPhone || '').trim();
  if (!clean) return { countryDialCode: '+57', localPhone: '', country: LATAM_COUNTRY_CODES[0] };

  // Buscar coincidencia de indicativo
  const normalized = clean.startsWith('+') ? clean : `+${clean}`;
  
  // Ordenar países por longitud de dialCode descendente para no confundir +593 con +59
  const sorted = [...LATAM_COUNTRY_CODES].filter(c => c.dialCode !== '+').sort((a, b) => b.dialCode.length - a.dialCode.length);

  for (const item of sorted) {
    if (normalized.startsWith(item.dialCode)) {
      const local = normalized.slice(item.dialCode.length).trim();
      return { countryDialCode: item.dialCode, localPhone: local, country: item };
    }
  }

  // Si no coincide con ninguno pero tiene dígitos, asumir Colombia por defecto si tiene 10 dígitos empezando en 3
  const digits = clean.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('3')) {
    return { countryDialCode: '+57', localPhone: digits, country: LATAM_COUNTRY_CODES[0] };
  }

  return { countryDialCode: '+57', localPhone: clean, country: LATAM_COUNTRY_CODES[0] };
}

/**
 * Construye el número completo en formato internacional E.164
 */
export function formatFullInternationalPhone(countryDialCode: string, localPhone: string) {
  const cleanLocal = (localPhone || '').replace(/\D/g, '');
  if (!cleanLocal) return '';
  const prefix = (countryDialCode || '+57').replace(/\D/g, '');
  return `+${prefix}${cleanLocal}`;
}

/**
 * Obtiene la bandera y nombre de país a partir de cualquier string de teléfono
 */
export function getCountryInfoFromPhone(phone: string = '') {
  if (!phone) return null;
  const { country } = parsePhoneAndCountry(phone);
  return country;
}

/**
 * Genera el enlace directo para enviar mensaje de WhatsApp con la licencia
 */
export function generateWhatsAppLicenseLink(params: {
  phone: string;
  clientName: string;
  licenseKey: string;
  productTitle: string;
  status: string;
  expiresAt?: string | null;
  trialEndsAt?: string | null;
}) {
  const { countryDialCode, localPhone } = parsePhoneAndCountry(params.phone);
  const cleanDigits = `${countryDialCode}${localPhone}`.replace(/\D/g, '');
  if (!cleanDigits || cleanDigits.length < 7) return null;

  const expiryNote = params.status === 'trial' && params.trialEndsAt
    ? ` (Válida por prueba hasta ${new Date(params.trialEndsAt).toLocaleDateString()})`
    : params.expiresAt
    ? ` (Vence: ${new Date(params.expiresAt).toLocaleDateString()})`
    : ' (Licencia Vitalicia / Lifetime)';

  const text = `Hola ${params.clientName || 'Cliente'}, ¡gracias por confiar en Tecnonets! 🚀\n\nAquí tienes tu clave de activación oficial para *${params.productTitle || 'tu Software'}*:\n\n🔑 *Clave:* \`${params.licenseKey}\`\n📋 *Estado:* Activa${expiryNote}\n\nPara activarla, abre tu plantilla/software e ingresa esta clave. ¡Quedamos atentos a cualquier duda!`;

  return `https://wa.me/${cleanDigits}?text=${encodeURIComponent(text)}`;
}
