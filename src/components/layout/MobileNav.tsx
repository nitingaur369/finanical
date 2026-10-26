import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  BarChart3,
  Bot,
  Calculator,
  Trophy,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'transactions', label: 'Expenses', icon: <Receipt className="w-5 h-5" /> },
    { id: 'budgets', label: 'Budgets', icon: <PieChart className="w-5 h-5" /> },
    { id: 'challenges', label: 'Contest', icon: <Trophy className="w-5 h-5" /> },
    { id: 'assistant', label: 'AI', icon: <Bot className="w-5 h-5" /> },
    { id: 'split', label: 'Split', icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-midnight-950/95 backdrop-blur-lg border-t border-white/10 px-2 py-2 flex items-center justify-around">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
              isActive ? 'text-brand-teal' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className={`${isActive ? 'scale-110 text-brand-teal' : ''} transition-transform`}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
