import React from 'react';

interface AdSenseProps {
  slotId: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
}

export function AdSense({ slotId, format = 'auto', className = '' }: AdSenseProps) {
  // This is a placeholder structure. In production, you would insert the actual AdSense script logic here.
  return (
    <div className={`w-full bg-white/5 border border-dashed border-white/10 rounded-lg flex items-center justify-center p-4 my-8 min-h-[100px] ${className}`}>
      <div className="text-center">
        <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1">Advertisement</span>
        {/* Actual Ad Code would go here */}
        <div className="text-gray-600 text-sm">Google AdSense Slot: {slotId} ({format})</div>
      </div>
    </div>
  );
}
