import React, { useMemo } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  Plus,
  Sparkles,
  ArrowRight,
  Receipt,
  PieChart,
  Bot,
  HelpCircle,
  AlertOctagon,
  ShieldAlert,
  Trophy,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate, CATEGORY_METADATA, formatMonthYear } from '../../utils/formatters';
import { CategoryDoughnutChart } from '../charts/CategoryDoughnutChart';
import { SpendingTrendChart } from '../charts/SpendingTrendChart';
import { generateDeterministicResponse } from '../../services/aiService';

export const DashboardView: React.FC = () => {
  const {
    monthlySummary,
    transactions,
    selectedMonth,
    budgets,
    setIsAddModalOpen,
    setActiveTab,
    setEditingTransaction,
    setDeletingTransactionId,
    setIsRestrictionModalOpen,
    setIsCanIBuyThisOpen,
  } = useApp();

  // Filter transactions for this month and get recent 5
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const recentTransactions = useMemo(() => {
    return [...currentMonthTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [currentMonthTransactions]);

  // Generate automated quick insight preview
  const quickInsight = useMemo(() => {
    return generateDeterministicResponse(
      'Summarize my spending this month.',
      monthlySummary,
      transactions,
      budgets
    );
  }, [monthlySummary, transactions, budgets]);

  const isOverBudget = monthlySummary.remainingBudget < 0;
  const isNearLimit = monthlySummary.percentageUsed >= 80 && !isOverBudget;
  const monthName = formatMonthYear(selectedMonth);

  // Check individual category breaches
  const exceededCategories = useMemo(() => {
    return monthlySummary.categoryBreakdown.filter((c) => {
      const cap = budgets.categoryBudgets[c.category] || 0;
      return cap > 0 && c.amount > cap;
    });
  }, [monthlySummary.categoryBreakdown, budgets.categoryBudgets]);

  const hasBudgetBreach = isOverBudget || exceededCategories.length > 0;

  // Trigger popup automatically when dashboard loads with an active breach
  React.useEffect(() => {
    if (hasBudgetBreach) {
      const sessionKey = `spendsense_breach_popped_${selectedMonth}_${monthlySummary.totalSpend}`;
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, 'true');
        setIsRestrictionModalOpen(true);
      }
    }
  }, [hasBudgetBreach, selectedMonth, monthlySummary.totalSpend, setIsRestrictionModalOpen]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* High-Visibility Restriction Notification Banner (Shows when budget is exceeded) */}
      {hasBudgetBreach && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950/80 via-rose-900/50 to-midnight-900 border-2 border-rose-500/50 p-4 sm:p-5 shadow-xl shadow-rose-950/50 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/40 animate-pulse">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-rose-400">
                  ⚠️ Budget Exceeded — Spending Restriction Active
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                  {isOverBudget ? `${monthlySummary.percentageUsed}% Used` : `${exceededCategories.length} Category Breached`}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium leading-relaxed">
                {isOverBudget
                  ? `You have exceeded your ${formatINR(monthlySummary.overallBudget)} budget by ${formatINR(Math.abs(monthlySummary.remainingBudget))}. Further discretionary spending should be paused.`
                  : `Spending caps exceeded in: ${exceededCategories.map((c) => c.category).join(', ')}.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
            <button
              onClick={() => setIsRestrictionModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 active:scale-95 transition"
            >
              <span>View Restriction Notice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Spending */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Spent ({monthName})
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-teal/15 text-brand-teal flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {formatINR(monthlySummary.totalSpend)}
            </div>
            {/* MoM Comparison */}
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium">
              {monthlySummary.prevMonthTotal !== null ? (
                monthlySummary.percentChange! > 0 ? (
                  <span className="flex items-center text-rose-400">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                    +{monthlySummary.percentChange}% vs last month
                  </span>
                ) : monthlySummary.percentChange! < 0 ? (
                  <span className="flex items-center text-brand-emerald">
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                    {monthlySummary.percentChange}% vs last month
                  </span>
                ) : (
                  <span className="text-slate-400">Identical to last month</span>
                )
              ) : (
                <span className="text-slate-500 italic">No previous month records</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Monthly Budget */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Monthly Budget
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-sky/15 text-brand-sky flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {formatINR(monthlySummary.overallBudget)}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>Limit allocated</span>
              <button
                onClick={() => setActiveTab('budgets')}
                className="text-brand-teal hover:underline font-semibold"
              >
                Edit Caps
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Remaining Budget */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Remaining Budget
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isOverBudget
                  ? 'bg-rose-500/15 text-rose-400'
                  : isNearLimit
                  ? 'bg-amber-500/15 text-amber-300'
                  : 'bg-brand-emerald/15 text-brand-emerald'
              }`}
            >
              {isOverBudget ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                isOverBudget ? 'text-rose-400' : 'text-white'
              }`}
            >
              {isOverBudget ? `-${formatINR(Math.abs(monthlySummary.remainingBudget))}` : formatINR(monthlySummary.remainingBudget)}
            </div>
            <div className="mt-2 text-xs font-medium">
              {isOverBudget ? (
                <span className="text-rose-400 font-semibold">Exceeded by {formatINR(Math.abs(monthlySummary.remainingBudget))}</span>
              ) : isNearLimit ? (
                <span className="text-amber-300 font-semibold">Caution: 80%+ consumed</span>
              ) : (
                <span className="text-brand-emerald font-semibold">Healthy financial buffer</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: Budget Used % */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Budget Consumed
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-midnight-900 border border-white/5 text-slate-300">
              {monthlySummary.transactionCount} txns
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                  isOverBudget
                    ? 'text-rose-400'
                    : isNearLimit
                    ? 'text-amber-300'
                    : 'text-brand-teal'
                }`}
              >
                {monthlySummary.percentageUsed}%
              </span>
              <span className="text-xs text-slate-400">of ₹{monthlySummary.overallBudget}</span>
            </div>
            {/* Progress bar */}
            <div className="mt-2.5 w-full bg-midnight-900 rounded-full h-2 overflow-hidden border border-white/5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverBudget
                    ? 'bg-rose-500'
                    : isNearLimit
                    ? 'bg-amber-400'
                    : 'bg-gradient-to-r from-brand-teal to-brand-emerald'
                }`}
                style={{ width: `${Math.min(100, monthlySummary.percentageUsed)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Prominent AI Spending Insight Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-midnight-850 via-midnight-800 to-midnight-850 border border-brand-teal/25 p-5 sm:p-6 shadow-glow-teal">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-teal/20 border border-brand-teal/40 text-brand-teal flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-teal">
                  AI Spending Insight
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                  Automated Intelligence
                </span>
              </div>
              <p className="text-sm sm:text-base font-medium text-slate-100 mt-1.5 leading-relaxed max-w-3xl">
                {quickInsight.text}
              </p>
              {/* Quick Fact Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {quickInsight.facts.slice(0, 3).map((f, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-lg bg-midnight-900/80 border border-white/10 text-slate-300 font-medium"
                  >
                    • {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
            <button
              onClick={() => setActiveTab('assistant')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-brand-teal/20 hover:bg-brand-teal/30 text-brand-teal border border-brand-teal/40 transition active:scale-95"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Assistant</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Two New Feature Highlights: Can I Buy This? + Tiny Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* Card A: Can I Buy This? */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-midnight-850 to-midnight-800 border border-brand-teal/30 flex items-center justify-between gap-4 shadow-sm hover:border-brand-teal/50 transition">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0 border border-brand-teal/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-white">“Can I Buy This?” Checker</h4>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-brand-teal/20 text-brand-teal">
                  New
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Run an instant impulse-check before checkout. Evaluates buffer impact & 5-year SIP opportunity.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCanIBuyThisOpen(true)}
            className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-teal text-midnight-950 hover:bg-teal-400 active:scale-95 transition"
          >
            Check Item
          </button>
        </div>

        {/* Card B: Tiny Challenges Contest */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-midnight-850 to-midnight-800 border border-amber-500/30 flex items-center justify-between gap-4 shadow-sm hover:border-amber-500/50 transition">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-white">Tiny Saving Challenges</h4>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                  Contest
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Fun micro-habits with a twist. Accumulate ₹1,000s towards your dream goal without sacrificing meals!
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('challenges')}
            className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-midnight-950 hover:bg-amber-400 active:scale-95 transition"
          >
            Play Quest
          </button>
        </div>
      </div>

      {/* Visual Charts Grid: Category Doughnut + Spending Trajectory Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Doughnut Chart (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-5 sm:p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <h3 className="text-base font-bold text-white">Category Distribution</h3>
              <p className="text-xs text-slate-400 mt-0.5">Where your money was allocated in {monthName}</p>
            </div>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-xs font-medium text-brand-teal hover:underline flex items-center gap-1"
            >
              Reports <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="py-4">
            <CategoryDoughnutChart breakdown={monthlySummary.categoryBreakdown} />
          </div>
          {monthlySummary.topCategory && (
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span>Top Outlay:</span>
              <span className="font-semibold text-white">
                {monthlySummary.topCategory.category} ({formatINR(monthlySummary.topCategory.amount)} • {monthlySummary.topCategory.percentage}%)
              </span>
            </div>
          )}
        </div>

        {/* Spending Trend Line Chart (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-5 sm:p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <h3 className="text-base font-bold text-white">Cumulative Spending Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">Day-by-day velocity and total expenditure trajectory</p>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-teal/15 text-brand-teal border border-brand-teal/30">
              Live Tracker
            </span>
          </div>
          <div className="py-4">
            <SpendingTrendChart transactions={transactions} yearMonth={selectedMonth} />
          </div>
          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>Avg Spend / Transaction:</span>
            <span className="font-semibold text-white">{formatINR(monthlySummary.averageTransaction)}</span>
          </div>
        </div>
      </div>

      {/* Recent Transactions & Quick Actions */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-brand-teal" />
              Recent Transactions ({monthName})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Latest 5 expenses logged. Full search, category and date filters available on Transactions page.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-teal/20 text-brand-teal hover:bg-brand-teal/30 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-midnight-800 text-slate-300 hover:text-white hover:bg-midnight-750 transition"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="divide-y divide-white/5 mt-2">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => {
              const meta = CATEGORY_METADATA[tx.category];
              return (
                <div
                  key={tx.id}
                  className="py-3 sm:py-3.5 flex items-center justify-between gap-3 hover:bg-white/[0.02] px-2 rounded-xl transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: meta.bgColor,
                        borderColor: meta.borderColor,
                        color: meta.textColor,
                      }}
                    >
                      <span className="text-xs font-bold">{tx.category.slice(0, 1)}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-md">
                        {tx.description}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="font-medium text-slate-300">{tx.category}</span>
                        <span>•</span>
                        <span>{formatDate(tx.date, 'short')}</span>
                        {tx.paymentMethod && (
                          <>
                            <span>•</span>
                            <span className="px-1.5 py-0.2 rounded bg-midnight-900 border border-white/5 text-[10px]">
                              {tx.paymentMethod}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-sm sm:text-base font-bold text-white">
                        {formatINR(tx.amount)}
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingTransaction(tx)}
                      className="text-xs text-slate-500 hover:text-brand-teal p-1 rounded transition"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingTransactionId(tx.id)}
                      className="text-xs text-slate-500 hover:text-rose-400 p-1 rounded transition"
                      title="Delete"
                    >
                      Del
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm text-slate-400 font-medium">No transactions recorded for {monthName}.</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-teal text-midnight-950 hover:bg-teal-400 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Record your first expense
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
