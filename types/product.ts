export interface Product {
  id: string;
  title: string;
  title_en?: string;
  price: number;
  category: string;
  tags: string[];
  images: string[];
  description: string;
  description_en?: string;
  checkoutUrl: string;
  demoUrl?: string;
  monthlyPrice?: number; // Para productos SaaS (Web/Landing)
  createdDate?: string; // Fecha de creación
  tutorialUrl?: string; // Link a tutorial (YouTube/Vimeo)
}
