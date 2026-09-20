/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  AppSettings,
  Loan,
  LoanPayment,
  Expense,
  MonthlyBudget,
  Reminder,
  PaymentMethod,
  LoanCategoryItem,
} from './types';
import {
  loadSettings,
  saveSettings,
  loadLoans,
  saveLoans,
  loadLoanPayments,
  saveLoanPayments,
  loadBudgets,
  saveBudgets,
  loadExpenses,
  saveExpenses,
  loadReminders,
  saveReminders,
} from './utils/storage';
import {
  generateAutomatedReminders,
  triggerSystemNotification,
} from './utils/calculations';
import { CURRENT_MONTH_KEY, DEFAULT_LOAN_CATEGORIES } from './data/initialData';

// Components
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { IosStatusBar } from './components/IosStatusBar';
import { AndroidNotificationDrawer } from './components/AndroidNotificationDrawer';
import { BottomNavBar } from './components/BottomNavBar';
import { IosBottomNavBar } from './components/IosBottomNavBar';
import { BudgetView } from './components/budget/BudgetView';
import { LoansView } from './components/loans/LoansView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { RemindersView } from './components/reminders/RemindersView';

// Modals
import { QuickAddModal } from './components/common/QuickAddModal';
import { LogPaymentModal } from './components/modals/LogPaymentModal';
import { AddLoanModal } from './components/modals/AddLoanModal';
import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { LoanDetailModal } from './components/modals/LoanDetailModal';
import { AddReminderModal } from './components/modals/AddReminderModal';
import { SettingsModal } from './components/modals/SettingsModal';

