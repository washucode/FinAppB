import React from 'react';
import {
  PieChart,
  Landmark,
  Receipt,
  BarChart3,
  Bell,
  Plus,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  pendingRemindersCount: number;
  onOpenQuickAdd: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  pendingRemindersCount,
  onOpenQuickAdd,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'budget', label: 'Budget', icon: PieChart },
    { id: 'loans', label: 'Loans', icon: Landmark },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reminders', label: 'Reminders', icon: Bell },
  ];

  return (
    <div className="relative z-20">
      {/* Floating Action Button (FAB) centered above navigation or positioned gracefully */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 pointer-events-auto">
        <button
          onClick={onOpenQuickAdd}
          className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-slate-900"
          title="Quick Add Expense or Loan Payment"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Material You Bottom Navigation Bar */}
      <nav className="bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-2 flex items-center justify-around select-none">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          // Leave gap in center for the FAB
          const isCenterAdjacent = index === 2;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Material You Active Pill Indicator */}
              <div
                className={`relative px-3 py-1 rounded-full flex items-center justify-center transition-all ${
                  isActive ? 'bg-emerald-500/15' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.7]'}`} />
                {item.id === 'reminders' && pendingRemindersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-slate-950 rounded-full text-[10px] font-bold flex items-center justify-center">
                    {pendingRemindersCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] tracking-tight mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
