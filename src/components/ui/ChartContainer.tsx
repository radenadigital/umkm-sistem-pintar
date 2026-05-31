import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface ChartContainerProps {
  children: ReactNode;
  height?: number | string;
  className?: string;
  minHeight?: number | string;
}

/**
 * A reusable wrapper for Recharts that ensures the parent container 
 * has a stable, non-zero height before the chart renders.
 * This prevents the "width/height is -1 or undefined" warning.
 */
export function ChartContainer({ 
  children, 
  height = 350, 
  className,
  minHeight = 250 
}: ChartContainerProps) {
  return (
    <div 
      className={cn("w-full relative overflow-hidden", className)}
      style={{ 
        height: typeof height === 'number' ? `${height}px` : height,
        minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight 
      }}
    >
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  );
}
