import { createAdminClient } from './supabase/admin';
import { Coupon } from '@/types/product';

// Fallback en memoria para cupones promocionales
let inMemoryCoupons: Coupon[] = [
  {
    id: 'coup-1',
    code: 'LANZAMIENTO50',
    discountType: 'percentage',
    discountValue: 50,
    maxUses: 100,
    usedCount: 14,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'coup-2',
    code: 'VIP10',
    discountType: 'fixed',
    discountValue: 10,
    maxUses: 50,
    usedCount: 8,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export async function getCoupons(): Promise<Coupon[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((c: any) => ({
        id: c.id,
        code: c.code,
        discountType: c.discount_type,
        discountValue: Number(c.discount_value),
        expiresAt: c.expires_at || undefined,
        maxUses: c.max_uses ? Number(c.max_uses) : undefined,
        usedCount: Number(c.used_count || 0),
        productId: c.product_id || undefined,
        isActive: Boolean(c.is_active),
        createdAt: c.created_at
      }));
    }
  } catch (err) {
    // Supabase table or credentials fallback
  }
  return inMemoryCoupons;
}

export async function saveCoupon(couponData: Partial<Coupon>): Promise<Coupon> {
  const code = couponData.code?.trim().toUpperCase() || '';
  if (!code) throw new Error('El código del cupón es obligatorio');

  const coupon: Coupon = {
    id: couponData.id || `coup-${Date.now()}`,
    code,
    discountType: couponData.discountType || 'percentage',
    discountValue: Number(couponData.discountValue) || 0,
    expiresAt: couponData.expiresAt || undefined,
    maxUses: couponData.maxUses ? Number(couponData.maxUses) : undefined,
    usedCount: couponData.usedCount || 0,
    productId: couponData.productId || undefined,
    isActive: couponData.isActive !== false,
    createdAt: couponData.createdAt || new Date().toISOString()
  };

  try {
    const supabase = createAdminClient();
    await supabase.from('coupons').upsert({
      id: coupon.id,
      code: coupon.code,
      discount_type: coupon.discountType,
      discount_value: coupon.discountValue,
      expires_at: coupon.expiresAt || null,
      max_uses: coupon.maxUses || null,
      used_count: coupon.usedCount,
      product_id: coupon.productId || null,
      is_active: coupon.isActive,
      created_at: coupon.createdAt
    });
  } catch (err) {
    // Fallback save to memory
  }

  const existingIdx = inMemoryCoupons.findIndex(c => c.id === coupon.id || c.code === coupon.code);
  if (existingIdx >= 0) {
    inMemoryCoupons[existingIdx] = coupon;
  } else {
    inMemoryCoupons.unshift(coupon);
  }

  return coupon;
}

export async function deleteCoupon(id: string): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    await supabase.from('coupons').delete().eq('id', id);
  } catch (err) {
    // Fallback in memory
  }
  inMemoryCoupons = inMemoryCoupons.filter(c => c.id !== id);
  return true;
}

export async function validateCoupon(code: string, currentPrice: number, productId?: string) {
  const coupons = await getCoupons();
  const cleanCode = code.trim().toUpperCase();
  const coupon = coupons.find(c => c.code === cleanCode && c.isActive);

  if (!coupon) {
    return { valid: false, message: 'Cupón no válido o inactivo' };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return { valid: false, message: 'Este cupón ha expirado' };
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, message: 'Este cupón ha alcanzado el límite máximo de usos' };
  }

  if (coupon.productId && productId && coupon.productId !== productId) {
    return { valid: false, message: 'Este cupón no aplica para este producto' };
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (currentPrice * coupon.discountValue) / 100;
  } else {
    discountAmount = Math.min(currentPrice, coupon.discountValue);
  }

  const finalPrice = Math.max(0, currentPrice - discountAmount);

  return {
    valid: true,
    coupon,
    discountAmount: Number(discountAmount.toFixed(2)),
    finalPrice: Number(finalPrice.toFixed(2)),
    message: `¡Cupón aplicado! Ahorras $${discountAmount.toFixed(2)} USD`
  };
}
