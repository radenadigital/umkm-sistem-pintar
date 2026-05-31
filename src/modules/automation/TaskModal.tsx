import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Layout, 
  AlignLeft, 
  User, 
  AlertCircle,
  Tag
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Modal from '../../components/ui/Modal';
import { Task, TaskPriority, TaskStatus } from './TaskList';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  editTask: Task | null;
}

export default function TaskModal({ isOpen, onClose, onSave, editTask }: TaskModalProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'low',
    status: 'todo',
    dueDate: new Date().toISOString().split('T')[0],
    assignee: '',
    category: ''
  });

  useEffect(() => {
    if (editTask) {
      setFormData(editTask);
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'low',
        status: 'todo',
        dueDate: new Date().toISOString().split('T')[0],
        assignee: '',
        category: ''
      });
    }
  }, [editTask, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editTask ? "Edit Tugas" : "Tambah Tugas Baru"}
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block flex items-center gap-1.5">
            <Layout size={10} /> Judul Tugas
          </label>
          <input 
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Misal: Follow-up penawaran catering"
            className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block flex items-center gap-1.5">
            <AlignLeft size={10} /> Deskripsi
          </label>
          <textarea 
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detail tugas yang harus dilakukan..."
            className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block flex items-center gap-1.5">
              <Calendar size={10} /> Deadline
            </label>
            <input 
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block flex items-center gap-1.5">
              <AlertCircle size={10} /> Prioritas
            </label>
            <select 
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
              className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
            >
              <option value="low">Rendah</option>
              <option value="medium">Sedang</option>
              <option value="high">Tinggi</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block flex items-center gap-1.5">
              <User size={10} /> Assignee
            </label>
            <input 
              type="text"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              placeholder="Nama penanggung jawab"
              className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block flex items-center gap-1.5">
              <Tag size={10} /> Kategori
            </label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              <option value="">Umum</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Inventory">Inventory</option>
              <option value="Support">Support</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block flex items-center gap-1.5">
            Status Terkini
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['todo', 'in-progress', 'done'] as TaskStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFormData({ ...formData, status: s })}
                className={cn(
                  "py-2 rounded-xl text-[10px] font-bold uppercase transition-all border-2",
                  formData.status === s 
                    ? "bg-indigo-600 border-indigo-600 text-white" 
                    : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                )}
              >
                {s.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
        >
          {editTask ? "Simpan Perubahan" : "Buat Tugas"}
        </button>
      </form>
    </Modal>
  );
}
