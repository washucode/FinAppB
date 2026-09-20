import React, { useRef, useState } from 'react';
import {
  X,
  Settings,
  Download,
  Upload,
  RotateCcw,
  Bell,
  Smartphone,
  Check,
  Plus,
  Trash2,
  Smile,
  Monitor,
} from 'lucide-react';
import { AppSettings, LoanCategoryItem } from '../../types';
import { exportAllData, importAllData, resetToDefaults } from '../../utils/storage';
import { triggerSystemNotification } from '../../utils/calculations';
import { DEFAULT_LOAN_CATEGORIES } from '../../data/initialData';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onDataReload: () => void;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'KES', symbol: 'KSh ', name: 'Kenyan Shilling (KSh)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar (AU$)' },
];

const PRESET_EMOJIS = ['🎓', '🚗', '🏠', '💳', '🤝', '💼', '💻', '🏥', '💍', '✈️', '🛠️', '🏍️', '🚤', '📚', '🐶', '🛍️', '🏦', '🚀', '🏷️'];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onDataReload,
}) => {
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Category Add State
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('🏷️');

  if (!isOpen) return null;

  const currentCategories = settings.customLoanCategories || DEFAULT_LOAN_CATEGORIES;

  const handleCurrencyChange = (code: string) => {
    const found = CURRENCIES.find((c) => c.code === code);
    if (found) {
      onUpdateSettings({
        ...settings,
        currencyCode: found.code,
        currencySymbol: found.symbol,
      });
    }
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: LoanCategoryItem = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      emoji: newCatEmoji || '🏷️',
    };
    const updated = [...currentCategories, newCat];
    onUpdateSettings({
      ...settings,
      customLoanCategories: updated,
    });
    setNewCatName('');
    setNotificationMsg(`Added ${newCat.emoji} ${newCat.name} category!`);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleDeleteCategory = (id: string) => {
    const updated = currentCategories.filter((c) => c.id !== id);
    onUpdateSettings({
      ...settings,
      customLoanCategories: updated,
    });
  };

  const handleExport = () => {
    const jsonStr = exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget_loans_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importAllData(content);
        if (success) {
          onDataReload();
          setNotificationMsg('Data successfully imported and restored!');
          setTimeout(() => setNotificationMsg(null), 3000);
        } else {
          alert('Invalid backup JSON format.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all loans, budget, and expenses to sample default data?')) {
      resetToDefaults();
      onDataReload();
      onClose();
    }
  };

  const handleTestNotification = async () => {
    const sent = await triggerSystemNotification(
      'Budget & Loan Tracker Alert',
      'Automated reminder: Your upcoming loan installment is scheduled soon!'
    );
    if (sent) {
      setNotificationMsg('Test notification sent to browser!');
    } else {
      setNotificationMsg('Please allow notification permissions in your browser bar.');
    }
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-800/90 border-b border-slate-700/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center text-slate-300">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Settings & OS Preferences</h3>
              <p className="text-[11px] text-slate-400">iOS, Android, custom emoji categories & backup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          {notificationMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{notificationMsg}</span>
            </div>
          )}

          {/* Operating System UI Style */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-300">
              Operating System & Layout Mode
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-800 p-1 rounded-2xl border border-slate-700">
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({ ...settings, osMode: 'ios', androidFrameView: true })
                }
                className={`py-2 px-2 rounded-xl font-medium transition-all text-center flex flex-col items-center gap-1 cursor-pointer ${
                  settings.osMode === 'ios'
                    ? 'bg-slate-900 text-white font-bold border border-slate-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-base">🍏</span>
                <span className="text-[11px]">iOS (iPhone)</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({ ...settings, osMode: 'android', androidFrameView: true })
                }
                className={`py-2 px-2 rounded-xl font-medium transition-all text-center flex flex-col items-center gap-1 cursor-pointer ${
                  settings.osMode === 'android'
                    ? 'bg-slate-900 text-emerald-400 font-bold border border-emerald-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-base">🤖</span>
                <span className="text-[11px]">Android</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({ ...settings, osMode: 'desktop', androidFrameView: false })
                }
                className={`py-2 px-2 rounded-xl font-medium transition-all text-center flex flex-col items-center gap-1 cursor-pointer ${
                  settings.osMode === 'desktop'
                    ? 'bg-slate-900 text-sky-400 font-bold border border-sky-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-base">🖥️</span>
                <span className="text-[11px]">Desktop View</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              {settings.osMode === 'ios'
                ? 'iOS mode active: Features iPhone Dynamic Island, iOS system status bar, Cupertino blurred bottom navigation, and Home Indicator.'
                : settings.osMode === 'android'
                ? 'Android mode active: Features Material You status bar, punch-hole camera notch, Android notification drawer, and Material 3 tabs.'
                : 'Desktop view: Expands to full screen width for larger tablets and monitors.'}
            </p>
          </div>

          {/* Currency */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Default Currency
            </label>
            <select
              value={settings.currencyCode}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Loan Categories with Emojis Management */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-indigo-400" />
                Emoji Loan Categories ({currentCategories.length})
              </span>
            </div>

            {/* Existing Categories List */}
            <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
              {currentCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cat.emoji}</span>
                    <span className="font-medium text-slate-200">{cat.name}</span>
                  </div>
                  {currentCategories.length > 3 && (
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Add New Category with Emoji */}
            <div className="pt-2 border-t border-slate-700/60 space-y-2">
              <span className="text-[11px] font-semibold text-slate-300 block">
                Add New Loan Category with Emoji
              </span>

              {/* Emoji selector row */}
              <div className="flex flex-wrap gap-1">
                {PRESET_EMOJIS.slice(0, 12).map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewCatEmoji(emoji)}
                    className={`w-6 h-6 rounded-md text-xs flex items-center justify-center transition-all ${
                      newCatEmoji === emoji
                        ? 'bg-indigo-600 scale-110 shadow-xs'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Category Name (e.g., Dental, Motorbike)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={!newCatName.trim()}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Automated System Notifications */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-emerald-400" />
                Browser Push Notifications
              </span>
              <button
                type="button"
                onClick={handleTestNotification}
                className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[11px] font-medium transition-colors cursor-pointer"
              >
                Test Push
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Triggers real device and browser alerts when loans are due in 3 days or when budgets exceed 80%.
            </p>
          </div>

          {/* Backup & Restore */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-300">
              Data Backup & Sync
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span>Export JSON</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Import JSON</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </div>
          </div>

          {/* Reset button */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2 px-3 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-500/30 flex items-center justify-center gap-1.5 transition-colors text-xs font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Fresh Sample Data</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-800/80 border-t border-slate-700/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-medium text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
