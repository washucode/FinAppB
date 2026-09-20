import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Calendar,
  DollarSign,
  CheckCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { Loan, PaymentMethod } from '../../types';
import { formatCurrency } from '../../utils/calculations';

interface LogPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loans: Loan[];
  initialLoanId?: string;
  currencySymbol: string;
  onSavePayment: (paymentData: {
    loanId: string;
    amount: number;
    date: string;
    principalPortion: number;
    interestPortion: number;
    paymentMethod: PaymentMethod;
    notes: string;
    autoLogExpense: boolean;
  }) => void;
}

export const LogPaymentModal: React.FC<LogPaymentModalProps> = ({
  isOpen,
  onClose,
  loans,
  initialLoanId,
  currencySymbol,
  onSavePayment,
}) => {
  if (!isOpen) return null;

  const activeLoans = loans.filter((l) => l.status === 'active');
  const defaultLoan = activeLoans.find((l) => l.id === initialLoanId) || activeLoans[0];

  const [selectedLoanId, setSelectedLoanId] = useState<string>(
    defaultLoan ? defaultLoan.id : ''
  );
  const selectedLoan = loans.find((l) => l.id === selectedLoanId);

  const [amount, setAmount] = useState<string>(
    selectedLoan ? String(selectedLoan.monthlyPayment) : '100'
  );
  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [autoLogExpense, setAutoLogExpense] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  // Handle loan selection change
  const handleLoanChange = (id: string) => {
    setSelectedLoanId(id);
    const loan = loans.find((l) => l.id === id);
    if (loan) {
      setAmount(String(loan.monthlyPayment));
    }
  };

  // Estimate interest portion
  const numAmount = parseFloat(amount) || 0;
  const monthlyRate = selectedLoan ? (selectedLoan.interestRate / 100) / 12 : 0;
  const estimatedInterest = selectedLoan ? Math.min(numAmount, selectedLoan.currentBalance * monthlyRate) : 0;
  const estimatedPrincipal = Math.max(0, numAmount - estimatedInterest);

  const [principalPortion, setPrincipalPortion] = useState<number>(
    Math.round(estimatedPrincipal * 100) / 100
  );
  const [interestPortion, setInterestPortion] = useState<number>(
    Math.round(estimatedInterest * 100) / 100
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanId || numAmount <= 0) return;

    onSavePayment({
      loanId: selectedLoanId,
      amount: numAmount,
      date,
      principalPortion: Number(principalPortion) || estimatedPrincipal,
      interestPortion: Number(interestPortion) || estimatedInterest,
      paymentMethod,
      notes,
      autoLogExpense: selectedLoan?.type === 'borrowed' ? autoLogExpense : false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-800/90 border-b border-slate-700/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Log Loan Payment</h3>
              <p className="text-[11px] text-slate-400">Record repayment & update balance</p>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Loan Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Loan
            </label>
            <select
              value={selectedLoanId}
              onChange={(e) => handleLoanChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
              required
            >
              {loans.map((loan) => (
                <option key={loan.id} value={loan.id}>
                  {loan.categoryEmoji || '🏷️'} {loan.title} ({loan.type === 'borrowed' ? 'Debt' : 'Lent'}) - Balance:{' '}
                  {formatCurrency(loan.currentBalance, currencySymbol)}
                </option>
              ))}
            </select>
          </div>

          {/* Current Loan Snapshot */}
          {selectedLoan && (
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="text-xl">
                  {selectedLoan.categoryEmoji || '🏷️'}
                </div>
                <div>
                  <span className="text-slate-400">Current Balance:</span>
                  <div className="font-bold text-slate-100 text-sm">
                    {formatCurrency(selectedLoan.currentBalance, currencySymbol)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-400">Interest Rate:</span>
                <div className="font-semibold text-emerald-400 text-sm">
                  {selectedLoan.interestRate}% APR
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-400">Next Due:</span>
                <div className="font-medium text-slate-300">
                  {selectedLoan.nextDueDate}
                </div>
              </div>
            </div>
          )}

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Amount Paid ({currencySymbol})
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    const val = parseFloat(e.target.value) || 0;
                    const estInt = selectedLoan
                      ? Math.min(val, selectedLoan.currentBalance * monthlyRate)
                      : 0;
                    setInterestPortion(Math.round(estInt * 100) / 100);
                    setPrincipalPortion(Math.round((val - estInt) * 100) / 100);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Payment Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
            </div>
          </div>

          {/* Principal & Interest Breakdown (For accurate debt accounting) */}
          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1">
                Principal & Interest Breakdown
                <HelpCircle className="w-3 h-3 text-slate-500" />
              </span>
              <span className="text-[10px] text-slate-400">Auto-estimated</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Principal Reduction
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={principalPortion}
                  onChange={(e) => setPrincipalPortion(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Interest Accrued
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={interestPortion}
                  onChange={(e) => setInterestPortion(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(['Bank Transfer', 'Debit Card', 'Cash', 'Mobile Money', 'Auto-Debit'] as PaymentMethod[]).map(
                (m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-1.5 px-2 rounded-lg border text-center transition-colors truncate cursor-pointer ${
                      paymentMethod === m
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-semibold'
                        : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {m}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Auto-record as Expense checkbox */}
          {selectedLoan?.type === 'borrowed' && (
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 cursor-pointer">
              <input
                type="checkbox"
                checked={autoLogExpense}
                onChange={(e) => setAutoLogExpense(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-800"
              />
              <div className="text-xs">
                <span className="font-semibold text-emerald-300">
                  Sync to Budget Expenses
                </span>
                <p className="text-slate-400 mt-0.5">
                  Automatically logs a ${amount} expense under "Debt & Loans" so your monthly budget stays accurate.
                </p>
              </div>
            </label>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Payment Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Confirmation #98234, early repayment"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
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
              className="px-5 py-2 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
