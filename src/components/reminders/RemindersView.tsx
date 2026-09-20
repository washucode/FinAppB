import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Clock,
  AlertTriangle,
  CreditCard,
  CheckCircle2,
  Volume2,
  Calendar,
  AlertCircle,
  Repeat,
  Trash2,
} from 'lucide-react';
import { Reminder, ReminderType } from '../../types';
import {
  formatCurrency,
  triggerSystemNotification,
  getDueStatus,
} from '../../utils/calculations';

interface RemindersViewProps {
  reminders: Reminder[];
  currencySymbol: string;
  onOpenAddReminder: () => void;
  onCompleteReminder: (id: string) => void;
  onSnoozeReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onLogLoanPayment: (loanId: string) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  currencySymbol,
  onOpenAddReminder,
  onCompleteReminder,
  onSnoozeReminder,
  onDeleteReminder,
  onLogLoanPayment,
}) => {
  const [filter, setFilter] = useState<'all' | 'loan_payment' | 'budget_warning' | 'completed'>('all');

  const filtered = reminders.filter((r) => {
    if (filter === 'all') return r.status !== 'completed';
    if (filter === 'completed') return r.status === 'completed';
    return r.type === filter && r.status !== 'completed';
  });

  const pendingCount = reminders.filter((r) => r.status === 'pending').length;

  const handleTestSystemPush = async () => {
    await triggerSystemNotification(
      'Automated Loan & Budget Reminder',
      'Automated check: 1 loan installment due soon, and 1 budget category reached 80% limit.'
    );
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Automated Alerts
              </span>
              <h2 className="text-base font-bold text-slate-100">Payment & Bill Reminders</h2>
            </div>
          </div>
          <button
            onClick={onOpenAddReminder}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Schedule
          </button>
        </div>

        {/* System Push Prompt Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100">Android System Notifications</h4>
              <p className="text-[11px] text-slate-400">Receive alerts even when browser is in background</p>
            </div>
          </div>
          <button
            onClick={handleTestSystemPush}
            className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors"
          >
            Enable & Test
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex rounded-2xl bg-slate-900 p-1 border border-slate-800 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 rounded-xl font-medium transition-all text-center cursor-pointer ${
            filter === 'all'
              ? 'bg-slate-800 text-purple-300 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Active ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('loan_payment')}
          className={`flex-1 py-1.5 rounded-xl font-medium transition-all text-center cursor-pointer ${
            filter === 'loan_payment'
              ? 'bg-slate-800 text-indigo-300 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Loans
        </button>
        <button
          onClick={() => setFilter('budget_warning')}
          className={`flex-1 py-1.5 rounded-xl font-medium transition-all text-center cursor-pointer ${
            filter === 'budget_warning'
              ? 'bg-slate-800 text-amber-300 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Budget Alerts
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 py-1.5 rounded-xl font-medium transition-all text-center cursor-pointer ${
            filter === 'completed'
              ? 'bg-slate-800 text-slate-300 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Done ({reminders.filter((r) => r.status === 'completed').length})
        </button>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
            <Bell className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-300">No reminders in this list</p>
            <p className="text-xs text-slate-500 mt-0.5">Automated reminders trigger as loan due dates approach</p>
          </div>
        ) : (
          filtered.map((item) => {
            const isLoan = item.type === 'loan_payment';
            const isBudget = item.type === 'budget_warning';
            const isCompleted = item.status === 'completed';
            const dueStatus = getDueStatus(item.dueDate);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  isCompleted
                    ? 'bg-slate-900/50 border-slate-800 opacity-60'
                    : item.priority === 'high'
                    ? 'bg-slate-900 border-rose-500/30'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isCompleted
                        ? 'bg-slate-800 text-slate-500'
                        : item.priority === 'high'
                        ? 'bg-rose-500/20 text-rose-400'
                        : isLoan
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : isBudget
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isLoan ? (
                      <CreditCard className="w-4 h-4" />
                    ) : isBudget ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            item.priority === 'high'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.priority} Priority
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {item.type.replace('_', ' ')}
                        </span>
                      </div>

                      {!isCompleted && (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${dueStatus.colorClass}`}>
                          {dueStatus.label}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xs font-bold text-slate-100 mt-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>

                    {item.amount && (
                      <div className="mt-1 text-xs font-bold text-emerald-400 font-mono">
                        Payment Amount: {formatCurrency(item.amount, currencySymbol)}
                      </div>
                    )}

                    {/* Actions */}
                    {!isCompleted && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-wrap items-center gap-1.5">
                        {isLoan && item.loanId && (
                          <button
                            onClick={() => onLogLoanPayment(item.loanId!)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Log Payment Now
                          </button>
                        )}
                        <button
                          onClick={() => onCompleteReminder(item.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Done
                        </button>
                        <button
                          onClick={() => onSnoozeReminder(item.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Snooze 1 Day
                        </button>
                        <button
                          onClick={() => onDeleteReminder(item.id)}
                          className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors ml-auto cursor-pointer"
                          title="Delete reminder"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
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
