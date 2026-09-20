import React from 'react';
import {
  Wallet,
  TrendingUp,
  Landmark,
  Receipt,
  BarChart3,
  Bell,
  Settings,
  Plus,
  ArrowUpRight,
  Smartphone,
  Laptop,
  CheckCircle2,
} from 'lucide-react';
import { ActiveTab, AppSettings } from '../../types';

interface WebHeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  pendingRemindersCount: number;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenLogPayment: () => void;
  onOpenAddExpense: () => void;
  onOpenAddLoan: () => void;
  onOpenAddReminder: () => void;
}

export const WebHeader: React.FC<WebHeaderProps> = ({
  activeTab,
  onSelectTab,
  pendingRemindersCount,
  settings,
  onUpdateSettings,
  onOpenNotifications,
  onOpenSettings,
  onOpenLogPayment,
  onOpenAddExpense,
  onOpenAddLoan,
  onOpenAddReminder,
}) => {
  const navItems: { tab: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { tab: 'budget', label: 'Budget & Overview', icon: <Wallet className="w-4 h-4" /> },
    { tab: 'loans', label: 'Loans & Debts', icon: <Landmark className="w-4 h-4" /> },
    { tab: 'expenses', label: 'Expenses', icon: <Receipt className="w-4 h-4" /> },
    { tab: 'analytics', label: 'Analytics & Charts', icon: <BarChart3 className="w-4 h-4" /> },
    {
      tab: 'reminders',
      label: 'Reminders',
      icon: <Bell className="w-4 h-4" />,
      badge: pendingRemindersCount > 0 ? pendingRemindersCount : undefined,
    },
  ];

  return (
    <header className="w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar row */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand / Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-100 tracking-tight">
                  Budget & Loan Tracker
                </h1>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Web Edition
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Personal Finance, Loan Repayments & Reminders
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-2xl border border-slate-800">
            {navItems.map((item) => {
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  type="button"
                  onClick={() => onSelectTab(item.tab)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 font-bold shadow-xs border border-slate-700/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5">
            {/* View/Platform Switcher */}
            <div className="hidden lg:flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({ ...settings, osMode: 'web', androidFrameView: false })
                }
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer font-medium ${
                  settings.osMode === 'web' || settings.osMode === 'desktop'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Full-screen Web View"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Web</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({ ...settings, osMode: 'ios', androidFrameView: true })
                }
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer font-medium ${
                  settings.osMode === 'ios'
                    ? 'bg-slate-800 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Preview in iPhone Frame"
              >
                <span>🍏</span>
                <span>iPhone</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({ ...settings, osMode: 'android', androidFrameView: true })
                }
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer font-medium ${
                  settings.osMode === 'android'
                    ? 'bg-slate-800 text-emerald-400 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Preview in Android Frame"
              >
                <span>🤖</span>
                <span>Android</span>
              </button>
            </div>

            {/* Quick Action: Log Payment */}
            <button
              type="button"
              onClick={onOpenLogPayment}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/30 cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Log Repayment</span>
            </button>

            {/* Quick Action: Add Expense */}
            <button
              type="button"
              onClick={onOpenAddExpense}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Expense</span>
            </button>

            {/* Quick Action: Add Loan */}
            <button
              type="button"
              onClick={onOpenAddLoan}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Loan</span>
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700/60"
              title="System Alerts & Notifications"
            >
              <Bell className="w-4 h-4" />
              {pendingRemindersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {pendingRemindersCount}
                </span>
              )}
            </button>

            {/* Settings */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700/60"
              title="Settings, Currency & Backup"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile secondary tab row if on a smaller web browser screen */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-800/80 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => onSelectTab(item.tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
