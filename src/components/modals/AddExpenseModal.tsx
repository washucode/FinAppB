import React, { useState } from 'react';
import { X, Receipt, Plus, Repeat } from 'lucide-react';
import { Expense, ExpenseCategory, PaymentMethod } from '../../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
  onSaveExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Food & Dining',
  'Housing',
  'Transportation',
  'Utilities',
  'Debt & Loans',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Savings',
  'Education',
  'Miscellaneous',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'Debit Card',
  'Cash',
  'Bank Transfer',
  'Mobile Money',
  'Auto-Debit',
  'Check',
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  currencySymbol,
  onSaveExpense,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food & Dining');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Debit Card');
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!title || isNaN(num) || num <= 0) return;

    onSaveExpense({
      title,
      amount: num,
      category,
      date,
      paymentMethod,
      isRecurring,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-800/90 border-b border-slate-700/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Log Expense</h3>
              <p className="text-[11px] text-slate-400">Track spending against your monthly budget</p>
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
          {/* Title & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Expense Title *
              </label>
              <input
                type="text"
                placeholder="e.g., Groceries, Fuel, Coffee"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Amount ({currencySymbol}) *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="45.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 font-mono text-xs"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Category</label>
            <div className="grid grid-cols-3 gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-800/50 rounded-xl border border-slate-700/50">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-1.5 px-2 rounded-lg text-center transition-colors truncate cursor-pointer text-[11px] ${
                    category === cat
                      ? 'bg-amber-500/20 border border-amber-500/60 text-amber-300 font-semibold'
                      : 'bg-slate-800 border border-slate-700/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 font-mono text-xs"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recurring bill toggle */}
          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900"
            />
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Repeat className="w-3.5 h-3.5 text-amber-400" />
              <span>Mark as Recurring Monthly Expense</span>
            </div>
          </label>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Receipt details, location"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>

          {/* Submit */}
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
              className="px-5 py-2 text-xs rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition-all shadow-md shadow-amber-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
