import React, { useState } from 'react';
import { X, Bell, Plus, Calendar } from 'lucide-react';
import { Reminder, ReminderPriority, ReminderType } from '../../types';

interface AddReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
  onSaveReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void;
}

export const AddReminderModal: React.FC<AddReminderModalProps> = ({
  isOpen,
  onClose,
  currencySymbol,
  onSaveReminder,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [type, setType] = useState<ReminderType>('loan_payment');
  const [priority, setPriority] = useState<ReminderPriority>('medium');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;

    onSaveReminder({
      title,
      description: description || `Reminder scheduled for ${dueDate}`,
      dueDate,
      type,
      priority,
      status: 'pending',
      amount: amount ? parseFloat(amount) : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-800/90 border-b border-slate-700/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Schedule Reminder</h3>
              <p className="text-[11px] text-slate-400">Automated alerts for payments & bills</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Reminder Title *
            </label>
            <input
              type="text"
              placeholder="e.g., Pay Student Loan Installment, Review Budget"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 text-xs"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Pay via auto-debit on checking account"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Due Date *</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-mono text-xs"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Amount ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Optional"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ReminderType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 text-xs"
              >
                <option value="loan_payment">Loan Payment</option>
                <option value="recurring_bill">Recurring Bill</option>
                <option value="budget_warning">Budget Alert</option>
                <option value="custom">General Reminder</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ReminderPriority)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 text-xs"
              >
                <option value="high">High (Urgent)</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Save Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
