import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface RefreshButtonProps {
  onRefresh: () => Promise<void> | void;
  className?: string;
  label?: string;
}

export default function RefreshButton({ onRefresh, className, label }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
        "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50",
        className
      )}
    >
      <motion.div
        animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
        transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : { duration: 0.2 }}
      >
        <RefreshCw size={14} className={cn(isRefreshing && "text-indigo-600")} />
      </motion.div>
      {label || (isRefreshing ? 'Memperbarui...' : 'Refresh')}
    </button>
  );
}
