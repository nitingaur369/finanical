import React, { useState } from 'react';
import {
  PieChart,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Plus,
  Save,
  RotateCcw,
  Info,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExpenseCategory, BudgetConfig } from '../../types';
import {
  ALL_CATEGORIES,
  CATEGORY_METADATA,
  formatINR,
  formatMonthYear,
} from '../../utils/formatters';
import { getBudgetAlertStatus } from '../../utils/calculations';

export const BudgetsView: React.FC = () => {
  const {
    budgets,
    updateBudgets,
    monthlySummary,
    selectedMonth,
    setActiveTab,
  } = useApp();

  // Local editing state for budget allocations
  const [overallBudgetInput, setOverallBudgetInput] = useState<string>(
    String(budgets.monthlyOverallBudget || 20000)
  );
  const [categoryBudgetsInput, setCategoryBudgetsInput] = useState<Partial<Record<ExpenseCategory, string>>>(() => {
    const initial: Partial<Record<ExpenseCategory, string>> = {};
    ALL_CATEGORIES.forEach((cat) => {
      initial[cat] = budgets.categoryBudgets[cat] ? String(budgets.categoryBudgets[cat]) : '';
    });
    return initial;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);

  const monthName = formatMonthYear(selectedMonth);

  // Overall budget calculations
  const overallAlert = getBudgetAlertStatus(
    monthlySummary.totalSpend,
    budgets.monthlyOverallBudget
  );

  const handleSaveBudgets = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedOverall = parseFloat(overallBudgetInput) || 0;
    const parsedCategories: Partial<Record<ExpenseCategory, number>> = {};

    ALL_CATEGORIES.forEach((cat) => {
      const val = parseFloat(categoryBudgetsInput[cat] || '');
      if (!isNaN(val) && val > 0) {
        parsedCategories[cat] = val;
      }
    });

    updateBudgets({
      monthlyOverallBudget: parsedOverall,
      categoryBudgets: parsedCategories,
    });

    setIsEditing(false);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2500);
  };

  const handleResetToRecommended = () => {
    setOverallBudgetInput('22000');
    setCategoryBudgetsInput({
      'Food and dining': '4500',
      'Groceries': '3500',
      'Transport': '2000',
      'Bills and utilities': '3000',
      'Shopping': '3500',
      'Entertainment': '1800',
      'Education': '1500',
      'Healthcare': '1200',
      'Clothing': '2500',
      'Cosmetics and personal care': '1500',
      'Other': '1000',
    });
  };

  // Find all category over-budget and near-limit alerts
  const categoryAlerts = monthlySummary.categoryBreakdown
    .map((c) => {
      const budget = budgets.categoryBudgets[c.category] || 0;
      const alert = getBudgetAlertStatus(c.amount, budget);
      return {
        category: c.category,
        amount: c.amount,
        budget,
        alert,
      };
    })
    .filter((item) => item.budget > 0 && item.alert.status !== 'safe');

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Overview Card: Overall Monthly Budget Meter */}
      <div className="glass-panel p-6 sm:p-7 rounded-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-teal">
                Monthly Spending Envelope
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-300">
                {monthName}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              Overall Budget Target: {formatINR(budgets.monthlyOverallBudget)}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-midnight-800 hover:bg-midnight-750 text-brand-teal border border-brand-teal/30 transition"
              >
                <Sliders className="w-4 h-4" />
                <span>Adjust Budget Caps</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Big Meter Bar */}
        <div className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
            <span className="text-slate-400 font-medium">
              Spent so far: <strong className="text-white">{formatINR(monthlySummary.totalSpend)}</strong>
            </span>
            <span className="text-slate-400 font-medium">
              Status:{' '}
              <strong
                className={
                  overallAlert.status === 'danger'
                    ? 'text-rose-400'
                    : overallAlert.status === 'warning'
                    ? 'text-amber-300'
                    : 'text-brand-emerald'
                }
              >
                {overallAlert.percentage}% Used ({overallAlert.status === 'danger' ? 'Over Budget' : overallAlert.status === 'warning' ? 'Caution: ≥80%' : 'On Track'})
              </strong>
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 w-full bg-midnight-900 rounded-full h-3.5 p-0.5 border border-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                overallAlert.status === 'danger'
                  ? 'bg-rose-500'
                  : overallAlert.status === 'warning'
                  ? 'bg-amber-400'
                  : 'bg-gradient-to-r from-brand-teal to-brand-emerald'
              }`}
              style={{ width: `${Math.min(100, overallAlert.percentage)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 mt-2">
            <span>₹0</span>
            <span>80% Warning Mark ({formatINR(budgets.monthlyOverallBudget * 0.8)})</span>
            <span>Cap: {formatINR(budgets.monthlyOverallBudget)}</span>
          </div>
        </div>

        {/* Active Alert Banners if any */}
        {categoryAlerts.length > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <AlertTriangle className="w-4 h-4" />
              <span>Category Spending Warnings Detected</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {categoryAlerts.map((item) => (
                <div
                  key={item.category}
                  className={`px-3 py-2 rounded-lg border text-xs flex items-center justify-between ${
                    item.alert.status === 'danger'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  }`}
                >
                  <span className="font-semibold">{item.category}</span>
                  <span>
                    {formatINR(item.amount)} of {formatINR(item.budget)} ({item.alert.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Editing Form when active */}
      {isEditing && (
        <form
          onSubmit={handleSaveBudgets}
          className="glass-panel p-6 sm:p-7 rounded-2xl space-y-6 border-brand-teal/40 animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-lg font-bold text-white">Configure Budget Envelopes</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Set realistic limits for your monthly overall spending and individual categories.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetToRecommended}
              className="text-xs text-brand-teal hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Load Recommended Caps
            </button>
          </div>

          {/* Overall budget input */}
          <div className="max-w-xs">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Monthly Overall Budget (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-teal font-bold">
                ₹
              </span>
              <input
                type="number"
                min="500"
                step="500"
                value={overallBudgetInput}
                onChange={(e) => setOverallBudgetInput(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-midnight-900 border border-white/10 rounded-xl text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
            </div>
          </div>

          {/* Category-wise allocations */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Individual Category Caps (₹)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ALL_CATEGORIES.map((cat) => {
                const meta = CATEGORY_METADATA[cat];
                return (
                  <div
                    key={cat}
                    className="p-3 rounded-xl bg-midnight-900 border border-white/5 space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: meta.color }}
                      />
                      <span className="truncate">{cat}</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                        ₹
                      </span>
                      <input
                        type="number"
                        placeholder="No limit"
                        min="0"
                        step="100"
                        value={categoryBudgetsInput[cat] || ''}
                        onChange={(e) =>
                          setCategoryBudgetsInput((prev) => ({
                            ...prev,
                            [cat]: e.target.value,
                          }))
                        }
                        className="w-full pl-6 pr-3 py-1.5 bg-midnight-950 border border-white/10 rounded-lg text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-brand-teal"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-brand-teal text-midnight-950 hover:bg-teal-400 shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* Category Budgets Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-brand-teal" />
            Category Budget Breakdown
          </h3>
          <span className="text-xs text-slate-400">
            {ALL_CATEGORIES.filter((c) => budgets.categoryBudgets[c] && budgets.categoryBudgets[c]! > 0).length} of {ALL_CATEGORIES.length} categories tracked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_CATEGORIES.map((cat) => {
            const meta = CATEGORY_METADATA[cat];
            const allocated = budgets.categoryBudgets[cat] || 0;
            const item = monthlySummary.categoryBreakdown.find((c) => c.category === cat);
            const spent = item ? item.amount : 0;
            const alert = getBudgetAlertStatus(spent, allocated);

            return (
              <div
                key={cat}
                className="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: meta.bgColor,
                        borderColor: meta.borderColor,
                        color: meta.textColor,
                      }}
                    >
                      <span className="text-xs font-bold">{cat.slice(0, 1)}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">{cat}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {allocated > 0 ? `Cap: ${formatINR(allocated)}` : 'No limit set'}
                      </p>
                    </div>
                  </div>

                  {allocated > 0 && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        alert.status === 'danger'
                          ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                          : alert.status === 'warning'
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                          : 'bg-brand-emerald/15 border-brand-emerald/30 text-brand-emerald'
                      }`}
                    >
                      {alert.status === 'danger' ? 'Exceeded' : alert.status === 'warning' ? '≥80% Warning' : 'Safe'}
                    </span>
                  )}
                </div>

                {/* Spent & Remaining metrics */}
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-400">Spent: <strong className="text-white text-sm">{formatINR(spent)}</strong></span>
                    {allocated > 0 && (
                      <span className="text-slate-400 font-medium">
                        {alert.percentage}% used
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {allocated > 0 ? (
                    <div className="w-full bg-midnight-900 rounded-full h-2 overflow-hidden border border-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          alert.status === 'danger'
                            ? 'bg-rose-500'
                            : alert.status === 'warning'
                            ? 'bg-amber-400'
                            : 'bg-brand-teal'
                        }`}
                        style={{ width: `${Math.min(100, alert.percentage)}%` }}
                      />
                    </div>
                  ) : (
                    <div className="w-full bg-midnight-900/50 rounded-full h-2 border border-dashed border-white/10" />
                  )}

                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-0.5">
                    {allocated > 0 ? (
                      alert.remaining < 0 ? (
                        <span className="text-rose-400 font-semibold">Over by {formatINR(Math.abs(alert.remaining))}</span>
                      ) : (
                        <span>{formatINR(alert.remaining)} remaining</span>
                      )
                    ) : (
                      <span className="text-slate-500 italic">No cap configured</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
