'use server';

import { revalidateTag, revalidatePath } from 'next/cache';

export async function revalidateProducts() {
  try {
    revalidatePath('/', 'layout');
    return { success: true, message: 'Caché de productos actualizado correctamente' };
  } catch (error) {
    console.error('Error revalidating products:', error);
    return { success: false, message: 'Error al actualizar el caché' };
  }
}
