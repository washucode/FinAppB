import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  TrendingDown,
  Calendar,
  Wallet,
  Landmark,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { MonthlyBudget, Expense, Loan, LoanPayment } from '../../types';
import {
  generateCashFlowHistory,
  computeBudgetSummary,
  formatCurrency,
  formatCompactCurrency,
} from '../../utils/calculations';

interface AnalyticsViewProps {
  budget: MonthlyBudget;
  budgets: Record<string, MonthlyBudget>;
  expenses: Expense[];
  loans: Loan[];
  payments: LoanPayment[];
  currencySymbol: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  budget,
  budgets,
  expenses,
  loans,
  payments,
  currencySymbol,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'cashflow' | 'categories' | 'debt' | 'budget'>('cashflow');

  // 1. Cash Flow History (Past 6 Months)
  const cashFlowData = generateCashFlowHistory(budgets, expenses, payments);

  // 2. Category Spending for current month
  const budgetSummary = computeBudgetSummary(budget, expenses);
  const categoryChartData = budget.categories
    .map((cat) => {
      const stat = budgetSummary.categorySpending[cat.category];
      return {
        name: cat.category,
        value: stat ? stat.spent : 0,
        color: cat.color,
        allocated: cat.allocatedAmount,
      };
    })
    .filter((c) => c.value > 0);

  // Fallback if no expenses yet
  const displayCategoryData =
    categoryChartData.length > 0
      ? categoryChartData
      : [{ name: 'Allocated Budget', value: 100, color: '#10b981', allocated: 100 }];

  // 3. Debt Payoff Simulation / Trajectory
  const totalPrincipal = loans
    .filter((l) => l.type === 'borrowed')
    .reduce((sum, l) => sum + l.principalAmount, 0);
  const currentTotalDebt = loans
    .filter((l) => l.type === 'borrowed' && l.status === 'active')
    .reduce((sum, l) => sum + l.currentBalance, 0);

  const debtHistoryData = [
    { month: 'Apr', balance: Math.round(totalPrincipal * 0.85) },
    { month: 'May', balance: Math.round(totalPrincipal * 0.8) },
    { month: 'Jun', balance: Math.round(totalPrincipal * 0.74) },
    { month: 'Jul', balance: Math.round(totalPrincipal * 0.69) },
    { month: 'Aug', balance: Math.round(totalPrincipal * 0.64) },
    { month: 'Sep (Current)', balance: currentTotalDebt },
  ];

  // 4. Budget vs Actual Bar Chart Data
  const budgetVsActualData = budget.categories.slice(0, 6).map((cat) => {
    const stat = budgetSummary.categorySpending[cat.category];
    return {
      category: cat.category.split(' ')[0], // Short name for axis
      Allocated: cat.allocatedAmount,
      Spent: stat ? stat.spent : 0,
    };
  });

  // 5. Financial Health Metrics
  const monthlyIncome = budget.totalIncome || 1;
  const totalMonthlyDebtRepayment = loans
    .filter((l) => l.type === 'borrowed' && l.status === 'active')
    .reduce((sum, l) => sum + l.monthlyPayment, 0);
  const dtiRatio = Math.round((totalMonthlyDebtRepayment / monthlyIncome) * 100);
  const savingsRate = Math.round(
    ((monthlyIncome - budgetSummary.totalSpent) / monthlyIncome) * 100
  );

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 shadow-lg space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Financial Intelligence
            </span>
            <h2 className="text-base font-bold text-slate-100">Monthly Visualizations</h2>
          </div>
        </div>

        {/* Health KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Debt-to-Income (DTI)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span
                className={`text-base font-black font-mono ${
                  dtiRatio <= 35
                    ? 'text-emerald-400'
                    : dtiRatio <= 45
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {dtiRatio}%
              </span>
              <span className="text-[10px] text-slate-500">
                {dtiRatio <= 35 ? 'Healthy' : 'Moderate'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Net Savings Rate</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-black text-teal-400 font-mono">
                {savingsRate}%
              </span>
              <span className="text-[10px] text-slate-500">of income</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 block">Active Loan Balance</span>
            <div className="text-base font-bold text-rose-300 font-mono mt-0.5">
              {formatCurrency(currentTotalDebt, currencySymbol)}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Selector Tabs */}
      <div className="flex rounded-2xl bg-slate-900 p-1 border border-slate-800 text-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveChartTab('cashflow')}
          className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
            activeChartTab === 'cashflow'
              ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Monthly Cash Flow
        </button>
        <button
          onClick={() => setActiveChartTab('categories')}
          className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
            activeChartTab === 'categories'
              ? 'bg-slate-800 text-amber-400 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Category Breakdown
        </button>
        <button
          onClick={() => setActiveChartTab('debt')}
          className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
            activeChartTab === 'debt'
              ? 'bg-slate-800 text-rose-400 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Debt Payoff Curve
        </button>
        <button
          onClick={() => setActiveChartTab('budget')}
          className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
            activeChartTab === 'budget'
              ? 'bg-slate-800 text-sky-400 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Budget vs Actual
        </button>
      </div>

      {/* Main Chart Container */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        {/* Tab 1: Monthly Cash Flow Grouped Bar Chart */}
        {activeChartTab === 'cashflow' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  Monthly Cash Flow Trends (Last 6 Months)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Income vs Total Spending vs Loan Repayments
                </p>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <XAxis
                    dataKey="monthLabel"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => formatCompactCurrency(val, currencySymbol)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [
                      formatCurrency(Number(val), currencySymbol),
                      '',
                    ]}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                  />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="loanPayments" name="Loan Payments" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 2: Category Expense Donut Chart */}
        {activeChartTab === 'categories' && (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Current Month Expense Distribution
              </h3>
              <p className="text-[11px] text-slate-400">
                Where your money went in {budget.monthKey}
              </p>
            </div>

            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {displayCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [
                      formatCurrency(Number(val), currencySymbol),
                      'Spent',
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
              {displayCategoryData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-800/40">
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-300 truncate text-[11px]">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-bold text-slate-100 font-mono text-[11px]">
                    {formatCurrency(item.value, currencySymbol)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Debt Payoff Curve */}
        {activeChartTab === 'debt' && (
          <div className="space-y-2">
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Debt Balance Reduction Trajectory
              </h3>
              <p className="text-[11px] text-slate-400">
                Total outstanding loan balance reduction curve
              </p>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={debtHistoryData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => formatCompactCurrency(val, currencySymbol)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [
                      formatCurrency(Number(val), currencySymbol),
                      'Total Remaining Debt',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#debtGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 4: Budget vs Actual Comparison */}
        {activeChartTab === 'budget' && (
          <div className="space-y-2">
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Budget vs. Actual Spending
              </h3>
              <p className="text-[11px] text-slate-400">
                Allocated target vs current expenditure by category
              </p>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetVsActualData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => formatCompactCurrency(val, currencySymbol)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [
                      formatCurrency(Number(val), currencySymbol),
                      '',
                    ]}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                  />
                  <Bar dataKey="Allocated" name="Target Budget" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Spent" name="Actual Spent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
