'use client';

import React, { useState } from 'react';
import Link from "next/link";
import { Search, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Product } from '@/types/product';
import Image from 'next/image';
import { AdBanner } from '@/components/ui/AdBanner';

const categories = ["Todos", "Gratis", "Páginas Web", "Landing Pages", "Portafolios", "Google Sheets", "Automatización"];

export function StoreGrid({ initialProducts }: { initialProducts: Product[] }) {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = initialProducts.filter(product => {
    let matchesCategory = activeCategory === "Todos" || product.category === activeCategory;
    
    // Lógica especial para el filtro "Gratis"
    if (activeCategory === "Gratis") {
      matchesCategory = product.price === 0;
    }

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = product.title.toLowerCase().includes(searchLower) || 
                          product.description.toLowerCase().includes(searchLower) ||
                          product.tags.some(tag => tag.toLowerCase().includes(searchLower));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-bold font-heading text-foreground">Catálogo de Recursos</h2>
          <p className="text-muted-foreground mt-2 font-medium">Encuentra herramientas listas para tu negocio.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Buscar: CRM, Landing, Sheet..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-card-border rounded-xl pl-10 pr-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all focus:ring-2 focus:ring-primary/20 font-medium"
          />
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-12">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
              activeCategory === category 
                ? "bg-primary text-white shadow-lg" 
                : "bg-card border border-card-border text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Link key={product.id} href={`/tienda/${product.id}`}>
              <Card className="h-full group hover:border-primary/50 transition-all">
                <div className="aspect-video rounded-lg mb-4 flex items-center justify-center text-white/20 group-hover:scale-105 transition-transform duration-500 overflow-hidden relative">
                    {product.images && product.images.length > 0 && (product.images[0].startsWith('/') || product.images[0].startsWith('http')) ? (
                       <Image 
                          src={product.images[0]} 
                          alt={product.title} 
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
                
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={(product.category === 'Páginas Web' || product.category === 'Landing Pages') ? 'primary' : 'secondary'}>{product.category}</Badge>
                  <div className="flex items-center gap-1 text-yellow-400 text-xs">
                    <Star className="w-3 h-3 fill-current" /> 5.0
                  </div>
                </div>

                <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
                <CardDescription className="text-sm mb-4 line-clamp-2">
                  {product.description}
                </CardDescription>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-card-border">
                  <span className="text-2xl font-bold text-foreground">
                    {product.price === 0 ? "GRATIS" : `$${product.price}`}
                  </span>
                  <Button size="sm" className="gap-2 font-bold uppercase tracking-tight">
                    Ver Detalles
                  </Button>
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center text-center py-20 bg-card/50 border border-dashed border-card-border rounded-2xl">
            <Search className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold text-foreground">No se encontraron productos</h3>
            <p className="text-muted-foreground font-medium">Intenta con otra categoría o término de búsqueda.</p>
            <Button 
               variant="ghost" 
               onClick={() => {setActiveCategory("Todos"); setSearchQuery("")}}
               className="mt-4 font-bold"
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
