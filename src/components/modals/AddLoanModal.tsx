import React, { useState } from 'react';
import { X, Landmark, Calculator, Plus, Sparkles, Smile } from 'lucide-react';
import { Loan, LoanType, LoanCategoryItem } from '../../types';
import { DEFAULT_LOAN_CATEGORIES } from '../../data/initialData';

interface AddLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
  categories?: LoanCategoryItem[];
  onAddCategory?: (newCategory: LoanCategoryItem) => void;
  onSaveLoan: (loan: Omit<Loan, 'id' | 'createdAt'>) => void;
}

const PRESET_EMOJIS = ['🎓', '🚗', '🏠', '💳', '🤝', '💼', '💻', '🏥', '💍', '✈️', '🛠️', '🏍️', '🚤', '📚', '🐶', '🛍️', '🏦', '🚀', '🏷️'];

export const AddLoanModal: React.FC<AddLoanModalProps> = ({
  isOpen,
  onClose,
  currencySymbol,
  categories = DEFAULT_LOAN_CATEGORIES,
  onAddCategory,
  onSaveLoan,
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<LoanType>('borrowed');
  const [title, setTitle] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [selectedCat, setSelectedCat] = useState<LoanCategoryItem>(
    categories[0] || { id: 'cat-student', name: 'Student Loan', emoji: '🎓' }
  );

  // Custom Category State
  const [showAddCustomCat, setShowAddCustomCat] = useState(false);
  const [customCatName, setCustomCatName] = useState('');
  const [customCatEmoji, setCustomCatEmoji] = useState('🏷️');

  const [principalAmount, setPrincipalAmount] = useState<string>('');
  const [currentBalance, setCurrentBalance] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('5.0');
  const [monthlyPayment, setMonthlyPayment] = useState<string>('');
  const [dueDateDay, setDueDateDay] = useState<number>(15);
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [termMonths, setTermMonths] = useState<number>(36);
  const [notes, setNotes] = useState<string>('');

  // Auto-calculate standard amortization monthly payment helper
  const handleAutoCalculatePayment = () => {
    const P = parseFloat(currentBalance || principalAmount) || 0;
    const r = (parseFloat(interestRate) || 0) / 100 / 12;
    const n = termMonths || 36;

    if (P <= 0 || n <= 0) return;
    if (r === 0) {
      setMonthlyPayment((P / n).toFixed(2));
      return;
    }

    const payment = (P * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
    if (!isNaN(payment) && payment > 0) {
      setMonthlyPayment(payment.toFixed(2));
    }
  };

  const handleCreateCustomCategory = () => {
    if (!customCatName.trim()) return;
    const newCat: LoanCategoryItem = {
      id: `cat-${Date.now()}`,
      name: customCatName.trim(),
      emoji: customCatEmoji || '🏷️',
    };
    if (onAddCategory) {
      onAddCategory(newCat);
    }
    setSelectedCat(newCat);
    setCustomCatName('');
    setShowAddCustomCat(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const principal = parseFloat(principalAmount);
    const balance = parseFloat(currentBalance || principalAmount);
    const monthly = parseFloat(monthlyPayment);
    const apr = parseFloat(interestRate) || 0;

    if (!title || isNaN(principal) || principal <= 0) return;

    // Calculate next due date (e.g. current year, current/next month, on dueDateDay)
    const today = new Date();
    let dueYear = today.getFullYear();
    let dueMonth = today.getMonth(); // 0-indexed
    if (today.getDate() > dueDateDay) {
      dueMonth += 1;
      if (dueMonth > 11) {
        dueMonth = 0;
        dueYear += 1;
      }
    }
    const nextDueDate = `${dueYear}-${String(dueMonth + 1).padStart(2, '0')}-${String(
      dueDateDay
    ).padStart(2, '0')}`;

    onSaveLoan({
      title,
      type,
      counterparty: counterparty || (type === 'borrowed' ? 'Bank / Creditor' : 'Borrower'),
      category: selectedCat.name,
      categoryEmoji: selectedCat.emoji || '🏷️',
      principalAmount: principal,
      currentBalance: balance,
      interestRate: apr,
      monthlyPayment: monthly || Math.round(balance / 24),
      dueDateDay,
      nextDueDate,
      startDate,
      termMonths,
      status: 'active',
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-800/90 border-b border-slate-700/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Log New Loan</h3>
              <p className="text-[11px] text-slate-400">Track debts, mortgages, or money lent</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Loan Type Selector: Borrowed (I owe) vs Lent (Someone owes me) */}
          <div className="flex rounded-2xl bg-slate-800 p-1 border border-slate-700">
            <button
              type="button"
              onClick={() => setType('borrowed')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                type === 'borrowed'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Borrowed (I Owe Money)
            </button>
            <button
              type="button"
              onClick={() => setType('lent')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                type === 'lent'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Lent Out (Someone Owes Me)
            </button>
          </div>

          {/* Title & Counterparty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Loan Name / Title *
              </label>
              <input
                type="text"
                placeholder="e.g., Auto Loan, Student Debt"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {type === 'borrowed' ? 'Lender / Institution' : 'Borrower Name'}
              </label>
              <input
                type="text"
                placeholder={type === 'borrowed' ? 'e.g., Chase Bank, Dept of Ed' : 'e.g., John Smith'}
                value={counterparty}
                onChange={(e) => setCounterparty(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
          </div>

          {/* Loan Categories with Emojis */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Category with Emoji</span>
                <span className="text-base">{selectedCat.emoji}</span>
              </label>
              <button
                type="button"
                onClick={() => setShowAddCustomCat(!showAddCustomCat)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                <Plus className="w-3 h-3" />
                {showAddCustomCat ? 'Hide Custom' : 'Add Custom Emoji Category'}
              </button>
            </div>

            {/* Custom Category Inline Creator */}
            {showAddCustomCat && (
              <div className="p-3 mb-2.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-[11px] text-indigo-300 font-semibold">
                  <span>Create Custom Category</span>
                  <span>Select an Emoji</span>
                </div>

                {/* Emoji Selector Chips */}
                <div className="flex flex-wrap gap-1">
                  {PRESET_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setCustomCatEmoji(emoji)}
                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-transform cursor-pointer ${
                        customCatEmoji === emoji
                          ? 'bg-indigo-600 scale-110 shadow-sm'
                          : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Motorcycle, Boat, Dog Surgery..."
                    value={customCatName}
                    onChange={(e) => setCustomCatName(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCustomCategory}
                    disabled={!customCatName.trim()}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Category Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = selectedCat.id === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCat(cat)}
                    className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-500/25 border-indigo-500 text-indigo-200 font-bold shadow-xs'
                        : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-base shrink-0">{cat.emoji}</span>
                    <span className="truncate text-xs">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amounts: Principal & Current Balance */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Original Principal ({currencySymbol}) *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="10000"
                value={principalAmount}
                onChange={(e) => {
                  setPrincipalAmount(e.target.value);
                  if (!currentBalance) setCurrentBalance(e.target.value);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Current Remaining Balance ({currencySymbol}) *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="8500"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                required
              />
            </div>
          </div>

          {/* Interest rate & Term */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Annual Interest Rate (APR %)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="4.5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Term (Total Months)
              </label>
              <input
                type="number"
                placeholder="36"
                value={termMonths}
                onChange={(e) => setTermMonths(parseInt(e.target.value) || 12)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>
          </div>

          {/* Monthly Payment & Due Day */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-300">
                  Monthly Payment ({currencySymbol})
                </label>
                <button
                  type="button"
                  onClick={handleAutoCalculatePayment}
                  className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Calculator className="w-2.5 h-2.5" /> Auto-calc
                </button>
              </div>
              <input
                type="number"
                step="0.01"
                placeholder="250"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Payment Due Day of Month
              </label>
              <select
                value={dueDateDay}
                onChange={(e) => setDueDateDay(parseInt(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-xs font-mono"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                    {d === 1 || d === 21 || d === 31
                      ? 'st'
                      : d === 2 || d === 22
                      ? 'nd'
                      : d === 3 || d === 23
                      ? 'rd'
                      : 'th'}{' '}
                    of each month
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Start Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Loan Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Notes & Terms (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Account #, fixed rate"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Save Loan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
