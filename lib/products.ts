import 'server-only';
import { Product } from '@/types/product';


export async function getProducts(): Promise<Product[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_KEY;

    if (!apiUrl || !apiKey) {
      console.error("API Configuration missing");
      return [];
    }

    // Append params for GET request
    const url = `${apiUrl}?action=getProducts&key=${apiKey}`;
    
    const res = await fetch(url, { 
      next: { 
        revalidate: 28800, // Revalidar cada 8 horas como respaldo
        tags: ['products'] // Tag para refrescar al instante desde el admin
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.status}`);
    }

    const data = await res.json();
    
    // Función para generar slug (ID) dinámico
    const slugify = (text: string) => {
        return text
          .toString()
          .toLowerCase()
          .trim()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
          .replace(/--+/g, '-');
      };

    // Mapeo para retrocompatibilidad
    const categoryMap: { [key: string]: string } = {
        "Next.js": "Páginas Web",
        "Automation": "Automatización",
        "Google Sheets": "Google Sheets",
        "Landing Pages": "Landing Pages"
    };

    // Validate if data is array
    if (Array.isArray(data)) {
        return data.map((p: any) => ({
            ...p,
            id: slugify(p.title), 
            price: Number(p.price), 
            category: categoryMap[p.category] || p.category, // Normalizar categoría
            images: Array.isArray(p.images) ? p.images : [],
            tags: Array.isArray(p.tags) ? p.tags : [],
            demoUrl: p.demoUrl || "",
            monthlyPrice: p.monthlyPrice ? Number(p.monthlyPrice) : undefined,
            createdDate: p.createdDate || "",
            tutorialUrl: p.tutorialUrl || ""
        }));
    }
    
    return [];

  } catch (error) {
    console.error("Error fetching products from Google Sheets:", error);
    return [];
  }
}
