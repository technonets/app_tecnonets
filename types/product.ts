export interface Product {
  id: string;
  title: string;
  title_en?: string;
  price: number;
  originalPrice?: number; // Precio base tachado para mostrar descuento
  category: string;
  tags: string[];
  images: string[];
  description: string;
  description_en?: string;
  checkoutUrl: string;
  templateUrl?: string;
  demoUrl?: string;
  monthlyPrice?: number; // Para productos SaaS (Web/Landing)
  createdDate?: string; // Fecha de creación
  tutorialUrl?: string; // Link a tutorial (YouTube/Vimeo)
  deliveryType?: string;
  requiresLicense?: boolean;
  hasTrial?: boolean;
  defaultTrialDays?: number;
  // Campos de Promoción y Urgencia
  offerEndDate?: string; // Fecha límite de la oferta (ISO o YYYY-MM-DD)
  isFreeTemporary?: boolean; // Si es gratis temporalmente
  freeUntilDate?: string; // Fecha hasta cuando es gratis
  promotionBadge?: string; // Ej: '🔥 LANZAMIENTO', '⚡ OFERTA FLASH', '🎁 GRATIS HOY'
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed'; // '%' o '$ USD'
  discountValue: number;
  expiresAt?: string;
  maxUses?: number;
  usedCount: number;
  productId?: string; // ID específico o null para global
  isActive: boolean;
  createdAt: string;
}
