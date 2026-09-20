export type LoanType = 'borrowed' | 'lent';
export type LoanStatus = 'active' | 'paid_off' | 'defaulted';

export interface LoanCategoryItem {
  id: string;
  name: string;
  emoji: string;
}

export interface Loan {
  id: string;
  title: string;
  type: LoanType;
  counterparty: string; // e.g. "Chase Bank", "Alice"
  category: string;
  categoryEmoji: string;
  principalAmount: number;
  currentBalance: number;
  interestRate: number; // annual percentage e.g. 5.5
  monthlyPayment: number;
  dueDateDay: number; // day of month 1-31
  nextDueDate: string; // YYYY-MM-DD
  startDate: string; // YYYY-MM-DD
  termMonths: number;
  status: LoanStatus;
  notes?: string;
  createdAt: string;
}

export type PaymentMethod = 'Bank Transfer' | 'Debit Card' | 'Cash' | 'Mobile Money' | 'Auto-Debit' | 'Check';

export interface LoanPayment {
  id: string;
  loanId: string;
  loanTitle: string;
  amount: number;
  date: string; // YYYY-MM-DD
  principalPortion?: number;
  interestPortion?: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  autoLoggedAsExpense?: boolean;
  expenseId?: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'Housing'
  | 'Food & Dining'
  | 'Transportation'
  | 'Utilities'
  | 'Entertainment'
  | 'Healthcare'
  | 'Debt & Loans'
  | 'Shopping'
  | 'Savings'
  | 'Education'
  | 'Miscellaneous';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  isRecurring?: boolean;
  relatedLoanId?: string;
  createdAt: string;
}

export interface BudgetCategory {
  id: string;
  category: ExpenseCategory;
  allocatedAmount: number;
  color: string;
}

export interface MonthlyBudget {
  monthKey: string; // 'YYYY-MM'
  totalIncome: number;
  categories: BudgetCategory[];
  savingsTarget: number;
  notes?: string;
}

export type ReminderType = 'loan_payment' | 'budget_warning' | 'recurring_bill' | 'custom';
export type ReminderPriority = 'high' | 'medium' | 'low';

export interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  type: ReminderType;
  priority: ReminderPriority;
  status: 'pending' | 'completed' | 'snoozed';
  amount?: number;
  loanId?: string;
  category?: ExpenseCategory;
  createdAt: string;
  snoozedUntil?: string;
}

export type ActiveTab = 'budget' | 'loans' | 'expenses' | 'analytics' | 'reminders';

export interface AppSettings {
  currencySymbol: string;
  currencyCode: string;
  androidFrameView: boolean;
  osMode: 'web' | 'ios' | 'android' | 'desktop';
  notificationsEnabled: boolean;
  darkTheme: boolean;
  soundEnabled: boolean;
  customLoanCategories?: LoanCategoryItem[];
}
