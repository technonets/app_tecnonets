import 'server-only';
import { Product } from '@/types/product';
import { createClient } from '@/lib/supabase/server';

export async function getProducts(): Promise<Product[]> {
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

  const categoryMap: { [key: string]: string } = {
    "Next.js": "Páginas Web",
    "Automation": "Automatización",
    "Google Sheets": "Google Sheets",
    "Landing Pages": "Landing Pages"
  };

  // 1. Intentar cargar desde Supabase si las variables existen
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createClient();
      const { data: supabaseProducts, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && supabaseProducts && supabaseProducts.length > 0) {
        return supabaseProducts.map((p: any) => {
          const now = new Date();
          const isOfferExpired = p.offer_end_date ? new Date(p.offer_end_date).getTime() < now.getTime() : false;
          const isFreeExpired = p.free_until_date ? new Date(p.free_until_date).getTime() < now.getTime() : false;

          let effectivePrice = Number(p.price) || 0;
          let isFree = effectivePrice === 0;

          if (p.is_free_temporary && !isFreeExpired) {
            effectivePrice = 0;
            isFree = true;
          } else if (p.is_free_temporary && isFreeExpired && p.original_price) {
            effectivePrice = Number(p.original_price);
            isFree = false;
          }

          return {
            id: p.slug || slugify(p.title),
            title: p.title,
            description: p.description || '',
            longDescription: p.long_description || '',
            price: effectivePrice,
            originalPrice: p.original_price ? Number(p.original_price) : undefined,
            monthlyPrice: p.monthly_price ? Number(p.monthly_price) : undefined,
            category: categoryMap[p.category] || p.category,
            images: Array.isArray(p.images) ? p.images : [],
            tags: Array.isArray(p.tags) ? p.tags : [],
            demoUrl: p.demo_url || '',
            templateUrl: p.template_url || '',
            checkoutUrl: p.checkout_url || p.checkoutUrl || (isFree ? (p.template_url || p.demo_url || '') : ''),
            tutorialUrl: p.tutorial_url || '',
            deliveryType: p.delivery_type,
            requiresLicense: p.requires_license,
            hasTrial: p.has_trial,
            defaultTrialDays: p.default_trial_days,
            offerEndDate: !isOfferExpired ? p.offer_end_date : undefined,
            isFreeTemporary: p.is_free_temporary && !isFreeExpired,
            freeUntilDate: !isFreeExpired ? p.free_until_date : undefined,
            promotionBadge: p.promotion_badge || (p.original_price && p.original_price > effectivePrice ? `-${Math.round((1 - effectivePrice / p.original_price) * 100)}% OFF` : undefined),
            createdDate: p.created_at || ''
          };
        });
      }
    } catch (sbError) {
      console.warn('Supabase products fetch failed or empty, checking fallback:', sbError);
    }
  }

  // 2. Fallback de respaldo: Google Sheets API
  try {
    const apiUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_KEY;

    if (!apiUrl || !apiKey) {
      return [];
    }

    const url = `${apiUrl}?action=getProducts&key=${apiKey}`;
    const res = await fetch(url, { 
      next: { 
        revalidate: 28800,
        tags: ['products']
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.status}`);
    }

    const data = await res.json();

    if (Array.isArray(data)) {
      return data.map((p: any) => ({
        ...p,
        id: slugify(p.title), 
        price: Number(p.price), 
        category: categoryMap[p.category] || p.category,
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
    console.error("Error fetching products:", error);
    return [];
  }
}
