import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Layout,
  MessageSquare,
  Package,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import RefreshButton from '../../components/ui/RefreshButton';
import TaskList, { Task, TaskPriority, TaskStatus } from './TaskList';
import TaskModal from './TaskModal';
import AutomationRules, { AutomationRule } from './AutomationRules';
import RuleModal from './RuleModal';

const INITIAL_TASKS: Task[] = [];
const INITIAL_RULES: AutomationRule[] = [];

type Tab = 'tasks' | 'automation';

export default function Automation() {
  const [activeTab, setActiveTab] = useState<Tab>('tasks');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [rules, setRules] = useState<AutomationRule[]>(INITIAL_RULES);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Tasks state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskSearch, setTaskSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Rules state
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  // Task Actions
  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...taskData } as Task : t));
    } else {
      const newTask: Task = {
        id: `T-${Math.floor(Math.random() * 1000)}`,
        title: taskData.title || '',
        description: taskData.description || '',
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
        assignee: taskData.assignee,
        category: taskData.category
      };
      setTasks([newTask, ...tasks]);
    }
    setEditingTask(null);
  };

  const handleToggleTaskStatus = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 'done' ? 'todo' : 'done' };
      }
      return t;
    }));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Rule Actions
  const handleSaveRule = (ruleData: Partial<AutomationRule>) => {
    if (editingRule) {
      setRules(rules.map(r => r.id === editingRule.id ? { ...r, ...ruleData } as AutomationRule : r));
    } else {
      const newRule: AutomationRule = {
        id: `R-${Math.floor(Math.random() * 1000)}`,
        name: ruleData.name || '',
        trigger: ruleData.trigger || '',
        action: ruleData.action || '',
        description: ruleData.description || '',
        isActive: ruleData.isActive ?? true,
        icon: Zap
      };
      setRules([newRule, ...rules]);
    }
    setEditingRule(null);
  };

  const handleToggleRuleActive = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const activeTasksCount = tasks.filter(t => t.status !== 'done').length;
  const activeRulesCount = rules.filter(r => r.isActive).length;
  
  // Find nearest deadline
  const nearestDeadlineTask = useMemo(() => {
    const pendingTasks = tasks.filter(t => t.status !== 'done' && t.dueDate);
    if (pendingTasks.length === 0) return null;
    
    return pendingTasks.sort((a, b) => {
      return new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime();
    })[0];
  }, [tasks]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Otomasi & Tasks</h1>
          <p className="text-slate-500 text-sm">Kelola tugas operasional dan buat workflow Bisnis pintar Anda.</p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton onRefresh={handleRefresh} />
          {activeTab === 'tasks' ? (
            <button 
              onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
              <Plus size={18} /> Tambah Task
            </button>
          ) : (
            <button 
              onClick={() => { setEditingRule(null); setIsRuleModalOpen(true); }}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
              <Zap size={18} /> Buat Otomasi
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm group hover:border-indigo-200 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Tasks Pending</p>
          </div>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-slate-900">{activeTasksCount}</h3>
            <span className="text-xs font-bold text-slate-400">Total {tasks.length}</span>
          </div>
        </div>
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm group hover:border-emerald-200 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Zap size={20} />
            </div>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Alur Aktif</p>
          </div>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-slate-900">{activeRulesCount}</h3>
            <span className="text-xs font-bold text-emerald-600">
              {rules.length === 0 ? '0%' : ((activeRulesCount / rules.length) * 100).toFixed(0)}% Otomatis
            </span>
          </div>
        </div>
        <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/10 text-white rounded-xl">
                <Clock size={20} />
              </div>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Deadline Terdekat</p>
            </div>
            {nearestDeadlineTask ? (
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {new Date(nearestDeadlineTask.dueDate!).toLocaleDateString('id-ID', { 
                    weekday: 'short', 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </h3>
                <div className={cn(
                  "px-2 py-1 text-white text-[10px] font-bold rounded-lg",
                  nearestDeadlineTask.priority === 'high' ? 'bg-rose-500 animate-pulse' :
                  nearestDeadlineTask.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-500'
                )}>
                  {nearestDeadlineTask.priority === 'high' ? 'URGENT' :
                   nearestDeadlineTask.priority === 'medium' ? 'PENTING' : 'BIASA'}
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-sm">
                Tidak ada deadline yang perlu diperhatikan
              </div>
            )}
          </div>
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Tabs and Controllers */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 border-b border-slate-100 pb-2">
          <div className="flex p-1 bg-slate-100 rounded-2xl w-full lg:w-fit">
            {[
              { id: 'tasks', label: 'Tugas Harian', icon: Layout },
              { id: 'automation', label: 'Workflow Otomasi', icon: Zap },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={cn(
                  "flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                  activeTab === tab.id 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                <tab.icon size={16} />
                {tab.label}
                {tab.id === 'tasks' && activeTasksCount > 0 && (
                  <span className="w-5 h-5 flex items-center justify-center bg-indigo-600 text-white text-[10px] rounded-full">
                    {activeTasksCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'tasks' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-wrap items-center gap-3 w-full lg:w-fit"
              >
                <div className="relative flex-1 lg:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Cari tugas..." 
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                  />
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent text-[11px] font-bold uppercase tracking-wider text-slate-600 px-2 py-1 outline-none cursor-pointer"
                  >
                    <option value="all">Sua Status</option>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  <div className="w-px h-4 bg-slate-100" />
                  <select 
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="bg-transparent text-[11px] font-bold uppercase tracking-wider text-slate-600 px-2 py-1 outline-none cursor-pointer"
                  >
                    <option value="all">Sua Prioritas</option>
                    <option value="low">Rendah</option>
                    <option value="medium">Sedang</option>
                    <option value="high">Tinggi</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Display */}
        <div className="min-h-[400px] relative">
          <AnimatePresence mode="wait">
            {isRefreshing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-2xl"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Memperbarui Data...</p>
                </div>
              </motion.div>
            )}
            {activeTab === 'tasks' ? (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TaskList 
                  tasks={tasks}
                  onToggleStatus={handleToggleTaskStatus}
                  onEdit={(t) => { setEditingTask(t); setIsTaskModalOpen(true); }}
                  onDelete={handleDeleteTask}
                  filterStatus={statusFilter}
                  filterPriority={priorityFilter}
                  searchTerm={taskSearch}
                />
              </motion.div>
            ) : (
              <motion.div
                key="automation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <AutomationRules 
                  rules={rules}
                  onToggleActive={handleToggleRuleActive}
                  onEdit={(r) => { setEditingRule(r); setIsRuleModalOpen(true); }}
                  onDelete={handleDeleteRule}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Integration Tips Panel */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden group shadow-2xl shadow-indigo-100">
        <div className="relative z-10 lg:flex items-center justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                <AlertCircle size={24} />
              </div>
              <h4 className="text-xl font-bold">Tips Integrasi Cerdas</h4>
            </div>
            <p className="text-indigo-100 text-sm leading-relaxed mb-6 lg:mb-0">
              Gunakan sistem otomasi untuk menghubungkan data penjualan dan inventory. Sistem akan otomatis mengingatkan tim saat stok menipis atau ada pelanggan loyal yang perlu disapa.
            </p>
          </div>
          <button className="px-8 py-3 bg-white text-indigo-600 rounded-2xl font-bold text-sm shadow-xl shadow-white/10 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group-hover:translate-x-2">
            Lihat Tutorial Workflow <Zap size={18} />
          </button>
        </div>
        
        {/* Background blobs */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl group-hover:rotate-12 transition-transform duration-1000"></div>
      </div>

      {/* Modals */}
      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
        onSave={handleSaveTask}
        editTask={editingTask}
      />
      <RuleModal 
        isOpen={isRuleModalOpen}
        onClose={() => { setIsRuleModalOpen(false); setEditingRule(null); }}
        onSave={handleSaveRule}
        editRule={editingRule}
      />
    </div>
  );
}