export default function App() {
  // Application state loaded from local persistence
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [loans, setLoans] = useState<Loan[]>(loadLoans);
  const [loanPayments, setLoanPayments] = useState<LoanPayment[]>(loadLoanPayments);
  const [budgets, setBudgets] = useState<Record<string, MonthlyBudget>>(loadBudgets);
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses);
  const [reminders, setReminders] = useState<Reminder[]>(loadReminders);

  // Active view
  const [activeTab, setActiveTab] = useState<ActiveTab>('budget');

  // Modals visibility
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isLogPaymentOpen, setIsLogPaymentOpen] = useState(false);
  const [logPaymentLoanId, setLogPaymentLoanId] = useState<string | undefined>(undefined);
  const [isAddLoanOpen, setIsAddLoanOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [selectedDetailLoan, setSelectedDetailLoan] = useState<Loan | null>(null);

  // Current active budget
  const currentBudget =
    budgets[CURRENT_MONTH_KEY] ||
    Object.values(budgets)[0] || {
      monthKey: CURRENT_MONTH_KEY,
      totalIncome: 5200,
      savingsTarget: 900,
      categories: [],
    };

  // Run automated reminder generator when loans or expenses change
  useEffect(() => {
    const updated = generateAutomatedReminders(
      loans,
      currentBudget,
      expenses,
      reminders
    );
    if (updated.length !== reminders.length) {
      setReminders(updated);
      saveReminders(updated);
    }
  }, [loans, expenses]);

  // Sync settings helper
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Category addition helper
  const handleAddLoanCategory = (newCat: LoanCategoryItem) => {
    const existing = settings.customLoanCategories || DEFAULT_LOAN_CATEGORIES;
    const updated = [...existing, newCat];
    handleUpdateSettings({ ...settings, customLoanCategories: updated });
  };

  // Sync reload from backup
  const handleDataReload = () => {
    setSettings(loadSettings());
    setLoans(loadLoans());
    setLoanPayments(loadLoanPayments());
    setBudgets(loadBudgets());
    setExpenses(loadExpenses());
    setReminders(loadReminders());
  };

  // Payment logger handler
  const handleSavePayment = (paymentData: {
    loanId: string;
    amount: number;
    date: string;
    principalPortion: number;
    interestPortion: number;
    paymentMethod: PaymentMethod;
    notes: string;
    autoLogExpense: boolean;
  }) => {
    const targetLoan = loans.find((l) => l.id === paymentData.loanId);
    if (!targetLoan) return;

    // 1. Create payment record
    const newPayment: LoanPayment = {
      id: `lp-${Date.now()}`,
      loanId: targetLoan.id,
      loanTitle: targetLoan.title,
      amount: paymentData.amount,
      date: paymentData.date,
      principalPortion: paymentData.principalPortion,
      interestPortion: paymentData.interestPortion,
      paymentMethod: paymentData.paymentMethod,
      notes: paymentData.notes,
      autoLoggedAsExpense: paymentData.autoLogExpense,
      createdAt: new Date().toISOString(),
    };

    const nextPayments = [newPayment, ...loanPayments];
    setLoanPayments(nextPayments);
    saveLoanPayments(nextPayments);

    // 2. Update loan current balance and advance next due date
    const updatedBalance = Math.max(0, targetLoan.currentBalance - paymentData.amount);
    const isNowPaidOff = updatedBalance <= 0;

    // Advance next due date by 1 month
    const curDue = new Date(targetLoan.nextDueDate);
    curDue.setMonth(curDue.getMonth() + 1);
    const nextDueDateStr = curDue.toISOString().split('T')[0];

    const updatedLoans = loans.map((l) =>
      l.id === targetLoan.id
        ? {
            ...l,
            currentBalance: updatedBalance,
            status: isNowPaidOff ? ('paid_off' as const) : l.status,
            nextDueDate: nextDueDateStr,
          }
        : l
    );
    setLoans(updatedLoans);
    saveLoans(updatedLoans);

    // 3. If autoLogExpense is checked and it's a borrowed loan, create expense
    if (paymentData.autoLogExpense && targetLoan.type === 'borrowed') {
      const newExpense: Expense = {
        id: `exp-loan-${Date.now()}`,
        title: `${targetLoan.title} Repayment`,
        amount: paymentData.amount,
        category: 'Debt & Loans',
        date: paymentData.date,
        paymentMethod: paymentData.paymentMethod,
        notes: `Automated loan payment log. ${paymentData.notes}`,
        relatedLoanId: targetLoan.id,
        createdAt: new Date().toISOString(),
      };
      const nextExpenses = [newExpense, ...expenses];
      setExpenses(nextExpenses);
      saveExpenses(nextExpenses);
    }

    // 4. Mark any pending reminder for this loan as completed
    const updatedReminders = reminders.map((r) =>
      r.loanId === targetLoan.id && r.status === 'pending'
        ? { ...r, status: 'completed' as const }
        : r
    );
    setReminders(updatedReminders);
    saveReminders(updatedReminders);

    // Update selected detail loan if currently viewing it
    if (selectedDetailLoan && selectedDetailLoan.id === targetLoan.id) {
      setSelectedDetailLoan({
        ...selectedDetailLoan,
        currentBalance: updatedBalance,
        status: isNowPaidOff ? 'paid_off' : selectedDetailLoan.status,
        nextDueDate: nextDueDateStr,
      });
    }
  };

  // Add new loan handler
  const handleSaveLoan = (loanData: Omit<Loan, 'id' | 'createdAt'>) => {
    const newLoan: Loan = {
      ...loanData,
      id: `loan-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const nextLoans = [...loans, newLoan];
    setLoans(nextLoans);
    saveLoans(nextLoans);
  };

  // Add new expense handler
  const handleSaveExpense = (expData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const nextExpenses = [newExp, ...expenses];
    setExpenses(nextExpenses);
    saveExpenses(nextExpenses);
  };

  // Delete expense handler
  const handleDeleteExpense = (id: string) => {
    const nextExpenses = expenses.filter((e) => e.id !== id);
    setExpenses(nextExpenses);
    saveExpenses(nextExpenses);
  };

  // Update budget handler
  const handleUpdateBudget = (newBudget: MonthlyBudget) => {
    const nextBudgets = { ...budgets, [newBudget.monthKey]: newBudget };
    setBudgets(nextBudgets);
    saveBudgets(nextBudgets);
  };

  // Add custom reminder handler
  const handleSaveReminder = (remData: Omit<Reminder, 'id' | 'createdAt'>) => {
    const newRem: Reminder = {
      ...remData,
      id: `rem-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const nextReminders = [newRem, ...reminders];
    setReminders(nextReminders);
    saveReminders(nextReminders);
  };

  // Reminder actions
  const handleCompleteReminder = (id: string) => {
    const nextReminders = reminders.map((r) =>
      r.id === id ? { ...r, status: 'completed' as const } : r
    );
    setReminders(nextReminders);
    saveReminders(nextReminders);
  };

  const handleSnoozeReminder = (id: string) => {
    const nextReminders = reminders.map((r) => {
      if (r.id === id) {
        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 1);
        return {
          ...r,
          status: 'snoozed' as const,
          snoozedUntil: nextDay.toISOString().split('T')[0],
        };
      }
      return r;
    });
    setReminders(nextReminders);
    saveReminders(nextReminders);
  };

  const handleDeleteReminder = (id: string) => {
    const nextReminders = reminders.filter((r) => r.id !== id);
    setReminders(nextReminders);
    saveReminders(nextReminders);
  };

  const handleOpenLogPaymentForLoan = (loanId?: string) => {
    setLogPaymentLoanId(loanId);
    setIsLogPaymentOpen(true);
  };

  // Count active pending reminders for status badge
  const pendingRemindersCount = reminders.filter((r) => r.status === 'pending').length;

  const isIos = settings.osMode === 'ios';
  const isAndroid = settings.osMode === 'android';
  const isDesktop = settings.osMode === 'desktop';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start antialiased font-sans">
      {/* Container: If iOS or Android mobile mode is enabled, render styled device chassis */}
      <div
        className={`w-full transition-all duration-300 ${
          !isDesktop
            ? isIos
              ? 'max-w-[430px] my-0 sm:my-6 rounded-none sm:rounded-[54px] border-0 sm:border-[10px] sm:border-slate-800 shadow-2xl overflow-hidden bg-slate-950 relative flex flex-col min-h-screen sm:min-h-[860px]'
              : 'max-w-[430px] my-0 sm:my-6 rounded-none sm:rounded-[44px] border-0 sm:border-[8px] sm:border-slate-800 shadow-2xl overflow-hidden bg-slate-950 relative flex flex-col min-h-screen sm:min-h-[860px]'
            : 'max-w-5xl px-4 sm:px-8 py-4 min-h-screen flex flex-col'
        }`}
      >
        {/* Android Punch Hole Camera Notch (Shown in Android phone frame mode) */}
        {isAndroid && (
          <div className="hidden sm:flex justify-center pt-2 pb-0.5 bg-slate-900 select-none">
            <div className="w-4 h-4 rounded-full bg-black border-2 border-slate-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            </div>
          </div>
        )}

        {/* Top Status Bar: iOS or Android */}
        {isIos ? (
          <IosStatusBar
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            pendingRemindersCount={pendingRemindersCount}
            onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        ) : (
          <AndroidStatusBar
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            pendingRemindersCount={pendingRemindersCount}
            onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* Main Content View with smooth scroll */}
        <main className="flex-1 p-3.5 sm:p-5 overflow-y-auto max-h-[calc(100vh-120px)] sm:max-h-[740px]">
          {activeTab === 'budget' && (
            <BudgetView
              budget={currentBudget}
              expenses={expenses}
              loans={loans}
              currencySymbol={settings.currencySymbol}
              onUpdateBudget={handleUpdateBudget}
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
              onOpenLogPayment={() => handleOpenLogPaymentForLoan()}
            />
          )}

          {activeTab === 'loans' && (
            <LoansView
              loans={loans}
              payments={loanPayments}
              currencySymbol={settings.currencySymbol}
              onOpenAddLoan={() => setIsAddLoanOpen(true)}
              onOpenLogPayment={handleOpenLogPaymentForLoan}
              onSelectLoan={(loan) => setSelectedDetailLoan(loan)}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              currencySymbol={settings.currencySymbol}
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              budget={currentBudget}
              budgets={budgets}
              expenses={expenses}
              loans={loans}
              payments={loanPayments}
              currencySymbol={settings.currencySymbol}
            />
          )}

          {activeTab === 'reminders' && (
            <RemindersView
              reminders={reminders}
              currencySymbol={settings.currencySymbol}
              onOpenAddReminder={() => setIsAddReminderOpen(true)}
              onCompleteReminder={handleCompleteReminder}
              onSnoozeReminder={handleSnoozeReminder}
              onDeleteReminder={handleDeleteReminder}
              onLogLoanPayment={handleOpenLogPaymentForLoan}
            />
          )}
        </main>

        {/* Bottom Navigation Bar: Cupertino for iOS, Material 3 for Android/Desktop */}
        {isIos ? (
          <IosBottomNavBar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            pendingRemindersCount={pendingRemindersCount}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          />
        ) : (
          <BottomNavBar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            pendingRemindersCount={pendingRemindersCount}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          />
        )}

        {/* Android Gesture Bar at bottom (Shown in Android frame mode) */}
        {isAndroid && (
          <div className="hidden sm:flex justify-center pb-1.5 pt-0.5 bg-slate-900 select-none">
            <div className="w-28 h-1 bg-slate-600 rounded-full" />
          </div>
        )}
      </div>

      {/* Speed Dial / Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSelectAction={(action) => {
          if (action === 'payment') setIsLogPaymentOpen(true);
          if (action === 'expense') setIsAddExpenseOpen(true);
          if (action === 'loan') setIsAddLoanOpen(true);
          if (action === 'reminder') setIsAddReminderOpen(true);
        }}
      />

      {/* Log Payment Modal */}
      <LogPaymentModal
        isOpen={isLogPaymentOpen}
        onClose={() => {
          setIsLogPaymentOpen(false);
          setLogPaymentLoanId(undefined);
        }}
        loans={loans}
        initialLoanId={logPaymentLoanId}
        currencySymbol={settings.currencySymbol}
        onSavePayment={handleSavePayment}
      />

      {/* Add Loan Modal with Emoji Categories */}
      <AddLoanModal
        isOpen={isAddLoanOpen}
        onClose={() => setIsAddLoanOpen(false)}
        currencySymbol={settings.currencySymbol}
        categories={settings.customLoanCategories || DEFAULT_LOAN_CATEGORIES}
        onAddCategory={handleAddLoanCategory}
        onSaveLoan={handleSaveLoan}
      />

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        currencySymbol={settings.currencySymbol}
        onSaveExpense={handleSaveExpense}
      />

      {/* Loan Detail Modal */}
      <LoanDetailModal
        isOpen={!!selectedDetailLoan}
        onClose={() => setSelectedDetailLoan(null)}
        loan={selectedDetailLoan}
        payments={loanPayments}
        currencySymbol={settings.currencySymbol}
        onOpenLogPayment={handleOpenLogPaymentForLoan}
      />

      {/* Add Reminder Modal */}
      <AddReminderModal
        isOpen={isAddReminderOpen}
        onClose={() => setIsAddReminderOpen(false)}
        currencySymbol={settings.currencySymbol}
        onSaveReminder={handleSaveReminder}
      />

      {/* Notification Shade / Drawer */}
      <AndroidNotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        reminders={reminders}
        currencySymbol={settings.currencySymbol}
        onCompleteReminder={handleCompleteReminder}
        onSnoozeReminder={handleSnoozeReminder}
        onDismissReminder={handleDeleteReminder}
        onLogLoanPaymentFromReminder={handleOpenLogPaymentForLoan}
      />

      {/* Settings & Backup Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onDataReload={handleDataReload}
      />
    </div>
  );
}
