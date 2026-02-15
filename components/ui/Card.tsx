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
        bg-card border border-card-border rounded-2xl p-6
        ${hoverEffect ? 'transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={`font-heading text-xl font-bold text-card-foreground mb-2 ${className}`}>{children}</h3>;
}

export function CardDescription({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <p className={`text-muted-foreground text-sm leading-relaxed font-medium ${className}`}>{children}</p>;
}
