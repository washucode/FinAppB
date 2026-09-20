import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Trash2,
  Calendar,
  CreditCard,
  Repeat,
  DollarSign,
  Tag,
} from 'lucide-react';
import { Expense, ExpenseCategory } from '../../types';
import { formatCurrency } from '../../utils/calculations';

interface ExpensesViewProps {
  expenses: Expense[];
  currencySymbol: string;
  onOpenAddExpense: () => void;
  onDeleteExpense: (id: string) => void;
}

const CATEGORIES: ('All' | ExpenseCategory)[] = [
  'All',
  'Food & Dining',
  'Housing',
  'Transportation',
  'Utilities',
  'Debt & Loans',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Savings',
  'Miscellaneous',
];

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  currencySymbol,
  onOpenAddExpense,
  onDeleteExpense,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<'All' | ExpenseCategory>('All');

  // Filter expenses
  const filtered = expenses.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedCat === 'All' || e.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  // Calculate current month total
  const currentMonthTotal = expenses
    .filter((e) => e.date.startsWith('2026-09'))
    .reduce((sum, e) => sum + e.amount, 0);

  // Group by date
  const groupedByDate: Record<string, Expense[]> = {};
  filtered.forEach((e) => {
    if (!groupedByDate[e.date]) {
      groupedByDate[e.date] = [];
    }
    groupedByDate[e.date].push(e);
  });

  // Sort dates descending
  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-4 pb-20">
      {/* Header & Quick Stats */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Expense Logs
              </span>
              <h2 className="text-base font-bold text-slate-100">Daily Spending</h2>
            </div>
          </div>
          <button
            onClick={onOpenAddExpense}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Expense
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400">Total Spent in September</span>
            <div className="text-xl font-black text-slate-100 font-mono">
              {formatCurrency(currentMonthTotal, currencySymbol)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400">Logged Transactions</span>
            <div className="text-sm font-bold text-amber-400">
              {filtered.length} expenses
            </div>
          </div>
        </div>
      </div>

      {/* Search & Category Pills */}
      <div className="space-y-2">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search expenses by title or note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Categories scrollable pill list */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all text-xs cursor-pointer ${
                selectedCat === cat
                  ? 'bg-amber-500/20 border border-amber-500/60 text-amber-300 font-semibold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expense List Grouped by Date */}
      <div className="space-y-4">
        {sortedDates.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
            <Receipt className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-300">No expenses recorded</p>
            <p className="text-xs text-slate-500 mt-0.5">Tap + Add Expense to log spending</p>
          </div>
        ) : (
          sortedDates.map((dateStr) => {
            const items = groupedByDate[dateStr];
            const dateTotal = items.reduce((sum, item) => sum + item.amount, 0);
            const isToday = dateStr === '2026-09-20';

            return (
              <div key={dateStr} className="space-y-1.5">
                {/* Date header */}
                <div className="flex items-center justify-between px-1 text-xs text-slate-400">
                  <span className="font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {isToday ? 'Today, ' : ''}
                    {dateStr}
                  </span>
                  <span className="font-mono text-slate-300 font-medium">
                    {formatCurrency(dateTotal, currencySymbol)}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-1.5">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-slate-900 border border-slate-800/90 hover:border-slate-700 transition-all flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold shrink-0">
                          {item.title.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-slate-200">{item.title}</h4>
                            {item.isRecurring && (
                              <span title="Recurring">
                                <Repeat className="w-3 h-3 text-amber-400" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300">
                              {item.category}
                            </span>
                            <span>•</span>
                            <span>{item.paymentMethod}</span>
                            {item.notes && (
                              <>
                                <span>•</span>
                                <span className="italic truncate max-w-[120px]">
                                  {item.notes}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-100 font-mono">
                          -{formatCurrency(item.amount, currencySymbol)}
                        </span>
                        <button
                          onClick={() => onDeleteExpense(item.id)}
                          className="p-1 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
