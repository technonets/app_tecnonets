import { Link } from "@/i18n/routing";
import Image from "next/image";
import { Monitor } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Product } from "@/types/product";
import { useTranslations, useLocale } from 'next-intl';

interface LatestProductsProps {
  products: Product[];
}

export function LatestProducts({ products }: LatestProductsProps) {
  const t = useTranslations('Store');
  const locale = useLocale();

  return (
    <Section>
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-4">{t('latest_title')}</h2>
        <p className="text-muted-foreground font-medium">{t('latest_subtitle')}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const displayTitle = locale === 'en' && product.title_en ? product.title_en : product.title;
          
          return (
            <Link key={product.id} href={`/tienda/${product.id}`}>
              <Card className="group cursor-pointer h-full border-border/50 hover:border-primary/50 transition-all shadow-sm hover:shadow-xl">
                <div className="aspect-video rounded-lg bg-foreground/5 mb-4 overflow-hidden relative">
                  {product.images && product.images.length > 0 ? (
                    <Image 
                      src={product.images[0]} 
                      alt={displayTitle}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
                      <Monitor className="w-12 h-12 text-foreground/20" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3" suppressHydrationWarning>
                    <Badge variant={product.price === 0 ? "secondary" : "primary"} className="shadow-lg">
                      {product.price === 0 ? t('free') : product.category}
                    </Badge>
                  </div>
                </div>
                <h3 className="text-foreground font-bold group-hover:text-primary transition-colors mb-2 line-clamp-2">
                  {displayTitle}
                </h3>
                <p className="text-sm text-foreground/50 font-bold uppercase tracking-tight">
                  {product.price === 0 ? t('free_download') : `${t('from')} $${product.price.toLocaleString()} COP`}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}
