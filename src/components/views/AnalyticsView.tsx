import React, { useMemo } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Layers,
  CreditCard,
  Receipt,
  Award,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CategoryDoughnutChart } from '../charts/CategoryDoughnutChart';
import { SpendingTrendChart } from '../charts/SpendingTrendChart';
import {
  formatINR,
  formatDate,
  CATEGORY_METADATA,
  formatMonthYear,
} from '../../utils/formatters';

export const AnalyticsView: React.FC = () => {
  const { monthlySummary, transactions, selectedMonth } = useApp();

  const monthName = formatMonthYear(selectedMonth);

  // Current month transactions
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Payment method distribution
  const paymentBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    monthTransactions.forEach((t) => {
      const pm = t.paymentMethod || 'UPI';
      map.set(pm, (map.get(pm) || 0) + t.amount);
    });

    const list: { method: string; amount: number; percentage: number }[] = [];
    map.forEach((amount, method) => {
      const pct = monthlySummary.totalSpend > 0 ? (amount / monthlySummary.totalSpend) * 100 : 0;
      list.push({ method, amount, percentage: Math.round(pct) });
    });

    return list.sort((a, b) => b.amount - a.amount);
  }, [monthTransactions, monthlySummary.totalSpend]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* 4 Financial Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Average Transaction Ticket */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Transaction Size</span>
            <Receipt className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {formatINR(monthlySummary.averageTransaction)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Across {monthlySummary.transactionCount} payments in {monthName}</p>
        </div>

        {/* KPI 2: Largest Transaction */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Largest Expense</span>
            <Award className="w-4 h-4 text-brand-sky" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {monthlySummary.largestTransaction ? formatINR(monthlySummary.largestTransaction.amount) : '₹0'}
          </div>
          <p className="text-xs text-slate-400 mt-1 truncate">
            {monthlySummary.largestTransaction
              ? `"${monthlySummary.largestTransaction.description}" (${formatDate(monthlySummary.largestTransaction.date, 'short')})`
              : 'No expenses recorded'}
          </p>
        </div>

        {/* KPI 3: Recorded Transactions Count */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Transaction Count</span>
            <Layers className="w-4 h-4 text-brand-purple" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {monthlySummary.transactionCount}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Total active entries logged
          </p>
        </div>

        {/* KPI 4: MoM Growth Comparison */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">MoM Comparison</span>
            <TrendingUp className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {monthlySummary.prevMonthTotal !== null ? (
              <span
                className={
                  monthlySummary.percentChange! > 0
                    ? 'text-rose-400'
                    : monthlySummary.percentChange! < 0
                    ? 'text-brand-emerald'
                    : 'text-white'
                }
              >
                {monthlySummary.percentChange! > 0 ? '+' : ''}
                {monthlySummary.percentChange}%
              </span>
            ) : (
              <span className="text-slate-500 text-lg">No prev data</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {monthlySummary.prevMonthTotal !== null
              ? `vs ${formatINR(monthlySummary.prevMonthTotal)} recorded in prior period`
              : 'Requires 2 consecutive months of logs'}
          </p>
        </div>
      </div>

      {/* Visual Charts: Category Doughnut + Cumulative Spend Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-brand-teal" />
                Category Distribution ({monthName})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Interactive percentage breakdown</p>
            </div>
          </div>
          <div className="pt-4">
            <CategoryDoughnutChart breakdown={monthlySummary.categoryBreakdown} />
          </div>
        </div>

        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-teal" />
                Monthly Spending Trajectory
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Cumulative expenditure pacing over the month</p>
            </div>
          </div>
          <div className="pt-4">
            <SpendingTrendChart transactions={transactions} yearMonth={selectedMonth} />
          </div>
        </div>
      </div>

      {/* Ranked Highest-Spending Categories & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ranked Categories Table (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div>
              <h3 className="text-base font-bold text-white">Ranked Category Spending</h3>
              <p className="text-xs text-slate-400 mt-0.5">Highest outlay areas ranked by total volume</p>
            </div>
          </div>

          <div className="divide-y divide-white/5 mt-3">
            {monthlySummary.categoryBreakdown.filter((c) => c.amount > 0).length > 0 ? (
              monthlySummary.categoryBreakdown
                .filter((c) => c.amount > 0)
                .map((cat, idx) => {
                  const meta = CATEGORY_METADATA[cat.category];
                  return (
                    <div key={cat.category} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-center text-xs font-bold text-slate-500">
                          #{idx + 1}
                        </span>
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                          style={{
                            backgroundColor: meta.bgColor,
                            borderColor: meta.borderColor,
                            color: meta.textColor,
                          }}
                        >
                          <span className="text-xs font-bold">{cat.category.slice(0, 1)}</span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{cat.category}</div>
                          <div className="text-xs text-slate-400">{cat.count} transactions</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-white">{formatINR(cat.amount)}</div>
                        <div className="text-xs text-brand-teal font-medium">{cat.percentage}% of total</div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No recorded spending in {monthName}.
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Distribution (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-brand-teal" />
                  Payment Channels
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">UPI, Card & Cash breakdown</p>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              {paymentBreakdown.length > 0 ? (
                paymentBreakdown.map((item) => (
                  <div key={item.method} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{item.method}</span>
                      <span className="text-slate-300">
                        {formatINR(item.amount)} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-midnight-900 rounded-full h-2 overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-brand-teal to-brand-sky rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No payment data available.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 text-[11px] text-slate-400">
            Tip: Over 70% of Indian student and urban household micro-transactions occur via UPI apps like PhonePe, Google Pay, and Paytm.
          </div>
        </div>
      </div>
    </div>
  );
};
