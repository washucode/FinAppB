import React from 'react';
import {
  X,
  CreditCard,
  Receipt,
  Landmark,
  Bell,
  Sparkles,
} from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: 'payment' | 'expense' | 'loan' | 'reminder') => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      id: 'expense' as const,
      label: 'Log Expense',
      description: 'Record everyday spending against your monthly budget',
      icon: Receipt,
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      id: 'payment' as const,
      label: 'Log Loan Payment',
      description: 'Record an installment & reduce your loan balance',
      icon: CreditCard,
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'loan' as const,
      label: 'Add New Loan',
      description: 'Track a new borrowed debt or money lent to someone',
      icon: Landmark,
      color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    },
    {
      id: 'reminder' as const,
      label: 'Schedule Reminder',
      description: 'Set custom alerts for bills, repayments or milestones',
      icon: Bell,
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
        {/* Handle / Header */}
        <div className="pt-3 pb-2 px-4 flex items-center justify-between border-b border-slate-800">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Quick Actions
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 space-y-2">
          {actions.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectAction(item.id);
                  onClose();
                }}
                className="w-full p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center gap-3 transition-all text-left cursor-pointer group hover:border-slate-600"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${item.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                    {item.label}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5 truncate">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
