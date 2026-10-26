import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  X,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Clock,
  PiggyBank,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExpenseCategory } from '../../types';
import { ALL_CATEGORIES, formatINR, CATEGORY_METADATA } from '../../utils/formatters';
import { evaluateAffordability } from '../../services/affordabilityService';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CanIBuyThisModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { monthlySummary, budgets, setIsAddModalOpen, setActiveTab } = useApp();

  const [productName, setProductName] = useState('');
  const [priceInput, setPriceInput] = useState('1800');
  const [category, setCategory] = useState<ExpenseCategory>('Shopping');
  const [isNeed, setIsNeed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const price = parseFloat(priceInput) || 0;

  // Live evaluation
  const evaluation = useMemo(() => {
    return evaluateAffordability(productName, price, category, isNeed, monthlySummary, budgets);
  }, [productName, price, category, isNeed, monthlySummary, budgets]);

  if (!isOpen) return null;

  const handleWait7Days = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#14B8A6', '#10B981', '#38BDF8'],
    });
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
      onClose();
    }, 2200);
  };

  const handleProceedToAddExpense = () => {
    onClose();
    setIsAddModalOpen(true);
  };

  const handleAskAI = () => {
    onClose();
    setActiveTab('assistant');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-midnight-900 border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0 border border-brand-teal/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-teal">
                  Purchase Advisor
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                  Buffer: {formatINR(monthlySummary.remainingBudget)} left
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">“Can I Buy This?”</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Inputs Section */}
          <div className="space-y-4 p-4 rounded-2xl bg-midnight-950 border border-white/5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Product / Item Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sony Headphones, Sneakers, Swiggy..."
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-midnight-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-teal"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Item Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-teal font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    placeholder="0"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 bg-midnight-900 border border-white/10 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-brand-teal"
                  />
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Quick tests:</span>
              {[500, 1500, 3000, 8000].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => setPriceInput(String(quick))}
                  className="px-2.5 py-0.5 rounded-lg bg-midnight-900 hover:bg-midnight-800 text-slate-300 hover:text-brand-teal border border-white/5 text-[11px]"
                >
                  ₹{quick}
                </button>
              ))}
            </div>

            {/* Category & Need vs Want Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-teal"
                >
                  {ALL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Need vs Discretionary Want
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-midnight-900 rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsNeed(false)}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                      !isNeed ? 'bg-brand-teal text-midnight-950 shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Want (Optional)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNeed(true)}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                      isNeed ? 'bg-brand-teal text-midnight-950 shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Need (Essential)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Verdict Card */}
          <div
            className={`p-5 rounded-2xl border-2 transition-all ${
              evaluation.status === 'safe'
                ? 'bg-emerald-950/25 border-brand-emerald/40'
                : evaluation.status === 'caution'
                ? 'bg-amber-950/25 border-amber-500/40'
                : 'bg-rose-950/25 border-rose-500/40'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    evaluation.status === 'safe'
                      ? 'bg-brand-emerald/20 text-brand-emerald border-brand-emerald/30'
                      : evaluation.status === 'caution'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {evaluation.status === 'safe' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : evaluation.status === 'caution' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <AlertOctagon className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Decision Verdict ({evaluation.score}/100)
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white">
                    {evaluation.verdictTitle}
                  </h3>
                </div>
              </div>

              <span
                className={`text-xs font-black px-2.5 py-1 rounded-full uppercase border ${
                  evaluation.status === 'safe'
                    ? 'bg-brand-emerald/20 border-brand-emerald/30 text-brand-emerald'
                    : evaluation.status === 'caution'
                    ? 'bg-amber-500/20 border-amber-500/30 text-amber-300'
                    : 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                }`}
              >
                {evaluation.status}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 mt-3 leading-relaxed">
              {evaluation.verdictMessage}
            </p>

            {/* Impact Metric & Progress */}
            <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Remaining Buffer After Purchase:</span>
                <strong
                  className={evaluation.remainingAfterPurchase < 0 ? 'text-rose-400' : 'text-white'}
                >
                  {evaluation.remainingAfterPurchase < 0
                    ? `-${formatINR(Math.abs(evaluation.remainingAfterPurchase))} Deficit`
                    : formatINR(evaluation.remainingAfterPurchase)}
                </strong>
              </div>

              <div className="w-full bg-midnight-950 rounded-full h-2 overflow-hidden border border-white/5">
                <div
                  className={`h-full rounded-full ${
                    evaluation.status === 'safe'
                      ? 'bg-brand-emerald'
                      : evaluation.status === 'caution'
                      ? 'bg-amber-400'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, evaluation.budgetImpactPct)}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 text-right">
                Consumes {evaluation.budgetImpactPct}% of remaining monthly buffer
              </div>
            </div>
          </div>

          {/* SIP Compounding Opportunity Cost Card */}
          {price > 0 && (
            <div className="p-4 rounded-2xl bg-midnight-950 border border-brand-teal/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-teal uppercase tracking-wider">
                <PiggyBank className="w-4 h-4" />
                <span>Wealth Opportunity Cost (Compounding Angle)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                If you skip this {productName || 'purchase'} and invest this{' '}
                <strong className="text-white">{formatINR(price)}</strong> into a Nifty 50 Index Mutual Fund
                (at 12% CAGR), it compounds to approximately{' '}
                <strong className="text-brand-emerald text-sm">
                  {formatINR(evaluation.sipOpportunity5Yr)}
                </strong>{' '}
                over 5 years!
              </p>
            </div>
          )}

          {/* Celebration Success Toast if user chose 7-day pause */}
          {showCelebration && (
            <div className="p-4 rounded-xl bg-brand-emerald/20 border border-brand-emerald/40 text-emerald-200 text-xs font-bold text-center animate-bounce">
              🎉 Brilliant choice! You just saved {formatINR(price)} this week by hitting pause!
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleWait7Days}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-emerald/20 hover:bg-brand-emerald/30 text-brand-emerald border border-brand-emerald/40 transition active:scale-95"
          >
            <Clock className="w-4 h-4" />
            <span>Apply 7-Day Cooling Rule (Save {formatINR(price)})</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleAskAI}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-midnight-800 text-slate-300 hover:text-white hover:bg-midnight-750 transition"
            >
              Ask AI
            </button>
            <button
              type="button"
              onClick={handleProceedToAddExpense}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition"
            >
              Buy & Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
