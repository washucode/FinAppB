import React from 'react';
import {
  TrendingUp,
  Wallet,
  Landmark,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { MonthlyBudget, Expense, Loan } from '../../types';
import {
  computeBudgetSummary,
  computeLoanOverview,
  formatCurrency,
} from '../../utils/calculations';

interface WebQuickStatsProps {
  budget: MonthlyBudget;
  expenses: Expense[];
  loans: Loan[];
  currencySymbol: string;
  onOpenLogPayment: () => void;
  onOpenAddExpense: () => void;
}

export const WebQuickStats: React.FC<WebQuickStatsProps> = ({
  budget,
  expenses,
  loans,
  currencySymbol,
  onOpenLogPayment,
  onOpenAddExpense,
}) => {
  const budgetSummary = computeBudgetSummary(budget, expenses);
  const loanOverview = computeLoanOverview(loans);

  // Find next upcoming active loan payment
  const activeBorrowedLoans = loans
    .filter((l) => l.status === 'active' && l.type === 'borrowed')
    .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  const nextLoan = activeBorrowedLoans[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Monthly Budget Card */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition-all shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Monthly Budget</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <Wallet className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl font-bold font-mono text-slate-100">
          {formatCurrency(budgetSummary.totalSpent, currencySymbol)}
        </div>
        <div className="mt-1 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            of {formatCurrency(budgetSummary.totalAllocated, currencySymbol)} allocated
          </span>
          <span
            className={`font-semibold ${
              budgetSummary.remainingBudget < 0
                ? 'text-rose-400'
                : budgetSummary.spendPercentage > 80
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {budgetSummary.spendPercentage}%
          </span>
        </div>
        {/* Progress meter */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              budgetSummary.remainingBudget < 0
                ? 'bg-rose-500'
                : budgetSummary.spendPercentage > 80
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(budgetSummary.spendPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* 2. Outstanding Debt */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition-all shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Total Outstanding Debt</span>
          <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center">
            <Landmark className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl font-bold font-mono text-slate-100">
          {formatCurrency(loanOverview.totalBorrowedBalance, currencySymbol)}
        </div>
        <div className="mt-1 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {loans.filter((l) => l.type === 'borrowed' && l.status === 'active').length} active debts
          </span>
          <span className="text-indigo-400 font-medium">
            {formatCurrency(loanOverview.monthlyCommitment, currencySymbol)}/mo
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-rose-500 rounded-full"
            style={{
              width: `${Math.min(
                100,
                Math.round(
                  (loanOverview.totalBorrowedBalance /
                    (loans
                      .filter((l) => l.type === 'borrowed')
                      .reduce((s, l) => s + l.principalAmount, 0) || 1)) *
                    100
                )
              )}%`,
            }}
          />
        </div>
      </div>

      {/* 3. Money Lent Out (Receivables) */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition-all shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Lent Out (Receivables)</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl font-bold font-mono text-emerald-400">
          {formatCurrency(loanOverview.totalLentBalance, currencySymbol)}
        </div>
        <div className="mt-1 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {loans.filter((l) => l.type === 'lent' && l.status === 'active').length} active loans
          </span>
          <span className="text-emerald-400 font-medium">Asset</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full w-3/4" />
        </div>
      </div>

      {/* 4. Next Payment Due */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/30 border border-indigo-500/30 hover:border-indigo-500/50 transition-all shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Next Due Loan
            </span>
            {nextLoan && (
              <span className="text-base">{nextLoan.categoryEmoji || '🏷️'}</span>
            )}
          </div>
          {nextLoan ? (
            <div>
              <div className="text-sm font-bold text-slate-100 truncate">
                {nextLoan.title}
              </div>
              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <span className="font-mono text-indigo-300 font-bold">
                  {formatCurrency(nextLoan.monthlyPayment, currencySymbol)}
                </span>
                <span>• Due {nextLoan.nextDueDate}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 mt-1">No pending payments scheduled</div>
          )}
        </div>

        {nextLoan && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={onOpenLogPayment}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 cursor-pointer"
            >
              Pay Now <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
