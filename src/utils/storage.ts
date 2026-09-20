import {
  Loan,
  LoanPayment,
  Expense,
  MonthlyBudget,
  Reminder,
  AppSettings,
} from '../types';
import {
  DEFAULT_SETTINGS,
  INITIAL_LOANS,
  INITIAL_LOAN_PAYMENTS,
  INITIAL_BUDGET,
  INITIAL_EXPENSES,
  INITIAL_REMINDERS,
} from '../data/initialData';

const STORAGE_KEYS = {
  SETTINGS: 'budget_loan_settings_v1',
  LOANS: 'budget_loan_loans_v1',
  PAYMENTS: 'budget_loan_payments_v1',
  BUDGETS: 'budget_loan_budgets_v1',
  EXPENSES: 'budget_loan_expenses_v1',
  REMINDERS: 'budget_loan_reminders_v1',
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed loading settings', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed saving settings', e);
  }
}

export function loadLoans(): Loan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOANS);
    if (!raw) {
      saveLoans(INITIAL_LOANS);
      return INITIAL_LOANS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed loading loans', e);
    return INITIAL_LOANS;
  }
}

export function saveLoans(loans: Loan[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  } catch (e) {
    console.error('Failed saving loans', e);
  }
}

export function loadLoanPayments(): LoanPayment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (!raw) {
      saveLoanPayments(INITIAL_LOAN_PAYMENTS);
      return INITIAL_LOAN_PAYMENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed loading loan payments', e);
    return INITIAL_LOAN_PAYMENTS;
  }
}

export function saveLoanPayments(payments: LoanPayment[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  } catch (e) {
    console.error('Failed saving loan payments', e);
  }
}

export function loadBudgets(): Record<string, MonthlyBudget> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (!raw) {
      const initial: Record<string, MonthlyBudget> = {
        [INITIAL_BUDGET.monthKey]: INITIAL_BUDGET,
      };
      saveBudgets(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed loading budgets', e);
    return { [INITIAL_BUDGET.monthKey]: INITIAL_BUDGET };
  }
}

export function saveBudgets(budgets: Record<string, MonthlyBudget>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  } catch (e) {
    console.error('Failed saving budgets', e);
  }
}

export function loadExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!raw) {
      saveExpenses(INITIAL_EXPENSES);
      return INITIAL_EXPENSES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed loading expenses', e);
    return INITIAL_EXPENSES;
  }
}

export function saveExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Failed saving expenses', e);
  }
}

export function loadReminders(): Reminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (!raw) {
      saveReminders(INITIAL_REMINDERS);
      return INITIAL_REMINDERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed loading reminders', e);
    return INITIAL_REMINDERS;
  }
}

export function saveReminders(reminders: Reminder[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  } catch (e) {
    console.error('Failed saving reminders', e);
  }
}

export function exportAllData(): string {
  const data = {
    exportedAt: new Date().toISOString(),
    settings: loadSettings(),
    loans: loadLoans(),
    loanPayments: loadLoanPayments(),
    budgets: loadBudgets(),
    expenses: loadExpenses(),
    reminders: loadReminders(),
  };
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.settings) saveSettings(parsed.settings);
    if (Array.isArray(parsed.loans)) saveLoans(parsed.loans);
    if (Array.isArray(parsed.loanPayments)) saveLoanPayments(parsed.loanPayments);
    if (parsed.budgets) saveBudgets(parsed.budgets);
    if (Array.isArray(parsed.expenses)) saveExpenses(parsed.expenses);
    if (Array.isArray(parsed.reminders)) saveReminders(parsed.reminders);
    return true;
  } catch (e) {
    console.error('Failed importing data', e);
    return false;
  }
}

export function resetToDefaults(): void {
  saveSettings(DEFAULT_SETTINGS);
  saveLoans(INITIAL_LOANS);
  saveLoanPayments(INITIAL_LOAN_PAYMENTS);
  saveBudgets({ [INITIAL_BUDGET.monthKey]: INITIAL_BUDGET });
  saveExpenses(INITIAL_EXPENSES);
  saveReminders(INITIAL_REMINDERS);
}
