import React from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  PieChart,
  Calendar,
  Volume2,
} from 'lucide-react';
import { Reminder } from '../types';
import { formatCurrency, triggerSystemNotification } from '../utils/calculations';

interface AndroidNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: Reminder[];
  currencySymbol: string;
  onCompleteReminder: (id: string) => void;
  onSnoozeReminder: (id: string) => void;
  onDismissReminder: (id: string) => void;
  onLogLoanPaymentFromReminder: (loanId: string) => void;
}

export const AndroidNotificationDrawer: React.FC<AndroidNotificationDrawerProps> = ({
  isOpen,
  onClose,
  reminders,
  currencySymbol,
  onCompleteReminder,
  onSnoozeReminder,
  onDismissReminder,
  onLogLoanPaymentFromReminder,
}) => {
  if (!isOpen) return null;

  const pending = reminders.filter((r) => r.status === 'pending');

  const handleTestSystemPush = async () => {
    await triggerSystemNotification(
      'Budget & Loan Tracker',
      'Automated reminders are active and watching your loan due dates and budget thresholds!'
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-start pt-3 sm:pt-6 p-3 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Android Notification Shade Header */}
        <div className="px-4 py-3 bg-slate-800/90 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                Android Notifications
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                  {pending.length} new
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Automated payment & budget alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="overflow-y-auto p-3 space-y-2.5 flex-1">
          {pending.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-200">All caught up!</p>
              <p className="text-xs text-slate-500">No pending reminders or loan alerts.</p>
            </div>
          ) : (
            pending.map((item) => {
              const isLoan = item.type === 'loan_payment';
              const isBudget = item.type === 'budget_warning';

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all ${
                    item.priority === 'high'
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : isLoan
                      ? 'bg-indigo-950/20 border-indigo-500/30'
                      : 'bg-slate-800/60 border-slate-700/60'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        item.priority === 'high'
                          ? 'bg-rose-500/20 text-rose-400'
                          : isLoan
                          ? 'bg-indigo-500/20 text-indigo-400'
                          : isBudget
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {isLoan ? (
                        <CreditCard className="w-3.5 h-3.5" />
                      ) : isBudget ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-semibold text-slate-100 truncate">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                          {item.dueDate}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                        {item.description}
                      </p>

                      {item.amount && (
                        <div className="mt-1 text-xs font-semibold text-emerald-400">
                          Amount: {formatCurrency(item.amount, currencySymbol)}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="mt-2.5 pt-2 border-t border-slate-700/40 flex flex-wrap items-center gap-1.5">
                        {isLoan && item.loanId && (
                          <button
                            onClick={() => {
                              onLogLoanPaymentFromReminder(item.loanId!);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <CreditCard className="w-3 h-3" />
                            Log Payment Now
                          </button>
                        )}
                        <button
                          onClick={() => onCompleteReminder(item.id)}
                          className="px-2 py-1 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-200 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Done
                        </button>
                        <button
                          onClick={() => onSnoozeReminder(item.id)}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Clock className="w-3 h-3 text-slate-400" />
                          Snooze
                        </button>
                        <button
                          onClick={() => onDismissReminder(item.id)}
                          className="px-2 py-1 rounded-lg text-slate-400 hover:text-slate-200 text-[11px] ml-auto transition-colors cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with browser system push trigger */}
        <div className="p-3 bg-slate-800/80 border-t border-slate-700/60 flex items-center justify-between gap-2 text-xs">
          <button
            onClick={handleTestSystemPush}
            className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition-colors py-1 px-2 rounded-lg bg-slate-700/50 hover:bg-slate-700"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Test Android System Push</span>
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
