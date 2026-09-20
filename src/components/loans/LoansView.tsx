import React, { useState } from 'react';
import {
  Landmark,
  Plus,
  CreditCard,
  Clock,
  TrendingDown,
  Calendar,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { Loan, LoanPayment, LoanType } from '../../types';
import {
  formatCurrency,
  getDueStatus,
  calculateLoanPayoff,
} from '../../utils/calculations';

interface LoansViewProps {
  loans: Loan[];
  payments: LoanPayment[];
  currencySymbol: string;
  onOpenAddLoan: () => void;
  onOpenLogPayment: (loanId?: string) => void;
  onSelectLoan: (loan: Loan) => void;
}

export const LoansView: React.FC<LoansViewProps> = ({
  loans,
  payments,
  currencySymbol,
  onOpenAddLoan,
  onOpenLogPayment,
  onSelectLoan,
}) => {
  const [filter, setFilter] = useState<'all' | 'borrowed' | 'lent' | 'paid_off'>('all');

  const filteredLoans = loans.filter((l) => {
    if (filter === 'all') return true;
    if (filter === 'paid_off') return l.status === 'paid_off';
    if (filter === 'borrowed') return l.type === 'borrowed' && l.status === 'active';
    if (filter === 'lent') return l.type === 'lent' && l.status === 'active';
    return true;
  });

  // Calculate totals
  const totalBorrowedDebt = loans
    .filter((l) => l.type === 'borrowed' && l.status === 'active')
    .reduce((sum, l) => sum + l.currentBalance, 0);

  const totalLentOut = loans
    .filter((l) => l.type === 'lent' && l.status === 'active')
    .reduce((sum, l) => sum + l.currentBalance, 0);

  const totalMonthlyObligation = loans
    .filter((l) => l.type === 'borrowed' && l.status === 'active')
    .reduce((sum, l) => sum + l.monthlyPayment, 0);

  // Find next upcoming due loan
  const activeBorrowed = loans.filter(
    (l) => l.type === 'borrowed' && l.status === 'active' && l.currentBalance > 0
  );
  const nextDueLoan = activeBorrowed.sort(
    (a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()
  )[0];

  return (
    <div className="space-y-4 pb-20">
      {/* Top Loan Summary Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Loan Portfolio
              </span>
              <h2 className="text-base font-bold text-slate-100">Debts & Repayments</h2>
            </div>
          </div>
          <button
            onClick={onOpenAddLoan}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Loan
          </button>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/30">
            <span className="text-[10px] text-slate-400 block flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-rose-400" />
              Total Debt Owed
            </span>
            <span className="text-base font-black text-rose-300 font-mono">
              {formatCurrency(totalBorrowedDebt, currencySymbol)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
            <span className="text-[10px] text-slate-400 block flex items-center gap-1">
              <ArrowDownLeft className="w-3 h-3 text-emerald-400" />
              Total Money Lent
            </span>
            <span className="text-base font-black text-emerald-300 font-mono">
              {formatCurrency(totalLentOut, currencySymbol)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 block">Monthly Commitments</span>
            <span className="text-base font-bold text-slate-100 font-mono">
              {formatCurrency(totalMonthlyObligation, currencySymbol)}
              <span className="text-xs font-normal text-slate-400">/mo</span>
            </span>
          </div>
        </div>

        {/* Next Due Alert Banner */}
        {nextDueLoan && (
          <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-indigo-300 font-medium block">
                  Next Payment Due: {nextDueLoan.nextDueDate}
                </span>
                <span className="text-xs font-bold text-slate-100">
                  {nextDueLoan.title} ({formatCurrency(nextDueLoan.monthlyPayment, currencySymbol)})
                </span>
              </div>
            </div>
            <button
              onClick={() => onOpenLogPayment(nextDueLoan.id)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Pay Now
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex rounded-2xl bg-slate-900 p-1 border border-slate-800 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 rounded-xl font-medium transition-all text-center cursor-pointer ${
            filter === 'all'
              ? 'bg-slate-800 text-slate-100 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({loans.length})
        </button>
        <button
          onClick={() => setFilter('borrowed')}
          className={`flex-1 py-1.5 rounded-xl font-medium transition-all text-center cursor-pointer ${
            filter === 'borrowed'
              ? 'bg-slate-800 text-rose-300 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Debts ({loans.filter((l) => l.type === 'borrowed' && l.status === 'active').length})
        </button>
        <button
          onClick={() => setFilter('lent')}
          className={`flex-1 py-1.5 rounded-xl font-medium transition-all text-center cursor-pointer ${
            filter === 'lent'
              ? 'bg-slate-800 text-emerald-300 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Lent ({loans.filter((l) => l.type === 'lent' && l.status === 'active').length})
        </button>
        <button
          onClick={() => setFilter('paid_off')}
          className={`flex-1 py-1.5 rounded-xl font-medium transition-all text-center cursor-pointer ${
            filter === 'paid_off'
              ? 'bg-slate-800 text-slate-300 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Paid Off ({loans.filter((l) => l.status === 'paid_off').length})
        </button>
      </div>

      {/* Loans List */}
      <div className="space-y-3">
        {filteredLoans.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
            <Landmark className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-300">No loans found in this category</p>
            <p className="text-xs text-slate-500 mt-0.5">Tap + Add Loan to begin logging debts or loans</p>
          </div>
        ) : (
          filteredLoans.map((loan) => {
            const dueStatus = getDueStatus(loan.nextDueDate);
            const totalPaid = loan.principalAmount - loan.currentBalance;
            const progress = Math.min(
              100,
              Math.max(0, Math.round((totalPaid / (loan.principalAmount || 1)) * 100))
            );
            const isPaidOff = loan.status === 'paid_off' || loan.currentBalance <= 0;

            return (
              <div
                key={loan.id}
                onClick={() => onSelectLoan(loan)}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group space-y-3"
              >
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-xl shrink-0 shadow-xs">
                      {loan.categoryEmoji || '🏷️'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            loan.type === 'borrowed'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {loan.type === 'borrowed' ? 'I Owe' : 'Lent Out'}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {loan.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors mt-0.5">
                        {loan.title}
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        {loan.counterparty}
                      </span>
                    </div>
                  </div>

                  {/* Balance / Status */}
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Current Balance</span>
                    <span className="text-base font-bold text-slate-100 font-mono">
                      {formatCurrency(loan.currentBalance, currencySymbol)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      of {formatCurrency(loan.principalAmount, currencySymbol)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>{progress}% Repaid</span>
                    <span>{loan.interestRate}% APR</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isPaidOff
                          ? 'bg-emerald-500'
                          : loan.type === 'borrowed'
                          ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Bottom row: Due date badge & quick action */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  {isPaidOff ? (
                    <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Fully Repaid!
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${dueStatus.colorClass}`}
                      >
                        {dueStatus.label}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Monthly: {formatCurrency(loan.monthlyPayment, currencySymbol)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {!isPaidOff && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenLogPayment(loan.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <CreditCard className="w-3 h-3" />
                        Log Payment
                      </button>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
