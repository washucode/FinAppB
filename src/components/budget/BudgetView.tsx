import React, { useState } from 'react';
import {
  PieChart,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { MonthlyBudget, Expense, ExpenseCategory, Loan } from '../../types';
import {
  computeBudgetSummary,
  formatCurrency,
} from '../../utils/calculations';

interface BudgetViewProps {
  budget: MonthlyBudget;
  expenses: Expense[];
  loans: Loan[];
  currencySymbol: string;
  onUpdateBudget: (budget: MonthlyBudget) => void;
  onOpenAddExpense: () => void;
  onOpenLogPayment: () => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budget,
  expenses,
  loans,
  currencySymbol,
  onUpdateBudget,
  onOpenAddExpense,
  onOpenLogPayment,
}) => {
  const summary = computeBudgetSummary(budget, expenses);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempAllocated, setTempAllocated] = useState<string>('');
  const [isEditingIncome, setIsEditingIncome] = useState<boolean>(false);
  const [tempIncome, setTempIncome] = useState<string>(String(budget.totalIncome));

  // Current month label (e.g. September 2026)
  const monthDate = new Date(`${budget.monthKey}-01T00:00:00`);
  const monthLabel = monthDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handleSaveAllocated = (catId: string) => {
    const num = parseFloat(tempAllocated);
    if (!isNaN(num) && num >= 0) {
      const updatedCategories = budget.categories.map((c) =>
        c.id === catId ? { ...c, allocatedAmount: num } : c
      );
      onUpdateBudget({ ...budget, categories: updatedCategories });
    }
    setEditingCategory(null);
  };

  const handleSaveIncome = () => {
    const num = parseFloat(tempIncome);
    if (!isNaN(num) && num > 0) {
      onUpdateBudget({ ...budget, totalIncome: num });
    }
    setIsEditingIncome(false);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Month Header & Overview Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 shadow-lg space-y-4">
        {/* Month selector & Quick Income */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Monthly Budget
              </span>
              <h2 className="text-base font-bold text-slate-100">{monthLabel}</h2>
            </div>
          </div>

          <div className="text-right">
            {isEditingIncome ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={tempIncome}
                  onChange={(e) => setTempIncome(e.target.value)}
                  className="w-24 px-2 py-1 bg-slate-800 border border-emerald-500 rounded-lg text-xs text-slate-100 font-mono"
                  autoFocus
                />
                <button
                  onClick={handleSaveIncome}
                  className="px-2 py-1 bg-emerald-600 text-slate-950 font-bold rounded-lg text-[11px]"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempIncome(String(budget.totalIncome));
                  setIsEditingIncome(true);
                }}
                className="group text-right cursor-pointer"
                title="Click to edit monthly income"
              >
                <span className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                  Monthly Income <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {formatCurrency(budget.totalIncome, currencySymbol)}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Gauge: Spent vs Budgeted */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[11px] text-slate-400">Total Spent</span>
              <div className="text-xl sm:text-2xl font-black text-slate-100 font-mono">
                {formatCurrency(summary.totalSpent, currencySymbol)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400">Remaining Budget</span>
              <div
                className={`text-base sm:text-lg font-bold font-mono ${
                  summary.remainingBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCurrency(summary.remainingBudget, currencySymbol)}
              </div>
            </div>
          </div>

          {/* Bar */}
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                summary.spendPercentage > 100
                  ? 'bg-rose-500'
                  : summary.spendPercentage > 85
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${Math.min(summary.spendPercentage, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span>{summary.spendPercentage}% of budget utilized</span>
            <span>Allocated: {formatCurrency(summary.totalAllocated, currencySymbol)}</span>
          </div>
        </div>

        {/* Quick Summary Pill Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 block">Net Savings Rate</span>
            <span className="text-sm font-bold text-teal-400 font-mono">
              {budget.totalIncome > 0
                ? Math.round((summary.netSavings / budget.totalIncome) * 100)
                : 0}
              % ({formatCurrency(summary.netSavings, currencySymbol)})
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 block">Active Loan Commitments</span>
            <span className="text-sm font-bold text-rose-400 font-mono">
              {formatCurrency(
                loans
                  .filter((l) => l.status === 'active' && l.type === 'borrowed')
                  .reduce((sum, l) => sum + l.monthlyPayment, 0),
                currencySymbol
              )}
              /mo
            </span>
          </div>
        </div>
      </div>

      {/* Categories Breakdown Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
            <span>Category Spending Targets</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
              {budget.categories.length}
            </span>
          </h3>
          <p className="text-[11px] text-slate-400">Tap pencil to adjust allocation limits</p>
        </div>
        <button
          onClick={onOpenAddExpense}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Expense
        </button>
      </div>

      {/* Category List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {budget.categories.map((cat) => {
          const catStat = summary.categorySpending[cat.category] || {
            spent: 0,
            remaining: cat.allocatedAmount,
            percent: 0,
            allocated: cat.allocatedAmount,
          };
          const isOver = catStat.spent > cat.allocatedAmount;
          const isWarning = !isOver && catStat.percent >= 80;
          const isEditing = editingCategory === cat.id;

          return (
            <div
              key={cat.id}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800/90 hover:border-slate-700 transition-all space-y-2"
            >
              {/* Top row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">
                      {cat.category}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      Spent: {formatCurrency(catStat.spent, currencySymbol)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={tempAllocated}
                        onChange={(e) => setTempAllocated(e.target.value)}
                        className="w-20 px-2 py-1 bg-slate-800 border border-emerald-500 rounded-lg text-xs text-slate-100 font-mono"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveAllocated(cat.id)}
                        className="px-2 py-1 bg-emerald-600 text-slate-950 font-bold rounded-lg text-[10px]"
                      >
                        OK
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-100 font-mono">
                        {formatCurrency(cat.allocatedAmount, currencySymbol)}
                      </span>
                      <button
                        onClick={() => {
                          setEditingCategory(cat.id);
                          setTempAllocated(String(cat.allocatedAmount));
                        }}
                        className="p-1 text-slate-500 hover:text-slate-300 rounded cursor-pointer"
                        title="Edit target"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Status Pill */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isOver
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {isOver
                      ? `Over by ${formatCurrency(catStat.spent - cat.allocatedAmount, currencySymbol)}`
                      : `${catStat.percent}%`}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(catStat.percent, 100)}%`,
                    backgroundColor: !isOver && !isWarning ? cat.color : undefined,
                  }}
                />
              </div>

              {/* Special action for Debt category */}
              {cat.category === 'Debt & Loans' && (
                <div className="pt-1.5 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Linked to your active loan repayments</span>
                    <button
                      onClick={onOpenLogPayment}
                      className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-0.5 cursor-pointer"
                    >
                      Log Repayment <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                  {/* Active Loan Badges with Emojis */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {loans
                      .filter((l) => l.status === 'active' && l.type === 'borrowed')
                      .slice(0, 4)
                      .map((l) => (
                        <span
                          key={l.id}
                          className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800/90 text-slate-300 border border-slate-700/60 flex items-center gap-1"
                        >
                          <span>{l.categoryEmoji || '🏷️'}</span>
                          <span className="truncate max-w-[90px]">{l.title}</span>
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
