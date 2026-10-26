import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Transaction,
  BudgetConfig,
  MonthlySummary,
  ActiveTab,
  ExpenseCategory,
  PaymentMethod,
} from '../types';
import { SAMPLE_TRANSACTIONS, INITIAL_BUDGET_CONFIG } from '../data/sampleTransactions';
import {
  calculateMonthlySummary,
  getAvailableMonths,
} from '../utils/calculations';

interface AppContextType {
  // State
  transactions: Transaction[];
  budgets: BudgetConfig;
  selectedMonth: string;
  availableMonths: string[];
  activeTab: ActiveTab;
  apiKey: string;
  isSampleData: boolean;
  monthlySummary: MonthlySummary;

  // Modals & Triggers
  isAddModalOpen: boolean;
  editingTransaction: Transaction | null;
  deletingTransactionId: string | null;
  isSettingsOpen: boolean;
  isRestrictionModalOpen: boolean;
  isCanIBuyThisOpen: boolean;

  // Setters & Actions
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedMonth: (month: string) => void;
  setIsAddModalOpen: (open: boolean) => void;
  setEditingTransaction: (t: Transaction | null) => void;
  setDeletingTransactionId: (id: string | null) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsRestrictionModalOpen: (open: boolean) => void;
  setIsCanIBuyThisOpen: (open: boolean) => void;
  setApiKey: (key: string) => void;

  addTransaction: (data: {
    amount: number;
    category: ExpenseCategory;
    date: string;
    description: string;
    paymentMethod: PaymentMethod;
  }) => void;
  updateTransaction: (
    id: string,
    data: {
      amount: number;
      category: ExpenseCategory;
      date: string;
      description: string;
      paymentMethod: PaymentMethod;
    }
  ) => void;
  deleteTransaction: (id: string) => void;
  updateBudgets: (newBudgets: BudgetConfig) => void;
  resetToSampleData: () => void;
  clearAllData: () => void;
}

const STORAGE_KEYS = {
  TRANSACTIONS: 'spendsense_v1_transactions',
  BUDGETS: 'spendsense_v1_budgets',
  API_KEY: 'spendsense_v1_gemini_key',
  IS_SAMPLE: 'spendsense_v1_is_sample',
};

