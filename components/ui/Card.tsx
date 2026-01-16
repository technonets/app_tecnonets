import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hoverEffect?: boolean;
}

export function Card({ className = '', children, hoverEffect = true }: CardProps) {
  return (
    <div 
      className={`
        bg-card border border-white/5 rounded-2xl p-6 backdrop-blur-md
        ${hoverEffect ? 'transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:-translate-y-1' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={`font-heading text-xl font-bold text-white mb-2 ${className}`}>{children}</h3>;
}

export function CardDescription({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <p className={`text-gray-400 text-sm leading-relaxed ${className}`}>{children}</p>;
}
