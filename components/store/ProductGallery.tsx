'use client';

import { useState } from 'react';
import Image from 'next/image';

interface GalleryProps {
  images: string[];
  category: string;
  title: string;
}

export function ProductGallery({ images, category, title }: GalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0] || "");

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-video rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl relative">
        {(activeImage.startsWith('/') || activeImage.startsWith('http')) ? (
          <Image 
            src={activeImage} 
            alt={title} 
            fill
            className="object-cover animate-in fade-in duration-500"
            sizes="(max-width: 1024px) 100vw, 50vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/products/placeholder.svg";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5">
            <span className="text-white/50 font-bold text-2xl">{category} Preview</span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div 
              key={idx} 
              onClick={() => setActiveImage(img)}
              className={`aspect-video rounded-lg bg-white/5 border overflow-hidden cursor-pointer transition-all hover:border-primary/50 relative ${
                activeImage === img ? "border-primary ring-2 ring-primary/20" : "border-white/10"
              }`}
            >
               {(img.startsWith('/') || img.startsWith('http')) ? (
                  <Image 
                    src={img} 
                    alt={`${title} ${idx}`} 
                    fill
                    className="object-cover"
                    sizes="100px"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/products/placeholder.svg";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[10px] text-gray-500">Preview</span>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
