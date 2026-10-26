import React from 'react';
import {
  AlertOctagon,
  X,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
  Bot,
  Sliders,
  Receipt,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatMonthYear, CATEGORY_METADATA } from '../../utils/formatters';

export const BudgetRestrictionModal: React.FC = () => {
  const {
    isRestrictionModalOpen,
    setIsRestrictionModalOpen,
    monthlySummary,
    budgets,
    selectedMonth,
    setActiveTab,
  } = useApp();

  if (!isRestrictionModalOpen) return null;

  const monthName = formatMonthYear(selectedMonth);

  // Check if overall budget is exceeded
  const isOverallExceeded = monthlySummary.overallBudget > 0 && monthlySummary.remainingBudget < 0;
  const overallExceededAmount = Math.abs(monthlySummary.remainingBudget);

  // Check individual category breaches (>100% used)
  const exceededCategories = monthlySummary.categoryBreakdown.filter((c) => {
    const cap = budgets.categoryBudgets[c.category] || 0;
    return cap > 0 && c.amount > cap;
  });

  // If somehow opened with no breach, don't break
  const hasBreach = isOverallExceeded || exceededCategories.length > 0;

  // Calculate days remaining in the month for recovery guidance
  const [year, month] = selectedMonth.split('-').map(Number);
  const totalDaysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  const currentDay = today.getFullYear() === year && today.getMonth() + 1 === month ? today.getDate() : 15;
  const daysLeft = Math.max(1, totalDaysInMonth - currentDay);

  const handleAskAI = () => {
    setIsRestrictionModalOpen(false);
    setActiveTab('assistant');
  };

  const handleAdjustBudget = () => {
    setIsRestrictionModalOpen(false);
    setActiveTab('budgets');
  };

  const handleReviewExpenses = () => {
    setIsRestrictionModalOpen(false);
    setActiveTab('transactions');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-midnight-900 border-2 border-rose-500/40 rounded-3xl shadow-2xl shadow-rose-950/50 p-6 sm:p-8 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Glowing Ambient Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 animate-pulse" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/40 shadow-lg shadow-rose-500/20">
              <AlertOctagon className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-rose-400">
                  Restriction Triggered
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {monthName}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Spending Cap Exceeded
              </h2>
            </div>
          </div>
          <button
            onClick={() => setIsRestrictionModalOpen(false)}
            aria-label="Close notification"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Main Alert Banner */}
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs sm:text-sm leading-relaxed space-y-2">
            <p className="font-semibold text-rose-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              Automated financial discipline protocol has been activated for this month.
            </p>
            <p className="text-rose-200/90 text-xs">
              Recorded spending has breached configured spending thresholds. Continued discretionary expenses will deepen your monthly deficit.
            </p>
          </div>

          {/* Exceeded Metrics Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Breached Spending Caps
            </h3>

            {/* Overall Budget Breached Card */}
            {isOverallExceeded && (
              <div className="p-4 rounded-xl bg-midnight-950 border border-rose-500/30 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Overall Monthly Budget</span>
                    <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[10px] font-extrabold">
                      {monthlySummary.percentageUsed}% USED
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Allocated: {formatINR(monthlySummary.overallBudget)} • Spent:{' '}
                    <strong className="text-white">{formatINR(monthlySummary.totalSpend)}</strong>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-medium text-slate-400">Exceeded By</div>
                  <div className="text-lg font-black text-rose-400">
                    +{formatINR(overallExceededAmount)}
                  </div>
                </div>
              </div>
            )}

            {/* Category Breaches */}
            {exceededCategories.map((c) => {
              const cap = budgets.categoryBudgets[c.category] || 0;
              const overBy = c.amount - cap;
              const meta = CATEGORY_METADATA[c.category];
              const pct = Math.round((c.amount / cap) * 100);

              return (
                <div
                  key={c.category}
                  className="p-3.5 rounded-xl bg-midnight-950 border border-rose-500/20 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: meta.color }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{c.category}</div>
                      <div className="text-[11px] text-slate-400">
                        Cap: {formatINR(cap)} • Spent:{' '}
                        <span className="text-white font-medium">{formatINR(c.amount)}</span> ({pct}%)
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-rose-400">+{formatINR(overBy)}</span>
                  </div>
                </div>
              );
            })}

            {!hasBreach && (
              <div className="p-3 rounded-xl bg-midnight-950 border border-white/5 text-xs text-slate-400">
                Overall budget is currently within limits. Review category allowances below.
              </div>
            )}
          </div>

          {/* Actionable Restriction Measures */}
          <div className="p-4 rounded-2xl bg-midnight-950/80 border border-white/10 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-teal flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" />
              Recommended Restriction Measures
            </h4>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>
                <strong>Immediate Discretionary Freeze:</strong> Pause non-essential dining deliveries (Swiggy/Zomato), online retail shopping, and paid entertainment for the next {daysLeft} days.
              </li>
              <li>
                <strong>Shift to Direct UPI Micropayment Auditing:</strong> Review payment confirmations before authenticating to halt casual leakages.
              </li>
              <li>
                <strong>Surplus Rebalancing:</strong> You can re-allocate unspent buffer from essential categories like Bills or Transport if necessary.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleAskAI}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-teal text-midnight-950 hover:bg-teal-400 shadow-md shadow-teal-500/20 transition active:scale-95"
          >
            <Bot className="w-4 h-4" />
            <span>Ask AI Recovery Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleAdjustBudget}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-midnight-800 text-slate-300 hover:text-white hover:bg-midnight-750 border border-white/10 transition"
            >
              Adjust Caps
            </button>
            <button
              type="button"
              onClick={() => setIsRestrictionModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
