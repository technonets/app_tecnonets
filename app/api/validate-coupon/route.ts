import { NextRequest, NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/coupons';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, price, productId } = body;

    if (!code) {
      return NextResponse.json({ valid: false, message: 'Ingresa un código de cupón' }, { status: 400 });
    }

    const result = await validateCoupon(code, Number(price) || 0, productId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ valid: false, message: error.message || 'Error al validar cupón' }, { status: 500 });
  }
}
