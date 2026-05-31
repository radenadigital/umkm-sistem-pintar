import React from 'react';
import { 
  Zap, 
  ToggleLeft, 
  ToggleRight, 
  ArrowRight, 
  Trash2, 
  Settings2,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import EmptyState from '../../components/ui/EmptyState';

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  isActive: boolean;
  description: string;
  icon: any;
}

interface AutomationRulesProps {
  rules: AutomationRule[];
  onToggleActive: (id: string) => void;
  onEdit: (rule: AutomationRule) => void;
  onDelete: (id: string) => void;
}

export default function AutomationRules({ 
  rules, 
  onToggleActive, 
  onEdit, 
  onDelete 
}: AutomationRulesProps) {

  if (rules.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[400px] flex items-center justify-center">
        <EmptyState 
          icon={Zap}
          title="Belum ada alur otomatis"
          description="Buat workflow sederhana untuk mengotomatiskan tugas operasional harian Anda."
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <AnimatePresence mode="popLayout">
        {rules.map((rule) => {
          const Icon = rule.icon || Zap;
          return (
            <motion.div 
              layout
              key={rule.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between transition-all hover:shadow-lg hover:border-indigo-100 group",
                !rule.isActive && "opacity-60 saturate-50"
              )}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                    rule.isActive ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-400"
                  )}>
                    <Icon size={24} />
                  </div>
                  <button 
                    onClick={() => onToggleActive(rule.id)}
                    className="transition-transform active:scale-90"
                  >
                    {rule.isActive ? (
                      <ToggleRight className="text-indigo-600" size={32} />
                    ) : (
                      <ToggleLeft className="text-slate-300" size={32} />
                    )}
                  </button>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-lg mb-1">{rule.name}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {rule.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-2 py-1 rounded-md border border-slate-200">
                    If: {rule.trigger}
                  </div>
                  <ArrowRight size={12} className="text-slate-300 shrink-0" />
                  <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                    Then: {rule.action}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                  <Bell size={12} /> Email & WA Alert
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => onEdit(rule)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    <Settings2 size={16} />
                  </button>
                  <button 
                    onClick={() => onDelete(rule.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
