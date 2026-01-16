import React from 'react';

interface SectionProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
  container?: boolean;
}

export function Section({ id, className = '', children, container = true }: SectionProps) {
  return (
    <section id={id} className={`py-16 md:py-24 relative overflow-hidden ${className}`}>
      {container ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
}
