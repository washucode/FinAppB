import React from 'react';
import {
  Wallet,
  Landmark,
  Receipt,
  BarChart3,
  Bell,
  Plus,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface IosBottomNavBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  pendingRemindersCount: number;
  onOpenQuickAdd: () => void;
}

export const IosBottomNavBar: React.FC<IosBottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  pendingRemindersCount,
  onOpenQuickAdd,
}) => {
  return (
    <div className="sticky bottom-0 left-0 right-0 z-40 bg-slate-950/85 backdrop-blur-2xl border-t border-slate-800/80 select-none">
      <div className="flex items-center justify-around px-2 pt-1.5 pb-1 max-w-lg mx-auto">
        {/* Tab 1: Budget */}
        <button
          onClick={() => onSelectTab('budget')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'budget' ? 'text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wallet className={`w-5 h-5 transition-transform ${activeTab === 'budget' ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Budget</span>
        </button>

        {/* Tab 2: Loans */}
        <button
          onClick={() => onSelectTab('loans')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'loans' ? 'text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Landmark className={`w-5 h-5 transition-transform ${activeTab === 'loans' ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Loans</span>
        </button>

        {/* Center iOS Action Button */}
        <button
          onClick={onOpenQuickAdd}
          className="flex flex-col items-center justify-center -mt-3.5 group cursor-pointer"
          title="Quick Action"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:scale-105 group-active:scale-95 transition-all">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[9px] text-slate-400 group-hover:text-slate-200 mt-0.5 font-medium">
            New
          </span>
        </button>

        {/* Tab 3: Expenses */}
        <button
          onClick={() => onSelectTab('expenses')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'expenses' ? 'text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Receipt className={`w-5 h-5 transition-transform ${activeTab === 'expenses' ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Expenses</span>
        </button>

        {/* Tab 4: Analytics */}
        <button
          onClick={() => onSelectTab('analytics')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'analytics' ? 'text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className={`w-5 h-5 transition-transform ${activeTab === 'analytics' ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Charts</span>
        </button>

        {/* Tab 5: Reminders */}
        <button
          onClick={() => onSelectTab('reminders')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative cursor-pointer ${
            activeTab === 'reminders' ? 'text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Bell className={`w-5 h-5 transition-transform ${activeTab === 'reminders' ? 'scale-110' : ''}`} />
            {pendingRemindersCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center shadow-xs">
                {pendingRemindersCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Alerts</span>
        </button>
      </div>

      {/* iOS Home Indicator Bar */}
      <div className="flex justify-center pb-1.5 pt-0.5">
        <div className="w-36 h-1 bg-slate-500/50 rounded-full" />
      </div>
    </div>
  );
};
