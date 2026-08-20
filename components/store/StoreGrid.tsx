'use client';

import React, { useState } from 'react';
import { Link } from "@/i18n/routing";
import { Search, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Product } from '@/types/product';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

export function StoreGrid({ initialProducts = [] }: { initialProducts: Product[] }) {
  const t = useTranslations('Store');
  const locale = useLocale();
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "Todos", label: t('cat_all') },
    { id: "Gratis", label: t('cat_free') },
    { id: "Páginas Web", label: t('cat_web') },
    { id: "Landing Pages", label: t('cat_landing') },
    { id: "Portafolios", label: t('cat_portfolio') },
    { id: "Google Sheets", label: t('cat_sheets') },
    { id: "Automatización", label: t('cat_automation') }
  ];

  const safeProducts = Array.isArray(initialProducts) ? initialProducts : [];

  const filteredProducts = safeProducts.filter(product => {
    if (!product) return false;
    let matchesCategory = activeCategory === "Todos" || product.category === activeCategory;
    
    if (activeCategory === "Gratis") {
      matchesCategory = Number(product.price) === 0;
    }

    const title = (locale === 'en' && product.title_en ? product.title_en : product.title) || '';
    const description = (locale === 'en' && product.description_en ? product.description_en : product.description) || '';

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
                          title.toLowerCase().includes(searchLower) || 
                          description.toLowerCase().includes(searchLower) ||
                          (Array.isArray(product.tags) && product.tags.some(tag => tag && String(tag).toLowerCase().includes(searchLower)));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-bold font-heading text-foreground">{t('catalog_title')}</h2>
          <p className="text-muted-foreground mt-2 font-medium">{t('catalog_subtitle')}</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-card-border rounded-xl pl-10 pr-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all focus:ring-2 focus:ring-primary/20 font-medium"
          />
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-12">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
              activeCategory === cat.id 
                ? "bg-primary text-white shadow-lg" 
                : "bg-card border border-card-border text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
            const displayTitle = (locale === 'en' && product.title_en ? product.title_en : product.title) || '';
            const displayDesc = (locale === 'en' && product.description_en ? product.description_en : product.description) || '';

            return (
              <Link key={product.id} href={`/tienda/${product.id}`}>
                <Card className="h-full group hover:border-primary/50 transition-all">
                  <div className="aspect-video rounded-lg mb-4 flex items-center justify-center text-white/20 group-hover:scale-105 transition-transform duration-500 overflow-hidden relative">
                      {Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string' && (product.images[0].startsWith('/') || product.images[0].startsWith('http')) ? (
                         <Image 
                            src={product.images[0]} 
                            alt={displayTitle} 
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                         />
                      ) : (
                         <div className="w-full h-full bg-white/5 flex items-center justify-center">
                            <span className="font-bold text-2xl opacity-50">{product.category}</span>
                         </div>
                      )}
                  </div>
                  
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant={(product.category === 'Páginas Web' || product.category === 'Landing Pages') ? 'primary' : 'secondary'}>
                        {product.category}
                      </Badge>
                      {product.promotionBadge && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xs animate-pulse">
                          {product.promotionBadge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400 text-xs shrink-0">
                      <Star className="w-3 h-3 fill-current" /> 5.0
                    </div>
                  </div>

                  <CardTitle className="text-lg line-clamp-2">{displayTitle}</CardTitle>
                  <CardDescription className="text-sm mb-4 line-clamp-2">
                    {displayDesc}
                  </CardDescription>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-card-border">
                    <div className="flex flex-col">
                      {product.originalPrice && product.originalPrice > Number(product.price) && (
                        <span className="text-xs text-muted-foreground line-through font-bold">
                          ${product.originalPrice}
                        </span>
                      )}
                      <span className="text-2xl font-bold text-foreground">
                        {Number(product.price) === 0 ? (
                          <span className="text-emerald-500 dark:text-emerald-400 font-extrabold">{t('free')}</span>
                        ) : (
                          `$${Number(product.price).toLocaleString('en-US', { minimumFractionDigits: Number(product.price) % 1 !== 0 ? 2 : 0 })}`
                        )}
                      </span>
                    </div>

                    <Button size="sm" className="gap-2 font-bold uppercase tracking-tight">
                      {Number(product.price) === 0 ? t('get_now') || 'Obtener' : t('details')}
                    </Button>
                  </div>
                </Card>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center text-center py-20 bg-card/50 border border-dashed border-card-border rounded-2xl">
            <Search className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold text-foreground">{t('no_products')}</h3>
            <p className="text-muted-foreground font-medium">{t('no_products_desc')}</p>
            <Button 
               variant="ghost" 
               onClick={() => {setActiveCategory("Todos"); setSearchQuery("")}}
               className="mt-4 font-bold"
            >
              {t('clear_filters')}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