const DEFAULT_MONTH = '2026-10';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Transactions state with localStorage persistence
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed reading transactions from localStorage', e);
    }
    return SAMPLE_TRANSACTIONS;
  });

  // 2. Budgets state with localStorage persistence
  const [budgets, setBudgets] = useState<BudgetConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed reading budgets from localStorage', e);
    }
    return INITIAL_BUDGET_CONFIG;
  });

  // 3. API Key
  const [apiKey, setApiKeyState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
  });

  // 4. Is Sample Data active flag
  const [isSampleData, setIsSampleData] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_SAMPLE);
    return saved !== null ? saved === 'true' : true;
  });

  // 5. Active Tab & Selected Month
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>(DEFAULT_MONTH);

  // 6. Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRestrictionModalOpen, setIsRestrictionModalOpen] = useState(false);
  const [isCanIBuyThisOpen, setIsCanIBuyThisOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed saving transactions to localStorage', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    } catch (e) {
      console.error('Failed saving budgets to localStorage', e);
    }
  }, [budgets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.IS_SAMPLE, String(isSampleData));
    } catch (e) {
      console.error('Failed saving isSample flag to localStorage', e);
    }
  }, [isSampleData]);

  const setApiKey = (key: string) => {
    setApiKeyState(key.trim());
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEYS.API_KEY);
    }
  };

  // Available months derived from all transaction records
  const availableMonths = useMemo(() => {
    return getAvailableMonths(transactions, DEFAULT_MONTH);
  }, [transactions]);

  // Derived financial summary for current selected month
  const monthlySummary = useMemo(() => {
    return calculateMonthlySummary(transactions, budgets, selectedMonth);
  }, [transactions, budgets, selectedMonth]);

  // Add Transaction
  const addTransaction = (data: {
    amount: number;
    category: ExpenseCategory;
    date: string;
    description: string;
    paymentMethod: PaymentMethod;
  }) => {
    const newTx: Transaction = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      amount: data.amount,
      category: data.category,
      date: data.date,
      description: data.description.trim(),
      paymentMethod: data.paymentMethod,
      isSample: false,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    setIsSampleData(false);

    // If transaction date belongs to another month, switch to that month so the user sees it immediately
    const txMonth = data.date.slice(0, 7);
    if (txMonth && txMonth !== selectedMonth) {
      setSelectedMonth(txMonth);
    }

    // Check if this expense pushes spending over the overall budget or category budget
    const targetMonth = txMonth || selectedMonth;
    const existingMonthSpend = transactions
      .filter((t) => t.date.startsWith(targetMonth))
      .reduce((sum, t) => sum + t.amount, 0);
    const newTotalSpend = existingMonthSpend + data.amount;

    const existingCatSpend = transactions
      .filter((t) => t.date.startsWith(targetMonth) && t.category === data.category)
      .reduce((sum, t) => sum + t.amount, 0);
    const newCatSpend = existingCatSpend + data.amount;
    const catBudget = budgets.categoryBudgets[data.category] || 0;

    const causesOverallBreach = budgets.monthlyOverallBudget > 0 && newTotalSpend > budgets.monthlyOverallBudget;
    const causesCatBreach = catBudget > 0 && newCatSpend > catBudget;

    if (causesOverallBreach || causesCatBreach) {
      // Small timeout so modal cleanly appears after add modal closes
      setTimeout(() => {
        setIsRestrictionModalOpen(true);
      }, 250);
    }
  };

  // Edit Transaction
  const updateTransaction = (
    id: string,
    data: {
      amount: number;
      category: ExpenseCategory;
      date: string;
      description: string;
      paymentMethod: PaymentMethod;
    }
  ) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === id
          ? {
              ...tx,
              amount: data.amount,
              category: data.category,
              date: data.date,
              description: data.description.trim(),
              paymentMethod: data.paymentMethod,
            }
          : tx
      )
    );
    setEditingTransaction(null);

    // Check if edit causes budget breach
    const txMonth = data.date.slice(0, 7);
    const targetMonth = txMonth || selectedMonth;
    const existingMonthSpend = transactions
      .filter((t) => t.id !== id && t.date.startsWith(targetMonth))
      .reduce((sum, t) => sum + t.amount, 0);
    const newTotalSpend = existingMonthSpend + data.amount;

    const existingCatSpend = transactions
      .filter((t) => t.id !== id && t.date.startsWith(targetMonth) && t.category === data.category)
      .reduce((sum, t) => sum + t.amount, 0);
    const newCatSpend = existingCatSpend + data.amount;
    const catBudget = budgets.categoryBudgets[data.category] || 0;

    if ((budgets.monthlyOverallBudget > 0 && newTotalSpend > budgets.monthlyOverallBudget) || (catBudget > 0 && newCatSpend > catBudget)) {
      setTimeout(() => {
        setIsRestrictionModalOpen(true);
      }, 250);
    }
  };

  // Delete Transaction
  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    setDeletingTransactionId(null);
  };

  // Update Budgets
  const updateBudgets = (newBudgets: BudgetConfig) => {
    setBudgets(newBudgets);
  };

  // Reset to Sample Demo Data
  const resetToSampleData = () => {
    setTransactions(SAMPLE_TRANSACTIONS);
    setBudgets(INITIAL_BUDGET_CONFIG);
    setIsSampleData(true);
    setSelectedMonth(DEFAULT_MONTH);
  };

  // Clear All Data
  const clearAllData = () => {
    setTransactions([]);
    setIsSampleData(false);
  };

  return (
    <AppContext.Provider
      value={{
        transactions,
        budgets,
        selectedMonth,
        availableMonths,
        activeTab,
        apiKey,
        isSampleData,
        monthlySummary,
        isAddModalOpen,
        editingTransaction,
        deletingTransactionId,
        isSettingsOpen,
        isRestrictionModalOpen,
        isCanIBuyThisOpen,
        setActiveTab,
        setSelectedMonth,
        setIsAddModalOpen,
        setEditingTransaction,
        setDeletingTransactionId,
        setIsSettingsOpen,
        setIsRestrictionModalOpen,
        setIsCanIBuyThisOpen,
        setApiKey,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        updateBudgets,
        resetToSampleData,
        clearAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
