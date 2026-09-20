import {
  Loan,
  LoanPayment,
  Expense,
  MonthlyBudget,
  Reminder,
  ExpenseCategory,
} from '../types';

export function formatCurrency(amount: number, symbol: string = '$'): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return isNegative ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

export function formatCompactCurrency(amount: number, symbol: string = '$'): string {
  if (Math.abs(amount) >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}k`;
  }
  return `${symbol}${amount.toFixed(0)}`;
}

export function getDaysDifference(targetDateStr: string, fromDateStr?: string): number {
  const from = fromDateStr ? new Date(fromDateStr) : new Date();
  const to = new Date(targetDateStr);
  // Reset hours to compare purely dates
  from.setHours(0, 0, 0, 0);
  to.setHours(0, 0, 0, 0);
  const diffTime = to.getTime() - from.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function getDueStatus(targetDateStr: string): {
  label: string;
  isOverdue: boolean;
  isDueToday: boolean;
  isDueSoon: boolean;
  daysDiff: number;
  colorClass: string;
} {
  const days = getDaysDifference(targetDateStr);
  if (days < 0) {
    return {
      label: `${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''} overdue`,
      isOverdue: true,
      isDueToday: false,
      isDueSoon: false,
      daysDiff: days,
      colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    };
  }
  if (days === 0) {
    return {
      label: 'Due today',
      isOverdue: false,
      isDueToday: true,
      isDueSoon: true,
      daysDiff: days,
      colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    };
  }
  if (days <= 3) {
    return {
      label: `Due in ${days} day${days > 1 ? 's' : ''}`,
      isOverdue: false,
      isDueToday: false,
      isDueSoon: true,
      daysDiff: days,
      colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    };
  }
  if (days <= 7) {
    return {
      label: `Due in ${days} days`,
      isOverdue: false,
      isDueToday: false,
      isDueSoon: true,
      daysDiff: days,
      colorClass: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    };
  }
  return {
    label: `Due in ${days} days`,
    isOverdue: false,
    isDueToday: false,
    isDueSoon: false,
    daysDiff: days,
    colorClass: 'text-slate-400 bg-slate-800/60 border-slate-700/50',
  };
}

export interface AmortizationEstimate {
  monthsRemaining: number;
  estimatedPayoffDate: string;
  estimatedTotalInterest: number;
  monthlyInterest: number;
}

export function calculateLoanPayoff(loan: Loan): AmortizationEstimate {
  const balance = loan.currentBalance;
  const payment = loan.monthlyPayment;
  const apr = loan.interestRate / 100;
  const monthlyRate = apr / 12;

  if (balance <= 0) {
    return {
      monthsRemaining: 0,
      estimatedPayoffDate: 'Paid Off',
      estimatedTotalInterest: 0,
      monthlyInterest: 0,
    };
  }

  const monthlyInterest = balance * monthlyRate;

  // If payment is less than monthly interest, balance will grow or never pay off
  if (payment <= monthlyInterest && apr > 0) {
    return {
      monthsRemaining: 999,
      estimatedPayoffDate: 'Indefinite (Payment ≤ Interest)',
      estimatedTotalInterest: 0,
      monthlyInterest,
    };
  }

  // Exact formula: n = -ln(1 - (balance * r / P)) / ln(1 + r)
  let months: number;
  if (monthlyRate === 0) {
    months = Math.ceil(balance / payment);
  } else {
    const numerator = -Math.log(1 - (balance * monthlyRate) / payment);
    const denominator = Math.log(1 + monthlyRate);
    months = Math.ceil(numerator / denominator);
  }

  if (isNaN(months) || months < 0) {
    months = Math.ceil(balance / (payment || 1));
  }

  // Calculate estimated total interest over remaining period
  let tempBal = balance;
  let totalInterest = 0;
  for (let i = 0; i < Math.min(months, 360); i++) {
    const intForMonth = tempBal * monthlyRate;
    totalInterest += intForMonth;
    const principalForMonth = payment - intForMonth;
    tempBal = Math.max(0, tempBal - principalForMonth);
    if (tempBal <= 0) break;
  }

  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + months);
  const payoffDate = targetDate.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  return {
    monthsRemaining: months,
    estimatedPayoffDate: payoffDate,
    estimatedTotalInterest: totalInterest,
    monthlyInterest,
  };
}

export interface BudgetSummary {
  totalIncome: number;
  totalAllocated: number;
  totalSpent: number;
  remainingBudget: number;
  savingsTarget: number;
  netSavings: number;
  spendPercentage: number;
  categorySpending: Record<
    ExpenseCategory,
    {
      allocated: number;
      spent: number;
      remaining: number;
      percent: number;
      color: string;
    }
  >;
}

export function computeBudgetSummary(
  budget: MonthlyBudget,
  expenses: Expense[]
): BudgetSummary {
  const monthKey = budget.monthKey;
  // Filter expenses matching current month
  const monthExpenses = expenses.filter((e) => e.date.startsWith(monthKey));
  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const totalAllocated = budget.categories.reduce(
    (sum, c) => sum + c.allocatedAmount,
    0
  );

  const categorySpending: BudgetSummary['categorySpending'] = {} as any;

  budget.categories.forEach((cat) => {
    const spentInCat = monthExpenses
      .filter((e) => e.category === cat.category)
      .reduce((sum, e) => sum + e.amount, 0);

    const remaining = cat.allocatedAmount - spentInCat;
    const percent =
      cat.allocatedAmount > 0
        ? Math.round((spentInCat / cat.allocatedAmount) * 100)
        : 0;

    categorySpending[cat.category] = {
      allocated: cat.allocatedAmount,
      spent: spentInCat,
      remaining,
      percent,
      color: cat.color,
    };
  });

  const remainingBudget = totalAllocated - totalSpent;
  const spendPercentage =
    totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
  const netSavings = budget.totalIncome - totalSpent;

  return {
    totalIncome: budget.totalIncome,
    totalAllocated,
    totalSpent,
    remainingBudget,
    savingsTarget: budget.savingsTarget,
    netSavings,
    spendPercentage,
    categorySpending,
  };
}

export interface CashFlowMonthData {
  month: string;
  monthLabel: string;
  income: number;
  expenses: number;
  loanPayments: number;
  netSavings: number;
}

export function generateCashFlowHistory(
  budgets: Record<string, MonthlyBudget>,
  expenses: Expense[],
  loanPayments: LoanPayment[]
): CashFlowMonthData[] {
  // Generate past 6 months up to current
  const result: CashFlowMonthData[] = [];
  const currentDate = new Date('2026-09-20');

  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const key = `${yyyy}-${mm}`;
    const monthLabel = d.toLocaleDateString('en-US', { month: 'short' });

    const budget = budgets[key] || {
      totalIncome: 5000,
    };

    const monthExp = expenses
      .filter((e) => e.date.startsWith(key))
      .reduce((sum, e) => sum + e.amount, 0);

    const monthLp = loanPayments
      .filter((p) => p.date.startsWith(key))
      .reduce((sum, p) => sum + p.amount, 0);

    // If no records in historical months, supply realistic baseline for visual demonstration
    let income = budget.totalIncome || 5200;
    let expTotal = monthExp;
    let lpTotal = monthLp;

    if (expTotal === 0 && i > 0) {
      // Realistic previous months
      expTotal = Math.round(3100 + Math.sin(i) * 350);
      lpTotal = 695;
    }

    result.push({
      month: key,
      monthLabel,
      income,
      expenses: expTotal,
      loanPayments: lpTotal,
      netSavings: income - expTotal,
    });
  }

  return result;
}

export function generateAutomatedReminders(
  loans: Loan[],
  budget: MonthlyBudget,
  expenses: Expense[],
  existingReminders: Reminder[]
): Reminder[] {
  const newReminders: Reminder[] = [...existingReminders];
  const today = '2026-09-20';

  // 1. Scan loans for upcoming due dates
  loans.forEach((loan) => {
    if (loan.status !== 'active' || loan.currentBalance <= 0) return;

    const daysUntilDue = getDaysDifference(loan.nextDueDate, today);
    const reminderId = `auto-loan-${loan.id}-${loan.nextDueDate}`;

    // If due within 7 days or overdue, and not already present
    const exists = newReminders.some(
      (r) => r.id === reminderId || (r.loanId === loan.id && r.dueDate === loan.nextDueDate)
    );

    if (!exists && daysUntilDue <= 7) {
      const isOverdue = daysUntilDue < 0;
      const isBorrowed = loan.type === 'borrowed';
      const actionText = isBorrowed ? 'Payment Due' : 'Collection Due';

      newReminders.push({
        id: reminderId,
        title: `${loan.title}: ${actionText} ($${loan.monthlyPayment})`,
        description: isOverdue
          ? `${loan.title} was due on ${loan.nextDueDate}. Current balance: $${loan.currentBalance.toLocaleString()}.`
          : `Scheduled monthly ${isBorrowed ? 'payment to' : 'collection from'} ${loan.counterparty} due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}.`,
        dueDate: loan.nextDueDate,
        type: 'loan_payment',
        priority: isOverdue || daysUntilDue <= 2 ? 'high' : 'medium',
        status: 'pending',
        amount: loan.monthlyPayment,
        loanId: loan.id,
        category: 'Debt & Loans',
        createdAt: new Date().toISOString(),
      });
    }
  });

  // 2. Scan budget categories for warning thresholds (> 80%)
  const monthExpenses = expenses.filter((e) => e.date.startsWith(budget.monthKey));
  budget.categories.forEach((cat) => {
    const spent = monthExpenses
      .filter((e) => e.category === cat.category)
      .reduce((sum, e) => sum + e.amount, 0);

    const percent = cat.allocatedAmount > 0 ? (spent / cat.allocatedAmount) * 100 : 0;
    const reminderId = `auto-budget-${budget.monthKey}-${cat.category}`;

    if (percent >= 80) {
      const exists = newReminders.some((r) => r.id === reminderId);
      if (!exists) {
        newReminders.push({
          id: reminderId,
          title: `${cat.category} Budget Alert (${Math.round(percent)}% Used)`,
          description: `You have spent $${spent.toFixed(2)} out of $${cat.allocatedAmount} allocated for ${cat.category}.`,
          dueDate: today,
          type: 'budget_warning',
          priority: percent >= 100 ? 'high' : 'medium',
          status: 'pending',
          category: cat.category,
          createdAt: new Date().toISOString(),
        });
      }
    }
  });

  return newReminders;
}

export async function triggerSystemNotification(title: string, body: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
      });
      return true;
    } catch (e) {
      console.warn('System notification failed', e);
      return false;
    }
  } else if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
        return true;
      }
    } catch (e) {
      console.warn('Notification permission error', e);
    }
  }
  return false;
}

export interface LoanOverview {
  totalBorrowedPrincipal: number;
  totalBorrowedBalance: number;
  totalLentPrincipal: number;
  totalLentBalance: number;
  monthlyCommitment: number;
}

export function computeLoanOverview(loans: Loan[]): LoanOverview {
  const borrowedLoans = loans.filter((l) => l.type === 'borrowed' && l.status === 'active');
  const lentLoans = loans.filter((l) => l.type === 'lent' && l.status === 'active');

  const totalBorrowedPrincipal = loans
    .filter((l) => l.type === 'borrowed')
    .reduce((acc, l) => acc + l.principalAmount, 0);
  const totalBorrowedBalance = borrowedLoans.reduce((acc, l) => acc + l.currentBalance, 0);

  const totalLentPrincipal = loans
    .filter((l) => l.type === 'lent')
    .reduce((acc, l) => acc + l.principalAmount, 0);
  const totalLentBalance = lentLoans.reduce((acc, l) => acc + l.currentBalance, 0);

  const monthlyCommitment = borrowedLoans.reduce((acc, l) => acc + l.monthlyPayment, 0);

  return {
    totalBorrowedPrincipal,
    totalBorrowedBalance,
    totalLentPrincipal,
    totalLentBalance,
    monthlyCommitment,
  };
}

