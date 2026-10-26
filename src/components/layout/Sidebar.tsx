import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  BarChart3,
  Bot,
  Calculator,
  Settings,
  Sparkles,
  RotateCcw,
  Zap,
  Trophy,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isSampleData,
    resetToSampleData,
    setIsSettingsOpen,
    setIsCanIBuyThisOpen,
    apiKey,
  } = useApp();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'transactions', label: 'Transactions', icon: <Receipt className="w-5 h-5" /> },
    { id: 'budgets', label: 'Budgets', icon: <PieChart className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    {
      id: 'assistant',
      label: 'AI Wealth Advisor',
      icon: <Bot className="w-5 h-5" />,
      badge: 'Smart',
    },
    {
      id: 'challenges',
      label: 'Tiny Challenges',
      icon: <Trophy className="w-5 h-5" />,
      badge: 'Contest',
    },
    { id: 'simulator', label: 'Savings Simulator', icon: <Calculator className="w-5 h-5" /> },
    { id: 'split', label: 'Split Bills', icon: <Users className="w-5 h-5" />, badge: 'New' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-midnight-950/80 border-r border-white/10 p-5 shrink-0 select-none backdrop-blur-xl">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 px-1">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-teal to-brand-emerald flex items-center justify-center shadow-lg shadow-teal-500/20 text-midnight-950">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-extrabold tracking-tight text-white">Spend<span className="text-brand-teal">Sense</span></span>
          </div>
          <p className="text-[11px] font-medium text-slate-400 tracking-wide uppercase">Your Money, Made Clear</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5" aria-label="Main Navigation">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-teal/15 text-brand-teal border border-brand-teal/30 shadow-sm shadow-teal-500/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-brand-teal' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-teal/20 text-brand-teal border border-brand-teal/30">
                  <Sparkles className="w-2.5 h-2.5" />
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Status & Demo Data Controls */}
      <div className="pt-4 mt-auto border-t border-white/10 space-y-3">
        {/* Engine status indicator */}
        <div className="px-3 py-2 rounded-lg bg-midnight-900 border border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${apiKey ? 'bg-brand-emerald animate-pulse' : 'bg-brand-teal'}`}></span>
            <span className="text-slate-300 font-medium">
              {apiKey ? 'Gemini AI Active' : 'Automated AI'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Ready</span>
        </div>

        {/* Demo Data indicator */}
        {isSampleData && (
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
            <span className="font-medium">Sample Data Active</span>
            <button
              onClick={resetToSampleData}
              title="Reset Sample Records"
              className="p-1 hover:bg-amber-500/20 rounded transition text-amber-300"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* "Can I Buy This?" Quick Checker Button */}
        <button
          onClick={() => setIsCanIBuyThisOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-teal/20 to-brand-emerald/20 text-brand-teal border border-brand-teal/40 hover:bg-brand-teal/30 transition shadow-sm"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            <span>“Can I Buy This?”</span>
          </div>
          <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-brand-teal text-midnight-950">
            Check
          </span>
        </button>

        {/* Settings button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition"
        >
          <Settings className="w-4 h-4" />
          <span>Settings & Data</span>
        </button>
      </div>
    </aside>
  );
};
