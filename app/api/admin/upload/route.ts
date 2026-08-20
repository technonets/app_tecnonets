import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getCurrentUser } from '@/lib/auth';
import { SECURITY_HEADERS } from '@/lib/api-security';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requiere rol de administrador.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const formData = await req.formData();
    const productStr = formData.get('product') as string;
    const imageFile = formData.get('image') as File;

    if (!productStr || !imageFile) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400, headers: SECURITY_HEADERS });
    }

    const newProduct = JSON.parse(productStr);

    // 1. Guardar Imagen
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const imageName = `${newProduct.id}-${Date.now()}.jpg`;
    const imagePath = path.join(process.cwd(), 'public', 'images', 'products', imageName);

    // Asegurar directorio
    await fs.mkdir(path.dirname(imagePath), { recursive: true });
    await fs.writeFile(imagePath, buffer);

    // 2. Actualizar Datos Locales
    const jsonPath = path.join(process.cwd(), 'data', 'products.json');
    const fileData = await fs.readFile(jsonPath, 'utf8');
    const products = JSON.parse(fileData);

    newProduct.image = `/images/products/${imageName}`;
    newProduct.price = Number(newProduct.price);

    products.unshift(newProduct);

    await fs.writeFile(jsonPath, JSON.stringify(products, null, 2));

    return NextResponse.json({ success: true, product: newProduct }, { headers: SECURITY_HEADERS });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500, headers: SECURITY_HEADERS });
  }
}
