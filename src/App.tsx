import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardView } from './components/views/DashboardView';
import { TransactionsView } from './components/views/TransactionsView';
import { BudgetsView } from './components/views/BudgetsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { AIAssistantView } from './components/views/AIAssistantView';
import { ChallengesView } from './components/views/ChallengesView';
import { SavingsSimulatorView } from './components/views/SavingsSimulatorView';
import { SplitBillView } from './components/views/SplitBillView';
import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { EditExpenseModal } from './components/modals/EditExpenseModal';
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { BudgetRestrictionModal } from './components/modals/BudgetRestrictionModal';
import { CanIBuyThisModal } from './components/modals/CanIBuyThisModal';
import { Info, Sparkles, X } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    activeTab,
    isSampleData,
    resetToSampleData,
    isCanIBuyThisOpen,
    setIsCanIBuyThisOpen,
  } = useApp();
  const [showDemoBanner, setShowDemoBanner] = React.useState(true);

  return (
    <div className="flex min-h-screen bg-midnight-950 text-slate-100">
      {/* Desktop Sidebar Navigation */}
      <Sidebar />

      {/* Main App Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <Header />

        {/* First Launch / Demo Mode Notice Banner */}
        {isSampleData && showDemoBanner && (
          <div className="bg-gradient-to-r from-brand-teal/15 via-midnight-800 to-midnight-850 border-b border-brand-teal/20 px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs transition">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-ping" />
              <span>
                <strong>Welcome to SpendSense:</strong> Pre-populated with realistic Indian UPI & card transactions so you can explore all charts, budgets, and AI insights immediately.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowDemoBanner(false)}
                className="text-slate-400 hover:text-white p-1"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'transactions' && <TransactionsView />}
          {activeTab === 'budgets' && <BudgetsView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'assistant' && <AIAssistantView />}
          {activeTab === 'challenges' && <ChallengesView />}
          {activeTab === 'simulator' && <SavingsSimulatorView />}
          {activeTab === 'split' && <SplitBillView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Interactive Modals */}
      <AddExpenseModal />
      <EditExpenseModal />
      <DeleteConfirmModal />
      <SettingsModal />
      <BudgetRestrictionModal />
      <CanIBuyThisModal
        isOpen={isCanIBuyThisOpen}
        onClose={() => setIsCanIBuyThisOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
