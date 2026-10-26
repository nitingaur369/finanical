import React from 'react';
import {
  Plus,
  Calendar,
  AlertTriangle,
  Settings,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatMonthYear } from '../../utils/formatters';

export const Header: React.FC = () => {
  const {
    activeTab,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    setIsAddModalOpen,
    monthlySummary,
    setIsSettingsOpen,
    setIsCanIBuyThisOpen,
  } = useApp();

  const getPageInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Financial Dashboard',
          subtitle: 'Real-time overview of spending, budget velocity, and AI recommendations.',
        };
      case 'transactions':
        return {
          title: 'Expense Transactions',
          subtitle: 'Search, filter, categorize, and manage your day-to-day purchases.',
        };
      case 'budgets':
        return {
          title: 'Budget Planner',
          subtitle: 'Set monthly and category-specific spending caps to keep goals on track.',
        };
      case 'analytics':
        return {
          title: 'Reports & Analytics',
          subtitle: 'Visual category breakdown, trends, and ticket-size metrics.',
        };
      case 'assistant':
        return {
          title: 'SpendSense AI & Wealth Advisor',
          subtitle: 'Ask about expenses, budget pacing, and Indian mutual funds & SIP investing.',
        };
      case 'challenges':
        return {
          title: 'Tiny Saving Challenges Contest',
          subtitle: 'Smart habit twists that accumulate toward dream goals without sacrificing essentials.',
        };
      case 'simulator':
        return {
          title: 'Savings Simulator',
          subtitle: 'Simulate micro-adjustments in discretionary spends to project compounding savings.',
        };
    }
  };

  const { title, subtitle } = getPageInfo();
  const isBudgetWarning = monthlySummary.percentageUsed >= 80;
  const isBudgetExceeded = monthlySummary.percentageUsed >= 100;

  return (
    <header className="sticky top-0 z-20 bg-midnight-900/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-4 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Page Title & Context */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              {title}
            </h1>
            {/* Quick alert badge if budget caution */}
            {isBudgetExceeded ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-3.5 h-3.5" />
                Over Budget ({monthlySummary.percentageUsed}%)
              </span>
            ) : isBudgetWarning ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <AlertTriangle className="w-3.5 h-3.5" />
                Near Limit ({monthlySummary.percentageUsed}%)
              </span>
            ) : null}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Month Selector */}
          <div className="relative flex items-center">
            <div className="absolute left-3 pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              aria-label="Select reporting month"
              className="appearance-none pl-9 pr-8 py-2 bg-midnight-800/90 border border-white/10 hover:border-brand-teal/40 rounded-xl text-xs sm:text-sm font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 transition cursor-pointer shadow-sm"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m} className="bg-midnight-900 text-slate-100">
                  {formatMonthYear(m)}
                </option>
              ))}
            </select>
            <div className="absolute right-2.5 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>

          {/* Quick Settings (mobile friendly) */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Open settings"
            className="lg:hidden p-2 rounded-xl bg-midnight-800 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* "Can I Buy This?" Quick Modal Button */}
          <button
            onClick={() => setIsCanIBuyThisOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-midnight-800 hover:bg-midnight-750 text-slate-200 border border-brand-teal/40 hover:border-brand-teal transition shadow-sm active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-brand-teal" />
            <span>“Can I Buy This?”</span>
          </button>

          {/* Add Expense Primary Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-brand-teal to-brand-emerald hover:from-teal-400 hover:to-emerald-400 text-midnight-950 shadow-md shadow-teal-500/20 active:scale-95 transition-all duration-150"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>
    </header>
  );
};
