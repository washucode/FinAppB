import React from 'react';
import {
  X,
  CreditCard,
  Calendar,
  Clock,
  TrendingDown,
  FileText,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { Loan, LoanPayment } from '../../types';
import {
  formatCurrency,
  calculateLoanPayoff,
  getDueStatus,
} from '../../utils/calculations';

interface LoanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  payments: LoanPayment[];
  currencySymbol: string;
  onOpenLogPayment: (loanId: string) => void;
}

export const LoanDetailModal: React.FC<LoanDetailModalProps> = ({
  isOpen,
  onClose,
  loan,
  payments,
  currencySymbol,
  onOpenLogPayment,
}) => {
  if (!isOpen || !loan) return null;

  const payoff = calculateLoanPayoff(loan);
  const dueStatus = getDueStatus(loan.nextDueDate);
  const loanPayments = payments.filter((p) => p.loanId === loan.id);
  const totalPaid = loan.principalAmount - loan.currentBalance;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((totalPaid / (loan.principalAmount || 1)) * 100))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-800/90 border-b border-slate-700/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-2xl shrink-0 shadow-md">
              {loan.categoryEmoji || '🏷️'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    loan.type === 'borrowed'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {loan.type === 'borrowed' ? 'Liability / Debt' : 'Asset / Lent Out'}
                </span>
                <span className="text-xs text-slate-400">• {loan.category}</span>
              </div>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">{loan.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Progress Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/70 space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Remaining Balance</span>
                <span className="text-2xl font-black text-slate-100 font-mono">
                  {formatCurrency(loan.currentBalance, currencySymbol)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Original Principal</span>
                <span className="text-sm font-semibold text-slate-300 font-mono">
                  {formatCurrency(loan.principalAmount, currencySymbol)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Repayment Progress</span>
                <span className="font-semibold text-emerald-400">{progressPercent}% Paid</span>
              </div>
              <div className="w-full h-2.5 bg-slate-700/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Counterparty & APR */}
            <div className="pt-2 border-t border-slate-700/50 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Interest Rate</span>
                <span className="font-bold text-amber-400">{loan.interestRate}% APR</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Monthly Due</span>
                <span className="font-bold text-slate-200">
                  {formatCurrency(loan.monthlyPayment, currencySymbol)}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Next Due Date</span>
                <span className="font-bold text-slate-200">{loan.nextDueDate}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Lender / Contact</span>
                <span className="font-semibold text-slate-200 truncate block">
                  {loan.counterparty}
                </span>
              </div>
            </div>
          </div>

          {/* Payoff & Amortization Projection */}
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-2.5">
            <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
              <Clock className="w-4 h-4" />
              <span>Automated Payoff Projection</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50">
                <span className="text-[10px] text-slate-400 block">Est. Payoff Date</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {payoff.estimatedPayoffDate}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50">
                <span className="text-[10px] text-slate-400 block">Months Remaining</span>
                <span className="text-xs font-bold text-slate-100 font-mono">
                  {payoff.monthsRemaining} months
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 block">Remaining Est. Interest</span>
                <span className="text-xs font-bold text-amber-400 font-mono">
                  {formatCurrency(payoff.estimatedTotalInterest, currencySymbol)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {loan.notes && (
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/40 text-slate-300">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                Notes & Terms
              </span>
              <p className="leading-relaxed">{loan.notes}</p>
            </div>
          )}

          {/* Payment History List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Payment Logs for this Loan ({loanPayments.length})
              </h4>
            </div>

            {loanPayments.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/30 text-center text-slate-400">
                No payments logged yet for this loan.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {loanPayments.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-100">
                        {formatCurrency(p.amount, currencySymbol)}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                        <span>{p.date}</span>
                        <span>•</span>
                        <span>{p.paymentMethod}</span>
                        {p.principalPortion !== undefined && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400">
                              Pr: {formatCurrency(p.principalPortion, currencySymbol)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {p.notes && (
                      <span className="text-[10px] text-slate-400 italic max-w-[140px] truncate">
                        {p.notes}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-800/80 border-t border-slate-700/70 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-300 hover:text-slate-100 hover:bg-slate-700 transition-colors font-medium text-xs"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenLogPayment(loan.id);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Log Payment for this Loan
          </button>
        </div>
      </div>
    </div>
  );
};
