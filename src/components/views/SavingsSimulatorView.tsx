import React, { useState, useMemo } from 'react';
import {
  Calculator,
  PiggyBank,
  TrendingDown,
  Sparkles,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExpenseCategory } from '../../types';
import {
  ALL_CATEGORIES,
  CATEGORY_METADATA,
  formatINR,
  formatMonthYear,
} from '../../utils/formatters';
import { calculateSavingsSimulation } from '../../utils/calculations';

export const SavingsSimulatorView: React.FC = () => {
  const { transactions, selectedMonth } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>('Food and dining');
  const [weeklyReduction, setWeeklyReduction] = useState<number>(250);

  const monthName = formatMonthYear(selectedMonth);

  // Compute simulation projections
  const simulation = useMemo(() => {
    return calculateSavingsSimulation(transactions, selectedCategory, weeklyReduction, selectedMonth);
  }, [transactions, selectedCategory, weeklyReduction, selectedMonth]);

  const catMeta = CATEGORY_METADATA[selectedCategory];

  // Practical Indian equivalencies based on 4-week savings
  const getIndianEquivalency = (amount4Weeks: number) => {
    if (amount4Weeks >= 5000) {
      return 'Equivalent to a domestic flight return ticket or a new pair of premium active noise-cancelling headphones.';
    } else if (amount4Weeks >= 2500) {
      return 'Equivalent to a full semester course material bundle or 3 months of premium gym membership.';
    } else if (amount4Weeks >= 1000) {
      return 'Equivalent to 1 month of high-speed fiber broadband + OTT entertainment bundle.';
    } else if (amount4Weeks >= 500) {
      return 'Equivalent to 5 campus cafeteria lunch meals or 2 weekly metro travel passes.';
    }
    return 'Equivalent to daily artisanal teas or weekend snack runs.';
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Intro Hero */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-midnight-850 via-midnight-800 to-midnight-850 border border-brand-teal/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-brand-emerald/20 text-brand-emerald flex items-center justify-center shrink-0 border border-brand-emerald/30 shadow-sm">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-emerald">
                  Micro-Habit Compounding
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-300">
                  {monthName}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                Interactive Savings Simulator
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Small, painless weekly adjustments in discretionary spending compound into significant savings over time. Test your custom reduction target below.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl space-y-6">
          {/* Step 1: Select Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              1. Select Spending Category
            </label>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {ALL_CATEGORIES.map((cat) => {
                const meta = CATEGORY_METADATA[cat];
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition border ${
                      isSelected
                        ? 'bg-midnight-750 text-white border-brand-teal shadow-sm'
                        : 'bg-midnight-900 text-slate-400 border-white/5 hover:bg-midnight-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: meta.color }}
                      />
                      <span>{cat}</span>
                    </div>
                    {isSelected && <span className="text-brand-teal text-[10px] font-bold">Selected</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Category Spend in Selected Month */}
          <div className="p-3.5 rounded-xl bg-midnight-900 border border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Current {selectedCategory} Spend:</span>
            <span className="font-bold text-white text-sm">{formatINR(simulation.currentMonthlySpend)}</span>
          </div>

          {/* Step 2: Weekly Reduction Target */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                2. Target Weekly Reduction
              </label>
              <span className="text-base font-extrabold text-brand-emerald">
                {formatINR(weeklyReduction)} / week
              </span>
            </div>

            {/* Range Slider */}
            <input
              type="range"
              min="50"
              max="2500"
              step="50"
              value={weeklyReduction}
              onChange={(e) => setWeeklyReduction(Number(e.target.value))}
              className="w-full accent-brand-emerald bg-midnight-900 h-2 rounded-lg cursor-pointer"
            />

            {/* Quick Chips */}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[11px] text-slate-400">Presets:</span>
              {[100, 250, 500, 1000].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setWeeklyReduction(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                    weeklyReduction === preset
                      ? 'bg-brand-emerald text-midnight-950 font-bold border-brand-emerald'
                      : 'bg-midnight-900 text-slate-300 border-white/5 hover:text-brand-emerald'
                  }`}
                >
                  ₹{preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projection Results Column (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-7 rounded-2xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h3 className="text-base font-bold text-white">Projected Retained Savings</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Assuming a continuous ₹{weeklyReduction}/week reduction in {selectedCategory}
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30">
                Live Dynamic Calculation
              </span>
            </div>

            {/* 3 Horizon Projection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-6">
              {/* 4 Weeks */}
              <div className="p-4 rounded-xl bg-midnight-900 border border-white/5 flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  4 Weeks (1 Month)
                </span>
                <div className="text-2xl font-extrabold text-white mt-2">
                  {formatINR(simulation.fourWeeksSaving)}
                </div>
                <div className="text-[11px] text-brand-emerald mt-1 font-medium">
                  {simulation.reductionPercentage > 0 ? `~${simulation.reductionPercentage}% of monthly spend` : 'Quick buffer'}
                </div>
              </div>

              {/* 3 Months */}
              <div className="p-4 rounded-xl bg-midnight-900 border border-brand-teal/30 flex flex-col justify-between relative shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    3 Months (Quarter)
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
                </div>
                <div className="text-2xl font-extrabold text-brand-teal mt-2">
                  {formatINR(simulation.threeMonthsSaving)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium">
                  Solid emergency buffer
                </div>
              </div>

              {/* 12 Months */}
              <div className="p-4 rounded-xl bg-midnight-900 border border-white/5 flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  12 Months (1 Year)
                </span>
                <div className="text-2xl font-extrabold text-brand-emerald mt-2">
                  {formatINR(simulation.twelveMonthsSaving)}
                </div>
                <div className="text-[11px] text-brand-emerald mt-1 font-medium">
                  Substantial capital
                </div>
              </div>
            </div>

            {/* Contextual Indian Real-World Benchmark */}
            <div className="p-4 rounded-xl bg-midnight-900/60 border border-brand-teal/20 space-y-1.5">
              <div className="text-xs font-bold text-brand-teal flex items-center gap-1.5 uppercase tracking-wide">
                <Zap className="w-3.5 h-3.5" /> Real-World Equivalent
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {getIndianEquivalency(simulation.fourWeeksSaving)}
              </p>
            </div>
          </div>

          {/* Mandatory Transparent Disclaimer as requested by the prompt */}
          <div className="pt-4 border-t border-white/5 flex items-start gap-2.5 text-slate-400 text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Transparent Calculation Note:</strong> Projections assume the exact same ₹{weeklyReduction} weekly reduction continues consistently over the selected period. These calculations are forward-looking estimates designed for financial planning, not guaranteed returns or fixed savings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
