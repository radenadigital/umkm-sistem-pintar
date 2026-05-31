import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { LucideIcon, Ghost } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({ 
  icon: Icon = Ghost, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-slate-200 text-center space-y-4",
      className
    )}>
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
        <Icon size={32} />
      </div>
      <div className="max-w-xs space-y-1">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>
      {action && (
        <div className="pt-2">
          {action}
        </div>
      )}
    </div>
  );
}
