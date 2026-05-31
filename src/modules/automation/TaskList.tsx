import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  MoreVertical,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import EmptyState from '../../components/ui/EmptyState';

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignee?: string;
  category?: string;
}

interface TaskListProps {
  tasks: Task[];
  onToggleStatus: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  filterStatus: string;
  filterPriority: string;
  searchTerm: string;
}

export default function TaskList({ 
  tasks, 
  onToggleStatus, 
  onEdit, 
  onDelete,
  filterStatus,
  filterPriority,
  searchTerm
}: TaskListProps) {
  
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  if (filteredTasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[400px] flex items-center justify-center">
        <EmptyState 
          icon={CheckCircle2}
          title="Tidak ada tugas ditemukan"
          description="Coba ubah filter atau cari dengan kata kunci lain."
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="divide-y divide-slate-100">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task) => (
            <motion.div 
              layout
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "p-4 lg:p-6 flex items-start justify-between hover:bg-slate-50 transition-colors group",
                task.status === 'done' && "bg-slate-50/50"
              )}
            >
              <div className="flex gap-4 flex-1">
                <button 
                  onClick={() => onToggleStatus(task.id)}
                  className={cn(
                    "mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    task.status === 'done' 
                      ? "bg-indigo-600 border-indigo-600 text-white" 
                      : "border-slate-200 hover:border-indigo-400 text-transparent"
                  )}
                >
                  <CheckCircle2 size={14} className={task.status === 'done' ? "opacity-100" : "opacity-0"} />
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className={cn(
                      "text-sm font-bold text-slate-900 truncate max-w-md",
                      task.status === 'done' && "line-through text-slate-400 font-medium"
                    )}>
                      {task.title}
                    </h4>
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md",
                      task.priority === 'high' ? "bg-rose-100 text-rose-700" : 
                      task.priority === 'medium' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                    )}>
                      {task.priority}
                    </span>
                    {task.category && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {task.category}
                      </span>
                    )}
                  </div>
                  
                  <p className={cn(
                    "text-xs text-slate-500 mb-3 line-clamp-1",
                    task.status === 'done' && "text-slate-400/80"
                  )}>
                    {task.description}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase">
                      <Calendar size={12} /> {task.dueDate}
                    </span>
                    {task.assignee && (
                      <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase">
                        <User size={12} /> {task.assignee}
                      </span>
                    )}
                    <span className={cn(
                      "flex items-center gap-1.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                      task.status === 'todo' ? "text-slate-500" :
                      task.status === 'in-progress' ? "text-indigo-600 bg-indigo-50" :
                      "text-emerald-600 bg-emerald-50"
                    )}>
                      {task.status === 'in-progress' && <Clock size={10} className="animate-pulse" />}
                      {task.status === 'todo' && <AlertCircle size={10} />}
                      {task.status === 'done' && <CheckCircle2 size={10} />}
                      {task.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                <button 
                  onClick={() => onEdit(task)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <MessageSquare size={16} />
                </button>
                <button 
                  onClick={() => onDelete(task.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
